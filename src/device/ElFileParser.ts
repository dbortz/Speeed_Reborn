import {
  BafangBasicParameters, BafangPedalParameters, BafangThrottleParameters,
  BafangTorqueParameters, TorqueSpeedProfile, AssistProfile,
} from '../types/BafangTypes';

export interface ElFileData {
  basic?: Partial<BafangBasicParameters>;
  pedal?: Partial<BafangPedalParameters>;
  throttle?: Partial<BafangThrottleParameters>;
  torque?: Partial<BafangTorqueParameters>;
}

// Speed profile suffixes: index 0-5 → Spd0/Spd20/Spd40/Spd60/Spd80/Spd100
const SPD_SUFFIX = ['0', '20', '40', '60', '80', '100'] as const;

function parseIni(content: string): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};
  let section = '';
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith(';') || line.startsWith('#')) continue;
    const sectionMatch = line.match(/^\[(.+)\]$/);
    if (sectionMatch) { section = sectionMatch[1]; result[section] = result[section] ?? {}; continue; }
    const eqIdx = line.indexOf('=');
    if (eqIdx !== -1 && section) {
      result[section][line.slice(0, eqIdx).trim()] = line.slice(eqIdx + 1).trim();
    }
  }
  return result;
}

function int(val: string | undefined, fallback = 0): number {
  if (val === undefined) return fallback;
  const n = parseInt(val, 10);
  return isNaN(n) ? fallback : n;
}

export function parseElFile(content: string): ElFileData {
  const ini = parseIni(content);
  const result: ElFileData = {};

  if (ini['Basic']) {
    const b = ini['Basic'];
    const assist_profiles: AssistProfile[] = Array.from({ length: 10 }, (_, i) => ({
      current_limit: int(b[`ALC${i}`]),
      speed_limit:   int(b[`ALBP${i}`]),
    }));
    result.basic = {
      low_battery_protection: int(b['LBP']),
      current_limit:          int(b['LC']),
      wheel_diameter:         int(b['WD']),
      speedmeter_type:        int(b['SMS']) as any,
      speedmeter_magnets:     int(b['SMM'], 1),
      assist_profiles,
    };
  }

  if (ini['Pedal Assist']) {
    const p = ini['Pedal Assist'];
    result.pedal = {
      pedal_type:               int(p['PT']) as any,
      pedal_speed_limit:        int(p['SL']),
      pedal_start_current:      int(p['SC']),
      pedal_slow_start_mode:    int(p['SSM']),
      pedal_signals_before_start: int(p['SDN']),
      pedal_time_to_stop:       int(p['TS']),
      pedal_current_decay:      int(p['CD']),
      pedal_stop_decay:         int(p['SD']),
      pedal_keep_current:       int(p['KC']),
    };
  }

  if (ini['Throttle Handle']) {
    const t = ini['Throttle Handle'];
    result.throttle = {
      throttle_start_voltage: int(t['SV']),
      throttle_end_voltage:   int(t['EV']),
      throttle_mode:          int(t['MODE']) as any,
      throttle_assist_level:  int(t['DA']),
      throttle_speed_limit:   int(t['SL']),
      throttle_start_current: int(t['SC']),
    };
  }

  if (ini['Torque']) {
    const t = ini['Torque'];
    const speed_profiles: TorqueSpeedProfile[] = SPD_SUFFIX.map((s) => ({
      start_kg:         int(t[`SS${s}`]),
      full_kg:          int(t[`FS${s}`]),
      return_kg:        int(t[`RS${s}`]),
      min_current_pct:  int(t[`MIS${s}`]),
      max_current_pct:  int(t[`MAS${s}`]),
      keep_current_pct: int(t[`KS${s}`]),
      current_decay:    int(t[`CS${s}`]),
      star_degree:      int(t[`SDS${s}`]),
    }));
    result.torque = {
      base_voltage:       int(t['BV']),
      error_voltage_min:  int(t['EV0']),
      error_voltage_max:  int(t['EV1']),
      delta_v_0_5kg:      int(t['DV0']),
      delta_v_5_10kg:     int(t['DV1']),
      delta_v_10_15kg:    int(t['DV2']),
      delta_v_15_20kg:    int(t['DV3']),
      delta_v_20_30kg:    int(t['DV4']),
      delta_v_30_40kg:    int(t['DV5']),
      delta_v_40_50kg:    int(t['DV6']),
      delta_v_50_60kg:    int(t['DV7']),
      boost_time_0speed:  int(t['SBT']),
      speed_profiles,
    };
  }

  return result;
}

