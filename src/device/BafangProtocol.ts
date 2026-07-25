/**
 * BBS01/02/HD UART protocol — byte layouts and checksums VERIFIED against a
 * real BBS02B (HZXT SZZ9, fw 2.0.1.1) by raw serial capture on 2026-07-25.
 * See tests/BafangProtocol.test.ts for the captured fixtures.
 *
 * Frames:
 *   read request   [0x11] [block]           (info block is the special
 *                                            sequence 11 51 04 B0 05)
 *   write request  [0x16] [block] [len] [data...] [checksum]
 *                  checksum = (block + len + sum(data)) & 0xff
 *   read response  [block] [len] [data...] [checksum]
 *                  checksum = (block + 2 + sum(data)) & 0xff on this
 *                  controller; other firmwares reportedly use
 *                  (block + len + sum(data)) & 0xff — both are accepted
 *   write ack      [block] [len] [(block + len) & 0xff]
 *
 * There is NO leading 0x06 on responses (the original implementation of this
 * app assumed one and therefore never parsed a single frame).
 */
import {
  BafangBasicParameters, BafangMotorInfo, BafangPedalParameters,
  BafangThrottleParameters, BafangTorqueParameters,
  SpeedmeterType, PedalType, ThrottleMode, TorqueSpeedProfile,
  VOLTAGE_TABLE,
} from '../types/BafangTypes';

export const BLOCK_INFO = 0x51;
export const BLOCK_BASIC = 0x52;
export const BLOCK_PEDAL = 0x53;
export const BLOCK_THROTTLE = 0x54;
export const BLOCK_TORQUE_READ = 0x55;
export const BLOCK_TORQUE_WRITE = 0x56;

export const DATA_LENGTHS: { [block: number]: number } = {
  [BLOCK_INFO]: 16,
  [BLOCK_BASIC]: 24,
  [BLOCK_PEDAL]: 11,
  [BLOCK_THROTTLE]: 6,
  [BLOCK_TORQUE_READ]: 71,
};

export function buildReadCommand(blockCode: number): Uint8Array {
  if (blockCode === BLOCK_INFO) {
    return new Uint8Array([0x11, 0x51, 0x04, 0xb0, 0x05]);
  }
  return new Uint8Array([0x11, blockCode]);
}

/** Write checksum = (block + len + sum(data)) & 0xff — verified accepted */
export function buildWriteCommand(blockCode: number, data: number[]): Uint8Array {
  let sum = blockCode + data.length;
  data.forEach((b) => { sum += b; });
  return new Uint8Array([0x16, blockCode, data.length, ...data, sum & 0xff]);
}

/** Both response-checksum dialects observed in the wild */
export function isValidResponseChecksum(
  blockCode: number,
  length: number,
  data: number[],
  checksum: number
): boolean {
  let payloadSum = 0;
  data.forEach((b) => { payloadSum += b; });
  const withTwo = (blockCode + 2 + payloadSum) & 0xff;   // BBS02B fw 2.0.1.1
  const withLen = (blockCode + length + payloadSum) & 0xff;
  return checksum === withTwo || checksum === withLen;
}

/** The 3-byte ack a controller returns after accepting a write */
export function expectedWriteAck(blockCode: number, dataLength: number): number[] {
  return [blockCode, dataLength, (blockCode + dataLength) & 0xff];
}

export interface ExtractedFrame {
  data: number[];
  /** total bytes consumed from the start of the buffer */
  consumed: number;
}

/**
 * Scan an accumulating receive buffer for a complete, checksum-valid response
 * frame for `blockCode` with `dataLength` payload bytes. Leading garbage is
 * skipped. Returns null while the frame is still incomplete/absent.
 * Pure function — testable without hardware.
 */
export function extractResponseFrame(
  buffer: number[],
  blockCode: number,
  dataLength: number
): ExtractedFrame | null {
  const frameSize = 2 + dataLength + 1;
  for (let start = 0; start + 2 <= buffer.length; start++) {
    if (buffer[start] !== blockCode || buffer[start + 1] !== dataLength) continue;
    if (start + frameSize > buffer.length) return null; // incomplete — wait
    const data = buffer.slice(start + 2, start + 2 + dataLength);
    const checksum = buffer[start + frameSize - 1];
    if (isValidResponseChecksum(blockCode, dataLength, data, checksum)) {
      return { data, consumed: start + frameSize };
    }
  }
  return null;
}

