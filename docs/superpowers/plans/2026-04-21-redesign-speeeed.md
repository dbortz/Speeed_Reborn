# Redesign Speeeed — BafangAndroid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer toute l'UI de BafangAndroid par un design inspiré de l'app Speeeed — fond noir pur, 3 onglets en bas (Home/Settings/Help), 5 onglets internes dans Settings (General/Levels/Pedal/Throttle/Torque), boutons READ/WRITE en contour, style flat paramètres.

**Architecture:** Remplacer `IonSplitPane` + `IonMenu` par `IonTabs` avec 3 onglets. Les pages ConnectionPage et InfoPage fusionnent dans `HomePage`. `BasicPage` devient `GeneralPage` et perd le tableau Assist (déplacé dans `LevelsPage`). Chaque page Settings embarque `SettingsInnerTabs` + `ReadWriteBar` en header.

**Tech Stack:** React 18, TypeScript, Ionic 8, Capacitor 8, Zustand (motorStore), React Router (react-router-dom)

---

## Fichiers touchés

| Action | Fichier |
|--------|---------|
| MODIFY | `src/theme/variables.css` |
| CREATE | `src/components/SettingsInnerTabs.tsx` |
| CREATE | `src/components/ReadWriteBar.tsx` |
| MODIFY | `src/components/ParameterRow.tsx` |
| MODIFY | `src/App.tsx` |
| CREATE | `src/pages/HomePage.tsx` |
| CREATE | `src/pages/GeneralPage.tsx` |
| CREATE | `src/pages/LevelsPage.tsx` |
| MODIFY | `src/pages/PedalPage.tsx` |
| MODIFY | `src/pages/ThrottlePage.tsx` |
| MODIFY | `src/pages/TorquePage.tsx` |
| CREATE | `src/pages/HelpPage.tsx` |
| DELETE | `src/pages/BasicPage.tsx` |
| DELETE | `src/pages/ConnectionPage.tsx` |
| DELETE | `src/pages/InfoPage.tsx` |
| DELETE | `src/pages/SettingsPage.tsx` |
| DELETE | `src/pages/Home.tsx` + `Home.css` |

---

## Task 1: CSS Variables — Thème toujours sombre

**Files:**
- Modify: `src/theme/variables.css`

- [ ] **Step 1 : Remplacer variables.css entièrement**

```css
/* src/theme/variables.css */

/* ============================================================
   Toujours sombre — pas de toggle light/dark
   ============================================================ */
:root,
body,
body.dark {
  /* Ionic overrides */
  --ion-background-color: #000000;
  --ion-background-color-rgb: 0, 0, 0;
  --ion-text-color: #ffffff;
  --ion-text-color-rgb: 255, 255, 255;
  --ion-color-primary: #3a7bd5;
  --ion-color-primary-rgb: 58, 123, 213;
  --ion-color-primary-contrast: #ffffff;
  --ion-color-primary-shade: #3371c4;
  --ion-color-primary-tint: #4e8ada;
  --ion-color-success: #27ae60;
  --ion-color-danger: #e74c3c;
  --ion-color-warning: #f39c12;
  --ion-item-background: transparent;
  --ion-toolbar-background: #000000;
  --ion-toolbar-border-color: #1e1e1e;
  --ion-tab-bar-background: #0d0d0d;
  --ion-tab-bar-border-color: #1e1e1e;
  --ion-card-background: #111111;
  --ion-color-step-50: #0d0d0d;
  --ion-color-step-100: #1a1a1a;
  --ion-color-step-150: #262626;
  --ion-color-step-200: #333333;
  --ion-color-step-600: #999999;
  --ion-color-step-850: #d9d9d9;
  --ion-font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;

  /* Custom design tokens */
  --bafang-accent: #3a7bd5;
  --bafang-green: #27ae60;
  --bafang-red: #e74c3c;
  --bafang-danger-bg: #c0392b;
  --bafang-bg: #000000;
  --bafang-surface: #0d0d0d;
  --bafang-surface-2: #111111;
  --bafang-border: #1e1e1e;
  --bafang-text: #ffffff;
  --bafang-text-muted: #aaaaaa;
  --bafang-text-dim: #555555;
}

/* ============================================================
   Inner tabs (Settings sub-navigation)
   ============================================================ */
.inner-tabs {
  display: flex;
  background: var(--bafang-surface);
  border-bottom: 1px solid var(--bafang-border);
}

.inner-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 2px 7px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  gap: 3px;
}

.inner-tab ion-icon {
  font-size: 18px;
  color: var(--bafang-text-dim);
}

.inner-tab .inner-tab-label {
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--bafang-text-dim);
  text-transform: uppercase;
}

.inner-tab.active {
  border-bottom: 2px solid var(--bafang-accent);
}

.inner-tab.active ion-icon {
  color: var(--bafang-accent);
}

.inner-tab.active .inner-tab-label {
  color: var(--bafang-accent);
}

/* ============================================================
   READ / WRITE bar
   ============================================================ */
.rw-bar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 8px;
  border-bottom: 1px solid var(--bafang-border);
  background: var(--bafang-bg);
}

.btn-read {
  border: 1.5px solid var(--bafang-green);
  border-radius: 4px;
  padding: 6px 14px;
  font-size: 10px;
  font-weight: 700;
  color: var(--bafang-green);
  background: transparent;
  letter-spacing: 0.5px;
  cursor: pointer;
}

.btn-read:disabled {
  opacity: 0.35;
  cursor: default;
}

.btn-write {
  border: 1.5px solid var(--bafang-red);
  border-radius: 4px;
  padding: 6px 14px;
  font-size: 10px;
  font-weight: 700;
  color: var(--bafang-red);
  background: transparent;
  letter-spacing: 0.5px;
  cursor: pointer;
}

.btn-write:disabled {
  opacity: 0.35;
  cursor: default;
}

.rw-title {
  flex: 1;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  color: var(--bafang-text);
}

/* ============================================================
   Sections Home
   ============================================================ */
.section-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--bafang-text);
  padding: 12px 16px 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.connect-btn-full {
  margin: 4px 16px 12px;
  background: var(--bafang-accent);
  border: none;
  border-radius: 6px;
  padding: 14px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #fff;
  width: calc(100% - 32px);
  cursor: pointer;
  text-transform: uppercase;
}

.connect-btn-full.danger {
  background: var(--bafang-danger-bg);
}

.status-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.status-badge.disconnected {
  background: var(--bafang-danger-bg);
  color: #fff;
}

.status-badge.connected {
  background: var(--bafang-green);
  color: #fff;
}

/* ============================================================
   Torque table (keep functional but dark-styled)
   ============================================================ */
.torque-table {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.torque-table table {
  min-width: 600px;
  border-collapse: collapse;
}

.torque-table th,
.torque-table td {
  padding: 6px 8px;
  border: 1px solid var(--bafang-border);
  text-align: center;
  font-size: 13px;
  color: var(--bafang-text);
}

.torque-table th {
  background: var(--bafang-surface);
  font-weight: 600;
  color: var(--bafang-text-muted);
}

.torque-table input {
  width: 52px;
  background: transparent;
  border: none;
  color: var(--bafang-text);
  text-align: center;
  font-size: 13px;
}

/* ============================================================
   Levels table
   ============================================================ */
.levels-toggle-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--bafang-border);
  font-size: 12px;
  color: var(--bafang-text-muted);
}

.levels-table-header {
  display: flex;
  padding: 6px 16px;
  font-size: 11px;
  font-weight: 700;
  color: var(--bafang-text-dim);
  border-bottom: 1px solid var(--bafang-border);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.levels-table-header .col-lvl { width: 48px; }
.levels-table-header .col-val { flex: 1; text-align: right; }
```

