import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonMenuButton, IonButtons } from '@ionic/react';

const PedalPage: React.FC = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start"><IonMenuButton /></IonButtons>
        <IonTitle>Pedal Assist</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent />
  </IonPage>
);

export default PedalPage;
