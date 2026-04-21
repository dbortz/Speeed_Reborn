import { create } from 'zustand';
import {
  BafangMotorInfo, BafangBasicParameters, BafangPedalParameters,
  BafangThrottleParameters, BafangTorqueParameters,
} from '../types/BafangTypes';
import {
  buildReadCommand, buildWriteCommand,
  parseInfo, parseBasic, parsePedal, parseThrottle, parseTorque,
  encodeBasic, encodePedal, encodeThrottle, encodeTorque,
} from '../device/BafangProtocol';
import { connect, disconnect, sendAndReceive, sendOnly } from '../device/UsbSerial';

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

  connectDevice: (deviceId: number) => Promise<void>;
  disconnectDevice: () => Promise<void>;
  readAll: () => Promise<void>;
  readInfo: () => Promise<void>;
  readBasic: () => Promise<void>;
  readPedal: () => Promise<void>;
  readThrottle: () => Promise<void>;
  readTorque: () => Promise<void>;
  writeBasic: (params: BafangBasicParameters) => Promise<void>;
  writePedal: (params: BafangPedalParameters) => Promise<void>;
  writeThrottle: (params: BafangThrottleParameters) => Promise<void>;
  writeTorque: (params: BafangTorqueParameters) => Promise<void>;
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

  setDarkMode: (dark) => set({ darkMode: dark }),
  setError: (msg) => set({ error: msg }),
}));
