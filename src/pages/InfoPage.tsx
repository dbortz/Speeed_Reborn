import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonMenuButton,
  IonButton, IonButtons, IonList, IonItem, IonLabel, IonText,
  IonIcon,
} from '@ionic/react';
import { syncOutline } from 'ionicons/icons';
import { useMotorStore } from '../store/motorStore';

const InfoPage: React.FC = () => {
  const { info, connected, readInfo } = useMotorStore();

  const rows = info ? [
    { label: 'Serial Number', value: info.serial_number },
    { label: 'Model', value: info.model },
    { label: 'Manufacturer', value: info.manufacturer },
    { label: 'System Code', value: info.system_code },
    { label: 'Firmware Version', value: info.firmware_version },
    { label: 'Hardware Version', value: info.hardware_version },
    { label: 'Voltage', value: info.voltage + ' V' },
    { label: 'Max Current', value: info.max_current + ' A' },
  ] : [];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton /></IonButtons>
          <IonTitle>Motor Info</IonTitle>
          <IonButtons slot="end">
            <IonButton disabled={!connected} onClick={readInfo}>
              <IonIcon icon={syncOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {!connected && <IonText color="warning"><p className="ion-padding">Not connected. Go to Connection page first.</p></IonText>}
        {connected && !info && (
          <div className="ion-padding ion-text-center">
            <IonButton onClick={readInfo}>Read Motor Info</IonButton>
          </div>
        )}
        <IonList>
          {rows.map((r) => (
            <IonItem key={r.label}>
              <IonLabel>
                <h3>{r.label}</h3>
                <p>{r.value || '—'}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default InfoPage;
