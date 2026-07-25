import { describe, it, expect } from 'vitest';
import {
  buildReadCommand, buildWriteCommand,
  isValidResponseChecksum, expectedWriteAck,
  extractResponseFrame, extractWriteAck,
  parseInfo, parseBasic, parsePedal, parseThrottle,
  encodeBasic, encodePedal, encodeThrottle,
  BLOCK_INFO, BLOCK_BASIC, BLOCK_PEDAL, BLOCK_THROTTLE, DATA_LENGTHS,
} from '../src/device/BafangProtocol';

/*
 * REAL packets captured from a BBS02B (HZXT SZZ9, fw 2.0.1.1) on 2026-07-25
 * via a CH340 cable at 1200 8N1 (scripts/probe-bbs02.js in the
 * dbortz/OpenBafangTool fork). These are ground truth — if a code change
 * breaks one of these tests, the code is wrong, not the fixture.
 */
const hex = (s: string) => s.split(' ').map((b) => parseInt(b, 16));

const INFO_FRAME = hex('51 10 48 5a 58 54 53 5a 5a 39 31 31 32 30 31 31 02 19 22');
const BASIC_FRAME = hex(
  '52 18 29 0f 1e 1e 32 32 3c 3c 46 46 64 64 64 64 64 64 64 64 64 64 64 64 37 01 18',
);
const PEDAL_FRAME = hex('53 0b 03 ff 18 0a 06 04 ff 0a 08 00 50 e4');
const THROTTLE_FRAME = hex('54 06 0b 23 01 ff 18 0a a6');

// The exact no-op pedal write the controller ACKed during capture
const PEDAL_WRITE_FRAME = hex('16 53 0b 03 ff 18 0a 06 04 ff 0a 08 00 50 ed');
const PEDAL_WRITE_ACK = hex('53 0b 5e');

const frameData = (frame: number[]) => frame.slice(2, frame.length - 1);

describe('read commands', () => {
  it('builds the special info request', () => {
    expect(Array.from(buildReadCommand(BLOCK_INFO))).toEqual([0x11, 0x51, 0x04, 0xb0, 0x05]);
  });
  it('builds two-byte block reads', () => {
    expect(Array.from(buildReadCommand(BLOCK_BASIC))).toEqual([0x11, 0x52]);
    expect(Array.from(buildReadCommand(BLOCK_PEDAL))).toEqual([0x11, 0x53]);
    expect(Array.from(buildReadCommand(BLOCK_THROTTLE))).toEqual([0x11, 0x54]);
  });
});

describe('response checksum (captured frames)', () => {
  it.each([
    ['info', INFO_FRAME, BLOCK_INFO],
    ['basic', BASIC_FRAME, BLOCK_BASIC],
    ['pedal', PEDAL_FRAME, BLOCK_PEDAL],
    ['throttle', THROTTLE_FRAME, BLOCK_THROTTLE],
  ])('validates the real %s frame', (_name, frame, block) => {
    const data = frameData(frame);
    expect(
      isValidResponseChecksum(block, frame[1], data, frame[frame.length - 1]),
    ).toBe(true);
  });

  it('also accepts the code+len+payload dialect', () => {
    const data = frameData(PEDAL_FRAME);
    const withLen = (BLOCK_PEDAL + 0x0b + data.reduce((a, b) => a + b, 0)) & 0xff;
    expect(isValidResponseChecksum(BLOCK_PEDAL, 0x0b, data, withLen)).toBe(true);
  });

  it('rejects corrupted payloads', () => {
    const data = [...frameData(PEDAL_FRAME)];
    data[3] += 1;
    expect(
      isValidResponseChecksum(BLOCK_PEDAL, 0x0b, data, PEDAL_FRAME[PEDAL_FRAME.length - 1]),
    ).toBe(false);
  });
});

describe('frame extraction (byte-at-a-time)', () => {
  it('waits for a complete frame then extracts it', () => {
    const buffer: number[] = [];
    for (const byte of PEDAL_FRAME.slice(0, -1)) {
      buffer.push(byte);
      expect(extractResponseFrame(buffer, BLOCK_PEDAL, 11)).toBeNull();
    }
    buffer.push(PEDAL_FRAME[PEDAL_FRAME.length - 1]);
    const frame = extractResponseFrame(buffer, BLOCK_PEDAL, 11);
    expect(frame).not.toBeNull();
    expect(frame!.data).toEqual(frameData(PEDAL_FRAME));
    expect(frame!.consumed).toBe(PEDAL_FRAME.length);
  });

  it('skips leading garbage bytes', () => {
    const buffer = [0x00, 0xab, ...THROTTLE_FRAME];
    const frame = extractResponseFrame(buffer, BLOCK_THROTTLE, 6);
    expect(frame).not.toBeNull();
    expect(frame!.data).toEqual(frameData(THROTTLE_FRAME));
    expect(frame!.consumed).toBe(2 + THROTTLE_FRAME.length);
  });

  it('finds the captured write ack', () => {
    expect(expectedWriteAck(BLOCK_PEDAL, 11)).toEqual(PEDAL_WRITE_ACK);
    const found = extractWriteAck([0x00, ...PEDAL_WRITE_ACK], BLOCK_PEDAL, 11);
    expect(found).not.toBeNull();
    expect(found!.consumed).toBe(4);
  });
});

