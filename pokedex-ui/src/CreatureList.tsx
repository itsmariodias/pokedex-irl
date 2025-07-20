import React, { useEffect, useState } from 'react';

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

const CreatureList: React.FC = () => {

  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Creature | null>(null);

  useEffect(() => {
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


  if (loading) return <div>Loading creatures...</div>;
  if (error) return <div>Error: {error}</div>;


  // Pokedex-inspired styles
  const pokedexStyles: React.CSSProperties = {
    background: 'linear-gradient(135deg, #f44336 0%, #b71c1c 100%)',
    minHeight: '100vh',
    padding: 0,
    fontFamily: '"Segoe UI", "Roboto", "Arial", sans-serif',
    display: 'flex',
    flexDirection: 'column',
  };
  const headerStyles: React.CSSProperties = {
    background: '#d32f2f',
    color: 'white',
    padding: '1.5rem 2rem 1rem 2rem',
    borderBottom: '4px solid #b71c1c',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    width: '100%',
    margin: 0,
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
  const listStyles: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: '2rem auto',
    maxWidth: 600,
  };
  const cardStyles: React.CSSProperties = {
    background: 'white',
    border: '2px solid #bdbdbd',
    borderRadius: 16,
    marginBottom: '2rem',
    padding: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    position: 'relative',
  };
  const nameStyles: React.CSSProperties = {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#d32f2f',
    margin: 0,
    lineHeight: 1.1,
  };

  return (
    <div style={pokedexStyles}>
      <div style={headerStyles}>
        <div style={ledStyles}></div>
        <h1 style={{margin: 0, fontWeight: 900, letterSpacing: 2, fontSize: '2rem'}}>Pokédex IRL</h1>
      </div>
      <div style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        width: '100%',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 24,
        boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
        overflow: 'hidden',
      }}>
        {/* Left panel: selected creature image */}
        <div style={{
          flex: 1.2,
          background: 'linear-gradient(120deg, #fff 60%, #f8bbd0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          borderRight: '2px solid #e57373',
        }}>
        {selected ? (
          <img
            src={`http://localhost:8000/api/v1/static/uploads/${selected.image_path.replace(/^.*[\\\/]/, '')}`}
            alt={selected.name}
            style={{
              width: 340,
              height: 340,
              objectFit: 'cover',
              borderRadius: '50%',
              background: '#fff',
              marginBottom: 0,
              display: 'block',
            }}
            onError={e => {
              (e.target as HTMLImageElement).src = 'http://localhost:8000/api/v1/static/uploads/placeholder.png';
            }}
          />
        ) : (
          <div style={{color: '#bdbdbd', fontSize: '1.2rem'}}>Select an entry</div>
        )}
        </div>
        {/* Right panel: list */}
        <div style={{flex: 1.5, background: 'none', overflowY: 'auto', minHeight: 400}}>
          <ul style={listStyles}>
            {creatures.map((creature) => (
            <li
              key={creature.id}
              style={{
                ...cardStyles,
                cursor: 'pointer',
                background: selected && selected.id === creature.id ? '#ffe0e0' : 'white',
                borderColor: selected && selected.id === creature.id ? '#d32f2f' : '#bdbdbd',
                transition: 'background 0.2s, border 0.2s',
                alignItems: 'center',
              }}
              onClick={() => setSelected(creature)}
            >
              <img
                src={`http://localhost:8000/api/v1/static/uploads/${creature.image_path.replace(/^.*[\\\/]/, '')}`}
                alt={creature.name}
                style={{
                  width: 48,
                  height: 48,
                  objectFit: 'cover',
                  borderRadius: '50%',
                  background: '#fff',
                  marginRight: 16,
                  display: 'inline-block',
                }}
                onError={e => {
                  (e.target as HTMLImageElement).src = 'http://localhost:8000/api/v1/static/uploads/placeholder.png';
                }}
              />
              <span style={{
                fontWeight: 700,
                color: '#616161',
                fontSize: '1.1rem',
                marginRight: 16,
                minWidth: 32,
                display: 'inline-block',
                textAlign: 'right',
              }}>
                #{creature.id.toString().padStart(3, '0')}
              </span>
              <span style={{
                ...nameStyles,
                color: '#d32f2f',
                fontSize: '1.3rem',
                marginLeft: 12,
              }}>{creature.name}</span>
            </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreatureList;