- [ ] **Step 2 : Vérifier que le build compile**

```bash
cd J:/Bafangtool/BafangAndroid && npm run build 2>&1 | tail -20
```
Attendu : build réussi ou erreurs seulement dans des fichiers pas encore touchés.

- [ ] **Step 3 : Commit**

```bash
cd J:/Bafangtool/BafangAndroid
git add src/theme/variables.css
git commit -m "style: replace theme with always-dark Speeeed-inspired tokens"
```

---

## Task 2: SettingsInnerTabs component

**Files:**
- Create: `src/components/SettingsInnerTabs.tsx`

- [ ] **Step 1 : Créer le composant**

```tsx
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
          onClick={() => history.push(`/settings/${tab.id}`)}
        >
          <IonIcon icon={tab.icon} />
          <span className="inner-tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default SettingsInnerTabs;
```

- [ ] **Step 2 : Commit**

```bash
cd J:/Bafangtool/BafangAndroid
git add src/components/SettingsInnerTabs.tsx
git commit -m "feat: add SettingsInnerTabs component (5 sub-tabs)"
```

---

## Task 3: ReadWriteBar component

**Files:**
- Create: `src/components/ReadWriteBar.tsx`

- [ ] **Step 1 : Créer le composant**

```tsx
// src/components/ReadWriteBar.tsx
import { useState } from 'react';

interface Props {
  title: string;
  connected: boolean;
  onRead: () => void;
  onWrite: () => Promise<void>;
}

const ReadWriteBar: React.FC<Props> = ({ title, connected, onRead, onWrite }) => {
  const [saving, setSaving] = useState(false);

  const handleWrite = async () => {
    setSaving(true);
    await onWrite();
    setSaving(false);
  };

  return (
    <div className="rw-bar">
      <button className="btn-read" disabled={!connected} onClick={onRead}>
        READ
      </button>
      <span className="rw-title">{title}</span>
      <button className="btn-write" disabled={!connected || saving} onClick={handleWrite}>
        {saving ? '···' : 'WRITE'}
      </button>
    </div>
  );
};

export default ReadWriteBar;
```

- [ ] **Step 2 : Commit**

```bash
cd J:/Bafangtool/BafangAndroid
git add src/components/ReadWriteBar.tsx
git commit -m "feat: add ReadWriteBar component (outlined green/red buttons)"
```

---

## Task 4: ParameterRow redesign — style flat

**Files:**
- Modify: `src/components/ParameterRow.tsx`

- [ ] **Step 1 : Réécrire ParameterRow**

Le nouveau style : label à gauche (muted), valeur/input à droite (blanc). Pas de `position="stacked"`.

```tsx
// src/components/ParameterRow.tsx
import { IonItem, IonLabel, IonInput, IonText } from '@ionic/react';

interface Props {
  label: string;
  value: number | string;
  unit?: string;
  onChange?: (val: number) => void;
  readonly?: boolean;
  min?: number;
  max?: number;
}

const ParameterRow: React.FC<Props> = ({ label, value, unit, onChange, readonly, min, max }) => {
  const displayValue = unit ? `${value} ${unit}` : String(value);

  return (
    <IonItem
      lines="full"
      style={{
        '--background': 'transparent',
        '--border-color': 'var(--bafang-border)',
        '--padding-start': '16px',
        '--padding-end': '16px',
        '--inner-padding-end': '0',
        '--min-height': '48px',
      }}
    >
      <IonLabel style={{ color: 'var(--bafang-text-muted)', fontSize: '14px' }}>
        {label}
      </IonLabel>
      {readonly ? (
        <IonText slot="end" style={{ color: 'var(--bafang-text)', fontSize: '14px', fontWeight: 500 }}>
          {displayValue}
        </IonText>
      ) : (
        <IonInput
          slot="end"
          type="number"
          value={String(value)}
          min={min}
          max={max}
          style={{
            textAlign: 'right',
            color: 'var(--bafang-text)',
            fontSize: '14px',
            fontWeight: 500,
            maxWidth: '100px',
          }}
          onIonChange={(e) => onChange?.(Number(e.detail.value))}
        />
      )}
    </IonItem>
  );
};

export default ParameterRow;
```

- [ ] **Step 2 : Vérifier le build**

```bash
cd J:/Bafangtool/BafangAndroid && npm run build 2>&1 | tail -20
```

- [ ] **Step 3 : Commit**

```bash
cd J:/Bafangtool/BafangAndroid
git add src/components/ParameterRow.tsx
git commit -m "style: redesign ParameterRow to flat label-left/value-right style"
```

---

## Task 5: App.tsx — Remplacer IonSplitPane par IonTabs

**Files:**
- Modify: `src/App.tsx`

Le fichier load/save est déplacé vers `HomePage`. App.tsx gère seulement le routage.

- [ ] **Step 1 : Réécrire App.tsx**

```tsx
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
```

- [ ] **Step 2 : Créer des placeholders pour les nouvelles pages (pour que le build passe)**

Créer les fichiers manquants avec du contenu minimal. On les remplacera dans les tâches suivantes.

`src/pages/HomePage.tsx` (placeholder) :
```tsx
import { IonPage, IonContent } from '@ionic/react';
const HomePage: React.FC = () => <IonPage><IonContent><p>Home</p></IonContent></IonPage>;
export default HomePage;
```

`src/pages/GeneralPage.tsx` (placeholder) :
```tsx
import { IonPage, IonContent } from '@ionic/react';
const GeneralPage: React.FC = () => <IonPage><IonContent><p>General</p></IonContent></IonPage>;
export default GeneralPage;
```

`src/pages/LevelsPage.tsx` (placeholder) :
```tsx
import { IonPage, IonContent } from '@ionic/react';
const LevelsPage: React.FC = () => <IonPage><IonContent><p>Levels</p></IonContent></IonPage>;
export default LevelsPage;
```

