// src/App.tsx
import {
  IonApp, IonIcon, IonLabel, IonRouterOutlet,
  IonTabBar, IonTabButton, IonTabs, setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { homeOutline, settingsOutline, helpCircleOutline } from 'ionicons/icons';
import { Route, Redirect, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import HomePage from './pages/HomePage';
import GeneralPage from './pages/GeneralPage';
import LevelsPage from './pages/LevelsPage';
import PedalPage from './pages/PedalPage';
import ThrottlePage from './pages/ThrottlePage';
import TorquePage from './pages/TorquePage';
import HelpPage from './pages/HelpPage';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './theme/variables.css';

setupIonicReact();

const TabBar: React.FC = () => {
  const { pathname } = useLocation();
  return (
    <IonTabBar slot="bottom">
      <IonTabButton tab="home" href="/home" selected={pathname === '/home'}>
        <IonIcon icon={homeOutline} />
        <IonLabel>HOME</IonLabel>
      </IonTabButton>
      <IonTabButton
        tab="settings"
        href="/settings/general"
        selected={pathname.startsWith('/settings')}
      >
        <IonIcon icon={settingsOutline} />
        <IonLabel>SETTINGS</IonLabel>
      </IonTabButton>
      <IonTabButton tab="help" href="/help" selected={pathname === '/help'}>
        <IonIcon icon={helpCircleOutline} />
        <IonLabel>HELP</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    document.body.classList.add('dark');
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/home" component={HomePage} />
            <Route exact path="/settings/general" component={GeneralPage} />
            <Route exact path="/settings/levels" component={LevelsPage} />
            <Route exact path="/settings/pedal" component={PedalPage} />
            <Route exact path="/settings/throttle" component={ThrottlePage} />
            <Route exact path="/settings/torque" component={TorquePage} />
            <Route exact path="/help" component={HelpPage} />
            <Route exact path="/settings" render={() => <Redirect to="/settings/general" />} />
            <Route exact path="/" render={() => <Redirect to="/home" />} />
          </IonRouterOutlet>
          <TabBar />
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
