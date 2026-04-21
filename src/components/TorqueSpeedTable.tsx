import { TorqueSpeedProfile, SPEED_PROFILE_LABELS } from '../types/BafangTypes';

interface Props {
  profiles: TorqueSpeedProfile[];
  onChange: (profiles: TorqueSpeedProfile[]) => void;
}

const FIELDS: { key: keyof TorqueSpeedProfile; label: string }[] = [
  { key: 'start_kg', label: 'Start (kg)' },
  { key: 'full_kg', label: 'Full (kg)' },
  { key: 'return_kg', label: 'Return (kg)' },
  { key: 'min_current_pct', label: 'MinCur%' },
  { key: 'max_current_pct', label: 'MaxCur%' },
  { key: 'keep_current_pct', label: 'KeepCur%' },
  { key: 'current_decay', label: 'CurDecay' },
  { key: 'star_degree', label: 'StarDeg' },
];

const TorqueSpeedTable: React.FC<Props> = ({ profiles, onChange }) => {
  const update = (i: number, field: keyof TorqueSpeedProfile, val: number) => {
    const next = profiles.map((p, idx) => idx === i ? { ...p, [field]: val } : p);
    onChange(next);
  };

  return (
    <div className="torque-table">
      <table>
        <thead>
          <tr>
            <th>Parameter</th>
            {SPEED_PROFILE_LABELS.map((lbl) => <th key={lbl}>{lbl}</th>)}
          </tr>
        </thead>
        <tbody>
          {FIELDS.map(({ key, label }) => (
            <tr key={key}>
              <td>{label}</td>
              {profiles.map((p, i) => (
                <td key={i}>
                  <input
                    type="number"
                    value={p[key]}
                    onChange={(e) => update(i, key, Number(e.target.value))}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TorqueSpeedTable;
