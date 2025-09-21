import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import NavBar from './NavBar';
import CreatureCard from './CreatureCard';

// Define the Creature type based on your FastAPI CreaturePublic schema
export interface Creature {
  id: number;
  name: string;
  scientific_name: string;
  description: string;
  gender_ratio: number;
  kingdom: string;
  classification: string;
  family: string;
  height: number;
  weight: number;
  body_shape: string;
  image_path: string;
}

const API_URL = 'http://localhost:8000/api/v1/creature/'; // Adjust if your FastAPI endpoint differs

export interface CreatureListHandle {
  refresh: () => void;
  showCreature: (creature: Creature) => void;
}


const CreatureList = forwardRef<CreatureListHandle, { onScanClick: () => void }>((props, ref) => {
  // Typewriter hook for parallel fields
  function useTypewriter(text: string, speed = 18) {
    const [display, setDisplay] = useState('');
    useEffect(() => {
      let i = 0;
      setDisplay('');
      if (!text) return;
      const interval = setInterval(() => {
        i++;
        setDisplay(text.slice(0, i));
        if (i >= text.length) clearInterval(interval);
      }, speed);
      return () => clearInterval(interval);
    }, [text, speed, text === undefined]);
    return display;
  }
  // Inject keyframes for left pane animations
  useEffect(() => {
    const styleId = 'creature-list-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        @keyframes fadeInText {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .creature-details-anim {
          animation: fadeInText 0.6s cubic-bezier(.5,1.5,.5,1) both;
        }
        @keyframes crtWipe {
          0% { clip-path: inset(100% 0 0 0); opacity: 0.7; }
          60% { opacity: 1; }
          100% { clip-path: inset(0 0 0 0); opacity: 1; }
        }
        .crt-wipe {
          animation: crtWipe 0.7s cubic-bezier(.5,1.5,.5,1) both;
        }
      `;
      document.head.appendChild(style);
    }
    return () => {
      const style = document.getElementById(styleId);
      if (style) style.remove();
    };
  }, []);
  // Pokedex-inspired styles
  const pokedexStyles: React.CSSProperties = {
    background: 'linear-gradient(135deg, var(--pokedex-red) 0%, var(--pokedex-dark-red) 100%)',
    height: '100%',
    width: '100%',
    padding: 0,
    fontFamily: '"Segoe UI", "Roboto", "Arial", sans-serif',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: 32,
  };
  const listScreenStyles: React.CSSProperties = {
    background: 'var(--pokedex-black)',
    border: '3px solid var(--pokedex-black)',
    borderRadius: '18px',
    width: '80%',
    height: '45%', // top half
    margin: '5% auto 0 auto',
    boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    position: 'relative',
  };
  const listStyles: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    paddingTop: 8,
    paddingBottom: 8,
    margin: 0,
    width: '100%',
    height: '100%',
    overflowY: 'auto',
    boxSizing: 'border-box',
  };
  const cardStyles: React.CSSProperties = {
    background: 'var(--pokedex-bg)',
    border: '2px solid var(--pokedex-gray)',
    borderRadius: 12,
    margin: '8px 12px',
    padding: '0.5rem 0.7rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
    display: 'flex',
    alignItems: 'center',
    gap: '1vw',
    position: 'relative',
    minWidth: 0,
    width: 'calc(100% - 24px)',
    minHeight: '48px',
    maxHeight: '56px',
    boxSizing: 'border-box',
  };
  const nameStyles: React.CSSProperties = {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: 'var(--pokedex-black)',
    margin: 0,
    lineHeight: 1.1,
  };
  // All hooks must be called unconditionally and in the same order
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [popupCreature, setPopupCreature] = useState<Creature | null>(null);
  const [hovered, setHovered] = useState<Creature | null>(null);
  const [selected, setSelected] = useState<Creature | null>(null);

  // Typewriter fields for selected creature
  const nameTyped = useTypewriter(selected?.name ?? '', 10);
  const sciNameTyped = useTypewriter(selected?.scientific_name ?? '', 10);
  const descTyped = useTypewriter(selected?.description ?? '', 3);
  const kingdomTyped = useTypewriter(selected?.kingdom ?? '', 8);
  const classTyped = useTypewriter(selected?.classification ?? '', 8);
  const familyTyped = useTypewriter(selected?.family ?? '', 8);
  const heightTyped = useTypewriter(selected ? selected.height + ' m' : '', 8);
  const weightTyped = useTypewriter(selected ? selected.weight + ' kg' : '', 8);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch creatures');
        return res.json();
      })
      .then((data) => {
        setCreatures(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      setLoading(true);
      setError(null);
      fetch(API_URL)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch creatures');
          return res.json();
        })
        .then((data) => {
          setCreatures(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    },
    showCreature: (creature: Creature) => setPopupCreature(creature),
  }));

  // Handler to reset left pane when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const leftPane = document.getElementById('pokedex-left-pane');
      if (leftPane && !leftPane.contains(e.target as Node)) {
        setSelected(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (loading) return <div>Loading creatures...</div>;
  if (error) return <div>Error: {error}</div>;

  // ...existing code...

  return (
    <div style={pokedexStyles}>
      <NavBar onScanClick={props.onScanClick} />
      <div style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        width: '100%',
        height: '100vh',
        flexGrow: 1,
        background: 'rgba(255,255,255,0.05)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
        overflow: 'hidden',
      }}>
        {/* Left panel: red background, gray container, white inner container */}
        <div
          id="pokedex-left-pane"
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, var(--pokedex-red) 0%, var(--pokedex-dark-red) 100%)', // red outer panel
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 0,
            height: '100%',
            borderRight: '2px solid var(--pokedex-red)',
            gap: '2vw',
          }}
        >
          <div
            style={{
              width: '55%',
              aspectRatio: '1 / 1', // force square for outer white border
              background: 'var(--pokedex-bg)', // more whiteish middle container
              borderRadius: '18px',
              boxSizing: 'border-box',
              boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              border: '1px solid var(--pokedex-gray)',
              overflow: 'hidden',
              marginTop: '-2vw',
            }}
          >
            <div
              style={{
                width: '80%',
                height: '80%',
                aspectRatio: '1 / 1', // force square for green screen
                background: 'var(--pokedex-screen-bg)', // darker green like Gameboy screen
                borderRadius: '12px',
                boxSizing: 'border-box',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                border: '1px solid var(--pokedex-bg)',
                overflow: 'hidden',
              }}
            >
              {(selected || hovered) ? (
                <img
                  key={selected ? selected.id : hovered?.id}
                  src={`http://localhost:8000/api/v1/static/uploads/${((selected || hovered)?.image_path ?? '').replace(/^.*[\\\/]/, '')}`}
                  alt={(selected || hovered)?.name ?? ''}
                  className="crt-wipe"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '0',
                    background: 'transparent',
                    display: 'block',
                  }}
                  onError={e => {
                    (e.target as HTMLImageElement).src = 'http://localhost:8000/api/v1/static/uploads/placeholder.png';
                  }}
                />
              ) : (
                <div style={{ color: 'rgb(51, 51, 51)', fontSize: '1.2rem' }}></div>
              )}
            </div>
          </div>
          {/* White container below green screen */}
          <div
            style={{
              width: '80%',
              height: '30%',
              minHeight: '80px',
              background: 'white',
              borderRadius: '18px',
              boxSizing: 'border-box',
              boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              position: 'relative',
              border: '1px solid var(--pokedex-gray)',
              padding: '1.1rem 1rem 0.7rem 1rem',
              overflowY: 'auto',
              overflowX: 'hidden',
              maxHeight: '220px',
              scrollbarWidth: 'none', /* Firefox */
            }}
            className="hide-scrollbar"
          >
            {selected && (
              <div className="creature-details-anim" style={{ width: '100%', display: 'flex', flexDirection: 'row', gap: '1.2rem', alignItems: 'flex-start', justifyContent: 'center' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'row', gap: '1.2rem' }}>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ margin: '0 0 0.15rem 0', color: 'var(--pokedex-black)', fontWeight: 900, fontSize: '1.08rem', letterSpacing: '0.01em' }}>{nameTyped}</h2>
                    <h4 style={{ margin: '0 0 0.4rem 0', color: '#616161', fontWeight: 500, fontStyle: 'italic', fontSize: '0.92rem', letterSpacing: '0.01em' }}>{sciNameTyped}</h4>
                    <p style={{ margin: '0 0 0.4rem 0', color: '#333', fontSize: '0.88rem', textAlign: 'left', lineHeight: 1.3 }}>{descTyped}</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <table style={{ width: '100%', fontSize: '0.88rem', color: '#444', marginBottom: 0, borderSpacing: 0 }}>
                      <tbody>
                        <tr><td style={{ fontWeight: 600, padding: '0.15rem 0.3rem 0.15rem 0', whiteSpace: 'nowrap' }}>Kingdom:</td><td style={{ padding: '0.15rem 0' }}>{kingdomTyped}</td></tr>
                        <tr><td style={{ fontWeight: 600, padding: '0.15rem 0.3rem 0.15rem 0', whiteSpace: 'nowrap' }}>Classification:</td><td style={{ padding: '0.15rem 0' }}>{classTyped}</td></tr>
                        <tr><td style={{ fontWeight: 600, padding: '0.15rem 0.3rem 0.15rem 0', whiteSpace: 'nowrap' }}>Family:</td><td style={{ padding: '0.15rem 0' }}>{familyTyped}</td></tr>
                        <tr>
                          <td style={{ fontWeight: 600, padding: '0.15rem 0.3rem 0.15rem 0', whiteSpace: 'nowrap' }}>Body Shape:</td>
                          <td style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.15rem 0' }}>
                            {(() => {
                              const match = /bsi:(.+)/.exec(selected.body_shape);
                              const key = match ? match[1] : selected.body_shape;
                              const icons = import.meta.glob('./assets/body_shape_icons/*.png', { eager: true, import: 'default' });
                              const iconPath = key ? `./assets/body_shape_icons/${key}.png` : null;
                              const iconSrc = iconPath && icons[iconPath] ? icons[iconPath] : null;
                              return (
                                <>
                                  {iconSrc && (
                                    <img
                                      src={iconSrc as string}
                                      alt={key}
                                      style={{ width: 18, height: 18, objectFit: 'contain', verticalAlign: 'middle' }}
                                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                  )}
                                </>
                              );
                            })()}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 600, padding: '0.15rem 0.3rem 0.15rem 0', verticalAlign: 'top', whiteSpace: 'nowrap' }}>Gender Ratio:</td>
                          <td style={{ padding: '0.15rem 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <span style={{ fontSize: '0.95em', color: '#2196f3', fontWeight: 700, minWidth: 16, textAlign: 'right' }}>♂️</span>
                              <div style={{ width: 60, height: 8, borderRadius: 4, overflow: 'hidden', display: 'flex', boxShadow: '0 1px 4px #eee', border: '1px solid #e0e0e0' }} title={`♂️:♀️ = ${selected.gender_ratio}:1`}>
                                {(() => {
                                  const ratio = Math.max(0, selected.gender_ratio) / 2;
                                  const total = 1;
                                  const malePercent = (ratio / total) * 100;
                                  const femalePercent = (1 - ratio / total) * 100;
                                  return <>
                                    <div style={{ width: `${malePercent}%`, background: 'linear-gradient(90deg, #2196f3 70%, #90caf9 100%)', height: '100%' }}></div>
                                    <div style={{ width: `${femalePercent}%`, background: 'linear-gradient(90deg, #f06292 70%, #f8bbd0 100%)', height: '100%' }}></div>
                                  </>;
                                })()}
                              </div>
                              <span style={{ fontSize: '0.95em', color: '#f06292', fontWeight: 700, minWidth: 16, textAlign: 'left' }}>♀️</span>
                            </div>
                          </td>
                        </tr>
                        <tr><td style={{ fontWeight: 600, padding: '0.15rem 0.3rem 0.15rem 0', whiteSpace: 'nowrap' }}>Height:</td><td style={{ padding: '0.15rem 0' }}>{heightTyped}</td></tr>
                        <tr><td style={{ fontWeight: 600, padding: '0.15rem 0.3rem 0.15rem 0', whiteSpace: 'nowrap' }}>Weight:</td><td style={{ padding: '0.15rem 0' }}>{weightTyped}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Right panel: list and grid */}
        <div style={{ flex: 1, background: 'none', overflowY: 'auto', minHeight: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={listScreenStyles}>
            <ul style={listStyles} className="creature-list-scroll">
              {creatures.map((creature) => (
                <li
                  key={creature.id}
                  style={{
                    ...cardStyles,
                    cursor: 'pointer',
                    background: (hovered && hovered.id === creature.id)
                      ? 'var(--pokedex-bg)' // highlight on hover only
                      : 'var(--pokedex-bg)',
                    borderColor: 'var(--pokedex-bg)',
                    transition: 'background 0.2s, border 0.2s, filter 0.2s, transform 0.2s',
                    alignItems: 'center',
                    position: 'relative',
                    transform:
                      (selected && selected.id === creature.id) || (hovered && hovered.id === creature.id)
                        ? 'scale(0.97)'
                        : 'scale(1)',
                    zIndex: (selected && selected.id === creature.id) ? 2 : 1,
                  }}
                  onMouseEnter={() => setHovered(creature)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => { setSelected(creature); }}
                >
                  <img
                    src={`http://localhost:8000/api/v1/static/uploads/${creature.image_path.replace(/^.*[\/]/, '')}`}
                    alt={creature.name}
                    style={{
                      width: 36,
                      height: 36,
                      objectFit: 'cover',
                      borderRadius: '50%',
                      background: 'var(--pokedex-bg)',
                      marginRight: 10,
                      display: 'inline-block',
                    }}
                    onError={e => {
                      (e.target as HTMLImageElement).src = 'http://localhost:8000/api/v1/static/uploads/placeholder.png';
                    }}
                  />
                  <span style={{
                    fontWeight: 700,
                    color: 'var(--pokedex-dark-gray)',
                    fontSize: '1rem',
                    marginRight: 10,
                    minWidth: 28,
                    display: 'inline-block',
                    textAlign: 'right',
                  }}>
                    #{creature.id.toString().padStart(3, '0')}
                  </span>
                  <span style={{
                    ...nameStyles,
                    color: 'var(--pokedex-black)',
                    fontSize: '1.1rem',
                    marginLeft: 8,
                  }}>{creature.name}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Rectangular grid below list */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gridTemplateRows: 'repeat(2, 1fr)',
            gap: '0px',
            justifyItems: 'center',
            alignItems: 'center',
            background: 'transparent',
            margin: "5% auto 0px",
            height: '25%',
            width: '70%',
          }}>
            {[...Array(10)].map((_, i) => (
              <button
                key={i}
                className="pokedex-grid-btn"
                onClick={() => { }}
              >
                <div className="pokedex-grid-btn-inner">
                  {i + 1}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default CreatureList;
