


import './App.css';
import { useRef, useState } from 'react';
import CreatureList from './CreatureList';
import type { CreatureListHandle, Creature } from './CreatureList';
import ScanPopup from './ScanPopup';

function App() {
  const listRef = useRef<CreatureListHandle>(null);
  const [scanOpen, setScanOpen] = useState(false);

  const handleScanResult = (creature: Creature) => {
    if (listRef.current) {
      listRef.current.refresh();
      listRef.current.showCreature(creature);
    }
    setScanOpen(false);
  };

  return (
    <>
      <CreatureList ref={listRef} onScanClick={() => setScanOpen(true)} />
      <ScanPopup
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onScanResult={handleScanResult}
      />
    </>
  );
}

export default App;
