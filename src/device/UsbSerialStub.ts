// Stub for @adeuros/capacitor-usb-serial
// This will be replaced with a real implementation in a later task.

export interface UsbSerialPlugin {
  requestPermission(): Promise<{ granted: boolean }>;
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  write(options: { data: string }): Promise<void>;
  read(): Promise<{ data: string }>;
}

export const UsbSerial: UsbSerialPlugin = {
  requestPermission: async () => ({ granted: false }),
  open: async () => {},
  close: async () => {},
  write: async () => {},
  read: async () => ({ data: '' }),
};
