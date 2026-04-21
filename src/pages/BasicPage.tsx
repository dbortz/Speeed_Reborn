import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonMenuButton,
  IonButton, IonButtons, IonList, IonItem, IonLabel, IonSelect,
  IonSelectOption, IonText, IonIcon, IonFab, IonFabButton, IonSpinner,
} from '@ionic/react';
import { syncOutline, saveOutline } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { useMotorStore } from '../store/motorStore';
import { BafangBasicParameters, SpeedmeterType } from '../types/BafangTypes';
import ParameterRow from '../components/ParameterRow';
import AssistLevelTable from '../components/AssistLevelTable';

const BasicPage: React.FC = () => {
  const { basic, connected, readBasic, writeBasic } = useMotorStore();
  const [local, setLocal] = useState<BafangBasicParameters | null>(basic);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setLocal(basic); }, [basic]);

  const set = (field: keyof BafangBasicParameters, val: any) =>
    setLocal((prev) => prev ? { ...prev, [field]: val } : prev);

  const handleWrite = async () => {
    if (!local) return;
    setSaving(true);
    await writeBasic(local);
    setSaving(false);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton /></IonButtons>
          <IonTitle>Basic Settings</IonTitle>
          <IonButtons slot="end">
            <IonButton disabled={!connected} onClick={readBasic}><IonIcon icon={syncOutline} /></IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {!connected && <IonText color="warning"><p>Not connected.</p></IonText>}
        {connected && !local && <IonButton onClick={readBasic}>Read Basic Parameters</IonButton>}

        {local && (
          <IonList>
            <ParameterRow
              label="Low Battery Protection" unit="V×10"
              value={local.low_battery_protection}
              min={200} max={600}
              onChange={(v) => set('low_battery_protection', v)}
            />
            <ParameterRow
              label="Current Limit" unit="A"
              value={local.current_limit}
              min={1} max={30}
              onChange={(v) => set('current_limit', v)}
            />
            <IonItem>
              <IonLabel>Assist Levels</IonLabel>
              <IonSelect
                value={local.assist_levels}
                onIonChange={(e) => set('assist_levels', e.detail.value)}
              >
                <IonSelectOption value={3}>3</IonSelectOption>
                <IonSelectOption value={5}>5</IonSelectOption>
                <IonSelectOption value={9}>9</IonSelectOption>
              </IonSelect>
            </IonItem>
            <ParameterRow
              label="Wheel Diameter" unit="inches"
              value={local.wheel_diameter}
              min={12} max={29}
              onChange={(v) => set('wheel_diameter', v)}
            />
            <IonItem>
              <IonLabel>Speedmeter Type</IonLabel>
              <IonSelect
                value={local.speedmeter_type}
                onIonChange={(e) => set('speedmeter_type', e.detail.value)}
              >
                <IonSelectOption value={SpeedmeterType.External}>External</IonSelectOption>
                <IonSelectOption value={SpeedmeterType.Internal}>Internal</IonSelectOption>
                <IonSelectOption value={SpeedmeterType.Motorphase}>Motorphase</IonSelectOption>
              </IonSelect>
            </IonItem>
            <ParameterRow
              label="Speedmeter Magnets"
              value={local.speedmeter_magnets}
              min={1} max={32}
              onChange={(v) => set('speedmeter_magnets', v)}
            />
          </IonList>
        )}

        {local && (
          <>
            <IonLabel className="ion-padding"><strong>Assist Level Table</strong></IonLabel>
            <AssistLevelTable
              profiles={local.assist_profiles}
              onChange={(p) => set('assist_profiles', p)}
            />
          </>
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

export default BasicPage;
