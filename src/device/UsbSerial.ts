/**
 * USB Serial abstraction layer for Bafang UART protocol.
 *
 * Uses @adeunis/capacitor-serial which wraps usb-serial-for-android.
 * This plugin was chosen because it supports:
 *   - writeHexadecimal() for raw binary output (required for Bafang)
 *   - registerReadRawCallback() for streaming binary input as base64 (required for Bafang)
 *   - Capacitor >= 7.0.0 (project uses 8)
 *
 * Plugins evaluated and rejected:
 *   - @adeuros/capacitor-usb-serial  — does not exist on npm (404)
 *   - @capawesome-team/capacitor-serial — does not exist on npm (404)
 *   - capacitor-plugin-serialport — does not exist on npm (404)
 *   - @e-is/capacitor-serial — does not exist on npm (404)
 *   - capacitor-usb-serial / capacitor-usb-serial-c7 — exist but encode all data as
 *     UTF-8 strings in the Android layer, which corrupts binary bytes > 0x7F
 *
 * Bafang UART protocol: 1200 bps, 8N1.
 * Response frame (VERIFIED on real BBS02B): [blockCode] [length] [...data]
 * [checksum] — no leading 0x06. Write ack: [blockCode] [length]
 * [(blockCode+length)&0xff]. Frame extraction + checksum validation live in
 * BafangProtocol.ts (pure, unit-tested); this module owns buffering and the
 * pending-promise machinery.
 */

import { Serial } from '@adeunis/capacitor-serial';
import { extractResponseFrame, extractWriteAck } from './BafangProtocol';

// ─── Public types ────────────────────────────────────────────────────────────

/** Represents a USB device discovered via getDeviceConnections (adeunis plugin
 *  does not enumerate devices — connection is established after permission grant,
 *  so we expose a single synthetic entry once permissions are obtained). */
export interface UsbDevice {
  deviceId: number;
  deviceName: string;
  vendorId: number;
  productId: number;
}

// ─── Module-level state ───────────────────────────────────────────────────────

let _connected = false;

/** Accumulates raw bytes arriving from the USB serial stream. */
let _receiveBuffer: number[] = [];

/** Resolves/rejects the pending sendAndReceive / sendAndAwaitAck call. */
let _pendingResolve: ((data: number[]) => void) | null = null;
let _pendingReject: ((err: Error) => void) | null = null;
let _pendingBlockCode: number | null = null;
let _pendingDataLength: number | null = null;
let _pendingMode: 'read' | 'ack' = 'read';
let _pendingTimeoutHandle: ReturnType<typeof setTimeout> | null = null;

// ─── Frame parser ─────────────────────────────────────────────────────────────

/**
 * Called each time new bytes arrive (often one byte at a time at 1200 baud).
 * Delegates frame recognition + checksum validation to BafangProtocol.
 */
function _tryParseResponse(): void {
  if (_pendingResolve === null) return; // no one waiting
  if (_pendingBlockCode === null || _pendingDataLength === null) return;

  const frame =
    _pendingMode === 'ack'
      ? extractWriteAck(_receiveBuffer, _pendingBlockCode, _pendingDataLength)
      : extractResponseFrame(_receiveBuffer, _pendingBlockCode, _pendingDataLength);
  if (frame === null) return; // incomplete or not yet present — wait for more

  _receiveBuffer = _receiveBuffer.slice(frame.consumed);

  const resolve = _pendingResolve;
  _clearPending();
  resolve(frame.data);
}

