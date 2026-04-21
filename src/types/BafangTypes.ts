export enum SpeedmeterType {
  External = 0,
  Internal = 1,
  Motorphase = 2,
}

export enum PedalType {
  None = 0,
  DHSensor12 = 1,
  BBSensor32 = 2,
  DoubleSignal24 = 3,
}

export enum ThrottleMode {
  Speed = 0,
  Current = 1,
}

export const SpeedLimitByDisplay = 0xff;

export interface AssistProfile {
  current_limit: number;  // 0-100 %
  speed_limit: number;    // 0-100 %
}

export interface BafangMotorInfo {
  serial_number: string;
  model: string;
  manufacturer: string;
  system_code: string;
  firmware_version: string;
  hardware_version: string;
  voltage: string;
  max_current: string;
}

export interface BafangBasicParameters {
  low_battery_protection: number;
  current_limit: number;
  assist_levels: number;
  wheel_diameter: number;
  speedmeter_type: SpeedmeterType;
  speedmeter_magnets: number;
  assist_profiles: AssistProfile[];
}

export interface BafangPedalParameters {
  pedal_type: PedalType;
  pedal_speed_limit: number;
  pedal_start_current: number;
  pedal_slow_start_mode: number;
  pedal_signals_before_start: number;
  pedal_time_to_stop: number;
  pedal_current_decay: number;
  pedal_stop_decay: number;
  pedal_keep_current: number;
}

export interface BafangThrottleParameters {
  throttle_start_voltage: number;
  throttle_end_voltage: number;
  throttle_mode: ThrottleMode;
  throttle_assist_level: number;
  throttle_speed_limit: number;
  throttle_start_current: number;
}

export interface TorqueSpeedProfile {
  start_kg: number;       // SS
  full_kg: number;        // FS
  return_kg: number;      // RS
  min_current_pct: number; // MIS
  max_current_pct: number; // MAS
  keep_current_pct: number; // KS
  current_decay: number;  // CS
  star_degree: number; // SDS — confirmed from karlsspecialsauceludicrous.el save file (labelled "StarDegree" in original UI)
}

// Layout confirmed from karlsspecialsauceludicrous.el save file:
// 23 bytes calibration + 6×8 bytes speed profiles = 71 bytes exactly.
// No "About Tq" section in this block (those params may be read-only or separate block).
// TODO: Validate byte order by serial port capture with real motor.
export interface BafangTorqueParameters {
  base_voltage: number;       // BV — bytes 0-1 H+L
  error_voltage_min: number;  // EV0 — bytes 2-3
  error_voltage_max: number;  // EV1 — bytes 4-5
  delta_v_0_5kg: number;      // DV0 — bytes 6-7
  delta_v_5_10kg: number;     // DV1 — bytes 8-9
  delta_v_10_15kg: number;    // DV2 — bytes 10-11
  delta_v_15_20kg: number;    // DV3 — bytes 12-13
  delta_v_20_30kg: number;    // DV4 — bytes 14-15
  delta_v_30_40kg: number;    // DV5 — bytes 16-17
  delta_v_40_50kg: number;    // DV6 — bytes 18-19
  delta_v_50_60kg: number;    // DV7 — bytes 20-21
  boost_time_0speed: number;  // SBT — byte 22
  speed_profiles: TorqueSpeedProfile[]; // bytes 23-70, 6×8 bytes
}

export const SPEED_PROFILE_LABELS = ['Spd0', 'Spd20', 'Spd40', 'Spd60', 'Spd80', 'Spd100'] as const;

export const DEFAULT_BASIC: BafangBasicParameters = {
  low_battery_protection: 300,
  current_limit: 15,
  assist_levels: 5,
  wheel_diameter: 26,
  speedmeter_type: SpeedmeterType.External,
  speedmeter_magnets: 1,
  assist_profiles: Array.from({ length: 10 }, (_, i) => ({
    current_limit: Math.round((i + 1) * 10),
    speed_limit: Math.round((i + 1) * 10),
  })),
};

export const DEFAULT_PEDAL: BafangPedalParameters = {
  pedal_type: PedalType.BBSensor32,
  pedal_speed_limit: SpeedLimitByDisplay,
  pedal_start_current: 10,
  pedal_slow_start_mode: 3,
  pedal_signals_before_start: 4,
  pedal_time_to_stop: 250,
  pedal_current_decay: 4,
  pedal_stop_decay: 0,
  pedal_keep_current: 30,
};

export const DEFAULT_THROTTLE: BafangThrottleParameters = {
  throttle_start_voltage: 1100,
  throttle_end_voltage: 4200,
  throttle_mode: ThrottleMode.Speed,
  throttle_assist_level: 0xff,
  throttle_speed_limit: 25,
  throttle_start_current: 10,
};

// Default values from karlsspecialsauceludicrous.el (real configuration file)
export const DEFAULT_TORQUE: BafangTorqueParameters = {
  base_voltage: 0,
  error_voltage_min: 300,
  error_voltage_max: 4300,
  delta_v_0_5kg: 200,
  delta_v_5_10kg: 200,
  delta_v_10_15kg: 400,
  delta_v_15_20kg: 400,
  delta_v_20_30kg: 200,
  delta_v_30_40kg: 200,
  delta_v_40_50kg: 400,
  delta_v_50_60kg: 400,
  boost_time_0speed: 120,
  speed_profiles: [
    { start_kg: 25, full_kg: 50, return_kg: 12, min_current_pct: 2,  max_current_pct: 6,   keep_current_pct: 2, current_decay: 3, star_degree: 1 },
    { start_kg: 16, full_kg: 45, return_kg: 9,  min_current_pct: 5,  max_current_pct: 50,  keep_current_pct: 2, current_decay: 3, star_degree: 1 },
    { start_kg: 12, full_kg: 40, return_kg: 6,  min_current_pct: 15, max_current_pct: 100, keep_current_pct: 3, current_decay: 3, star_degree: 1 },
    { start_kg: 10, full_kg: 35, return_kg: 5,  min_current_pct: 15, max_current_pct: 100, keep_current_pct: 2, current_decay: 2, star_degree: 1 },
    { start_kg: 8,  full_kg: 30, return_kg: 4,  min_current_pct: 10, max_current_pct: 100, keep_current_pct: 2, current_decay: 2, star_degree: 1 },
    { start_kg: 6,  full_kg: 25, return_kg: 4,  min_current_pct: 10, max_current_pct: 100, keep_current_pct: 2, current_decay: 2, star_degree: 1 },
  ],
};

export interface MotorState {
  connected: boolean;
  info: BafangMotorInfo | null;
  basic: BafangBasicParameters | null;
  pedal: BafangPedalParameters | null;
  throttle: BafangThrottleParameters | null;
  torque: BafangTorqueParameters | null;
}