describe('parsers against bike-truth', () => {
  it('parses info', () => {
    const info = parseInfo(frameData(INFO_FRAME));
    expect(info.manufacturer).toBe('HZXT');
    expect(info.model).toBe('SZZ9');
    expect(info.hardware_version).toBe('1.1');
    expect(info.firmware_version).toBe('2.0.1.1');
    expect(info.voltage).toBe(48);
    expect(info.max_current).toBe(25);
  });

  it('parses basic (kid-safe tune)', () => {
    const basic = parseBasic(frameData(BASIC_FRAME));
    expect(basic.low_battery_protection).toBe(41);
    expect(basic.current_limit).toBe(15);
    expect(basic.wheel_diameter).toBe(27.5);
    expect(basic.speedmeter_type).toBe(0);
    expect(basic.speedmeter_magnets).toBe(1);
    expect(basic.assist_profiles.map((p) => p.current_limit)).toEqual([
      30, 30, 50, 50, 60, 60, 70, 70, 100, 100,
    ]);
    expect(basic.assist_profiles.every((p) => p.speed_limit === 100)).toBe(true);
  });

  it('parses pedal (kid-safe tune)', () => {
    const pedal = parsePedal(frameData(PEDAL_FRAME));
    expect(pedal.pedal_type).toBe(3);
    expect(pedal.pedal_assist_level).toBe(255);
    expect(pedal.pedal_speed_limit).toBe(24);
    expect(pedal.pedal_start_current).toBe(10);
    expect(pedal.pedal_slow_start_mode).toBe(6);
    expect(pedal.pedal_signals_before_start).toBe(4);
    expect(pedal.pedal_work_mode).toBe(0xff);
    expect(pedal.pedal_time_to_stop).toBe(100);
    expect(pedal.pedal_current_decay).toBe(8);
    expect(pedal.pedal_stop_decay).toBe(0);
    expect(pedal.pedal_keep_current).toBe(80);
  });

  it('parses throttle (kid-safe tune)', () => {
    const throttle = parseThrottle(frameData(THROTTLE_FRAME));
    expect(throttle.throttle_start_voltage).toBeCloseTo(1.1);
    expect(throttle.throttle_end_voltage).toBeCloseTo(3.5);
    expect(throttle.throttle_mode).toBe(1);
    expect(throttle.throttle_assist_level).toBe(255);
    expect(throttle.throttle_speed_limit).toBe(24);
    expect(throttle.throttle_start_current).toBe(10);
  });
});

describe('encoders round-trip against captured bytes', () => {
  it('re-encodes the pedal read into the exact ACKed write frame', () => {
    const pedal = parsePedal(frameData(PEDAL_FRAME));
    const written = buildWriteCommand(BLOCK_PEDAL, encodePedal(pedal));
    expect(Array.from(written)).toEqual(PEDAL_WRITE_FRAME);
  });

  it('encodeBasic reproduces the captured basic payload', () => {
    const basic = parseBasic(frameData(BASIC_FRAME));
    expect(encodeBasic(basic)).toEqual(frameData(BASIC_FRAME));
  });

  it('encodeThrottle reproduces the captured throttle payload', () => {
    const throttle = parseThrottle(frameData(THROTTLE_FRAME));
    expect(encodeThrottle(throttle)).toEqual(frameData(THROTTLE_FRAME));
  });

  it('payload lengths match DATA_LENGTHS', () => {
    expect(frameData(INFO_FRAME)).toHaveLength(DATA_LENGTHS[BLOCK_INFO]);
    expect(frameData(BASIC_FRAME)).toHaveLength(DATA_LENGTHS[BLOCK_BASIC]);
    expect(frameData(PEDAL_FRAME)).toHaveLength(DATA_LENGTHS[BLOCK_PEDAL]);
    expect(frameData(THROTTLE_FRAME)).toHaveLength(DATA_LENGTHS[BLOCK_THROTTLE]);
  });
});
