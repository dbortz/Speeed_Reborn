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
