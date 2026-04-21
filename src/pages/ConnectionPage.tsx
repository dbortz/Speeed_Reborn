import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonMenuButton, IonButtons } from '@ionic/react';

const ConnectionPage: React.FC = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start"><IonMenuButton /></IonButtons>
        <IonTitle>Connection</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent />
  </IonPage>
);

export default ConnectionPage;