`src/pages/HelpPage.tsx` (placeholder) :
```tsx
import { IonPage, IonContent } from '@ionic/react';
const HelpPage: React.FC = () => <IonPage><IonContent><p>Help</p></IonContent></IonPage>;
export default HelpPage;
```

- [ ] **Step 3 : Vérifier le build**

```bash
cd J:/Bafangtool/BafangAndroid && npm run build 2>&1 | tail -30
```
Attendu : build réussi. Si erreur de type, vérifier les imports.

- [ ] **Step 4 : Commit**

```bash
cd J:/Bafangtool/BafangAndroid
git add src/App.tsx src/pages/HomePage.tsx src/pages/GeneralPage.tsx src/pages/LevelsPage.tsx src/pages/HelpPage.tsx
git commit -m "feat: replace IonSplitPane with IonTabs (3 bottom tabs)"
```

---

## Task 6: HomePage (Connection + Motor Info)

**Files:**
- Modify: `src/pages/HomePage.tsx`

Remplace ConnectionPage + InfoPage. Garde la liste USB, les checkboxes légales, CONNECT/DISCONNECT, et les infos moteur.

- [ ] **Step 1 : Écrire HomePage**

```tsx
// src/pages/HomePage.tsx
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonIcon, IonItem, IonLabel,
  IonList, IonCheckbox, IonSpinner, IonText, IonSelect,
  IonSelectOption,
} from '@ionic/react';
import {
  folderOpenOutline, downloadOutline, refreshOutline,
} from 'ionicons/icons';
import { useState, useEffect, useRef } from 'react';
import { useMotorStore } from '../store/motorStore';
import { listDevices, UsbDevice } from '../device/UsbSerial';
import { parseElFile, serializeAllToEl } from '../device/ElFileParser';

const HomePage: React.FC = () => {
  const [devices, setDevices] = useState<UsbDevice[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [lawAgreed, setLawAgreed] = useState(false);
  const [liabilityAgreed, setLiabilityAgreed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    connected, connecting, error,
    connectDevice, disconnectDevice,
    info, readInfo,
    basic, pedal, throttle, torque,
    loadFromFile,
    readBasic, readPedal, readThrottle, readTorque,
    writeBasic, writePedal, writeThrottle, writeTorque,
  } = useMotorStore();

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

  const handleReadAll = () => {
    readInfo();
    readBasic();
    readPedal();
    readThrottle();
    readTorque();
  };

  const handleWriteAll = async () => {
    if (basic) await writeBasic(basic);
    if (pedal) await writePedal(pedal);
    if (throttle) await writeThrottle(throttle);
    if (torque) await writeTorque(torque);
  };

  const handleLoad = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = parseElFile(ev.target?.result as string);
      loadFromFile(data);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSave = () => {
    const content = serializeAllToEl({ basic, pedal, throttle, torque });
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bafang-settings.el';
    a.click();
    URL.revokeObjectURL(url);
  };

  const motorRows = info ? [
    { label: 'Manufacturer', value: info.manufacturer },
    { label: 'Model', value: info.model },
    { label: 'Firmware', value: info.firmware_version },
    { label: 'Hardware', value: info.hardware_version },
    { label: 'Serial', value: info.serial_number },
    { label: 'Voltage', value: `${info.voltage} V` },
    { label: 'Max Current', value: `${info.max_current} A` },
  ] : [];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle style={{ color: 'var(--bafang-accent)', fontWeight: 700 }}>
            BafangAndroid
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLoad}>
              <IonIcon slot="icon-only" icon={folderOpenOutline} />
            </IonButton>
            <IonButton onClick={handleSave}>
              <IonIcon slot="icon-only" icon={downloadOutline} />
            </IonButton>
            <IonButton onClick={refreshDevices}>
              <IonIcon slot="icon-only" icon={refreshOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {error && (
          <IonText color="danger">
            <p style={{ padding: '8px 16px', fontSize: '13px' }}>{error}</p>
          </IonText>
        )}

        {/* Connection section */}
        <div className="section-label">Connection</div>

        {!connected && devices.length === 0 && (
          <p style={{ padding: '4px 16px 8px', fontSize: '13px', color: 'var(--bafang-text-muted)' }}>
            No USB device found. Connect adapter via OTG and tap ↻
          </p>
        )}

        {!connected && devices.length > 0 && (
          <IonItem
            lines="full"
            style={{ '--background': 'transparent', '--border-color': 'var(--bafang-border)' }}
          >
            <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>USB Device</IonLabel>
            <IonSelect
              slot="end"
              value={selectedId}
              placeholder="Select"
              onIonChange={(e) => setSelectedId(e.detail.value)}
              style={{ color: 'var(--bafang-text)' }}
            >
              {devices.map((d) => (
                <IonSelectOption key={d.deviceId} value={d.deviceId}>
                  {d.deviceName}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        )}

        {!connected && (
          <>
            <IonItem lines="full" style={{ '--background': 'transparent', '--border-color': 'var(--bafang-border)', '--min-height': '56px' }}>
              <IonCheckbox
                slot="start"
                checked={lawAgreed}
                onIonChange={(e) => setLawAgreed(e.detail.checked)}
                style={{ '--border-color': 'var(--bafang-text-dim)', '--checkbox-background-checked': 'var(--bafang-accent)' }}
              />
              <IonLabel className="ion-text-wrap" style={{ fontSize: '12px', color: 'var(--bafang-text-muted)' }}>
                I confirm I will only use this software in accordance with local e-bike laws. *
              </IonLabel>
            </IonItem>
            <IonItem lines="full" style={{ '--background': 'transparent', '--border-color': 'var(--bafang-border)', '--min-height': '56px' }}>
              <IonCheckbox
                slot="start"
                checked={liabilityAgreed}
                onIonChange={(e) => setLiabilityAgreed(e.detail.checked)}
                style={{ '--border-color': 'var(--bafang-text-dim)', '--checkbox-background-checked': 'var(--bafang-accent)' }}
              />
              <IonLabel className="ion-text-wrap" style={{ fontSize: '12px', color: 'var(--bafang-text-muted)' }}>
                I accept full responsibility for any damage, injury, or consequences from using this software. *
              </IonLabel>
            </IonItem>
          </>
        )}

        <button
          className={`connect-btn-full${connected ? ' danger' : ''}`}
          disabled={connected ? false : (!canConnect || connecting)}
          onClick={() => connected ? disconnectDevice() : selectedId !== null && connectDevice(selectedId)}
        >
          {connecting ? '···' : connected ? 'DISCONNECT' : 'CONNECT'}
        </button>

        {/* Motor section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 16px 0' }}>
          <div className="section-label" style={{ padding: '8px 0 4px' }}>Motor</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-read" disabled={!connected} onClick={handleReadAll}>READ ALL</button>
            <button className="btn-write" disabled={!connected} onClick={handleWriteAll}>WRITE ALL</button>
          </div>
        </div>

        <IonList style={{ '--ion-item-background': 'transparent', background: 'transparent' }}>
          <IonItem
            lines="full"
            style={{ '--background': 'transparent', '--border-color': 'var(--bafang-border)' }}
          >
            <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>Status</IonLabel>
            <span
              slot="end"
              className={`status-badge ${connected ? 'connected' : 'disconnected'}`}
            >
              {connected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </IonItem>

          {motorRows.map((row) => (
            <IonItem
              key={row.label}
              lines="full"
              style={{ '--background': 'transparent', '--border-color': 'var(--bafang-border)' }}
            >
              <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>{row.label}</IonLabel>
              <IonText
                slot="end"
                style={{ color: row.value ? 'var(--bafang-text)' : 'var(--bafang-text-dim)', fontSize: '14px' }}
              >
                {row.value || '—'}
              </IonText>
            </IonItem>
          ))}

          {!info && connected && (
            <IonItem lines="none" style={{ '--background': 'transparent' }}>
              <IonLabel style={{ color: 'var(--bafang-text-dim)', fontSize: '13px' }}>
                Tap READ ALL to load motor info
              </IonLabel>
            </IonItem>
          )}
        </IonList>

        <input
          type="file"
          accept=".el"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
```

