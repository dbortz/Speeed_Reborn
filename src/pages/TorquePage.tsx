import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonMenuButton,
  IonButton, IonButtons, IonList, IonItem, IonLabel, IonText,
  IonIcon, IonFab, IonFabButton, IonSpinner,
  IonAccordion, IonAccordionGroup,
} from '@ionic/react';
import { syncOutline, saveOutline } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { useMotorStore } from '../store/motorStore';
import { BafangTorqueParameters } from '../types/BafangTypes';
import ParameterRow from '../components/ParameterRow';
import TorqueSpeedTable from '../components/TorqueSpeedTable';

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
  const { torque, connected, readTorque, writeTorque } = useMotorStore();
  const [local, setLocal] = useState<BafangTorqueParameters | null>(torque);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setLocal(torque); }, [torque]);

  const set = (field: keyof BafangTorqueParameters, val: any) =>
    setLocal((prev) => prev ? { ...prev, [field]: val } : prev);

  const handleWrite = async () => {
    if (!local) return;
    setSaving(true);
    await writeTorque(local);
    setSaving(false);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton /></IonButtons>
          <IonTitle>Torque Sensor</IonTitle>
          <IonButtons slot="end">
            <IonButton disabled={!connected} onClick={readTorque}><IonIcon icon={syncOutline} /></IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {!connected && <IonText color="warning"><p>Not connected.</p></IonText>}
        {connected && !local && (
          <div className="ion-text-center ion-padding">
            <IonButton onClick={readTorque}>Read Torque Parameters</IonButton>
            <p style={{ fontSize: '12px', color: 'var(--ion-color-medium)' }}>
              Torque block codes (0x55/0x56) are reverse-engineered estimates. Validate on first use.
            </p>
          </div>
        )}

        {local && (
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

            <IonAccordion value="about">
              <IonItem slot="header" color="light"><IonLabel>About Tq</IonLabel></IonItem>
              <div slot="content">
                <IonList>
                  <ParameterRow label="Speed Signal ACC" value={local.speed_signal_acc} min={0} max={255} onChange={(v) => set('speed_signal_acc', v)} />
                  <ParameterRow label="Speed Sig Level" value={local.speed_sig_level} min={0} max={255} onChange={(v) => set('speed_sig_level', v)} />
                  <ParameterRow label="Level H Time" unit="ms" value={local.level_h_time} min={0} max={255} onChange={(v) => set('level_h_time', v)} />
                  <ParameterRow label="Level L Time" unit="ms" value={local.level_l_time} min={0} max={255} onChange={(v) => set('level_l_time', v)} />
                  <ParameterRow label="Tq Voltage" unit="mV" value={local.tq_voltage} min={0} max={5000} onChange={(v) => set('tq_voltage', v)} />
                </IonList>
              </div>
            </IonAccordion>

          </IonAccordionGroup>
        )}

        {local && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={handleWrite} disabled={saving}>
              {saving ? <IonSpinner /> : <IonIcon icon={saveOutline} />}
            </IonFabButton>
          </IonFab>
        )}
      </IonContent>
    </IonPage>
  );
};

export default TorquePage;
