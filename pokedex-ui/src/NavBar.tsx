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
const navRightStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  position: 'absolute',
  bottom: 8,
  right: 16,
  fontSize: '0.90rem',
  color: 'rgba(255,255,255,0.7)',
  textDecoration: 'none',
  zIndex: 20,
  opacity: 0.5,
};
const githubIconStyles: React.CSSProperties = {
  width: 18,
  height: 18,
  verticalAlign: 'middle',
  marginLeft: 4,
  opacity: 0.5,
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
      <a
        href="https://github.com/itsmariodias"
        style={navRightStyles}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub profile"
      >
        made by @itsmariodias
        <svg style={githubIconStyles} viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.6-.18-3.29-.8-3.29-3.55 0-.78.28-1.42.74-1.92-.07-.18-.32-.91.07-1.9 0 0 .6-.19 1.97.73.57-.16 1.18-.24 1.79-.24.61 0 1.22.08 1.79.24 1.37-.92 1.97-.73 1.97-.73.39.99.14 1.72.07 1.9.46.5.74 1.14.74 1.92 0 2.76-1.69 3.37-3.3 3.55.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
        </svg>
      </a>
    </nav>
  );
};

export default NavBar;