- [ ] **Step 2 : Build**

```bash
cd J:/Bafangtool/BafangAndroid && npm run build 2>&1 | tail -20
```

- [ ] **Step 3 : Commit**

```bash
cd J:/Bafangtool/BafangAndroid
git add src/pages/HomePage.tsx
git commit -m "feat: HomePage merges Connection + MotorInfo, styled Speeeed"
```

---

## Task 7: GeneralPage (était BasicPage, sans assist table)

**Files:**
- Modify: `src/pages/GeneralPage.tsx`

- [ ] **Step 1 : Écrire GeneralPage**

```tsx
// src/pages/GeneralPage.tsx
import {
  IonPage, IonContent, IonHeader, IonList,
  IonItem, IonLabel, IonSelect, IonSelectOption,
} from '@ionic/react';
import { useState, useEffect } from 'react';
import { useMotorStore } from '../store/motorStore';
import { BafangBasicParameters, SpeedmeterType, DEFAULT_BASIC } from '../types/BafangTypes';
import ParameterRow from '../components/ParameterRow';
import SettingsInnerTabs from '../components/SettingsInnerTabs';
import ReadWriteBar from '../components/ReadWriteBar';

const GeneralPage: React.FC = () => {
  const { basic, connected, readBasic, writeBasic } = useMotorStore();
  const [local, setLocal] = useState<BafangBasicParameters>(basic ?? DEFAULT_BASIC);

  useEffect(() => { if (basic) setLocal(basic); }, [basic]);

  const set = (field: keyof BafangBasicParameters, val: any) =>
    setLocal((prev) => ({ ...prev, [field]: val }));

  return (
    <IonPage>
      <IonHeader style={{ boxShadow: 'none' }}>
        <SettingsInnerTabs active="general" />
        <ReadWriteBar
          title="General"
          connected={connected}
          onRead={readBasic}
          onWrite={() => writeBasic(local)}
        />
      </IonHeader>

      <IonContent>
        <IonList style={{ background: 'transparent' }}>
          <ParameterRow
            label="Low Battery Protection"
            unit="V×10"
            value={local.low_battery_protection}
            min={200} max={600}
            onChange={(v) => set('low_battery_protection', v)}
          />
          <ParameterRow
            label="Current Limit"
            unit="A"
            value={local.current_limit}
            min={1} max={30}
            onChange={(v) => set('current_limit', v)}
          />
          <IonItem
            lines="full"
            style={{ '--background': 'transparent', '--border-color': 'var(--bafang-border)' }}
          >
            <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>Assist Levels</IonLabel>
            <IonSelect
              slot="end"
              value={local.assist_levels}
              style={{ color: 'var(--bafang-text)' }}
              onIonChange={(e) => set('assist_levels', e.detail.value)}
            >
              <IonSelectOption value={3}>3</IonSelectOption>
              <IonSelectOption value={5}>5</IonSelectOption>
              <IonSelectOption value={9}>9</IonSelectOption>
            </IonSelect>
          </IonItem>
          <ParameterRow
            label="Wheel Diameter"
            unit="inches"
            value={local.wheel_diameter}
            min={12} max={29}
            onChange={(v) => set('wheel_diameter', v)}
          />
          <IonItem
            lines="full"
            style={{ '--background': 'transparent', '--border-color': 'var(--bafang-border)' }}
          >
            <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>Speed Meter Type</IonLabel>
            <IonSelect
              slot="end"
              value={local.speedmeter_type}
              style={{ color: 'var(--bafang-text)' }}
              onIonChange={(e) => set('speedmeter_type', e.detail.value)}
            >
              <IonSelectOption value={SpeedmeterType.External}>External</IonSelectOption>
              <IonSelectOption value={SpeedmeterType.Internal}>Internal</IonSelectOption>
              <IonSelectOption value={SpeedmeterType.Motorphase}>Motorphase</IonSelectOption>
            </IonSelect>
          </IonItem>
          <ParameterRow
            label="Speed Meter Signals"
            value={local.speedmeter_magnets}
            min={1} max={32}
            onChange={(v) => set('speedmeter_magnets', v)}
          />
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default GeneralPage;
```

- [ ] **Step 2 : Commit**

```bash
cd J:/Bafangtool/BafangAndroid
git add src/pages/GeneralPage.tsx
git commit -m "feat: GeneralPage (Basic params, Speeeed style, no assist table)"
```

---

## Task 8: LevelsPage (tableau des niveaux d'assist)

**Files:**
- Modify: `src/pages/LevelsPage.tsx`

- [ ] **Step 1 : Écrire LevelsPage**

