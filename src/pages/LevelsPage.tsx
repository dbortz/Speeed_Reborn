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
