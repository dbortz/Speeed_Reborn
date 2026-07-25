/**
 * Named profiles for BBS02B configs, stored via Capacitor Preferences.
 *
 * The on-disk JSON schema is IDENTICAL to the OpenBafangTool fork's
 * "obt-uart-profile" files (dbortz/OpenBafangTool, branch profiles), so a
 * profile exported there can be imported here verbatim and vice versa.
 * Field-name differences between the two apps (speedmeter_magnets here vs
 * magnets_per_wheel_rotation there; volts here are numbers in both) are
 * mapped in toObtJson/fromObtJson.
 */
import { Preferences } from '@capacitor/preferences';
import { create } from 'zustand';
import {
  BafangBasicParameters, BafangMotorInfo, BafangPedalParameters,
  BafangThrottleParameters, SpeedmeterType, PedalType, ThrottleMode,
} from '../types/BafangTypes';

const INDEX_KEY = 'profiles-index';
const PROFILE_KEY_PREFIX = 'profile:';
const SEED_FLAG_KEY = 'profiles-seeded-v1';

export interface StoredProfile {
  format: 'obt-uart-profile';
  version: 1;
  name: string;
  created: string;
  motor_info: unknown;
  basic: {
    low_battery_protection: number;
    current_limit: number;
    assist_profiles: { current_limit: number; speed_limit: number }[];
    wheel_diameter: number;
    magnets_per_wheel_rotation: number;
    speedmeter_type: number;
  };
  pedal: {
    pedal_type: number;
    pedal_assist_level: number;
    pedal_speed_limit: number;
    pedal_start_current: number;
    pedal_slow_start_mode: number;
    pedal_signals_before_start: number;
    pedal_time_to_stop: number;
    pedal_current_decay: number;
    pedal_stop_decay: number;
    pedal_keep_current: number;
  };
  throttle: {
    throttle_start_voltage: number;
    throttle_end_voltage: number;
    throttle_mode: number;
    throttle_assist_level: number;
    throttle_speed_limit: number;
    throttle_start_current: number;
  };
}

export interface AppProfileData {
  basic: BafangBasicParameters;
  pedal: Omit<BafangPedalParameters, 'pedal_work_mode'>;
  throttle: BafangThrottleParameters;
}

export function toObtJson(
  name: string,
  created: string,
  motorInfo: BafangMotorInfo | null,
  basic: BafangBasicParameters,
  pedal: BafangPedalParameters,
  throttle: BafangThrottleParameters
): StoredProfile {
  // pedal_work_mode is device state, not tune state — deliberately excluded
  const { pedal_work_mode: _ignored, ...pedalRest } = pedal;
  const { speedmeter_magnets, ...basicRest } = basic;
  return {
    format: 'obt-uart-profile',
    version: 1,
    name,
    created,
    motor_info: motorInfo,
    basic: { ...basicRest, magnets_per_wheel_rotation: speedmeter_magnets },
    pedal: pedalRest,
    throttle: { ...throttle },
  };
}

export function fromObtJson(profile: StoredProfile): AppProfileData {
  const { magnets_per_wheel_rotation, ...basicRest } = profile.basic;
  return {
    basic: {
      ...basicRest,
      speedmeter_type: profile.basic.speedmeter_type as SpeedmeterType,
      speedmeter_magnets: magnets_per_wheel_rotation,
    },
    pedal: {
      ...profile.pedal,
      pedal_type: profile.pedal.pedal_type as PedalType,
    },
    throttle: {
      ...profile.throttle,
      throttle_mode: profile.throttle.throttle_mode as ThrottleMode,
    },
  };
}

// ─── Built-in seed profiles (bike-truth, verified 2026-07-25 by raw read) ────

const MOTOR_INFO_SEED = {
  serial_number: 'unknown',
  model: 'SZZ9',
  manufacturer: 'HZXT',
  system_code: '',
  firmware_version: '2.0.1.1',
  hardware_version: '1.1',
  voltage: 48,
  max_current: 25,
};

