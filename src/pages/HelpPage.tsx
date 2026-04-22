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
          Use the folder and download icons on the Home tab to load or save configuration profiles in .el format (compatible with Controllerst and OpenBafangTool).
        </p>
      </div>

      <div style={{ ...CARD_STYLE, borderColor: 'var(--bafang-danger-bg)' }}>
        <div style={{ ...HEADING_STYLE, color: '#e74c3c' }}>Warning</div>
        <p style={TEXT_STYLE}>
          Modifying motor parameters incorrectly can damage your controller, motor, battery, or cause injury. Always note current values before writing. Use READ before WRITE.
        </p>
      </div>
    </IonContent>
  </IonPage>
);

export default HelpPage;
