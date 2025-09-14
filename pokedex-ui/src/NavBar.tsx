import React from 'react';

const navStyles: React.CSSProperties = {
  background: 'var(--pokedex-red)',
  color: 'white',
  padding: '0.5vw 2vw',
  borderBottom: '4px solid var(--pokedex-dark-red)',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: 64,
  margin: 0,
  position: 'relative',
  zIndex: 10,
  overflowX: 'auto',
  flexWrap: 'nowrap',
  gap: '1vw',
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
  width: 40,
  height: 40,
  borderRadius: '50%',
  background: 'radial-gradient(circle at 30% 30%, var(--pokedex-light-blue) 70%, var(--pokedex-blue) 100%)',
  border: '4px solid var(--pokedex-bg)',
  marginRight: 18,
};

const smallCircle = (color: string) => ({
  width: 16,
  height: 16,
  borderRadius: '50%',
  background: color,
  border: '2px solid var(--pokedex-bg)',
  marginRight: 6,
  boxShadow: '0 0 4px ' + color,
});

const NavBar: React.FC<{ onScanClick: () => void }> = ({ onScanClick }) => {
  // Add keyframes for pulse animation
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .scan-animated {
        transition: transform 0.18s cubic-bezier(.4,0,.2,1);
      }
      .scan-animated:hover {
        transform: scale(1.05);
      }
      .scan-animated:active {
        transform: scale(0.95);
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <nav style={navStyles}>
      <div style={navLeftStyles}>
        <div style={ledStyles}></div>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: 8 }}>
          <div style={smallCircle('radial-gradient(circle at 30% 30%, var(--pokedex-red) 70%, var(--pokedex-dark-red) 100%)')}></div>
          <div style={smallCircle('radial-gradient(circle at 30% 30%, var(--pokedex-yellow) 70%, var(--pokedex-dark-yellow) 100%)')}></div>
          <div style={smallCircle('radial-gradient(circle at 30% 30%, var(--pokedex-light-green) 70%, var(--pokedex-green) 100%)')}></div>
        </div>
        <span style={navTitleStyles}>Pokédex IRL</span>
      </div>
    </nav>
  );
};

export default NavBar;
