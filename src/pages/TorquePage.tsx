// src/pages/TorquePage.tsx
import {
  IonPage, IonContent, IonHeader, IonList, IonItem, IonLabel,
  IonText, IonButton, IonAccordion, IonAccordionGroup,
} from '@ionic/react';
import { useState, useEffect } from 'react';
import { useMotorStore } from '../store/motorStore';
import { BafangTorqueParameters, DEFAULT_TORQUE } from '../types/BafangTypes';
import ParameterRow from '../components/ParameterRow';
import TorqueSpeedTable from '../components/TorqueSpeedTable';
import SettingsInnerTabs from '../components/SettingsInnerTabs';
import ReadWriteBar from '../components/ReadWriteBar';

const DELTA_ROWS: { key: keyof BafangTorqueParameters; label: string }[] = [
  { key: 'delta_v_0_5kg',   label: '0–5 kg' },
  { key: 'delta_v_5_10kg',  label: '5–10 kg' },
  { key: 'delta_v_10_15kg', label: '10–15 kg' },
  { key: 'delta_v_15_20kg', label: '15–20 kg' },
  { key: 'delta_v_20_30kg', label: '20–30 kg' },
  { key: 'delta_v_30_40kg', label: '30–40 kg' },
  { key: 'delta_v_40_50kg', label: '40–50 kg' },
  { key: 'delta_v_50_60kg', label: '50–60 kg' },
];

const ACCORDION_HEADER_STYLE = {
  '--background': 'var(--bafang-surface)',
  '--border-color': 'var(--bafang-border)',
  '--color': 'var(--bafang-text-muted)',
};