/** Same idea for the 3-byte write ack */
export function extractWriteAck(
  buffer: number[],
  blockCode: number,
  dataLength: number
): ExtractedFrame | null {
  const ack = expectedWriteAck(blockCode, dataLength);
  for (let start = 0; start + 3 <= buffer.length; start++) {
    if (
      buffer[start] === ack[0] &&
      buffer[start + 1] === ack[1] &&
      buffer[start + 2] === ack[2]
    ) {
      return { data: [], consumed: start + 3 };
    }
  }
  return null;
}

// ─── Info (0x51, 16 bytes) ───────────────────────────────────────────────────
// [0-3] manufacturer ASCII, [4-7] model ASCII, [8] hw major char,
// [9] hw minor char, [10-13] fw version chars, [14] voltage table index,
// [15] max current (A)

export function parseInfo(data: number[]): BafangMotorInfo {
  const chars = (start: number, len: number) =>
    String.fromCharCode(...data.slice(start, start + len)).replace(/\0/g, '').trim();
  return {
    serial_number: '',
    manufacturer: chars(0, 4),
    model: chars(4, 4),
    system_code: '',
    hardware_version: `${String.fromCharCode(data[8])}.${String.fromCharCode(data[9])}`,
    firmware_version: data
      .slice(10, 14)
      .map((c) => String.fromCharCode(c))
      .join('.'),
    voltage: VOLTAGE_TABLE[data[14]] ?? 0,
    max_current: data[15],
  };
}

// ─── Basic (0x52, 24 bytes) ──────────────────────────────────────────────────
// [0] low battery protection (V), [1] current limit (A),
// [2-11] per-level current %, [12-21] per-level speed %,
// [22] wheel diameter * 2, [23] (speedmeter_type << 6) | magnets

export function parseBasic(data: number[]): BafangBasicParameters {
  return {
    low_battery_protection: data[0],
    current_limit: data[1],
    assist_profiles: Array.from({ length: 10 }, (_, i) => ({
      current_limit: data[2 + i],
      speed_limit: data[12 + i],
    })),
    wheel_diameter: data[22] / 2,
    speedmeter_type: ((data[23] & 0b11000000) >> 6) as SpeedmeterType,
    speedmeter_magnets: data[23] & 0b111111,
  };
}

export function encodeBasic(p: BafangBasicParameters): number[] {
  return [
    p.low_battery_protection,
    p.current_limit,
    ...p.assist_profiles.map((a) => a.current_limit),
    ...p.assist_profiles.map((a) => a.speed_limit),
    Math.round(p.wheel_diameter * 2),
    ((p.speedmeter_type & 0b11) << 6) | (p.speedmeter_magnets & 0b111111),
  ];
}

// ─── Pedal (0x53, 11 bytes) ──────────────────────────────────────────────────
// [0] type, [1] designated assist level, [2] speed limit, [3] start current %,
// [4] slow start mode, [5] signals before start, [6] work mode (raw,
// preserved), [7] time to stop / 10ms, [8] current decay, [9] stop decay /
// 10ms, [10] keep current %

export function parsePedal(data: number[]): BafangPedalParameters {
  return {
    pedal_type: data[0] as PedalType,
    pedal_assist_level: data[1],
    pedal_speed_limit: data[2],
    pedal_start_current: data[3],
    pedal_slow_start_mode: data[4],
    pedal_signals_before_start: data[5],
    pedal_work_mode: data[6],
    pedal_time_to_stop: data[7] * 10,
    pedal_current_decay: data[8],
    pedal_stop_decay: data[9] * 10,
    pedal_keep_current: data[10],
  };
}

