import React from 'react';
import type { Creature } from './CreatureList';

interface CreatureCardProps {
  creature: Creature;
  onClose: () => void;
}

const CreatureCard: React.FC<CreatureCardProps> = ({ creature, onClose }) => (
  <div
    style={{
      background: 'white',
      borderRadius: 24,
      padding: '2.5rem 2.5rem 2rem 2.5rem',
      minWidth: 700,
      maxWidth: 900,
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}
    onClick={e => e.stopPropagation()}
  >
    <button
      style={{
        position: 'absolute',
        top: 18,
        right: 18,
        background: 'var(--pokedex-red)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: 40,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(0,0,0,0.10)',
        padding: 0,
        lineHeight: 1,
      }}
      onClick={onClose}
      aria-label="Close details"
    >
      ✕
    </button>
    <img
      src={`http://localhost:8000/api/v1/static/uploads/${creature.image_path.replace(/^.*[\\\/]/, '')}`}
      alt={creature.name}
      style={{
        width: 180,
        height: 180,
        objectFit: 'cover',
        borderRadius: '50%',
        background: '#fff',
        marginBottom: 24,
        boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
      }}
      onError={e => {
        (e.target as HTMLImageElement).src = 'http://localhost:8000/api/v1/static/uploads/placeholder.png';
      }}
    />
    <h2 style={{margin: '0 0 0.5rem 0', color: 'var(--pokedex-red)', fontWeight: 900, fontSize: '2rem'}}>{creature.name}</h2>
    <h4 style={{margin: '0 0 1.2rem 0', color: '#616161', fontWeight: 500, fontStyle: 'italic'}}>{creature.scientific_name}</h4>
    <p style={{margin: '0 0 1.2rem 0', color: '#333', fontSize: '1.1rem', textAlign: 'center'}}>{creature.description}</p>
    <table style={{width: '100%', fontSize: '1.05rem', color: '#444', marginBottom: 0}}>
      <tbody>
        <tr><td style={{fontWeight: 600, padding: '0.3rem 0.7rem 0.3rem 0'}}>Kingdom:</td><td>{creature.kingdom}</td></tr>
        <tr><td style={{fontWeight: 600, padding: '0.3rem 0.7rem 0.3rem 0'}}>Classification:</td><td>{creature.classification}</td></tr>
        <tr><td style={{fontWeight: 600, padding: '0.3rem 0.7rem 0.3rem 0'}}>Family:</td><td>{creature.family}</td></tr>
        <tr>
          <td style={{fontWeight: 600, padding: '0.3rem 0.7rem 0.3rem 0'}}>Body Shape:</td>
          <td style={{display: 'flex', alignItems: 'center', gap: 10}}>
            {(() => {
              // Extract key after 'bsi:' or use as is
              const match = /bsi:(.+)/.exec(creature.body_shape);
              const key = match ? match[1] : creature.body_shape;
              // Use Vite's import.meta.glob to import all icons
              const icons = import.meta.glob('./assets/body_shape_icons/*.png', { eager: true, import: 'default' });
              const iconPath = key ? `./assets/body_shape_icons/${key}.png` : null;
              const iconSrc = iconPath && icons[iconPath] ? icons[iconPath] : null;
              return (
                <>
                  {iconSrc && (
                    <img
                      src={iconSrc as string}
                      alt={key}
                      style={{width: 32, height: 32, objectFit: 'contain', verticalAlign: 'middle'}}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                </>
              );
            })()}
          </td>
        </tr>
        <tr>
          <td style={{fontWeight: 600, padding: '0.3rem 0.7rem 0.3rem 0', verticalAlign: 'top'}}>Gender Ratio:</td>
          <td>
            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <span style={{fontSize: '1.1em', color: '#2196f3', fontWeight: 700, minWidth: 22, textAlign: 'right'}}>♂️</span>
              <div style={{width: 180, height: 18, borderRadius: 10, overflow: 'hidden', display: 'flex', boxShadow: '0 1px 4px #eee', border: '1px solid #e0e0e0'}} title={`♂️:♀️ = ${creature.gender_ratio}:1`}>
                {(() => {
                  // gender_ratio: number of males per 1 female
                  const ratio = Math.max(0, creature.gender_ratio) / 2;
                  const total = 1;
                  const malePercent = (ratio / total) * 100;
                  const femalePercent = (1 - ratio / total) * 100;
                  return <>
                    <div style={{width: `${malePercent}%`, background: 'linear-gradient(90deg, #2196f3 70%, #90caf9 100%)', height: '100%'}}></div>
                    <div style={{width: `${femalePercent}%`, background: 'linear-gradient(90deg, #f06292 70%, #f8bbd0 100%)', height: '100%'}}></div>
                  </>;
                })()}
              </div>
              <span style={{fontSize: '1.1em', color: '#f06292', fontWeight: 700, minWidth: 22, textAlign: 'left'}}>♀️</span>
            </div>
          </td>
        </tr>
        <tr><td style={{fontWeight: 600, padding: '0.3rem 0.7rem 0.3rem 0'}}>Height:</td><td>{creature.height} m</td></tr>
        <tr><td style={{fontWeight: 600, padding: '0.3rem 0.7rem 0.3rem 0'}}>Weight:</td><td>{creature.weight} kg</td></tr>
      </tbody>
    </table>
  </div>
);

export default CreatureCard;
