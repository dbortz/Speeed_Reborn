// src/pages/PedalPage.tsx
import {
  IonPage, IonContent, IonHeader, IonList,
  IonItem, IonLabel, IonSelect, IonSelectOption,
} from '@ionic/react';
import { useState, useEffect } from 'react';
import { useMotorStore } from '../store/motorStore';
import {
  BafangPedalParameters, PedalType, SpeedLimitByDisplay,
  AssistLevelByDisplay, DEFAULT_PEDAL,
} from '../types/BafangTypes';
import ParameterRow from '../components/ParameterRow';
import SettingsInnerTabs from '../components/SettingsInnerTabs';
import ReadWriteBar from '../components/ReadWriteBar';

const SELECT_STYLE = { '--background': 'transparent', '--border-color': 'var(--bafang-border)' };

const PedalPage: React.FC = () => {
  const { pedal, connected, readPedal, writePedal } = useMotorStore();
  const [local, setLocal] = useState<BafangPedalParameters>(pedal ?? DEFAULT_PEDAL);

  useEffect(() => { if (pedal) setLocal(pedal); }, [pedal]);

  const set = (field: keyof BafangPedalParameters, val: any) =>
    setLocal((prev) => ({ ...prev, [field]: val }));

  return (
    <IonPage>
      <IonHeader style={{ boxShadow: 'none' }}>
        <SettingsInnerTabs active="pedal" />
        <ReadWriteBar
          title="Pedal"
          connected={connected}
          onRead={readPedal}
          onWrite={() => writePedal(local)}
        />
      </IonHeader>

      <IonContent>
        <IonList style={{ background: 'transparent' }}>
          <IonItem lines="full" style={SELECT_STYLE}>
            <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>Pedal Sensor Type</IonLabel>
            <IonSelect slot="end" value={local.pedal_type} style={{ color: 'var(--bafang-text)' }}
              onIonChange={(e) => set('pedal_type', e.detail.value)}>
              <IonSelectOption value={PedalType.None}>None</IonSelectOption>
              <IonSelectOption value={PedalType.DHSensor12}>DH Sensor 12</IonSelectOption>
              <IonSelectOption value={PedalType.BBSensor32}>BB Sensor 32</IonSelectOption>
              <IonSelectOption value={PedalType.DoubleSignal24}>Double Signal 24</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem lines="full" style={SELECT_STYLE}>
            <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>Designated Assist Level</IonLabel>
            <IonSelect slot="end" value={local.pedal_assist_level} style={{ color: 'var(--bafang-text)' }}
              onIonChange={(e) => set('pedal_assist_level', e.detail.value)}>
              <IonSelectOption value={AssistLevelByDisplay}>By Display</IonSelectOption>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((v) => (
                <IonSelectOption key={v} value={v}>Level {v}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem lines="full" style={SELECT_STYLE}>
            <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>Speed Limit</IonLabel>
            <IonSelect slot="end" value={local.pedal_speed_limit} style={{ color: 'var(--bafang-text)' }}
              onIonChange={(e) => set('pedal_speed_limit', e.detail.value)}>
              <IonSelectOption value={SpeedLimitByDisplay}>By Display</IonSelectOption>
              {[15, 16, 20, 24, 25, 30, 32, 35, 40, 45].map((v) => (
                <IonSelectOption key={v} value={v}>{v} km/h</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <ParameterRow label="Start Current" unit="%" value={local.pedal_start_current}
            min={0} max={100} onChange={(v) => set('pedal_start_current', v)} />
          <IonItem lines="full" style={SELECT_STYLE}>
            <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>Slow Start Mode</IonLabel>
            <IonSelect slot="end" value={local.pedal_slow_start_mode} style={{ color: 'var(--bafang-text)' }}
              onIonChange={(e) => set('pedal_slow_start_mode', e.detail.value)}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((v) => (
                <IonSelectOption key={v} value={v}>{v}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <ParameterRow label="Signals Before Assist" value={local.pedal_signals_before_start}
            min={1} max={24} onChange={(v) => set('pedal_signals_before_start', v)} />
          <IonItem lines="full" style={SELECT_STYLE}>
            <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>Stop Delay</IonLabel>
            <IonSelect slot="end" value={local.pedal_time_to_stop} style={{ color: 'var(--bafang-text)' }}
              onIonChange={(e) => set('pedal_time_to_stop', e.detail.value)}>
              {[50, 100, 150, 200, 250].map((v) => (
                <IonSelectOption key={v} value={v}>{v} ms</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <ParameterRow label="Current Decay" value={local.pedal_current_decay}
            min={1} max={8} onChange={(v) => set('pedal_current_decay', v)} />
          <ParameterRow label="Stop Decay" unit="ms" value={local.pedal_stop_decay}
            min={0} max={2550} onChange={(v) => set('pedal_stop_decay', v)} />
          <ParameterRow label="Keep Current" unit="%" value={local.pedal_keep_current}
            min={0} max={100} onChange={(v) => set('pedal_keep_current', v)} />
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default PedalPage;