```tsx
// src/pages/LevelsPage.tsx
import {
  IonPage, IonContent, IonHeader, IonToggle, IonInput,
} from '@ionic/react';
import { useState, useEffect } from 'react';
import { useMotorStore } from '../store/motorStore';
import { AssistProfile, DEFAULT_BASIC } from '../types/BafangTypes';
import SettingsInnerTabs from '../components/SettingsInnerTabs';
import ReadWriteBar from '../components/ReadWriteBar';

const LevelsPage: React.FC = () => {
  const { basic, connected, readBasic, writeBasic } = useMotorStore();
  const [profiles, setProfiles] = useState<AssistProfile[]>(
    basic?.assist_profiles ?? DEFAULT_BASIC.assist_profiles
  );
  const [showAmps, setShowAmps] = useState(false);
  const maxCurrent = basic?.current_limit ?? 25;

  useEffect(() => {
    if (basic?.assist_profiles) setProfiles(basic.assist_profiles);
  }, [basic]);

  const updateProfile = (i: number, field: keyof AssistProfile, val: number) => {
    setProfiles((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, [field]: val } : p))
    );
  };

  const handleWrite = async () => {
    if (!basic) return;
    await writeBasic({ ...basic, assist_profiles: profiles });
  };

  return (
    <IonPage>
      <IonHeader style={{ boxShadow: 'none' }}>
        <SettingsInnerTabs active="levels" />
        <ReadWriteBar
          title="Levels"
          connected={connected}
          onRead={readBasic}
          onWrite={handleWrite}
        />
      </IonHeader>

      <IonContent>
        {/* Toggle row */}
        <div className="levels-toggle-row">
          <span>%</span>
          <IonToggle
            checked={showAmps}
            onIonChange={(e) => setShowAmps(e.detail.checked)}
            style={{ '--track-background-checked': 'var(--bafang-accent)', transform: 'scale(0.8)' }}
          />
          <span>A</span>
        </div>

        {/* Header row */}
        <div className="levels-table-header">
          <span className="col-lvl">LVL</span>
          <span className="col-val">CURRENT</span>
          <span className="col-val">SPEED %</span>
        </div>

        {/* Data rows */}
        {profiles.map((p, i) => {
          const currentDisplay = showAmps
            ? `${((p.current_limit / 100) * maxCurrent).toFixed(1)} A`
            : null;
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                borderBottom: '1px solid var(--bafang-border)',
                minHeight: '46px',
              }}
            >
              <span style={{ width: '48px', color: 'var(--bafang-text-muted)', fontSize: '14px' }}>
                {i}
              </span>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px' }}>
                {showAmps ? (
                  <span style={{ color: 'var(--bafang-text)', fontSize: '14px', fontWeight: 500 }}>
                    {currentDisplay}
                  </span>
                ) : (
                  <IonInput
                    type="number"
                    value={p.current_limit}
                    min={0} max={100}
                    style={{
                      textAlign: 'right',
                      color: 'var(--bafang-text)',
                      fontSize: '14px',
                      fontWeight: 500,
                      maxWidth: '80px',
                      '--background': 'transparent',
                    }}
                    onIonChange={(e) => updateProfile(i, 'current_limit', Number(e.detail.value))}
                  />
                )}
                {!showAmps && (
                  <span style={{ color: 'var(--bafang-text-muted)', fontSize: '12px' }}>%</span>
                )}
              </div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px' }}>
                <IonInput
                  type="number"
                  value={p.speed_limit}
                  min={0} max={100}
                  style={{
                    textAlign: 'right',
                    color: 'var(--bafang-text)',
                    fontSize: '14px',
                    fontWeight: 500,
                    maxWidth: '70px',
                    '--background': 'transparent',
                  }}
                  onIonChange={(e) => updateProfile(i, 'speed_limit', Number(e.detail.value))}
                />
                <span style={{ color: 'var(--bafang-text-muted)', fontSize: '12px' }}>%</span>
              </div>
            </div>
          );
        })}
      </IonContent>
    </IonPage>
  );
};

export default LevelsPage;
```

- [ ] **Step 2 : Commit**

```bash
cd J:/Bafangtool/BafangAndroid
git add src/pages/LevelsPage.tsx
git commit -m "feat: LevelsPage with assist table and current % / A toggle"
```

---

## Task 9: PedalPage redesign

**Files:**
- Modify: `src/pages/PedalPage.tsx`

- [ ] **Step 1 : Réécrire PedalPage**

```tsx
// src/pages/PedalPage.tsx
import {
  IonPage, IonContent, IonHeader, IonList,
  IonItem, IonLabel, IonSelect, IonSelectOption,
} from '@ionic/react';
import { useState, useEffect } from 'react';
import { useMotorStore } from '../store/motorStore';
import { BafangPedalParameters, PedalType, SpeedLimitByDisplay, DEFAULT_PEDAL } from '../types/BafangTypes';
import ParameterRow from '../components/ParameterRow';
import SettingsInnerTabs from '../components/SettingsInnerTabs';
import ReadWriteBar from '../components/ReadWriteBar';

const SELECT_STYLE = { '--background': 'transparent', '--border-color': 'var(--bafang-border)' };

const PedalPage: React.FC = () => {
  const { pedal, connected, readPedal, writePedal } = useMotorStore();
  const [local, setLocal] = useState<BafangPedalParameters>(pedal ?? DEFAULT_PEDAL);

  useEffect(() => { if (pedal) setLocal(pedal); }, [pedal]);

  const set = (field: keyof BafangPedalParameters, val: any) =>
    setLocal((prev) => ({ ...prev, [field]: val }));

  return (
    <IonPage>
      <IonHeader style={{ boxShadow: 'none' }}>
        <SettingsInnerTabs active="pedal" />
        <ReadWriteBar
          title="Pedal"
          connected={connected}
          onRead={readPedal}
          onWrite={() => writePedal(local)}
        />
      </IonHeader>

      <IonContent>
        <IonList style={{ background: 'transparent' }}>
          <IonItem lines="full" style={SELECT_STYLE}>
            <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>Pedal Sensor Type</IonLabel>
            <IonSelect slot="end" value={local.pedal_type} style={{ color: 'var(--bafang-text)' }}
              onIonChange={(e) => set('pedal_type', e.detail.value)}>
              <IonSelectOption value={PedalType.None}>None</IonSelectOption>
              <IonSelectOption value={PedalType.DHSensor12}>DH Sensor 12</IonSelectOption>
              <IonSelectOption value={PedalType.BBSensor32}>BB Sensor 32</IonSelectOption>
              <IonSelectOption value={PedalType.DoubleSignal24}>Double Signal 24</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem lines="full" style={SELECT_STYLE}>
            <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>Assist Level</IonLabel>
            <IonSelect slot="end" value={local.pedal_speed_limit} style={{ color: 'var(--bafang-text)' }}
              onIonChange={(e) => set('pedal_speed_limit', e.detail.value)}>
              <IonSelectOption value={SpeedLimitByDisplay}>By Display</IonSelectOption>
              {[15, 20, 25, 30, 35, 40, 45].map((v) => (
                <IonSelectOption key={v} value={v}>{v} km/h</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <ParameterRow label="Start Current" unit="%" value={local.pedal_start_current}
            min={0} max={100} onChange={(v) => set('pedal_start_current', v)} />
          <IonItem lines="full" style={SELECT_STYLE}>
            <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>Slow Start Mode</IonLabel>
            <IonSelect slot="end" value={local.pedal_slow_start_mode} style={{ color: 'var(--bafang-text)' }}
              onIonChange={(e) => set('pedal_slow_start_mode', e.detail.value)}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((v) => (
                <IonSelectOption key={v} value={v}>{v}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <ParameterRow label="Signals Before Assist" value={local.pedal_signals_before_start}
            min={1} max={24} onChange={(v) => set('pedal_signals_before_start', v)} />
          <IonItem lines="full" style={SELECT_STYLE}>
            <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>Stop Delay</IonLabel>
            <IonSelect slot="end" value={local.pedal_time_to_stop} style={{ color: 'var(--bafang-text)' }}
              onIonChange={(e) => set('pedal_time_to_stop', e.detail.value)}>
              {[50, 100, 150, 200, 250].map((v) => (
                <IonSelectOption key={v} value={v}>{v} ms</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <ParameterRow label="Current Decay" value={local.pedal_current_decay}
            min={1} max={8} onChange={(v) => set('pedal_current_decay', v)} />
          <ParameterRow label="Stop Decay" unit="ms×10" value={local.pedal_stop_decay}
            min={0} max={255} onChange={(v) => set('pedal_stop_decay', v)} />
          <ParameterRow label="Keep Current" unit="%" value={local.pedal_keep_current}
            min={0} max={100} onChange={(v) => set('pedal_keep_current', v)} />
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default PedalPage;
```

