import { describe, it, expect } from 'vitest';
import {
  buildReadCommand,
  buildWriteCommand,
  calcChecksum,
  encodeBasic,
  encodePedal,
  encodeThrottle,
  encodeTorque,
  parseBasic,
  parsePedal,
  parseThrottle,
  parseTorque,
  parseInfo,
} from '../src/device/BafangProtocol';
import {
  SpeedmeterType, PedalType, ThrottleMode,
  BafangBasicParameters, BafangPedalParameters,
  BafangThrottleParameters, BafangTorqueParameters,
} from '../src/types/BafangTypes';

describe('calcChecksum', () => {
  it('XORs all bytes', () => {
    expect(calcChecksum([0x11, 0x22, 0x33])).toBe(0x11 ^ 0x22 ^ 0x33);
  });
  it('returns 0 for empty array', () => {
    expect(calcChecksum([])).toBe(0);
  });
});

describe('buildReadCommand', () => {
  it('builds 3-byte read frame', () => {
    expect(buildReadCommand(0x52)).toEqual(new Uint8Array([0x11, 0x52, 0x00]));
    expect(buildReadCommand(0x55)).toEqual(new Uint8Array([0x11, 0x55, 0x00]));
  });
});

describe('buildWriteCommand', () => {
  it('builds write frame with checksum', () => {
    const data = [0x01, 0x02, 0x03];
    const cmd = buildWriteCommand(0x52, data);
    const checksum = 0x01 ^ 0x02 ^ 0x03;
    expect(cmd).toEqual(new Uint8Array([0x16, 0x52, 0x03, 0x01, 0x02, 0x03, checksum]));
  });
});

describe('encodeBasic / parseBasic round-trip', () => {
  const params: BafangBasicParameters = {
    low_battery_protection: 295,
    current_limit: 15,
    assist_levels: 9,
    wheel_diameter: 26,
    speedmeter_type: SpeedmeterType.External,
    speedmeter_magnets: 1,
    assist_profiles: Array.from({ length: 10 }, (_, i) => ({
      current_limit: (i + 1) * 10,
      speed_limit: (i + 1) * 10,
    })),
  };

  it('encodes to 24 bytes', () => {
    const bytes = encodeBasic(params);
    expect(bytes.length).toBe(24);
  });

  it('round-trips through encode/parse', () => {
    const bytes = encodeBasic(params);
    const parsed = parseBasic(bytes);
    expect(parsed.low_battery_protection).toBe(params.low_battery_protection);
    expect(parsed.current_limit).toBe(params.current_limit);
    expect(parsed.assist_levels).toBe(params.assist_levels);
    expect(parsed.wheel_diameter).toBe(params.wheel_diameter);
    expect(parsed.speedmeter_type).toBe(params.speedmeter_type);
    expect(parsed.assist_profiles[0]).toEqual(params.assist_profiles[0]);
    expect(parsed.assist_profiles[9]).toEqual(params.assist_profiles[9]);
  });
});

describe('encodePedal / parsePedal round-trip', () => {
  const params: BafangPedalParameters = {
    pedal_type: PedalType.BBSensor32,
    pedal_speed_limit: 25,
    pedal_start_current: 30,
    pedal_slow_start_mode: 4,
    pedal_signals_before_start: 8,
    pedal_time_to_stop: 250,
    pedal_current_decay: 4,
    pedal_stop_decay: 10,
    pedal_keep_current: 30,
  };

  it('round-trips through encode/parse', () => {
    const bytes = encodePedal(params);
    const parsed = parsePedal(bytes);
    expect(parsed.pedal_type).toBe(params.pedal_type);
    expect(parsed.pedal_speed_limit).toBe(params.pedal_speed_limit);
    expect(parsed.pedal_time_to_stop).toBe(params.pedal_time_to_stop);
  });
});

describe('encodeThrottle / parseThrottle round-trip', () => {
  const params: BafangThrottleParameters = {
    throttle_start_voltage: 1100,
    throttle_end_voltage: 4200,
    throttle_mode: ThrottleMode.Speed,
    throttle_assist_level: 0xff,
    throttle_speed_limit: 30,
    throttle_start_current: 10,
  };

  it('round-trips through encode/parse', () => {
    const bytes = encodeThrottle(params);
    const parsed = parseThrottle(bytes);
    expect(parsed.throttle_start_voltage).toBe(params.throttle_start_voltage);
    expect(parsed.throttle_end_voltage).toBe(params.throttle_end_voltage);
    expect(parsed.throttle_mode).toBe(params.throttle_mode);
  });
});

describe('encodeTorque / parseTorque round-trip', () => {
  const makeProfile = (n: number) => ({
    start_kg: n, full_kg: n + 5, return_kg: n + 2,
    min_current_pct: 20, max_current_pct: 100, keep_current_pct: 30,
    current_decay: 4, star_degree: 1,
  });
  const params: BafangTorqueParameters = {
    base_voltage: 2500,
    error_voltage_min: 200,
    error_voltage_max: 4800,
    delta_v_0_5kg: 150,
    delta_v_5_10kg: 200,
    delta_v_10_15kg: 250,
    delta_v_15_20kg: 300,
    delta_v_20_30kg: 400,
    delta_v_30_40kg: 500,
    delta_v_40_50kg: 600,
    delta_v_50_60kg: 700,
    boost_time_0speed: 50,
    speed_profiles: [0,1,2,3,4,5].map(makeProfile),
  };

  it('encodes to 71 bytes', () => {
    expect(encodeTorque(params).length).toBe(71);
  });

  it('round-trips through encode/parse', () => {
    const bytes = encodeTorque(params);
    const parsed = parseTorque(bytes);
    expect(parsed.base_voltage).toBe(params.base_voltage);
    expect(parsed.boost_time_0speed).toBe(params.boost_time_0speed);
    expect(parsed.speed_profiles[0].start_kg).toBe(params.speed_profiles[0].start_kg);
    expect(parsed.speed_profiles[5].full_kg).toBe(params.speed_profiles[5].full_kg);
    expect(parsed.speed_profiles[0].star_degree).toBe(1);
  });
});