export function serializeAllToEl(params: {
  basic: BafangBasicParameters | null;
  pedal: BafangPedalParameters | null;
  throttle: BafangThrottleParameters | null;
  torque: BafangTorqueParameters | null;
}): string {
  const lines: string[] = [];

  if (params.basic) {
    const b = params.basic;
    lines.push('[Basic]');
    lines.push(`LBP=${b.low_battery_protection}`);
    lines.push(`LC=${b.current_limit}`);
    for (let i = 0; i < 10; i++) lines.push(`ALC${i}=${b.assist_profiles[i]?.current_limit ?? 0}`);
    for (let i = 0; i < 10; i++) lines.push(`ALBP${i}=${b.assist_profiles[i]?.speed_limit ?? 0}`);
    lines.push(`WD=${b.wheel_diameter}`);
    lines.push(`SMS=${b.speedmeter_type}`);
    lines.push(`SMM=${b.speedmeter_magnets}`);
    lines.push('');
  }

  if (params.pedal) {
    const p = params.pedal;
    lines.push('[Pedal Assist]');
    lines.push(`PT=${p.pedal_type}`);
    lines.push(`SL=${p.pedal_speed_limit}`);
    lines.push(`SC=${p.pedal_start_current}`);
    lines.push(`SSM=${p.pedal_slow_start_mode}`);
    lines.push(`SDN=${p.pedal_signals_before_start}`);
    lines.push(`TS=${p.pedal_time_to_stop}`);
    lines.push(`CD=${p.pedal_current_decay}`);
    lines.push(`SD=${p.pedal_stop_decay}`);
    lines.push(`KC=${p.pedal_keep_current}`);
    lines.push('');
  }

  if (params.throttle) {
    const t = params.throttle;
    lines.push('[Throttle Handle]');
    lines.push(`SV=${t.throttle_start_voltage}`);
    lines.push(`EV=${t.throttle_end_voltage}`);
    lines.push(`MODE=${t.throttle_mode}`);
    lines.push(`DA=${t.throttle_assist_level}`);
    lines.push(`SL=${t.throttle_speed_limit}`);
    lines.push(`SC=${t.throttle_start_current}`);
    lines.push('');
  }

  if (params.torque) {
    const t = params.torque;
    lines.push('[Torque]');
    lines.push(`BV=${t.base_voltage}`);
    lines.push(`EV0=${t.error_voltage_min}`);
    lines.push(`EV1=${t.error_voltage_max}`);
    lines.push(`DV0=${t.delta_v_0_5kg}`);
    lines.push(`DV1=${t.delta_v_5_10kg}`);
    lines.push(`DV2=${t.delta_v_10_15kg}`);
    lines.push(`DV3=${t.delta_v_15_20kg}`);
    lines.push(`DV4=${t.delta_v_20_30kg}`);
    lines.push(`DV5=${t.delta_v_30_40kg}`);
    lines.push(`DV6=${t.delta_v_40_50kg}`);
    lines.push(`DV7=${t.delta_v_50_60kg}`);
    lines.push(`SBT=${t.boost_time_0speed}`);
    t.speed_profiles.forEach((sp, i) => {
      const s = SPD_SUFFIX[i];
      lines.push(`SS${s}=${sp.start_kg}`);
      lines.push(`FS${s}=${sp.full_kg}`);
      lines.push(`RS${s}=${sp.return_kg}`);
      lines.push(`MIS${s}=${sp.min_current_pct}`);
      lines.push(`MAS${s}=${sp.max_current_pct}`);
      lines.push(`KS${s}=${sp.keep_current_pct}`);
      lines.push(`CS${s}=${sp.current_decay}`);
      lines.push(`SDS${s}=${sp.star_degree}`);
    });
  }

  return lines.join('\r\n') + '\r\n';
}
