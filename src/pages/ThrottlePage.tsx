// src/pages/ThrottlePage.tsx
import {
  IonPage, IonContent, IonHeader, IonList,
  IonItem, IonLabel, IonSelect, IonSelectOption,
} from '@ionic/react';
import { useState, useEffect } from 'react';
import { useMotorStore } from '../store/motorStore';
import { BafangThrottleParameters, ThrottleMode, DEFAULT_THROTTLE } from '../types/BafangTypes';
import ParameterRow from '../components/ParameterRow';
import SettingsInnerTabs from '../components/SettingsInnerTabs';
import ReadWriteBar from '../components/ReadWriteBar';

const SELECT_STYLE = { '--background': 'transparent', '--border-color': 'var(--bafang-border)' };

const ThrottlePage: React.FC = () => {
  const { throttle, connected, readThrottle, writeThrottle } = useMotorStore();
  const [local, setLocal] = useState<BafangThrottleParameters>(throttle ?? DEFAULT_THROTTLE);

  useEffect(() => { if (throttle) setLocal(throttle); }, [throttle]);

  const set = (field: keyof BafangThrottleParameters, val: any) =>
    setLocal((prev) => ({ ...prev, [field]: val }));

  return (
    <IonPage>
      <IonHeader style={{ boxShadow: 'none' }}>
        <SettingsInnerTabs active="throttle" />
        <ReadWriteBar
          title="Throttle"
          connected={connected}
          onRead={readThrottle}
          onWrite={() => writeThrottle(local)}
        />
      </IonHeader>

      <IonContent>
        <IonList style={{ background: 'transparent' }}>
          <ParameterRow label="Start Voltage" unit="mV" value={local.throttle_start_voltage}
            min={500} max={2000} onChange={(v) => set('throttle_start_voltage', v)} />
          <ParameterRow label="End Voltage" unit="mV" value={local.throttle_end_voltage}
            min={3000} max={5000} onChange={(v) => set('throttle_end_voltage', v)} />
          <IonItem lines="full" style={SELECT_STYLE}>
            <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>Mode</IonLabel>
            <IonSelect slot="end" value={local.throttle_mode} style={{ color: 'var(--bafang-text)' }}
              onIonChange={(e) => set('throttle_mode', e.detail.value)}>
              <IonSelectOption value={ThrottleMode.Speed}>Speed</IonSelectOption>
              <IonSelectOption value={ThrottleMode.Current}>Current</IonSelectOption>
            </IonSelect>
          </IonItem>
          <ParameterRow label="Assist Level" value={local.throttle_assist_level}
            min={0} max={9} onChange={(v) => set('throttle_assist_level', v)} />
          <ParameterRow label="Speed Limit" unit="km/h" value={local.throttle_speed_limit}
            min={1} max={45} onChange={(v) => set('throttle_speed_limit', v)} />
          <ParameterRow label="Start Current" unit="%" value={local.throttle_start_current}
            min={0} max={100} onChange={(v) => set('throttle_start_current', v)} />
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default ThrottlePage;
