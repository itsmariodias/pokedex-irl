


import './App.css';
import { useRef, useState } from 'react';
import CreatureList from './CreatureList';
import type { CreatureListHandle } from './CreatureList';


function App() {
  const listRef = useRef<CreatureListHandle>(null);
  const [scanOpen, setScanOpen] = useState(false);
  // Use the CreatureList imperative handle to open the embedded scan UI

  return (
    <div className="pokedex-outer-bg">
      <div className="pokedex-16-9" style={{ position: 'relative' }}>
  <CreatureList ref={listRef} onScanModeChange={(open) => setScanOpen(open)} />
        {/* Semicircular Scan Button */}
        <button
          onClick={() => {
            if (scanOpen) {
              listRef.current && listRef.current.showScan(false);
            } else {
              listRef.current && listRef.current.showScan(true);
            }
          }}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: '0px',
            marginLeft: 'auto',
            marginRight: 'auto',
            width: '160px',
            height: '80px',
            background: 'var(--pokedex-red)',
            color: 'var(--pokedex-bg)',
            border: 'none',
            borderTopLeftRadius: '80px',
            borderTopRightRadius: '80px',
            borderBottomLeftRadius: '0',
            borderBottomRightRadius: '0',
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            fontWeight: 900,
            fontSize: '1.5rem',
            cursor: 'pointer',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            letterSpacing: '2px',
            paddingTop: '30px',
            userSelect: 'none',
            backgroundColor: 'var(--pokedex-black)'
          }}
          className="scan-animated scan-semicircle"
          aria-label="Scan a Creature"
        >
          {scanOpen ? 'Cancel' : 'Scan'}
        </button>
      </div>
    </div>
  );
}

export default App;