- [ ] **Step 2 : Commit**

```bash
cd J:/Bafangtool/BafangAndroid
git add src/pages/PedalPage.tsx
git commit -m "style: redesign PedalPage with Speeeed flat style"
```

---

## Task 10: ThrottlePage redesign

**Files:**
- Modify: `src/pages/ThrottlePage.tsx`

- [ ] **Step 1 : Réécrire ThrottlePage**

```tsx
// src/pages/ThrottlePage.tsx
import {
  IonPage, IonContent, IonHeader, IonList,
  IonItem, IonLabel, IonSelect, IonSelectOption,
} from '@ionic/react';
import { useState, useEffect } from 'react';
import { useMotorStore } from '../store/motorStore';
import { BafangThrottleParameters, ThrottleMode, DEFAULT_THROTTLE } from '../types/BafangTypes';
import ParameterRow from '../components/ParameterRow';
import SettingsInnerTabs from '../components/SettingsInnerTabs';
import ReadWriteBar from '../components/ReadWriteBar';

const SELECT_STYLE = { '--background': 'transparent', '--border-color': 'var(--bafang-border)' };

const ThrottlePage: React.FC = () => {
  const { throttle, connected, readThrottle, writeThrottle } = useMotorStore();
  const [local, setLocal] = useState<BafangThrottleParameters>(throttle ?? DEFAULT_THROTTLE);

  useEffect(() => { if (throttle) setLocal(throttle); }, [throttle]);

  const set = (field: keyof BafangThrottleParameters, val: any) =>
    setLocal((prev) => ({ ...prev, [field]: val }));

  return (
    <IonPage>
      <IonHeader style={{ boxShadow: 'none' }}>
        <SettingsInnerTabs active="throttle" />
        <ReadWriteBar
          title="Throttle"
          connected={connected}
          onRead={readThrottle}
          onWrite={() => writeThrottle(local)}
        />
      </IonHeader>

      <IonContent>
        <IonList style={{ background: 'transparent' }}>
          <ParameterRow label="Start Voltage" unit="mV" value={local.throttle_start_voltage}
            min={500} max={2000} onChange={(v) => set('throttle_start_voltage', v)} />
          <ParameterRow label="End Voltage" unit="mV" value={local.throttle_end_voltage}
            min={3000} max={5000} onChange={(v) => set('throttle_end_voltage', v)} />
          <IonItem lines="full" style={SELECT_STYLE}>
            <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>Mode</IonLabel>
            <IonSelect slot="end" value={local.throttle_mode} style={{ color: 'var(--bafang-text)' }}
              onIonChange={(e) => set('throttle_mode', e.detail.value)}>
              <IonSelectOption value={ThrottleMode.Speed}>Speed</IonSelectOption>
              <IonSelectOption value={ThrottleMode.Current}>Current</IonSelectOption>
            </IonSelect>
          </IonItem>
          <ParameterRow label="Assist Level" value={local.throttle_assist_level}
            min={0} max={9} onChange={(v) => set('throttle_assist_level', v)} />
          <ParameterRow label="Speed Limit" unit="km/h" value={local.throttle_speed_limit}
            min={1} max={45} onChange={(v) => set('throttle_speed_limit', v)} />
          <ParameterRow label="Start Current" unit="%" value={local.throttle_start_current}
            min={0} max={100} onChange={(v) => set('throttle_start_current', v)} />
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default ThrottlePage;
```

- [ ] **Step 2 : Commit**

```bash
cd J:/Bafangtool/BafangAndroid
git add src/pages/ThrottlePage.tsx
git commit -m "style: redesign ThrottlePage with Speeeed flat style"
```

---

## Task 11: TorquePage redesign

**Files:**
- Modify: `src/pages/TorquePage.tsx`

Les accordions sont conservés pour organiser le contenu dense, mais stylés dark.

- [ ] **Step 1 : Réécrire TorquePage**

