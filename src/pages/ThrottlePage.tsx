import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonMenuButton, IonButtons } from '@ionic/react';

const ThrottlePage: React.FC = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start"><IonMenuButton /></IonButtons>
        <IonTitle>Throttle</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent />
  </IonPage>
);

export default ThrottlePage;