export function encodePedal(p: BafangPedalParameters): number[] {
  return [
    p.pedal_type,
    p.pedal_assist_level,
    p.pedal_speed_limit,
    p.pedal_start_current,
    p.pedal_slow_start_mode,
    p.pedal_signals_before_start,
    p.pedal_work_mode,
    Math.round(p.pedal_time_to_stop / 10),
    p.pedal_current_decay,
    Math.round(p.pedal_stop_decay / 10),
    p.pedal_keep_current,
  ];
}

// ─── Throttle (0x54, 6 bytes) ────────────────────────────────────────────────
// [0] start voltage * 10, [1] end voltage * 10, [2] mode,
// [3] designated assist level, [4] speed limit, [5] start current %

export function parseThrottle(data: number[]): BafangThrottleParameters {
  return {
    throttle_start_voltage: data[0] / 10,
    throttle_end_voltage: data[1] / 10,
    throttle_mode: data[2] as ThrottleMode,
    throttle_assist_level: data[3],
    throttle_speed_limit: data[4],
    throttle_start_current: data[5],
  };
}

export function encodeThrottle(p: BafangThrottleParameters): number[] {
  return [
    Math.round(p.throttle_start_voltage * 10),
    Math.round(p.throttle_end_voltage * 10),
    p.throttle_mode,
    p.throttle_assist_level,
    p.throttle_speed_limit,
    p.throttle_start_current,
  ];
}

// ─── Torque (0x55 read / 0x56 write, 71 bytes) ───────────────────────────────
// Not applicable to BBS01/02/HD (no torque sensor); retained for torque-sensor
// motors. Byte order NOT validated on hardware.

function hl(hi: number, lo: number): number { return (hi << 8) | lo; }

export function parseTorque(data: number[]): BafangTorqueParameters {
  const profile = (offset: number): TorqueSpeedProfile => ({
    start_kg:        data[offset],
    full_kg:         data[offset + 1],
    return_kg:       data[offset + 2],
    min_current_pct: data[offset + 3],
    max_current_pct: data[offset + 4],
    keep_current_pct: data[offset + 5],
    current_decay:   data[offset + 6],
    star_degree: data[offset + 7],
  });
  return {
    base_voltage:      hl(data[0], data[1]),
    error_voltage_min: hl(data[2], data[3]),
    error_voltage_max: hl(data[4], data[5]),
    delta_v_0_5kg:     hl(data[6], data[7]),
    delta_v_5_10kg:    hl(data[8], data[9]),
    delta_v_10_15kg:   hl(data[10], data[11]),
    delta_v_15_20kg:   hl(data[12], data[13]),
    delta_v_20_30kg:   hl(data[14], data[15]),
    delta_v_30_40kg:   hl(data[16], data[17]),
    delta_v_40_50kg:   hl(data[18], data[19]),
    delta_v_50_60kg:   hl(data[20], data[21]),
    boost_time_0speed: data[22],
    speed_profiles: [0, 1, 2, 3, 4, 5].map((i) => profile(23 + i * 8)),
  };
}

export function encodeTorque(p: BafangTorqueParameters): number[] {
  const out: number[] = new Array(71).fill(0);
  const setHL = (i: number, v: number) => { out[i] = (v >> 8) & 0xff; out[i + 1] = v & 0xff; };
  setHL(0, p.base_voltage);
  setHL(2, p.error_voltage_min);
  setHL(4, p.error_voltage_max);
  setHL(6, p.delta_v_0_5kg);
  setHL(8, p.delta_v_5_10kg);
  setHL(10, p.delta_v_10_15kg);
  setHL(12, p.delta_v_15_20kg);
  setHL(14, p.delta_v_20_30kg);
  setHL(16, p.delta_v_30_40kg);
  setHL(18, p.delta_v_40_50kg);
  setHL(20, p.delta_v_50_60kg);
  out[22] = p.boost_time_0speed;
  p.speed_profiles.forEach((sp, i) => {
    const base = 23 + i * 8;
    out[base]     = sp.start_kg;
    out[base + 1] = sp.full_kg;
    out[base + 2] = sp.return_kg;
    out[base + 3] = sp.min_current_pct;
    out[base + 4] = sp.max_current_pct;
    out[base + 5] = sp.keep_current_pct;
    out[base + 6] = sp.current_decay;
    out[base + 7] = sp.star_degree;
  });
  return out;
}