export const SEED_PROFILES: StoredProfile[] = [
  {
    format: 'obt-uart-profile',
    version: 1,
    name: 'kidsafe',
    created: '2026-07-25T00:00:00.000Z',
    motor_info: MOTOR_INFO_SEED,
    basic: {
      low_battery_protection: 41,
      current_limit: 15,
      assist_profiles: [30, 30, 50, 50, 60, 60, 70, 70, 100, 100].map((c) => ({
        current_limit: c,
        speed_limit: 100,
      })),
      wheel_diameter: 27.5,
      magnets_per_wheel_rotation: 1,
      speedmeter_type: 0,
    },
    pedal: {
      pedal_type: 3,
      pedal_assist_level: 255,
      pedal_speed_limit: 24,
      pedal_start_current: 10,
      pedal_slow_start_mode: 6,
      pedal_signals_before_start: 4,
      pedal_time_to_stop: 100,
      pedal_current_decay: 8,
      pedal_stop_decay: 0,
      pedal_keep_current: 80,
    },
    throttle: {
      throttle_start_voltage: 1.1,
      throttle_end_voltage: 3.5,
      throttle_mode: 1,
      throttle_assist_level: 255,
      throttle_speed_limit: 24,
      throttle_start_current: 10,
    },
  },
  {
    format: 'obt-uart-profile',
    version: 1,
    name: 'stock-2026-07-17',
    created: '2026-07-17T00:00:00.000Z',
    motor_info: MOTOR_INFO_SEED,
    basic: {
      low_battery_protection: 41,
      current_limit: 25,
      assist_profiles: [
        { current_limit: 1, speed_limit: 1 },
        { current_limit: 52, speed_limit: 44 },
        { current_limit: 58, speed_limit: 51 },
        { current_limit: 64, speed_limit: 58 },
        { current_limit: 70, speed_limit: 65 },
        { current_limit: 76, speed_limit: 72 },
        { current_limit: 82, speed_limit: 79 },
        { current_limit: 88, speed_limit: 86 },
        { current_limit: 94, speed_limit: 93 },
        { current_limit: 100, speed_limit: 100 },
      ],
      wheel_diameter: 27.5,
      magnets_per_wheel_rotation: 1,
      speedmeter_type: 0,
    },
    pedal: {
      pedal_type: 3,
      pedal_assist_level: 255,
      pedal_speed_limit: 255,
      pedal_start_current: 20,
      pedal_slow_start_mode: 4,
      pedal_signals_before_start: 4,
      pedal_time_to_stop: 100,
      pedal_current_decay: 8,
      pedal_stop_decay: 0,
      pedal_keep_current: 80,
    },
    throttle: {
      throttle_start_voltage: 1.1,
      throttle_end_voltage: 3.5,
      throttle_mode: 0,
      throttle_assist_level: 9,
      throttle_speed_limit: 40,
      throttle_start_current: 10,
    },
  },
];

// ─── Persistence ─────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-_ ]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

async function readIndex(): Promise<string[]> {
  const { value } = await Preferences.get({ key: INDEX_KEY });
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeIndex(slugs: string[]): Promise<void> {
  await Preferences.set({ key: INDEX_KEY, value: JSON.stringify(slugs) });
}

export async function persistProfile(profile: StoredProfile): Promise<string> {
  const slug = slugify(profile.name);
  if (!slug) throw new Error('Profile name is empty');
  await Preferences.set({
    key: PROFILE_KEY_PREFIX + slug,
    value: JSON.stringify(profile),
  });
  const index = await readIndex();
  if (!index.includes(slug)) {
    index.push(slug);
    await writeIndex(index.sort());
  }
  return slug;
}

export async function loadStoredProfile(slug: string): Promise<StoredProfile> {
  const { value } = await Preferences.get({ key: PROFILE_KEY_PREFIX + slug });
  if (!value) throw new Error(`Profile "${slug}" not found`);
  const profile = JSON.parse(value);
  if (profile.format !== 'obt-uart-profile') {
    throw new Error('Not a profile record');
  }
  return profile as StoredProfile;
}

export async function removeProfile(slug: string): Promise<void> {
  await Preferences.remove({ key: PROFILE_KEY_PREFIX + slug });
  const index = await readIndex();
  await writeIndex(index.filter((s) => s !== slug));
}

async function seedIfNeeded(): Promise<void> {
  const { value } = await Preferences.get({ key: SEED_FLAG_KEY });
  if (value) return;
  for (const seed of SEED_PROFILES) {
    await persistProfile(seed);
  }
  await Preferences.set({ key: SEED_FLAG_KEY, value: 'true' });
}

// ─── Zustand store for the UI ────────────────────────────────────────────────

export interface ProfileSummary {
  slug: string;
  name: string;
  created: string;
}

interface ProfileStore {
  profiles: ProfileSummary[];
  loaded: boolean;
  refresh: () => Promise<void>;
  save: (
    name: string,
    motorInfo: BafangMotorInfo | null,
    basic: BafangBasicParameters,
    pedal: BafangPedalParameters,
    throttle: BafangThrottleParameters
  ) => Promise<void>;
  load: (slug: string) => Promise<AppProfileData>;
  remove: (slug: string) => Promise<void>;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profiles: [],
  loaded: false,

  refresh: async () => {
    await seedIfNeeded();
    const slugs = await readIndex();
    const profiles: ProfileSummary[] = [];
    for (const slug of slugs) {
      try {
        const p = await loadStoredProfile(slug);
        profiles.push({ slug, name: p.name, created: p.created });
      } catch {
        // skip unreadable entries
      }
    }
    set({ profiles, loaded: true });
  },

  save: async (name, motorInfo, basic, pedal, throttle) => {
    const profile = toObtJson(
      name,
      new Date().toISOString(),
      motorInfo,
      basic,
      pedal,
      throttle
    );
    await persistProfile(profile);
    await useProfileStore.getState().refresh();
  },

  load: async (slug) => {
    const profile = await loadStoredProfile(slug);
    return fromObtJson(profile);
  },

  remove: async (slug) => {
    await removeProfile(slug);
    await useProfileStore.getState().refresh();
  },
}));
