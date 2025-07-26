import React from 'react';

const navStyles: React.CSSProperties = {
  background: '#d32f2f',
  color: 'white',
  padding: '0.5rem 2.5rem',
  borderBottom: '4px solid #b71c1c',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  maxWidth: '100vw',
  minHeight: 64,
  margin: 0,
  position: 'relative',
  zIndex: 10,
  overflowX: 'auto',
};
const navLeftStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
};
const navTitleStyles: React.CSSProperties = {
  margin: 0,
  fontWeight: 900,
  letterSpacing: 2,
  fontSize: '2rem',
  userSelect: 'none',
};
const ledStyles: React.CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: '50%',
  background: 'radial-gradient(circle at 30% 30%, #90caf9 70%, #1976d2 100%)',
  border: '2px solid #1976d2',
  boxShadow: '0 0 8px #1976d2',
  marginRight: 12,
};

const NavBar: React.FC<{ onScanClick: () => void }> = ({ onScanClick }) => {
  return (
    <nav style={navStyles}>
      <div style={navLeftStyles}>
        <div style={ledStyles}></div>
        <span style={navTitleStyles}>Pokédex IRL</span>
      </div>
      <button
        style={{
          background: '#fff',
          color: '#d32f2f',
          border: 'none',
          borderRadius: 20,
          padding: '0.5rem 1.5rem',
          fontWeight: 700,
          fontSize: '1.1rem',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'background 0.2s, color 0.2s',
          marginLeft: 24,
        }}
        onClick={onScanClick}
      >
        Scan
      </button>
    </nav>
  );
};

export default NavBar;
