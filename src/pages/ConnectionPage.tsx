import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonMenuButton,
  IonButton, IonList, IonItem, IonLabel, IonSpinner, IonCheckbox,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonText,
  IonIcon, IonButtons,
} from '@ionic/react';
import { refreshOutline } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { listDevices, UsbDevice } from '../device/UsbSerial';
import { useMotorStore } from '../store/motorStore';

const ConnectionPage: React.FC = () => {
  const [devices, setDevices] = useState<UsbDevice[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [lawAgreed, setLawAgreed] = useState(false);
  const [liabilityAgreed, setLiabilityAgreed] = useState(false);
  const { connected, connecting, error, connectDevice, disconnectDevice } = useMotorStore();

  const refreshDevices = async () => {
    try {
      const list = await listDevices();
      setDevices(list);
    } catch {
      setDevices([]);
    }
  };

  useEffect(() => { refreshDevices(); }, []);

  const canConnect = selectedId !== null && lawAgreed && liabilityAgreed && !connected;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton /></IonButtons>
          <IonTitle>Connection</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={refreshDevices}><IonIcon icon={refreshOutline} /></IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">

        {error && <IonText color="danger"><p>{error}</p></IonText>}

        <IonCard>
          <IonCardHeader><IonCardTitle>USB Device</IonCardTitle></IonCardHeader>
          <IonCardContent>
            <IonList>
              {devices.length === 0 && (
                <IonItem><IonLabel color="medium">No USB devices found. Connect adapter via OTG.</IonLabel></IonItem>
              )}
              {devices.map((d) => (
                <IonItem
                  key={d.deviceId}
                  button
                  detail={false}
                  color={selectedId === d.deviceId ? 'primary' : undefined}
                  onClick={() => setSelectedId(d.deviceId)}
                >
                  <IonLabel>
                    <h2>{d.deviceName}</h2>
                    <p>VID: 0x{d.vendorId.toString(16).padStart(4, '0')} PID: 0x{d.productId.toString(16).padStart(4, '0')}</p>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader><IonCardTitle>Legal Agreement</IonCardTitle></IonCardHeader>
          <IonCardContent>
            <IonItem lines="none">
              <IonCheckbox slot="start" checked={lawAgreed} onIonChange={(e) => setLawAgreed(e.detail.checked)} />
              <IonLabel className="ion-text-wrap" style={{ fontSize: '13px' }}>
                I confirm that I will only use this software in accordance with the laws and regulations of my country regarding e-bike speed limits and motor power. *
              </IonLabel>
            </IonItem>
            <IonItem lines="none">
              <IonCheckbox slot="start" checked={liabilityAgreed} onIonChange={(e) => setLiabilityAgreed(e.detail.checked)} />
              <IonLabel className="ion-text-wrap" style={{ fontSize: '13px' }}>
                I understand that modifying motor controller parameters can be dangerous. I accept full responsibility for any damage to property, injury, or death or other consequences resulting from the use of this software. *
              </IonLabel>
            </IonItem>
          </IonCardContent>
        </IonCard>

        {!connected ? (
          <IonButton
            expand="block"
            disabled={!canConnect || connecting}
            onClick={() => selectedId !== null && connectDevice(selectedId)}
          >
            {connecting ? <IonSpinner name="crescent" /> : 'Connect (1200 baud)'}
          </IonButton>
        ) : (
          <IonButton expand="block" color="danger" onClick={disconnectDevice}>
            Disconnect
          </IonButton>
        )}

        {connected && (
          <IonText color="success">
            <p className="ion-text-center">✓ Connected at 1200 baud</p>
          </IonText>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ConnectionPage;
