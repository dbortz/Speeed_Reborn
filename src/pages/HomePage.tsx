// src/pages/HomePage.tsx
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonIcon, IonItem, IonLabel,
  IonList, IonCheckbox, IonText, IonSelect,
  IonSelectOption,
} from '@ionic/react';
import {
  folderOpenOutline, downloadOutline, refreshOutline,
} from 'ionicons/icons';
import { useState, useEffect, useRef } from 'react';
import { useMotorStore } from '../store/motorStore';
import { listDevices, UsbDevice } from '../device/UsbSerial';
import { parseElFile, serializeAllToEl } from '../device/ElFileParser';

const HomePage: React.FC = () => {
  const [devices, setDevices] = useState<UsbDevice[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [lawAgreed, setLawAgreed] = useState(false);
  const [liabilityAgreed, setLiabilityAgreed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    connected, connecting, error,
    connectDevice, disconnectDevice,
    info, readInfo,
    basic, pedal, throttle, torque,
    loadFromFile,
    readBasic, readPedal, readThrottle, readTorque,
    writeBasic, writePedal, writeThrottle, writeTorque,
  } = useMotorStore();

  const refreshDevices = async () => {
    try {
      const list = await listDevices();
      setDevices(list);
    } catch {
      setDevices([]);
    }
  };

  useEffect(() => { refreshDevices(); }, []);

  const canConnect = selectedId !== null && lawAgreed && liabilityAgreed && !connected;

  const handleReadAll = () => {
    readInfo();
    readBasic();
    readPedal();
    readThrottle();
    readTorque();
  };

  const handleWriteAll = async () => {
    if (basic) await writeBasic(basic);
    if (pedal) await writePedal(pedal);
    if (throttle) await writeThrottle(throttle);
    if (torque) await writeTorque(torque);
  };

  const handleLoad = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = parseElFile(ev.target?.result as string);
      loadFromFile(data);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSave = () => {
    const content = serializeAllToEl({ basic, pedal, throttle, torque });
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bafang-settings.el';
    a.click();
    URL.revokeObjectURL(url);
  };

  const motorRows = info ? [
    { label: 'Manufacturer', value: info.manufacturer },
    { label: 'Model', value: info.model },
    { label: 'Firmware', value: info.firmware_version },
    { label: 'Hardware', value: info.hardware_version },
    { label: 'Serial', value: info.serial_number },
    { label: 'Voltage', value: `${info.voltage} V` },
    { label: 'Max Current', value: `${info.max_current} A` },
  ] : [];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle style={{ color: 'var(--bafang-accent)', fontWeight: 700 }}>
            BafangAndroid
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLoad}>
              <IonIcon slot="icon-only" icon={folderOpenOutline} />
            </IonButton>
            <IonButton onClick={handleSave}>
              <IonIcon slot="icon-only" icon={downloadOutline} />
            </IonButton>
            <IonButton onClick={refreshDevices}>
              <IonIcon slot="icon-only" icon={refreshOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {error && (
          <IonText color="danger">
            <p style={{ padding: '8px 16px', fontSize: '13px' }}>{error}</p>
          </IonText>
        )}

        {/* Connection section */}
        <div className="section-label">Connection</div>

        {!connected && devices.length === 0 && (
          <p style={{ padding: '4px 16px 8px', fontSize: '13px', color: 'var(--bafang-text-muted)' }}>
            No USB device found. Connect adapter via OTG and tap ↻
          </p>
        )}

        {!connected && devices.length > 0 && (
          <IonItem
            lines="full"
            style={{ '--background': 'transparent', '--border-color': 'var(--bafang-border)' }}
          >
            <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>USB Device</IonLabel>
            <IonSelect
              slot="end"
              value={selectedId}
              placeholder="Select"
              onIonChange={(e) => setSelectedId(e.detail.value)}
              style={{ color: 'var(--bafang-text)' }}
            >
              {devices.map((d) => (
                <IonSelectOption key={d.deviceId} value={d.deviceId}>
                  {d.deviceName}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        )}

        {!connected && (
          <>
            <IonItem lines="full" style={{ '--background': 'transparent', '--border-color': 'var(--bafang-border)', '--min-height': '56px' }}>
              <IonCheckbox
                slot="start"
                checked={lawAgreed}
                onIonChange={(e) => setLawAgreed(e.detail.checked)}
                style={{ '--border-color': 'var(--bafang-text-dim)', '--checkbox-background-checked': 'var(--bafang-accent)' }}
              />
              <IonLabel className="ion-text-wrap" style={{ fontSize: '12px', color: 'var(--bafang-text-muted)' }}>
                I confirm I will only use this software in accordance with local e-bike laws. *
              </IonLabel>
            </IonItem>
            <IonItem lines="full" style={{ '--background': 'transparent', '--border-color': 'var(--bafang-border)', '--min-height': '56px' }}>
              <IonCheckbox
                slot="start"
                checked={liabilityAgreed}
                onIonChange={(e) => setLiabilityAgreed(e.detail.checked)}
                style={{ '--border-color': 'var(--bafang-text-dim)', '--checkbox-background-checked': 'var(--bafang-accent)' }}
              />
              <IonLabel className="ion-text-wrap" style={{ fontSize: '12px', color: 'var(--bafang-text-muted)' }}>
                I accept full responsibility for any damage, injury, or consequences from using this software. *
              </IonLabel>
            </IonItem>
          </>
        )}

        <button
          className={`connect-btn-full${connected ? ' danger' : ''}`}
          disabled={connected ? false : (!canConnect || connecting)}
          onClick={() => connected ? disconnectDevice() : selectedId !== null && connectDevice(selectedId)}
        >
          {connecting ? '···' : connected ? 'DISCONNECT' : 'CONNECT'}
        </button>

        {/* Motor section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 16px 0' }}>
          <div className="section-label" style={{ padding: '8px 0 4px' }}>Motor</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-read" disabled={!connected} onClick={handleReadAll}>READ ALL</button>
            <button className="btn-write" disabled={!connected} onClick={handleWriteAll}>WRITE ALL</button>
          </div>
        </div>

        <IonList style={{ '--ion-item-background': 'transparent', background: 'transparent' }}>
          <IonItem
            lines="full"
            style={{ '--background': 'transparent', '--border-color': 'var(--bafang-border)' }}
          >
            <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>Status</IonLabel>
            <span
              slot="end"
              className={`status-badge ${connected ? 'connected' : 'disconnected'}`}
            >
              {connected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </IonItem>

          {motorRows.map((row) => (
            <IonItem
              key={row.label}
              lines="full"
              style={{ '--background': 'transparent', '--border-color': 'var(--bafang-border)' }}
            >
              <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>{row.label}</IonLabel>
              <IonText
                slot="end"
                style={{ color: row.value ? 'var(--bafang-text)' : 'var(--bafang-text-dim)', fontSize: '14px' }}
              >
                {row.value || '—'}
              </IonText>
            </IonItem>
          ))}

          {!info && connected && (
            <IonItem lines="none" style={{ '--background': 'transparent' }}>
              <IonLabel style={{ color: 'var(--bafang-text-dim)', fontSize: '13px' }}>
                Tap READ ALL to load motor info
              </IonLabel>
            </IonItem>
          )}
        </IonList>

        <input
          type="file"
          accept=".el"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
