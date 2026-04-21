import { IonItem, IonLabel, IonInput, IonNote } from '@ionic/react';

interface Props {
  label: string;
  value: number | string;
  unit?: string;
  onChange?: (val: number) => void;
  readonly?: boolean;
  min?: number;
  max?: number;
}

const ParameterRow: React.FC<Props> = ({ label, value, unit, onChange, readonly, min, max }) => (
  <IonItem>
    <IonLabel position="stacked">{label}{unit && <IonNote> ({unit})</IonNote>}</IonLabel>
    {readonly ? (
      <IonInput value={String(value)} readonly />
    ) : (
      <IonInput
        type="number"
        value={String(value)}
        min={min}
        max={max}
        onIonChange={(e) => onChange?.(Number(e.detail.value))}
      />
    )}
  </IonItem>
);

export default ParameterRow;
