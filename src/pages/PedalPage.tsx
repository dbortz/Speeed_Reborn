import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonMenuButton,
  IonButton, IonButtons, IonList, IonItem, IonLabel, IonSelect,
  IonSelectOption, IonText, IonIcon, IonFab, IonFabButton, IonSpinner,
} from '@ionic/react';
import { syncOutline, saveOutline } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { useMotorStore } from '../store/motorStore';
import { BafangPedalParameters, PedalType, SpeedLimitByDisplay } from '../types/BafangTypes';
import ParameterRow from '../components/ParameterRow';

const PedalPage: React.FC = () => {
  const { pedal, connected, readPedal, writePedal } = useMotorStore();
  const [local, setLocal] = useState<BafangPedalParameters | null>(pedal);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setLocal(pedal); }, [pedal]);

  const set = (field: keyof BafangPedalParameters, val: any) =>
    setLocal((prev) => prev ? { ...prev, [field]: val } : prev);

  const handleWrite = async () => {
    if (!local) return;
    setSaving(true);
    await writePedal(local);
    setSaving(false);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton /></IonButtons>
          <IonTitle>Pedal Assist</IonTitle>
          <IonButtons slot="end">
            <IonButton disabled={!connected} onClick={readPedal}><IonIcon icon={syncOutline} /></IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {!connected && <IonText color="warning"><p>Not connected.</p></IonText>}
        {connected && !local && <IonButton onClick={readPedal}>Read Pedal Parameters</IonButton>}
        {local && (
          <IonList>
            <IonItem>
              <IonLabel>Pedal Type</IonLabel>
              <IonSelect value={local.pedal_type} onIonChange={(e) => set('pedal_type', e.detail.value)}>
                <IonSelectOption value={PedalType.None}>None</IonSelectOption>
                <IonSelectOption value={PedalType.DHSensor12}>DH Sensor 12</IonSelectOption>
                <IonSelectOption value={PedalType.BBSensor32}>BB Sensor 32</IonSelectOption>
                <IonSelectOption value={PedalType.DoubleSignal24}>Double Signal 24</IonSelectOption>
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel>Speed Limit</IonLabel>
              <IonSelect value={local.pedal_speed_limit} onIonChange={(e) => set('pedal_speed_limit', e.detail.value)}>
                <IonSelectOption value={SpeedLimitByDisplay}>By Display</IonSelectOption>
                {[15,20,25,30,35,40,45].map((v) => (
                  <IonSelectOption key={v} value={v}>{v} km/h</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <ParameterRow label="Start Current" unit="%" value={local.pedal_start_current} min={0} max={100} onChange={(v) => set('pedal_start_current', v)} />
            <IonItem>
              <IonLabel>Slow Start Mode (1-8)</IonLabel>
              <IonSelect value={local.pedal_slow_start_mode} onIonChange={(e) => set('pedal_slow_start_mode', e.detail.value)}>
                {[1,2,3,4,5,6,7,8].map((v) => <IonSelectOption key={v} value={v}>{v}</IonSelectOption>)}
              </IonSelect>
            </IonItem>
            <ParameterRow label="Signals Before Assist" value={local.pedal_signals_before_start} min={1} max={24} onChange={(v) => set('pedal_signals_before_start', v)} />
            <IonItem>
              <IonLabel>Time to Stop</IonLabel>
              <IonSelect value={local.pedal_time_to_stop} onIonChange={(e) => set('pedal_time_to_stop', e.detail.value)}>
                {[50,100,150,200,250].map((v) => <IonSelectOption key={v} value={v}>{v} ms</IonSelectOption>)}
              </IonSelect>
            </IonItem>
            <ParameterRow label="Current Decay" value={local.pedal_current_decay} min={1} max={8} onChange={(v) => set('pedal_current_decay', v)} />
            <ParameterRow label="Stop Decay" unit="ms×10" value={local.pedal_stop_decay} min={0} max={255} onChange={(v) => set('pedal_stop_decay', v)} />
            <ParameterRow label="Keep Current" unit="%" value={local.pedal_keep_current} min={0} max={100} onChange={(v) => set('pedal_keep_current', v)} />
          </IonList>
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

export default PedalPage;