```tsx
// src/pages/TorquePage.tsx
import {
  IonPage, IonContent, IonHeader, IonList, IonItem, IonLabel,
  IonText, IonButton, IonAccordion, IonAccordionGroup,
} from '@ionic/react';
import { useState, useEffect } from 'react';
import { useMotorStore } from '../store/motorStore';
import { BafangTorqueParameters, DEFAULT_TORQUE } from '../types/BafangTypes';
import ParameterRow from '../components/ParameterRow';
import TorqueSpeedTable from '../components/TorqueSpeedTable';
import SettingsInnerTabs from '../components/SettingsInnerTabs';
import ReadWriteBar from '../components/ReadWriteBar';

const DELTA_ROWS: { key: keyof BafangTorqueParameters; label: string }[] = [
  { key: 'delta_v_0_5kg',   label: '0–5 kg' },
  { key: 'delta_v_5_10kg',  label: '5–10 kg' },
  { key: 'delta_v_10_15kg', label: '10–15 kg' },
  { key: 'delta_v_15_20kg', label: '15–20 kg' },
  { key: 'delta_v_20_30kg', label: '20–30 kg' },
  { key: 'delta_v_30_40kg', label: '30–40 kg' },
  { key: 'delta_v_40_50kg', label: '40–50 kg' },
  { key: 'delta_v_50_60kg', label: '50–60 kg' },
];

const ACCORDION_HEADER_STYLE = {
  '--background': 'var(--bafang-surface)',
  '--border-color': 'var(--bafang-border)',
  '--color': 'var(--bafang-text-muted)',
};

const TorquePage: React.FC = () => {
  const {
    torque, connected, readTorque, writeTorque,
    aboutTqReading, readAboutTq, continuousGetActive, stopContinuousGet,
  } = useMotorStore();
  const [local, setLocal] = useState<BafangTorqueParameters>(torque ?? DEFAULT_TORQUE);
  const [continuousIntervalId, setContinuousIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { if (torque) setLocal(torque); }, [torque]);
  useEffect(() => () => { if (continuousIntervalId !== null) clearInterval(continuousIntervalId); }, [continuousIntervalId]);

  const set = (field: keyof BafangTorqueParameters, val: any) =>
    setLocal((prev) => ({ ...prev, [field]: val }));

  const startContinuousGet = () => {
    if (continuousIntervalId !== null) clearInterval(continuousIntervalId);
    const id = setInterval(() => { readAboutTq(); }, 500);
    setContinuousIntervalId(id);
  };

  const stopContinuous = () => {
    if (continuousIntervalId !== null) { clearInterval(continuousIntervalId); setContinuousIntervalId(null); }
    stopContinuousGet();
  };

  const isContinuousActive = continuousIntervalId !== null || continuousGetActive;

  return (
    <IonPage>
      <IonHeader style={{ boxShadow: 'none' }}>
        <SettingsInnerTabs active="torque" />
        <ReadWriteBar
          title="Torque"
          connected={connected}
          onRead={readTorque}
          onWrite={() => writeTorque(local)}
        />
      </IonHeader>

      <IonContent>
        <IonAccordionGroup multiple>

          <IonAccordion value="calibration">
            <IonItem slot="header" style={ACCORDION_HEADER_STYLE}>
              <IonLabel>Voltage Calibration</IonLabel>
            </IonItem>
            <div slot="content">
              <IonList style={{ background: 'transparent' }}>
                <ParameterRow label="Base Voltage" unit="mV" value={local.base_voltage}
                  min={0} max={5000} onChange={(v) => set('base_voltage', v)} />
                <ParameterRow label="Error Voltage Min" unit="mV" value={local.error_voltage_min}
                  min={0} max={5000} onChange={(v) => set('error_voltage_min', v)} />
                <ParameterRow label="Error Voltage Max" unit="mV" value={local.error_voltage_max}
                  min={0} max={5000} onChange={(v) => set('error_voltage_max', v)} />
                {DELTA_ROWS.map(({ key, label }) => (
                  <ParameterRow key={key} label={`Delta V ${label}`} unit="mV"
                    value={local[key] as number} min={0} max={2000}
                    onChange={(v) => set(key, v)} />
                ))}
                <ParameterRow label="0-Speed Boost Time" unit="ms" value={local.boost_time_0speed}
                  min={0} max={255} onChange={(v) => set('boost_time_0speed', v)} />
              </IonList>
            </div>
          </IonAccordion>

          <IonAccordion value="speeds">
            <IonItem slot="header" style={ACCORDION_HEADER_STYLE}>
              <IonLabel>Speed Profiles (Spd0–Spd100)</IonLabel>
            </IonItem>
            <div slot="content" style={{ padding: '8px' }}>
              <TorqueSpeedTable
                profiles={local.speed_profiles}
                onChange={(p) => set('speed_profiles', p)}
              />
            </div>
          </IonAccordion>

          <IonAccordion value="live">
            <IonItem slot="header" style={ACCORDION_HEADER_STYLE}>
              <IonLabel>About Tq — Live Reading</IonLabel>
            </IonItem>
            <div slot="content">
              <p style={{ padding: '8px 16px', fontSize: '11px', color: 'var(--bafang-text-dim)' }}>
                ⚠ Block code not yet validated on real motor.
              </p>
              <IonList style={{ background: 'transparent' }}>
                <IonItem lines="full" style={{ '--background': 'transparent', '--border-color': 'var(--bafang-border)' }}>
                  <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>SpeedSignalACC</IonLabel>
                  <IonText slot="end" style={{ color: 'var(--bafang-text)' }}>{aboutTqReading?.speed_signal_acc ?? 0}</IonText>
                </IonItem>
                <IonItem lines="full" style={{ '--background': 'transparent', '--border-color': 'var(--bafang-border)' }}>
                  <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>SpeedSigLevel</IonLabel>
                  <IonText slot="end" style={{ color: 'var(--bafang-text)' }}>{aboutTqReading?.speed_sig_level ?? 0}</IonText>
                </IonItem>
                <IonItem lines="full" style={{ '--background': 'transparent', '--border-color': 'var(--bafang-border)' }}>
                  <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>LevelHTime (ms)</IonLabel>
                  <IonText slot="end" style={{ color: 'var(--bafang-text)' }}>{aboutTqReading?.level_h_time ?? 0}</IonText>
                </IonItem>
                <IonItem lines="full" style={{ '--background': 'transparent', '--border-color': 'var(--bafang-border)' }}>
                  <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>LevelLTime (ms)</IonLabel>
                  <IonText slot="end" style={{ color: 'var(--bafang-text)' }}>{aboutTqReading?.level_l_time ?? 0}</IonText>
                </IonItem>
                <IonItem lines="full" style={{ '--background': 'transparent', '--border-color': 'var(--bafang-border)' }}>
                  <IonLabel style={{ color: 'var(--bafang-text-muted)' }}>TqVoltage (mV)</IonLabel>
                  <IonText slot="end" style={{ color: 'var(--bafang-text)' }}>{aboutTqReading?.tq_voltage ?? 0}</IonText>
                  <IonButton
                    slot="end" size="small" fill="outline"
                    style={{ '--border-color': 'var(--bafang-accent)', '--color': 'var(--bafang-accent)', marginLeft: '8px' }}
                    onClick={() => set('base_voltage', aboutTqReading?.tq_voltage ?? 0)}
                  >
                    → Base V
                  </IonButton>
                </IonItem>
              </IonList>
              <div style={{ display: 'flex', gap: '8px', padding: '12px 16px' }}>
                <IonButton
                  fill="outline" size="small" disabled={!connected || isContinuousActive}
                  style={{ '--border-color': 'var(--bafang-accent)', '--color': 'var(--bafang-accent)' }}
                  onClick={readAboutTq}
                >Get</IonButton>
                <IonButton
                  fill="outline" size="small" disabled={!connected}
                  style={isContinuousActive
                    ? { '--border-color': 'var(--bafang-red)', '--color': 'var(--bafang-red)' }
                    : { '--border-color': 'var(--bafang-accent)', '--color': 'var(--bafang-accent)' }
                  }
                  onClick={isContinuousActive ? stopContinuous : startContinuousGet}
                >
                  {isContinuousActive ? 'Stop' : 'Continuous'}
                </IonButton>
              </div>
            </div>
          </IonAccordion>

        </IonAccordionGroup>
      </IonContent>
    </IonPage>
  );
};

export default TorquePage;
```

- [ ] **Step 2 : Commit**

```bash
cd J:/Bafangtool/BafangAndroid
git add src/pages/TorquePage.tsx
git commit -m "style: redesign TorquePage with Speeeed flat style + accordions"
```