function _clearPending(): void {
  if (_pendingTimeoutHandle !== null) {
    clearTimeout(_pendingTimeoutHandle);
    _pendingTimeoutHandle = null;
  }
  _pendingResolve = null;
  _pendingReject = null;
  _pendingBlockCode = null;
  _pendingDataLength = null;
  _pendingMode = 'read';
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the list of USB serial devices currently visible.
 *
 * NOTE: @adeunis/capacitor-serial does not provide a device-enumeration API —
 * it connects to whichever device matches the permission grant. This function
 * returns an empty array; use connect() directly (it triggers the Android
 * permission dialog which lists attached devices).
 */
export async function listDevices(): Promise<UsbDevice[]> {
  return [];
}

/**
 * Request USB permission and open a serial connection at 1200 bps, 8N1.
 *
 * The adeunis plugin connects to the first detected USB serial device.
 * If vendorId/productId are needed for a custom driver, pass them here;
 * leave undefined to use the default CDC-ACM / FTDI prober.
 *
 * @param _deviceId  Not used by this plugin (kept for interface compatibility).
 * @param vendorId   Optional: restrict permission request to this vendor.
 * @param productId  Optional: restrict permission request to this product.
 */
export async function connect(
  _deviceId: number,
  vendorId?: number,
  productId?: number
): Promise<void> {
  if (_connected) {
    await disconnect();
  }

  // Request USB OTG permission (shows Android dialog if not yet granted)
  const permParams =
    vendorId !== undefined && productId !== undefined
      ? { vendorId, productId, driver: 'CdcAcmSerialDriver' as any }
      : undefined;

  const { granted } = await Serial.requestSerialPermissions(permParams);
  if (!granted) {
    throw new Error('USB serial permission denied by user');
  }

  // Open connection: 1200 bps, 8 data bits, 1 stop bit, no parity (Bafang UART)
  await Serial.openConnection({
    baudRate: 1200,
    dataBits: 8,
    stopBits: 1,
    parity: 0, // PARITY_NONE
  });

  // Register streaming callback for incoming binary data (base64-encoded)
  await Serial.registerReadRawCallback((message, error) => {
    if (error) {
      // Surface the error to any pending sendAndReceive call
      if (_pendingReject) {
        const reject = _pendingReject;
        _clearPending();
        reject(new Error(`Serial read error: ${error}`));
      }
      return;
    }
    if (!message?.data) return;

    // Decode base64 → binary bytes and append to receive buffer
    const raw = atob(message.data);
    for (let i = 0; i < raw.length; i++) {
      _receiveBuffer.push(raw.charCodeAt(i));
    }
    _tryParseResponse();
  });

  _connected = true;
  _receiveBuffer = [];
}

/**
 * Close the serial connection and clean up state.
 */
export async function disconnect(): Promise<void> {
  if (!_connected) return;
  _clearPending();
  _receiveBuffer = [];
  try {
    await Serial.unregisterReadRawCallback();
  } catch (_) {
    // ignore — may already be unregistered
  }
  await Serial.closeConnection();
  _connected = false;
}

/**
 * Send a Bafang command and wait for the matching response frame.
 *
 * @param command     Raw bytes to transmit (e.g. [0x11, 0x52, 0x00])
 * @param blockCode   Expected block code in the response frame (e.g. 0x52)
 * @param dataLength  Expected number of data bytes in the response
 * @param timeoutMs   Timeout in milliseconds (default 3000)
 * @returns           Data bytes from the response frame (header/checksum stripped)
 */
export async function sendAndReceive(
  command: Uint8Array,
  blockCode: number,
  dataLength: number,
  timeoutMs = 3000
): Promise<number[]> {
  if (!_connected) {
    throw new Error('Not connected — call connect() first');
  }
  if (_pendingResolve !== null) {
    throw new Error('A sendAndReceive call is already in progress');
  }

  // I-2: Clear stale bytes (noise, partial frames from previous commands)
  // before registering the new pending promise so the parser never sees
  // leftover data belonging to a different request.
  _receiveBuffer = [];

  return _sendAndAwait(command, blockCode, dataLength, 'read', timeoutMs);
}

/**
 * Send a Bafang write command (0x16 ...) and wait for the controller's 3-byte
 * ack ([block] [len] [(block+len)&0xff]). Resolves on ack; rejects on timeout
 * so callers can surface real write failures instead of assuming success.
 *
 * @param command     Full write frame (from buildWriteCommand)
 * @param blockCode   Block code being written (e.g. 0x53)
 * @param dataLength  Payload length of the write (e.g. 11 for pedal)
 */
export async function sendAndAwaitAck(
  command: Uint8Array,
  blockCode: number,
  dataLength: number,
  timeoutMs = 3000
): Promise<void> {
  if (!_connected) {
    throw new Error('Not connected — call connect() first');
  }
  if (_pendingResolve !== null) {
    throw new Error('A serial exchange is already in progress');
  }
  _receiveBuffer = [];
  await _sendAndAwait(command, blockCode, dataLength, 'ack', timeoutMs);
}

function _sendAndAwait(
  command: Uint8Array,
  blockCode: number,
  dataLength: number,
  mode: 'read' | 'ack',
  timeoutMs: number
): Promise<number[]> {
  return new Promise<number[]>((resolve, reject) => {
    _pendingResolve = resolve;
    _pendingReject = reject;
    _pendingBlockCode = blockCode;
    _pendingDataLength = dataLength;
    _pendingMode = mode;

    // Arm timeout
    _pendingTimeoutHandle = setTimeout(() => {
      const rej = _pendingReject;
      _clearPending();
      rej?.(
        new Error(
          `Timeout waiting for Bafang ${mode === 'ack' ? 'write ack' : 'response'} (blockCode=0x${blockCode
            .toString(16)
            .padStart(2, '0')}, expected ${dataLength} bytes)`
        )
      );
    }, timeoutMs);

    // Convert command bytes to uppercase hex string for writeHexadecimal()
    // e.g. Uint8Array [0x11, 0x52] → "1152"
    const hex = Array.from(command)
      .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
      .join('');

    Serial.writeHexadecimal({ data: hex }).catch((err: unknown) => {
      const rej = _pendingReject;
      _clearPending();
      rej?.(new Error(`Write failed: ${err}`));
    });
  });
}

/**
 * Send a Bafang command without waiting for any response. Only used for
 * fire-and-forget situations; parameter writes should use sendAndAwaitAck.
 *
 * @param command  Raw bytes to transmit
 */
export async function sendOnly(command: Uint8Array): Promise<void> {
  if (!_connected) {
    throw new Error('Not connected — call connect() first');
  }

  const hex = Array.from(command)
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join('');

  await Serial.writeHexadecimal({ data: hex });
}
