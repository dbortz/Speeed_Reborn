import { create } from 'zustand';
import {
  BafangMotorInfo, BafangBasicParameters, BafangPedalParameters,
  BafangThrottleParameters, BafangTorqueParameters,
  DEFAULT_BASIC, DEFAULT_PEDAL, DEFAULT_THROTTLE, DEFAULT_TORQUE,
} from '../types/BafangTypes';
import {
  buildReadCommand, buildWriteCommand,
  parseInfo, parseBasic, parsePedal, parseThrottle, parseTorque,
  encodeBasic, encodePedal, encodeThrottle, encodeTorque,
} from '../device/BafangProtocol';
import { connect, disconnect, sendAndReceive, sendOnly } from '../device/UsbSerial';
import { ElFileData } from '../device/ElFileParser';

export interface AboutTqReading {
  speed_signal_acc: number;
  speed_sig_level: number;
  level_h_time: number;
  level_l_time: number;
  tq_voltage: number;
}

interface MotorStore {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  info: BafangMotorInfo | null;
  basic: BafangBasicParameters | null;
  pedal: BafangPedalParameters | null;
  throttle: BafangThrottleParameters | null;
  torque: BafangTorqueParameters | null;
  darkMode: boolean;
  aboutTqReading: AboutTqReading | null;
  continuousGetActive: boolean;

  connectDevice: (deviceId: number) => Promise<void>;
  disconnectDevice: () => Promise<void>;
  readAll: () => Promise<void>;
  readInfo: () => Promise<void>;
  readBasic: () => Promise<void>;
  readPedal: () => Promise<void>;
  readThrottle: () => Promise<void>;
  readTorque: () => Promise<void>;
  readAboutTq: () => Promise<void>;
  stopContinuousGet: () => void;
  writeBasic: (params: BafangBasicParameters) => Promise<void>;
  writePedal: (params: BafangPedalParameters) => Promise<void>;
  writeThrottle: (params: BafangThrottleParameters) => Promise<void>;
  writeTorque: (params: BafangTorqueParameters) => Promise<void>;
  loadFromFile: (data: ElFileData) => void;
  setDarkMode: (dark: boolean) => void;
  setError: (msg: string | null) => void;
}

export const useMotorStore = create<MotorStore>((set, get) => ({
  connected: false,
  connecting: false,
  error: null,
  info: null,
  basic: null,
  pedal: null,
  throttle: null,
  torque: null,
  darkMode: true,
  aboutTqReading: null,
  continuousGetActive: false,

  connectDevice: async (deviceId) => {
    set({ connecting: true, error: null });
    try {
      await connect(deviceId);
      set({ connected: true, connecting: false });
    } catch (e: any) {
      set({ connecting: false, error: e.message });
    }
  },

  disconnectDevice: async () => {
    try { await disconnect(); } catch { /* ignore hardware errors on disconnect */ }
    set({ connected: false, info: null, basic: null, pedal: null, throttle: null, torque: null });
  },

  readAll: async () => {
    await get().readInfo();
    await get().readBasic();
    await get().readPedal();
    await get().readThrottle();
    await get().readTorque();
  },

  readInfo: async () => {
    try {
      const data = await sendAndReceive(buildReadCommand(0x60), 0x60, 34);
      set({ info: parseInfo(data) });
    } catch (e: any) { set({ error: e.message }); }
  },

  readBasic: async () => {
    try {
      const data = await sendAndReceive(buildReadCommand(0x52), 0x52, 24);
      set({ basic: parseBasic(data) });
    } catch (e: any) { set({ error: e.message }); }
  },

  readPedal: async () => {
    try {
      const data = await sendAndReceive(buildReadCommand(0x53), 0x53, 11);
      set({ pedal: parsePedal(data) });
    } catch (e: any) { set({ error: e.message }); }
  },

  readThrottle: async () => {
    try {
      const data = await sendAndReceive(buildReadCommand(0x54), 0x54, 6);
      set({ throttle: parseThrottle(data) });
    } catch (e: any) { set({ error: e.message }); }
  },

  readTorque: async () => {
    try {
      const data = await sendAndReceive(buildReadCommand(0x55), 0x55, 71);
      set({ torque: parseTorque(data) });
    } catch (e: any) { set({ error: e.message }); }
  },

  // TODO: Block code 0x57 is a PLACEHOLDER — real block code for live About Tq reading
  // is NOT YET KNOWN. Response length (7 bytes) is also a placeholder.
  // Must be validated by serial port capture on a real motor before relying on this feature.
  readAboutTq: async () => {
    try {
      const data = await sendAndReceive(buildReadCommand(0x57), 0x57, 7);
      set({
        aboutTqReading: {
          speed_signal_acc: data[0],
          speed_sig_level:  data[1],
          level_h_time:     data[2],
          level_l_time:     data[3],
          tq_voltage:       (data[4] << 8) | data[5],
        },
      });
    } catch (e: any) { set({ error: e.message }); }
  },

  stopContinuousGet: () => set({ continuousGetActive: false }),

  writeBasic: async (params) => {
    try {
      const cmd = buildWriteCommand(0x52, encodeBasic(params));
      await sendOnly(cmd);
      set({ basic: params });
    } catch (e: any) { set({ error: e.message }); }
  },

  writePedal: async (params) => {
    try {
      const cmd = buildWriteCommand(0x53, encodePedal(params));
      await sendOnly(cmd);
      set({ pedal: params });
    } catch (e: any) { set({ error: e.message }); }
  },

  writeThrottle: async (params) => {
    try {
      const cmd = buildWriteCommand(0x54, encodeThrottle(params));
      await sendOnly(cmd);
      set({ throttle: params });
    } catch (e: any) { set({ error: e.message }); }
  },

  writeTorque: async (params) => {
    try {
      const cmd = buildWriteCommand(0x56, encodeTorque(params));
      await sendOnly(cmd);
      set({ torque: params });
    } catch (e: any) { set({ error: e.message }); }
  },

  loadFromFile: (data) => {
    const s = get();
    const updates: any = {};
    if (data.basic)    updates.basic    = { ...(s.basic    ?? DEFAULT_BASIC),    ...data.basic };
    if (data.pedal)    updates.pedal    = { ...(s.pedal    ?? DEFAULT_PEDAL),    ...data.pedal };
    if (data.throttle) updates.throttle = { ...(s.throttle ?? DEFAULT_THROTTLE), ...data.throttle };
    if (data.torque)   updates.torque   = { ...(s.torque   ?? DEFAULT_TORQUE),   ...data.torque };
    set(updates);
  },

  setDarkMode: (dark) => set({ darkMode: dark }),
  setError: (msg) => set({ error: msg }),
}));
