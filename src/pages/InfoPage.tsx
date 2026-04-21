import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonMenuButton, IonButtons } from '@ionic/react';

const InfoPage: React.FC = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start"><IonMenuButton /></IonButtons>
        <IonTitle>Motor Info</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent />
  </IonPage>
);

export default InfoPage;
