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
  BLOCK_INFO, BLOCK_BASIC, BLOCK_PEDAL, BLOCK_THROTTLE,
  BLOCK_TORQUE_READ, BLOCK_TORQUE_WRITE, DATA_LENGTHS,
} from '../device/BafangProtocol';
import { connect, disconnect, sendAndReceive, sendAndAwaitAck } from '../device/UsbSerial';
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
  /** transient success message (e.g. write confirmations) */
  notice: string | null;
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
  writeBasic: (params: BafangBasicParameters) => Promise<boolean>;
  writePedal: (params: BafangPedalParameters) => Promise<boolean>;
  writeThrottle: (params: BafangThrottleParameters) => Promise<boolean>;
  writeTorque: (params: BafangTorqueParameters) => Promise<boolean>;
  loadFromFile: (data: ElFileData) => void;
  setDarkMode: (dark: boolean) => void;
  setError: (msg: string | null) => void;
  setNotice: (msg: string | null) => void;
}

export const useMotorStore = create<MotorStore>((set, get) => ({
  connected: false,
  connecting: false,
  error: null,
  notice: null,
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

  // BBS01/02/HD have no torque block — torque is read only from its own tab
  readAll: async () => {
    await get().readInfo();
    await get().readBasic();
    await get().readPedal();
    await get().readThrottle();
  },

  readInfo: async () => {
    try {
      const data = await sendAndReceive(
        buildReadCommand(BLOCK_INFO), BLOCK_INFO, DATA_LENGTHS[BLOCK_INFO],
      );
      set({ info: parseInfo(data) });
    } catch (e: any) { set({ error: e.message }); }
  },

  readBasic: async () => {
    try {
      const data = await sendAndReceive(
        buildReadCommand(BLOCK_BASIC), BLOCK_BASIC, DATA_LENGTHS[BLOCK_BASIC],
      );
      set({ basic: parseBasic(data) });
    } catch (e: any) { set({ error: e.message }); }
  },

  readPedal: async () => {
    try {
      const data = await sendAndReceive(
        buildReadCommand(BLOCK_PEDAL), BLOCK_PEDAL, DATA_LENGTHS[BLOCK_PEDAL],
      );
      set({ pedal: parsePedal(data) });
    } catch (e: any) { set({ error: e.message }); }
  },

  readThrottle: async () => {
    try {
      const data = await sendAndReceive(
        buildReadCommand(BLOCK_THROTTLE), BLOCK_THROTTLE, DATA_LENGTHS[BLOCK_THROTTLE],
      );
      set({ throttle: parseThrottle(data) });
    } catch (e: any) { set({ error: e.message }); }
  },

  readTorque: async () => {
    try {
      const data = await sendAndReceive(
        buildReadCommand(BLOCK_TORQUE_READ), BLOCK_TORQUE_READ, DATA_LENGTHS[BLOCK_TORQUE_READ],
      );
      set({ torque: parseTorque(data) });
    } catch (e: any) { set({ error: e.message }); }
  },

  // TODO: Block code 0x57 is a PLACEHOLDER — real block code for live About Tq reading
  // is NOT YET KNOWN. Response length (7 bytes) is also a placeholder.
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
      const data = encodeBasic(params);
      await sendAndAwaitAck(buildWriteCommand(BLOCK_BASIC, data), BLOCK_BASIC, data.length);
      set({ basic: params, notice: 'Basic parameters written ✓', error: null });
      return true;
    } catch (e: any) {
      set({ error: `Basic write NOT confirmed: ${e.message}` });
      return false;
    }
  },

  writePedal: async (params) => {
    try {
      // Never invent the work-mode byte: reuse what the motor last reported
      const workMode = get().pedal?.pedal_work_mode ?? params.pedal_work_mode ?? 0xff;
      const merged = { ...params, pedal_work_mode: workMode };
      const data = encodePedal(merged);
      await sendAndAwaitAck(buildWriteCommand(BLOCK_PEDAL, data), BLOCK_PEDAL, data.length);
      set({ pedal: merged, notice: 'Pedal parameters written ✓', error: null });
      return true;
    } catch (e: any) {
      set({ error: `Pedal write NOT confirmed: ${e.message}` });
      return false;
    }
  },

  writeThrottle: async (params) => {
    try {
      const data = encodeThrottle(params);
      await sendAndAwaitAck(buildWriteCommand(BLOCK_THROTTLE, data), BLOCK_THROTTLE, data.length);
      set({ throttle: params, notice: 'Throttle parameters written ✓', error: null });
      return true;
    } catch (e: any) {
      set({ error: `Throttle write NOT confirmed: ${e.message}` });
      return false;
    }
  },

  writeTorque: async (params) => {
    try {
      const data = encodeTorque(params);
      // Torque writes use block 0x56 but ack format is unverified on hardware
      await sendAndAwaitAck(buildWriteCommand(BLOCK_TORQUE_WRITE, data), BLOCK_TORQUE_WRITE, data.length);
      set({ torque: params, notice: 'Torque parameters written ✓', error: null });
      return true;
    } catch (e: any) {
      set({ error: `Torque write NOT confirmed: ${e.message}` });
      return false;
    }
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
  setNotice: (msg) => set({ notice: msg }),
}));