const TorquePage: React.FC = () => {
  const {
    torque, connected, readTorque, writeTorque,
    aboutTqReading, readAboutTq, continuousGetActive, stopContinuousGet,
  } = useMotorStore();
  const [local, setLocal] = useState<BafangTorqueParameters>(torque ?? DEFAULT_TORQUE);
  const [continuousIntervalId, setContinuousIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { if (torque) setLocal(torque); }, [torque]);
  useEffect(() => () => { if (continuousIntervalId !== null) clearInterval(continuousIntervalId); }, [continuousIntervalId]);

  const set = (field: keyof BafangTorqueParameters, val: any) =>
    setLocal((prev) => ({ ...prev, [field]: val }));

  const startContinuousGet = () => {
    if (continuousIntervalId !== null) clearInterval(continuousIntervalId);
    const id = setInterval(() => { readAboutTq(); }, 500);
    setContinuousIntervalId(id);
  };

  const stopContinuous = () => {
    if (continuousIntervalId !== null) { clearInterval(continuousIntervalId); setContinuousIntervalId(null); }
    stopContinuousGet();
  };

  const isContinuousActive = continuousIntervalId !== null || continuousGetActive;

  return (
    <IonPage>
      <IonHeader style={{ boxShadow: 'none' }}>
        <SettingsInnerTabs active="torque" />
        <ReadWriteBar
          title="Torque"
          connected={connected}
          onRead={readTorque}
          onWrite={() => writeTorque(local)}
        />
      </IonHeader>

      <IonContent>
        <IonAccordionGroup multiple>

          <IonAccordion value="calibration">
            <IonItem slot="header" style={ACCORDION_HEADER_STYLE}>
              <IonLabel>Voltage Calibration</IonLabel>
            </IonItem>
            <div slot="content">
              <IonList style={{ background: 'transparent' }}>
                <ParameterRow label="Base Voltage" unit="mV" value={local.base_voltage}
                  min={0} max={5000} onChange={(v) => set('base_voltage', v)} />
                <ParameterRow label="Error Voltage Min" unit="mV" value={local.error_voltage_min}
                  min={0} max={5000} onChange={(v) => set('error_voltage_min', v)} />
                <ParameterRow label="Error Voltage Max" unit="mV" value={local.error_voltage_max}
                  min={0} max={5000} onChange={(v) => set('error_voltage_max', v)} />
                {DELTA_ROWS.map(({ key, label }) => (
                  <ParameterRow key={key} label={`Delta V ${label}`} unit="mV"
                    value={local[key] as number} min={0} max={2000}
                    onChange={(v) => set(key, v)} />
                ))}
                <ParameterRow label="0-Speed Boost Time" unit="ms" value={local.boost_time_0speed}
                  min={0} max={255} onChange={(v) => set('boost_time_0speed', v)} />
              </IonList>
            </div>
          </IonAccordion>

          <IonAccordion value="speeds">
            <IonItem slot="header" style={ACCORDION_HEADER_STYLE}>
              <IonLabel>Speed Profiles (Spd0–Spd100)</IonLabel>
            </IonItem>
            <div slot="content" style={{ padding: '8px' }}>
              <TorqueSpeedTable
                profiles={local.speed_profiles}
                onChange={(p) => set('speed_profiles', p)}
              />
            </div>
          </IonAccordion>

          <IonAccordion value="live">
            <IonItem slot="header" style={ACCORDION_HEADER_STYLE}>
              <IonLabel>About Tq — Live Reading</IonLabel>
            </IonItem>
            <div slot="content">
              <p style={{ padding: '8px 16px', fontSize: '11px', color: 'var(--bafang-text-dim)' }}>
                ⚠ Block code not yet validated on real motor.
              </p>
              <IonList style={{ background: 'transparent' }}>
                <IonItem lines="full" style={{ '--background': 'transparent', '--border-color': 'var(--bafang-border)' }}>
                  <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>SpeedSignalACC</IonLabel>
                  <IonText slot="end" style={{ color: 'var(--bafang-text)' }}>{aboutTqReading?.speed_signal_acc ?? 0}</IonText>
                </IonItem>
                <IonItem lines="full" style={{ '--background': 'transparent', '--border-color': 'var(--bafang-border)' }}>
                  <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>SpeedSigLevel</IonLabel>
                  <IonText slot="end" style={{ color: 'var(--bafang-text)' }}>{aboutTqReading?.speed_sig_level ?? 0}</IonText>
                </IonItem>
                <IonItem lines="full" style={{ '--background': 'transparent', '--border-color': 'var(--bafang-border)' }}>
                  <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>LevelHTime (ms)</IonLabel>
                  <IonText slot="end" style={{ color: 'var(--bafang-text)' }}>{aboutTqReading?.level_h_time ?? 0}</IonText>
                </IonItem>
                <IonItem lines="full" style={{ '--background': 'transparent', '--border-color': 'var(--bafang-border)' }}>
                  <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>LevelLTime (ms)</IonLabel>
                  <IonText slot="end" style={{ color: 'var(--bafang-text)' }}>{aboutTqReading?.level_l_time ?? 0}</IonText>
                </IonItem>
                <IonItem lines="full" style={{ '--background': 'transparent', '--border-color': 'var(--bafang-border)' }}>
                  <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>TqVoltage (mV)</IonLabel>
                  <IonText slot="end" style={{ color: 'var(--bafang-text)' }}>{aboutTqReading?.tq_voltage ?? 0}</IonText>
                  <IonButton
                    slot="end" size="small" fill="outline"
                    style={{ '--border-color': 'var(--bafang-accent)', '--color': 'var(--bafang-accent)', marginLeft: '8px' }}
                    onClick={() => set('base_voltage', aboutTqReading?.tq_voltage ?? 0)}
                  >
                    → Base V
                  </IonButton>
                </IonItem>
              </IonList>
              <div style={{ display: 'flex', gap: '8px', padding: '12px 16px' }}>
                <IonButton
                  fill="outline" size="small" disabled={!connected || isContinuousActive}
                  style={{ '--border-color': 'var(--bafang-accent)', '--color': 'var(--bafang-accent)' }}
                  onClick={readAboutTq}
                >Get</IonButton>
                <IonButton
                  fill="outline" size="small" disabled={!connected}
                  style={isContinuousActive
                    ? { '--border-color': 'var(--bafang-red)', '--color': 'var(--bafang-red)' }
                    : { '--border-color': 'var(--bafang-accent)', '--color': 'var(--bafang-accent)' }
                  }
                  onClick={isContinuousActive ? stopContinuous : startContinuousGet}
                >
                  {isContinuousActive ? 'Stop' : 'Continuous'}
                </IonButton>
              </div>
            </div>
          </IonAccordion>

        </IonAccordionGroup>
      </IonContent>
    </IonPage>
  );
};

export default TorquePage;