---

## Task 12: HelpPage

**Files:**
- Modify: `src/pages/HelpPage.tsx`

- [ ] **Step 1 : Écrire HelpPage**

```tsx
// src/pages/HelpPage.tsx
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';

const CARD_STYLE = {
  margin: '12px 16px',
  background: 'var(--bafang-surface-2)',
  borderRadius: '8px',
  padding: '16px',
  border: '1px solid var(--bafang-border)',
};

const HEADING_STYLE = {
  fontSize: '14px',
  fontWeight: 700,
  color: 'var(--bafang-text)',
  marginBottom: '8px',
};

const TEXT_STYLE = {
  fontSize: '12px',
  color: 'var(--bafang-text-muted)',
  lineHeight: '1.6',
};

const HelpPage: React.FC = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Help</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent>
      <div style={CARD_STYLE}>
        <div style={HEADING_STYLE}>About BafangAndroid</div>
        <p style={TEXT_STYLE}>
          Programming tool for Bafang UART motor controllers (G510 and compatible). Communicates via USB OTG → USB-UART adapter at 1200 baud.
        </p>
      </div>

      <div style={CARD_STYLE}>
        <div style={HEADING_STYLE}>Connection</div>
        <p style={TEXT_STYLE}>
          Connect your phone to the Bafang controller using a USB OTG cable + USB-to-Serial adapter with Julet-type female connector.{'\n\n'}
          On the Home tab: select the USB device, accept the legal agreements, then tap CONNECT.
        </p>
      </div>

      <div style={CARD_STYLE}>
        <div style={HEADING_STYLE}>Settings — General</div>
        <p style={TEXT_STYLE}>
          <strong style={{ color: 'var(--bafang-text)' }}>Low Battery Protection</strong> — Voltage at which the controller cuts power to protect the battery.{'\n'}
          <strong style={{ color: 'var(--bafang-text)' }}>Current Limit</strong> — Maximum motor current in amps.{'\n'}
          <strong style={{ color: 'var(--bafang-text)' }}>Assist Levels</strong> — Number of PAS levels (3, 5, or 9).
        </p>
      </div>

      <div style={CARD_STYLE}>
        <div style={HEADING_STYLE}>Settings — Levels</div>
        <p style={TEXT_STYLE}>
          Configures current % and speed % for each assist level. Toggle to display current in Amps instead of percentage.
        </p>
      </div>

      <div style={CARD_STYLE}>
        <div style={HEADING_STYLE}>Settings — Pedal</div>
        <p style={TEXT_STYLE}>
          Controls how the pedal assist sensor (PAS) behaves: sensor type, start current, slow start mode, stop delay, etc.
        </p>
      </div>

      <div style={CARD_STYLE}>
        <div style={HEADING_STYLE}>Settings — Throttle</div>
        <p style={TEXT_STYLE}>
          Configures the throttle handle: start/end voltage range, mode (Speed or Current), speed limit, and start current.
        </p>
      </div>

      <div style={CARD_STYLE}>
        <div style={HEADING_STYLE}>Settings — Torque</div>
        <p style={TEXT_STYLE}>
          Advanced torque sensor calibration and 6 speed profiles. ⚠ Block codes not yet validated on all motor versions — always backup first.
        </p>
      </div>

      <div style={CARD_STYLE}>
        <div style={HEADING_STYLE}>Load / Save .el files</div>
        <p style={TEXT_STYLE}>
          Use the 📂 and 💾 icons on the Home tab to load or save configuration profiles in .el format (compatible with Controllerst and OpenBafangTool).
        </p>
      </div>

      <div style={{ ...CARD_STYLE, borderColor: 'var(--bafang-danger-bg)' }}>
        <div style={{ ...HEADING_STYLE, color: '#e74c3c' }}>⚠ Warning</div>
        <p style={TEXT_STYLE}>
          Modifying motor parameters incorrectly can damage your controller, motor, battery, or cause injury. Always note current values before writing. Use READ before WRITE.
        </p>
      </div>
    </IonContent>
  </IonPage>
);

export default HelpPage;
```

- [ ] **Step 2 : Commit**

```bash
cd J:/Bafangtool/BafangAndroid
git add src/pages/HelpPage.tsx
git commit -m "feat: add HelpPage with section descriptions and warnings"
```

---

## Task 13: Cleanup — Supprimer les anciens fichiers

**Files:**
- Delete: `src/pages/BasicPage.tsx`
- Delete: `src/pages/ConnectionPage.tsx`
- Delete: `src/pages/InfoPage.tsx`
- Delete: `src/pages/SettingsPage.tsx`
- Delete: `src/pages/Home.tsx`
- Delete: `src/pages/Home.css`

- [ ] **Step 1 : Supprimer les fichiers obsolètes**

```bash
cd J:/Bafangtool/BafangAndroid
rm src/pages/BasicPage.tsx
rm src/pages/ConnectionPage.tsx
rm src/pages/InfoPage.tsx
rm src/pages/SettingsPage.tsx
rm src/pages/Home.tsx
rm src/pages/Home.css
```

- [ ] **Step 2 : Build final**

```bash
cd J:/Bafangtool/BafangAndroid && npm run build 2>&1 | tail -30
```
Attendu : build réussi, aucune erreur. Si erreur d'import résiduel, vérifier que App.tsx n'importe plus les vieux fichiers.

- [ ] **Step 3 : Commit final**

```bash
cd J:/Bafangtool/BafangAndroid
git add -A
git commit -m "chore: remove obsolete pages (Basic, Connection, Info, Settings, Home)"
```

---

## Self-review

**Couverture spec :**
- ✅ 3 onglets bas (Home / Settings / Help)
- ✅ 5 onglets Settings (General / Levels / Pedal / Throttle / Torque)
- ✅ Icônes Speeeed (bicycleOutline, speedometerOutline, cogOutline, contrastOutline, flashOutline)
- ✅ Accent bleu #3a7bd5
- ✅ Fond noir pur #000
- ✅ Boutons READ (vert contour) / WRITE (rouge contour)
- ✅ Lignes flat label-gauche valeur-droite
- ✅ Badge DISCONNECTED/CONNECTED
- ✅ Bouton CONNECT pleine largeur
- ✅ Load/Save .el file conservé (Home header)
- ✅ Pas d'écran Display

**Cohérence des types :** `BafangBasicParameters`, `BafangPedalParameters`, `BafangThrottleParameters`, `BafangTorqueParameters` — utilisés de façon identique aux fichiers originaux. `DEFAULT_BASIC`, `DEFAULT_PEDAL`, `DEFAULT_THROTTLE`, `DEFAULT_TORQUE` importés des mêmes sources.

**Pas de placeholders** : chaque tâche contient le code complet.
