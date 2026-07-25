// src/pages/ThrottlePage.tsx
import {
  IonPage, IonContent, IonHeader, IonList,
  IonItem, IonLabel, IonSelect, IonSelectOption,
} from '@ionic/react';
import { useState, useEffect } from 'react';
import { useMotorStore } from '../store/motorStore';
import {
  BafangThrottleParameters, ThrottleMode, DEFAULT_THROTTLE,
  AssistLevelByDisplay, SpeedLimitByDisplay,
} from '../types/BafangTypes';
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
          <ParameterRow label="Start Voltage" unit="V" value={local.throttle_start_voltage}
            min={0} max={25.5} onChange={(v) => set('throttle_start_voltage', v)} />
          <ParameterRow label="End Voltage" unit="V" value={local.throttle_end_voltage}
            min={0} max={25.5} onChange={(v) => set('throttle_end_voltage', v)} />
          <IonItem lines="full" style={SELECT_STYLE}>
            <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>Mode</IonLabel>
            <IonSelect slot="end" value={local.throttle_mode} style={{ color: 'var(--bafang-text)' }}
              onIonChange={(e) => set('throttle_mode', e.detail.value)}>
              <IonSelectOption value={ThrottleMode.Speed}>Speed</IonSelectOption>
              <IonSelectOption value={ThrottleMode.Current}>Current</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem lines="full" style={SELECT_STYLE}>
            <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>Designated Assist Level</IonLabel>
            <IonSelect slot="end" value={local.throttle_assist_level} style={{ color: 'var(--bafang-text)' }}
              onIonChange={(e) => set('throttle_assist_level', e.detail.value)}>
              <IonSelectOption value={AssistLevelByDisplay}>By Display</IonSelectOption>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((v) => (
                <IonSelectOption key={v} value={v}>Level {v}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem lines="full" style={SELECT_STYLE}>
            <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>Speed Limit</IonLabel>
            <IonSelect slot="end" value={local.throttle_speed_limit} style={{ color: 'var(--bafang-text)' }}
              onIonChange={(e) => set('throttle_speed_limit', e.detail.value)}>
              <IonSelectOption value={SpeedLimitByDisplay}>By Display</IonSelectOption>
              {[15, 16, 20, 24, 25, 30, 32, 35, 40, 45].map((v) => (
                <IonSelectOption key={v} value={v}>{v} km/h</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <ParameterRow label="Start Current" unit="%" value={local.throttle_start_current}
            min={0} max={100} onChange={(v) => set('throttle_start_current', v)} />
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default ThrottlePage;
