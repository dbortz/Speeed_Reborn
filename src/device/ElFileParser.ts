// Parses .el file content (Windows INI format) into store-compatible objects.
// Returns partial objects — only sections present in the file are returned.
// Reference format from karlsspecialsauceludicrous.el:
//   [Torque]
//   BV=0, EV0=300, EV1=4300, DV0-DV7=delta voltages, SBT=boost time
//   Speed profiles use suffix 0-5 (Spd0/Spd20/Spd40/Spd60/Spd80/Spd100):
//     SS{n}=start_kg, FS{n}=full_kg, RS{n}=return_kg, MIS{n}=min_current_pct,
//     MAS{n}=max_current_pct, KS{n}=keep_current_pct, CS{n}=current_decay, SDS{n}=star_degree

import { BafangTorqueParameters, TorqueSpeedProfile } from '../types/BafangTypes';

export interface ElFileData {
  torque?: Partial<BafangTorqueParameters>;
  // Extend later for basic/pedal/throttle if needed
}

/** Parse a Windows INI-style .el file into sections and key=value maps */
function parseIni(content: string): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};
  let currentSection = '';
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith(';') || line.startsWith('#')) continue;
    const sectionMatch = line.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      result[currentSection] = result[currentSection] ?? {};
      continue;
    }
    const eqIdx = line.indexOf('=');
    if (eqIdx !== -1 && currentSection) {
      const key = line.slice(0, eqIdx).trim();
      const value = line.slice(eqIdx + 1).trim();
      result[currentSection][key] = value;
    }
  }
  return result;
}

function int(val: string | undefined): number {
  if (val === undefined) return 0;
  return parseInt(val, 10) || 0;
}

export function parseElFile(content: string): ElFileData {
  const ini = parseIni(content);
  const result: ElFileData = {};

  if (ini['Torque']) {
    const t = ini['Torque'];

    // Build the 6 speed profiles (index 0-5 = Spd0/Spd20/Spd40/Spd60/Spd80/Spd100)
    const speed_profiles: TorqueSpeedProfile[] = Array.from({ length: 6 }, (_, n) => ({
      start_kg:        int(t[`SS${n}`]),
      full_kg:         int(t[`FS${n}`]),
      return_kg:       int(t[`RS${n}`]),
      min_current_pct: int(t[`MIS${n}`]),
      max_current_pct: int(t[`MAS${n}`]),
      keep_current_pct: int(t[`KS${n}`]),
      current_decay:   int(t[`CS${n}`]),
      star_degree:     int(t[`SDS${n}`]),
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

export function serializeTorqueToEl(params: BafangTorqueParameters): string {
  const lines: string[] = ['[Torque]'];
  lines.push(`BV=${params.base_voltage}`);
  lines.push(`EV0=${params.error_voltage_min}`);
  lines.push(`EV1=${params.error_voltage_max}`);
  lines.push(`DV0=${params.delta_v_0_5kg}`);
  lines.push(`DV1=${params.delta_v_5_10kg}`);
  lines.push(`DV2=${params.delta_v_10_15kg}`);
  lines.push(`DV3=${params.delta_v_15_20kg}`);
  lines.push(`DV4=${params.delta_v_20_30kg}`);
  lines.push(`DV5=${params.delta_v_30_40kg}`);
  lines.push(`DV6=${params.delta_v_40_50kg}`);
  lines.push(`DV7=${params.delta_v_50_60kg}`);
  lines.push(`SBT=${params.boost_time_0speed}`);
  params.speed_profiles.forEach((sp, n) => {
    lines.push(`SS${n}=${sp.start_kg}`);
    lines.push(`FS${n}=${sp.full_kg}`);
    lines.push(`RS${n}=${sp.return_kg}`);
    lines.push(`MIS${n}=${sp.min_current_pct}`);
    lines.push(`MAS${n}=${sp.max_current_pct}`);
    lines.push(`KS${n}=${sp.keep_current_pct}`);
    lines.push(`CS${n}=${sp.current_decay}`);
    lines.push(`SDS${n}=${sp.star_degree}`);
  });
  return lines.join('\r\n') + '\r\n';
}
