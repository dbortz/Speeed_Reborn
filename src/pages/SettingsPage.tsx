import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonMenuButton, IonButtons } from '@ionic/react';

const SettingsPage: React.FC = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start"><IonMenuButton /></IonButtons>
        <IonTitle>App Settings</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent />
  </IonPage>
);

export default SettingsPage;
