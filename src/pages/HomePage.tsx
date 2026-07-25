// src/pages/HomePage.tsx
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonIcon, IonItem, IonLabel,
  IonList, IonCheckbox, IonText, IonSelect,
  IonSelectOption, IonInput, useIonAlert,
} from '@ionic/react';
import {
  folderOpenOutline, downloadOutline,
  saveOutline, arrowUpCircleOutline, trashOutline,
} from 'ionicons/icons';
import { useState, useEffect, useRef } from 'react';
import { useMotorStore } from '../store/motorStore';
import { useProfileStore } from '../store/profileStore';
import { parseElFile, serializeAllToEl } from '../device/ElFileParser';

const HomePage: React.FC = () => {
  // Confirmations default to checked — the user can still opt out
  const [lawAgreed, setLawAgreed] = useState(true);
  const [liabilityAgreed, setLiabilityAgreed] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    connected, connecting, error, notice,
    connectDevice, disconnectDevice,
    info,
    basic, pedal, throttle, torque,
    loadFromFile,
    readAll,
    writeBasic, writePedal, writeThrottle, writeTorque,
    setNotice, setError,
  } = useMotorStore();

  const {
    profiles, refresh: refreshProfiles,
    save: saveProfile, load: loadProfile, remove: removeProfile,
  } = useProfileStore();
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [presentAlert] = useIonAlert();

  useEffect(() => { refreshProfiles(); }, [refreshProfiles]);

  const handleSaveProfile = async () => {
    if (!basic || !pedal || !throttle) {
      setError('Read the motor (or load a profile) before saving one');
      return;
    }
    const name = newProfileName.trim();
    if (!name) {
      setError('Enter a profile name first');
      return;
    }
    try {
      await saveProfile(name, info, basic, pedal, throttle);
      setNewProfileName('');
      setNotice(`Profile "${name}" saved`);
      setError(null);
    } catch (e: any) {
      setError(`Failed to save profile: ${e.message}`);
    }
  };

  const handleLoadProfile = async () => {
    if (!selectedProfile) {
      setError('Select a profile first');
      return;
    }
    try {
      const data = await loadProfile(selectedProfile);
      loadFromFile(data);
      setNotice(
        'Profile loaded into the form — review the tabs, then WRITE ALL to apply to the motor'
      );
      setError(null);
    } catch (e: any) {
      setError(`Failed to load profile: ${e.message}`);
    }
  };

  const handleDeleteProfile = () => {
    if (!selectedProfile) {
      setError('Select a profile first');
      return;
    }
    presentAlert({
      header: 'Delete profile',
      message: 'Delete this saved profile? The motor is not affected.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            removeProfile(selectedProfile).then(() => {
              setSelectedProfile(null);
              setNotice('Profile deleted');
            });
          },
        },
      ],
    });
  };

  const [writing, setWriting] = useState(false);
  // The serial plugin cannot enumerate devices — Android shows its own USB
  // permission dialog when connecting, so CONNECT is gated only on the
  // confirmations.
  const canConnect = lawAgreed && liabilityAgreed && !connected;

  const handleWriteAll = async () => {
    setWriting(true);
    try {
      if (basic) await writeBasic(basic);
      if (pedal) await writePedal(pedal);
      if (throttle) await writeThrottle(throttle);
      if (torque) await writeTorque(torque);
    } finally {
      setWriting(false);
    }
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
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {error && (
          <IonText color="danger">
            <p style={{ padding: '8px 16px', fontSize: '13px' }}>{error}</p>
          </IonText>
        )}
        {notice && (
          <IonText color="success">
            <p style={{ padding: '8px 16px', fontSize: '13px' }}>{notice}</p>
          </IonText>
        )}

        {/* Connection section */}
        <div className="section-label">Connection</div>

        {!connected && (
          <p style={{ padding: '4px 16px 8px', fontSize: '13px', color: 'var(--bafang-text-muted)' }}>
            Plug the programming cable in via OTG, then tap CONNECT — Android
            will ask for USB permission.
          </p>
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
          onClick={() => (connected ? disconnectDevice() : connectDevice(0))}
        >
          {connecting ? '···' : connected ? 'DISCONNECT' : 'CONNECT'}
        </button>

        {/* Profiles section */}
        <div className="section-label">Profiles</div>
        <IonItem
          lines="full"
          style={{ '--background': 'transparent', '--border-color': 'var(--bafang-border)' }}
        >
          <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>Profile</IonLabel>
          <IonSelect
            slot="end"
            value={selectedProfile}
            placeholder="Select"
            onIonChange={(e) => setSelectedProfile(e.detail.value)}
            style={{ color: 'var(--bafang-text)' }}
          >
            {profiles.map((p) => (
              <IonSelectOption key={p.slug} value={p.slug}>
                {p.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
        <div style={{ display: 'flex', gap: '8px', padding: '8px 16px' }}>
          <IonButton size="small" fill="outline" onClick={handleLoadProfile}>
            <IonIcon slot="start" icon={arrowUpCircleOutline} />
            Load into form
          </IonButton>
          <IonButton size="small" fill="outline" color="danger" onClick={handleDeleteProfile}>
            <IonIcon slot="icon-only" icon={trashOutline} />
          </IonButton>
        </div>
        <IonItem
          lines="full"
          style={{ '--background': 'transparent', '--border-color': 'var(--bafang-border)' }}
        >
          <IonInput
            placeholder="New profile name"
            value={newProfileName}
            onIonChange={(e) => setNewProfileName(String(e.detail.value ?? ''))}
            style={{ color: 'var(--bafang-text)', fontSize: '14px' }}
          />
          <IonButton slot="end" size="small" fill="outline" onClick={handleSaveProfile}>
            <IonIcon slot="start" icon={saveOutline} />
            Save
          </IonButton>
        </IonItem>
        <p style={{ padding: '4px 16px 8px', fontSize: '12px', color: 'var(--bafang-text-muted)' }}>
          Loading a profile only fills the form — nothing is written to the
          motor until you press WRITE ALL.
        </p>

        {/* Motor section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 16px 0' }}>
          <div className="section-label" style={{ padding: '8px 0 4px' }}>Motor</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-read" disabled={!connected} onClick={readAll}>READ ALL</button>
            <button className="btn-write" disabled={!connected || writing} onClick={handleWriteAll}>{writing ? '···' : 'WRITE ALL'}</button>
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
