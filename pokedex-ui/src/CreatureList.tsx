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
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [popupCreature, setPopupCreature] = useState<Creature | null>(null);
  const [hovered, setHovered] = useState<Creature | null>(null);
  const [selected, setSelected] = useState<Creature | null>(null);

  const fetchCreatures = () => {
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
  };

  useEffect(() => {
    fetchCreatures();
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: fetchCreatures,
    showCreature: (creature: Creature) => setPopupCreature(creature),
  }));

  if (loading) return <div>Loading creatures...</div>;
  if (error) return <div>Error: {error}</div>;


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
    height: '48%', // top half
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
    color: 'var(--pokedex-red)',
    margin: 0,
    lineHeight: 1.1,
  };

  return (
    <div style={pokedexStyles}>
      <NavBar onScanClick={props.onScanClick} />
      <div style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        width: '100%',
        height: '0',
        flexGrow: 1,
        background: 'rgba(255,255,255,0.05)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
        overflow: 'hidden',
      }}>
        {/* Left panel: red background, gray container, white inner container */}
        <div
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, var(--pokedex-red) 0%, var(--pokedex-dark-red) 100%)', // red outer panel
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 0,
            height: '100%',
            borderRight: '2px solid var(--pokedex-red)',
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
              marginTop: '-16vw', // move container upwards
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
              {hovered ? (
                <img
                  src={`http://localhost:8000/api/v1/static/uploads/${hovered.image_path.replace(/^.*[\\\/]/, '')}`}
                  alt={hovered.name}
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
        </div>
  {/* Right panel: list */}
  <div style={{flex: 1, background: 'none', overflowY: 'auto', minHeight: 0, height: '100%'}}>
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
                onClick={() => { setSelected(creature); setPopupCreature(creature); }}
                onDoubleClick={() => setPopupCreature(creature)}
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
                  color: 'var(--pokedex-red)',
                  fontSize: '1.1rem',
                  marginLeft: 8,
                }}>{creature.name}</span>
              </li>
            ))}
          </ul>
        </div>
        </div>
      </div>
      {/* Popup for creature details */}
      {popupCreature && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.45)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setPopupCreature(null)}
        >
          <CreatureCard creature={popupCreature} onClose={() => setPopupCreature(null)} />
        </div>
      )}
    </div>
  );
});

export default CreatureList;
