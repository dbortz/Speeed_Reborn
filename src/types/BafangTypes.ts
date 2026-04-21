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
  start_kg: number;
  full_kg: number;
  return_kg: number;
  min_current_pct: number;
  max_current_pct: number;
  keep_current_pct: number;
  current_decay: number;
}

// NOTE: Byte layout approximated from Controllerst_torque.exe reverse engineering.
// TODO: Validate all field positions by serial port capture with real motor.
export interface BafangTorqueParameters {
  base_voltage: number;
  error_voltage_min: number;
  error_voltage_max: number;
  delta_v_0_5kg: number;
  delta_v_5_10kg: number;
  delta_v_10_15kg: number;
  delta_v_15_20kg: number;
  delta_v_20_30kg: number;
  delta_v_30_40kg: number;
  delta_v_40_50kg: number;
  delta_v_50_60kg: number;
  boost_time_0speed: number;
  speed_profiles: TorqueSpeedProfile[];
  speed_signal_acc: number;
  speed_sig_level: number;
  level_h_time: number;
  level_l_time: number;
  tq_voltage: number;
}

export const SPEED_PROFILE_LABELS = ['Spd0', 'Spd20', 'Spd40', 'Spd60', 'Spd80', 'Spd100'] as const;

export interface MotorState {
  connected: boolean;
  info: BafangMotorInfo | null;
  basic: BafangBasicParameters | null;
  pedal: BafangPedalParameters | null;
  throttle: BafangThrottleParameters | null;
  torque: BafangTorqueParameters | null;
}
