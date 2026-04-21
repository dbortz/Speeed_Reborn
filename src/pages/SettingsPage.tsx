import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonMenuButton,
  IonButtons, IonList, IonItem, IonLabel, IonToggle,
} from '@ionic/react';
import { useMotorStore } from '../store/motorStore';

const SettingsPage: React.FC = () => {
  const { darkMode, setDarkMode } = useMotorStore();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton /></IonButtons>
          <IonTitle>App Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel>Dark Mode</IonLabel>
            <IonToggle
              slot="end"
              checked={darkMode}
              onIonChange={(e) => setDarkMode(e.detail.checked)}
            />
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
