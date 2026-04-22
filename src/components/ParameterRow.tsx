// src/components/ParameterRow.tsx
import { IonItem, IonLabel, IonInput, IonText } from '@ionic/react';

interface Props {
  label: string;
  value: number | string;
  unit?: string;
  onChange?: (val: number) => void;
  readonly?: boolean;
  min?: number;
  max?: number;
}

const ParameterRow: React.FC<Props> = ({ label, value, unit, onChange, readonly, min, max }) => {
  const displayValue = unit ? `${value} ${unit}` : String(value);

  return (
    <IonItem
      lines="full"
      style={{
        '--background': 'transparent',
        '--border-color': 'var(--bafang-border)',
        '--padding-start': '16px',
        '--padding-end': '16px',
        '--inner-padding-end': '0',
        '--min-height': '48px',
      }}
    >
      <IonLabel style={{ color: 'var(--bafang-text-muted)', fontSize: '14px' }}>
        {label}
      </IonLabel>
      {readonly ? (
        <IonText slot="end" style={{ color: 'var(--bafang-text)', fontSize: '14px', fontWeight: 500 }}>
          {displayValue}
        </IonText>
      ) : (
        <IonInput
          slot="end"
          type="number"
          value={String(value)}
          min={min}
          max={max}
          style={{
            textAlign: 'right',
            color: 'var(--bafang-text)',
            fontSize: '14px',
            fontWeight: 500,
            maxWidth: '100px',
          }}
          onIonChange={(e) => onChange?.(Number(e.detail.value))}
        />
      )}
    </IonItem>
  );
};

export default ParameterRow;
