import {
  IonApp, IonContent, IonHeader, IonIcon, IonItem, IonLabel,
  IonList, IonMenu, IonMenuButton, IonPage, IonRouterOutlet,
  IonSplitPane, IonTitle, IonToolbar, setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import {
  informationCircleOutline, settingsOutline, flashOutline,
  bicycleOutline, analyticsOutline, linkOutline, accessibilityOutline,
} from 'ionicons/icons';
import { Route, Redirect } from 'react-router-dom';
import { useEffect } from 'react';
import { useMotorStore } from './store/motorStore';

import ConnectionPage from './pages/ConnectionPage';
import InfoPage from './pages/InfoPage';
import BasicPage from './pages/BasicPage';
import PedalPage from './pages/PedalPage';
import ThrottlePage from './pages/ThrottlePage';
import TorquePage from './pages/TorquePage';
import SettingsPage from './pages/SettingsPage';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './theme/variables.css';

setupIonicReact();

const menuItems = [
  { path: '/connection', label: 'Connection', icon: linkOutline },
  { path: '/info', label: 'Motor Info', icon: informationCircleOutline },
  { path: '/basic', label: 'Basic Settings', icon: settingsOutline },
  { path: '/pedal', label: 'Pedal Assist', icon: bicycleOutline },
  { path: '/throttle', label: 'Throttle', icon: flashOutline },
  { path: '/torque', label: 'Torque Sensor', icon: analyticsOutline },
  { path: '/settings', label: 'App Settings', icon: accessibilityOutline },
];

const App: React.FC = () => {
  const darkMode = useMotorStore((s) => s.darkMode);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <IonApp>
      <IonReactRouter>
        <IonSplitPane contentId="main">
          <IonMenu contentId="main" type="overlay">
            <IonHeader>
              <IonToolbar>
                <IonTitle>BafangAndroid</IonTitle>
              </IonToolbar>
            </IonHeader>
            <IonContent>
              <IonList>
                {menuItems.map((item) => (
                  <IonItem
                    key={item.path}
                    routerLink={item.path}
                    routerDirection="none"
                    lines="none"
                    detail={false}
                  >
                    <IonIcon slot="start" icon={item.icon} />
                    <IonLabel>{item.label}</IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </IonContent>
          </IonMenu>

          <IonPage id="main">
            <IonRouterOutlet>
              <Route exact path="/connection" component={ConnectionPage} />
              <Route exact path="/info" component={InfoPage} />
              <Route exact path="/basic" component={BasicPage} />
              <Route exact path="/pedal" component={PedalPage} />
              <Route exact path="/throttle" component={ThrottlePage} />
              <Route exact path="/torque" component={TorquePage} />
              <Route exact path="/settings" component={SettingsPage} />
              <Route exact path="/" render={() => <Redirect to="/connection" />} />
            </IonRouterOutlet>
          </IonPage>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
