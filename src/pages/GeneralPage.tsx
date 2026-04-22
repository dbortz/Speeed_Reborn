// src/pages/GeneralPage.tsx
import {
  IonPage, IonContent, IonHeader, IonList,
  IonItem, IonLabel, IonSelect, IonSelectOption,
} from '@ionic/react';
import { useState, useEffect } from 'react';
import { useMotorStore } from '../store/motorStore';
import { BafangBasicParameters, SpeedmeterType, DEFAULT_BASIC } from '../types/BafangTypes';
import ParameterRow from '../components/ParameterRow';
import SettingsInnerTabs from '../components/SettingsInnerTabs';
import ReadWriteBar from '../components/ReadWriteBar';

const GeneralPage: React.FC = () => {
  const { basic, connected, readBasic, writeBasic } = useMotorStore();
  const [local, setLocal] = useState<BafangBasicParameters>(basic ?? DEFAULT_BASIC);

  useEffect(() => { if (basic) setLocal(basic); }, [basic]);

  const set = (field: keyof BafangBasicParameters, val: any) =>
    setLocal((prev) => ({ ...prev, [field]: val }));

  return (
    <IonPage>
      <IonHeader style={{ boxShadow: 'none' }}>
        <SettingsInnerTabs active="general" />
        <ReadWriteBar
          title="General"
          connected={connected}
          onRead={readBasic}
          onWrite={() => writeBasic(local)}
        />
      </IonHeader>

      <IonContent>
        <IonList style={{ background: 'transparent' }}>
          <ParameterRow
            label="Low Battery Protection"
            unit="V×10"
            value={local.low_battery_protection}
            min={200} max={600}
            onChange={(v) => set('low_battery_protection', v)}
          />
          <ParameterRow
            label="Current Limit"
            unit="A"
            value={local.current_limit}
            min={1} max={30}
            onChange={(v) => set('current_limit', v)}
          />
          <IonItem
            lines="full"
            style={{ '--background': 'transparent', '--border-color': 'var(--bafang-border)' }}
          >
            <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>Assist Levels</IonLabel>
            <IonSelect
              slot="end"
              value={local.assist_levels}
              style={{ color: 'var(--bafang-text)' }}
              onIonChange={(e) => set('assist_levels', e.detail.value)}
            >
              <IonSelectOption value={3}>3</IonSelectOption>
              <IonSelectOption value={5}>5</IonSelectOption>
              <IonSelectOption value={9}>9</IonSelectOption>
            </IonSelect>
          </IonItem>
          <ParameterRow
            label="Wheel Diameter"
            unit="inches"
            value={local.wheel_diameter}
            min={12} max={29}
            onChange={(v) => set('wheel_diameter', v)}
          />
          <IonItem
            lines="full"
            style={{ '--background': 'transparent', '--border-color': 'var(--bafang-border)' }}
          >
            <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>Speed Meter Type</IonLabel>
            <IonSelect
              slot="end"
              value={local.speedmeter_type}
              style={{ color: 'var(--bafang-text)' }}
              onIonChange={(e) => set('speedmeter_type', e.detail.value)}
            >
              <IonSelectOption value={SpeedmeterType.External}>External</IonSelectOption>
              <IonSelectOption value={SpeedmeterType.Internal}>Internal</IonSelectOption>
              <IonSelectOption value={SpeedmeterType.Motorphase}>Motorphase</IonSelectOption>
            </IonSelect>
          </IonItem>
          <ParameterRow
            label="Speed Meter Signals"
            value={local.speedmeter_magnets}
            min={1} max={32}
            onChange={(v) => set('speedmeter_magnets', v)}
          />
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default GeneralPage;
