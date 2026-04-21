import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonMenuButton,
  IonButton, IonButtons, IonList, IonItem, IonLabel, IonSelect,
  IonSelectOption, IonText, IonIcon, IonFab, IonFabButton, IonSpinner,
} from '@ionic/react';
import { syncOutline, saveOutline } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { useMotorStore } from '../store/motorStore';
import { BafangThrottleParameters, ThrottleMode } from '../types/BafangTypes';
import ParameterRow from '../components/ParameterRow';

const ThrottlePage: React.FC = () => {
  const { throttle, connected, readThrottle, writeThrottle } = useMotorStore();
  const [local, setLocal] = useState<BafangThrottleParameters | null>(throttle);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setLocal(throttle); }, [throttle]);

  const set = (field: keyof BafangThrottleParameters, val: any) =>
    setLocal((prev) => prev ? { ...prev, [field]: val } : prev);

  const handleWrite = async () => {
    if (!local) return;
    setSaving(true);
    await writeThrottle(local);
    setSaving(false);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton /></IonButtons>
          <IonTitle>Throttle Handle</IonTitle>
          <IonButtons slot="end">
            <IonButton disabled={!connected} onClick={readThrottle}><IonIcon icon={syncOutline} /></IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {!connected && <IonText color="warning"><p>Not connected.</p></IonText>}
        {connected && !local && <IonButton onClick={readThrottle}>Read Throttle Parameters</IonButton>}
        {local && (
          <IonList>
            <ParameterRow label="Start Voltage" unit="mV" value={local.throttle_start_voltage} min={500} max={2000} onChange={(v) => set('throttle_start_voltage', v)} />
            <ParameterRow label="End Voltage" unit="mV" value={local.throttle_end_voltage} min={3000} max={5000} onChange={(v) => set('throttle_end_voltage', v)} />
            <IonItem>
              <IonLabel>Mode</IonLabel>
              <IonSelect value={local.throttle_mode} onIonChange={(e) => set('throttle_mode', e.detail.value)}>
                <IonSelectOption value={ThrottleMode.Speed}>Speed</IonSelectOption>
                <IonSelectOption value={ThrottleMode.Current}>Current</IonSelectOption>
              </IonSelect>
            </IonItem>
            <ParameterRow label="Assist Level" value={local.throttle_assist_level} min={0} max={9} onChange={(v) => set('throttle_assist_level', v)} />
            <ParameterRow label="Speed Limit" unit="km/h" value={local.throttle_speed_limit} min={1} max={45} onChange={(v) => set('throttle_speed_limit', v)} />
            <ParameterRow label="Start Current" unit="%" value={local.throttle_start_current} min={0} max={100} onChange={(v) => set('throttle_start_current', v)} />
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

export default ThrottlePage;
