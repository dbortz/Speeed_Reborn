import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonMenuButton,
  IonButton, IonButtons, IonList, IonItem, IonLabel, IonText,
  IonIcon, IonFab, IonFabButton, IonSpinner,
  IonAccordion, IonAccordionGroup,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
} from '@ionic/react';
import { syncOutline, saveOutline, folderOpenOutline, downloadOutline } from 'ionicons/icons';
import { useState, useEffect, useRef } from 'react';
import { useMotorStore } from '../store/motorStore';
import { BafangTorqueParameters, DEFAULT_TORQUE } from '../types/BafangTypes';
import ParameterRow from '../components/ParameterRow';
import TorqueSpeedTable from '../components/TorqueSpeedTable';
import { parseElFile, serializeTorqueToEl } from '../device/ElFileParser';

const DeltaVoltageRows: { key: keyof BafangTorqueParameters; label: string }[] = [
  { key: 'delta_v_0_5kg', label: '0–5 kg' },
  { key: 'delta_v_5_10kg', label: '5–10 kg' },
  { key: 'delta_v_10_15kg', label: '10–15 kg' },
  { key: 'delta_v_15_20kg', label: '15–20 kg' },
  { key: 'delta_v_20_30kg', label: '20–30 kg' },
  { key: 'delta_v_30_40kg', label: '30–40 kg' },
  { key: 'delta_v_40_50kg', label: '40–50 kg' },
  { key: 'delta_v_50_60kg', label: '50–60 kg' },
];

const TorquePage: React.FC = () => {
  const { torque, connected, readTorque, writeTorque, aboutTqReading, readAboutTq, continuousGetActive, stopContinuousGet } = useMotorStore();
  const [local, setLocal] = useState<BafangTorqueParameters>(torque ?? DEFAULT_TORQUE);
  const [saving, setSaving] = useState(false);
  const [continuousIntervalId, setContinuousIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (torque) setLocal(torque); }, [torque]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (continuousIntervalId !== null) clearInterval(continuousIntervalId);
    };
  }, [continuousIntervalId]);

  const set = (field: keyof BafangTorqueParameters, val: any) =>
    setLocal((prev) => ({ ...prev, [field]: val }));

  const handleWrite = async () => {
    if (!local) return;
    setSaving(true);
    await writeTorque(local);
    setSaving(false);
  };

  const startContinuousGet = () => {
    if (continuousIntervalId !== null) clearInterval(continuousIntervalId);
    const id = setInterval(() => { readAboutTq(); }, 500);
    setContinuousIntervalId(id);
  };

  const handleStopContinuousGet = () => {
    if (continuousIntervalId !== null) {
      clearInterval(continuousIntervalId);
      setContinuousIntervalId(null);
    }
    stopContinuousGet();
  };

  const handleLoad = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const parsed = parseElFile(content);
      if (parsed.torque) {
        setLocal((prev) => ({ ...prev, ...parsed.torque }));
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be loaded again
    e.target.value = '';
  };

  const handleSave = () => {
    const content = serializeTorqueToEl(local);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bafang-torque.el';
    a.click();
    URL.revokeObjectURL(url);
  };

  const isContinuousActive = continuousIntervalId !== null || continuousGetActive;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton /></IonButtons>
          <IonTitle>Torque Sensor</IonTitle>
          <IonButtons slot="end">
            <IonButton disabled={!connected} onClick={readTorque}><IonIcon icon={syncOutline} /></IonButton>
            <IonButton onClick={handleLoad}><IonIcon icon={folderOpenOutline} /></IonButton>
            <IonButton onClick={handleSave}><IonIcon icon={downloadOutline} /></IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {!connected && <IonText color="warning"><p>Not connected.</p></IonText>}

        {/* Hidden file input for .el file loading */}
        <input
          type="file"
          accept=".el"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <IonAccordionGroup multiple>

          <IonAccordion value="calibration">
            <IonItem slot="header" color="light"><IonLabel>Voltage Calibration</IonLabel></IonItem>
            <div slot="content">
              <IonList>
                <ParameterRow label="Base Voltage" unit="mV" value={local.base_voltage} min={0} max={5000} onChange={(v) => set('base_voltage', v)} />
                <ParameterRow label="Error Voltage Min" unit="mV" value={local.error_voltage_min} min={0} max={5000} onChange={(v) => set('error_voltage_min', v)} />
                <ParameterRow label="Error Voltage Max" unit="mV" value={local.error_voltage_max} min={0} max={5000} onChange={(v) => set('error_voltage_max', v)} />
                {DeltaVoltageRows.map(({ key, label }) => (
                  <ParameterRow
                    key={key}
                    label={`Delta V ${label}`}
                    unit="mV"
                    value={local[key] as number}
                    min={0} max={2000}
                    onChange={(v) => set(key, v)}
                  />
                ))}
                <ParameterRow label="0-Speed Boost Time" unit="ms" value={local.boost_time_0speed} min={0} max={255} onChange={(v) => set('boost_time_0speed', v)} />
              </IonList>
            </div>
          </IonAccordion>

          <IonAccordion value="speeds">
            <IonItem slot="header" color="light"><IonLabel>Speed Profiles (Spd0–Spd100)</IonLabel></IonItem>
            <div slot="content" className="ion-padding">
              <TorqueSpeedTable
                profiles={local.speed_profiles}
                onChange={(p) => set('speed_profiles', p)}
              />
            </div>
          </IonAccordion>

        </IonAccordionGroup>

        <IonCard style={{ marginTop: '16px' }}>
          <IonCardHeader>
            <IonCardTitle>About Tq — Live Sensor Reading</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p style={{ fontSize: '12px', color: 'var(--ion-color-medium)', marginBottom: '8px' }}>
              ⚠ Block code for live reading not yet validated on real motor.
            </p>
            {aboutTqReading ? (
              <IonList>
                <IonItem><IonLabel><h3>SpeedSignalACC</h3><p>{aboutTqReading.speed_signal_acc}</p></IonLabel></IonItem>
                <IonItem><IonLabel><h3>SpeedSigLevel</h3><p>{aboutTqReading.speed_sig_level}</p></IonLabel></IonItem>
                <IonItem><IonLabel><h3>LevelHTime (ms)</h3><p>{aboutTqReading.level_h_time}</p></IonLabel></IonItem>
                <IonItem><IonLabel><h3>LevelLTime (ms)</h3><p>{aboutTqReading.level_l_time}</p></IonLabel></IonItem>
                <IonItem><IonLabel><h3>TqVoltage (mV)</h3><p>{aboutTqReading.tq_voltage}</p></IonLabel></IonItem>
              </IonList>
            ) : (
              <p style={{ color: 'var(--ion-color-medium)' }}>Press Get to read live sensor data.</p>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <IonButton disabled={!connected || isContinuousActive} onClick={readAboutTq}>Get</IonButton>
              <IonButton
                disabled={!connected}
                color={isContinuousActive ? 'danger' : 'secondary'}
                onClick={isContinuousActive ? handleStopContinuousGet : startContinuousGet}
              >
                {isContinuousActive ? 'Stop' : 'Continuous Get'}
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleWrite} disabled={saving || !connected}>
            {saving ? <IonSpinner /> : <IonIcon icon={saveOutline} />}
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default TorquePage;
