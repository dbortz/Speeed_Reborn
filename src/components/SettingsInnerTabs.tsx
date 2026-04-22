// src/components/SettingsInnerTabs.tsx
import { IonIcon } from '@ionic/react';
import {
  bicycleOutline,
  speedometerOutline,
  cogOutline,
  contrastOutline,
  flashOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

export type SettingsTab = 'general' | 'levels' | 'pedal' | 'throttle' | 'torque';

const TABS: { id: SettingsTab; label: string; icon: string }[] = [
  { id: 'general',  label: 'GENERAL',  icon: bicycleOutline },
  { id: 'levels',   label: 'LEVELS',   icon: speedometerOutline },
  { id: 'pedal',    label: 'PEDAL',    icon: cogOutline },
  { id: 'throttle', label: 'THROTTLE', icon: contrastOutline },
  { id: 'torque',   label: 'TORQUE',   icon: flashOutline },
];

interface Props { active: SettingsTab; }

const SettingsInnerTabs: React.FC<Props> = ({ active }) => {
  const history = useHistory();
  return (
    <div className="inner-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`inner-tab${active === tab.id ? ' active' : ''}`}
          onClick={() => history.replace(`/settings/${tab.id}`)}
        >
          <IonIcon icon={tab.icon} />
          <span className="inner-tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default SettingsInnerTabs;
