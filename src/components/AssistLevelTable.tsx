import { IonGrid, IonRow, IonCol, IonInput, IonLabel } from '@ionic/react';
import { AssistProfile } from '../types/BafangTypes';

interface Props {
  profiles: AssistProfile[];
  onChange: (profiles: AssistProfile[]) => void;
}

const AssistLevelTable: React.FC<Props> = ({ profiles, onChange }) => {
  const update = (i: number, field: keyof AssistProfile, val: number) => {
    const next = profiles.map((p, idx) => idx === i ? { ...p, [field]: val } : p);
    onChange(next);
  };

  return (
    <IonGrid>
      <IonRow>
        <IonCol><IonLabel><strong>Level</strong></IonLabel></IonCol>
        <IonCol><IonLabel><strong>Current %</strong></IonLabel></IonCol>
        <IonCol><IonLabel><strong>Speed %</strong></IonLabel></IonCol>
      </IonRow>
      {profiles.map((p, i) => (
        <IonRow key={i}>
          <IonCol><IonLabel>{i}</IonLabel></IonCol>
          <IonCol>
            <IonInput
              type="number" min={0} max={100} value={p.current_limit}
              onIonChange={(e) => update(i, 'current_limit', Number(e.detail.value))}
            />
          </IonCol>
          <IonCol>
            <IonInput
              type="number" min={0} max={100} value={p.speed_limit}
              onIonChange={(e) => update(i, 'speed_limit', Number(e.detail.value))}
            />
          </IonCol>
        </IonRow>
      ))}
    </IonGrid>
  );
};

export default AssistLevelTable;
