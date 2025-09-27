import searchIcon from './assets/search.png';
import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import NavBar from './NavBar';

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
    height: '44%', // top half
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
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // popupCreature removed - not used currently. Reintroduce if a detail modal is needed.
  const [hovered, setHovered] = useState<Creature | null>(null);
  const [selected, setSelected] = useState<Creature | null>(null);
  // currently selected full label from the blue grid buttons
  const [gridFullLabel, setGridFullLabel] = useState<string>('');
  // ordered list of pressed grid keys (most recent at the end)
  const [pressedGridKeys, setPressedGridKeys] = useState<string[]>([]);
  // per-field search parameter values keyed by the full label (e.g. 'Scientific Name')
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  // For range fields store separate min/max values
  const [searchRangeParams, setSearchRangeParams] = useState<Record<string, { min?: string; max?: string }>>({});

  // Range field helpers: which UI labels represent ranges and derived active min/max
  const rangeFields: string[] = ['Height', 'Weight', 'Gender Ratio'];
  const activeIsRange = !!gridFullLabel && rangeFields.includes(gridFullLabel);
  const activeFieldValue = activeIsRange
    ? (() => {
        const r = gridFullLabel ? searchRangeParams[gridFullLabel] : undefined;
        if (!r) return '';
        const min = r.min ?? '';
        const max = r.max ?? '';
        return `${min}-${max}`;
      })()
    : (gridFullLabel ? (searchParams[gridFullLabel] ?? '') : '');
  // (we derive min/max from activeFieldValue on demand)

  // Helper: map UI full label keys to backend query params
  function mapFieldToQuery(full: string, value: string): Record<string, string> {
    if (!value && value !== '0') return {};
    const trimmed = value.trim();
    switch (full) {
      case 'ID':
        // ensure integer
        const asInt = parseInt(trimmed, 10);
        if (Number.isNaN(asInt)) return {};
        return { id: String(asInt) };
      case 'Name':
        return { name: trimmed };
      case 'Scientific Name':
        return { scientific_name: trimmed };
      case 'Kingdom':
        return { kingdom: trimmed };
      case 'Classification':
        return { classification: trimmed };
      case 'Family':
        return { family: trimmed };
      case 'Body Shape':
        return { body_shape: trimmed };
      case 'Height': {
        const m = trimmed.split('-').map(s => s.trim()).filter(Boolean);
        if (m.length === 2) {
          const min = parseFloat(m[0]);
          const max = parseFloat(m[1]);
          if (Number.isNaN(min) || Number.isNaN(max)) return {};
          return { height_min: String(min), height_max: String(max) };
        }
        const asNum = parseFloat(trimmed);
        if (Number.isNaN(asNum)) return {};
        return { height_min: String(asNum), height_max: String(asNum) };
      }
      case 'Weight': {
        const m = trimmed.split('-').map(s => s.trim()).filter(Boolean);
        if (m.length === 2) {
          const min = parseFloat(m[0]);
          const max = parseFloat(m[1]);
          if (Number.isNaN(min) || Number.isNaN(max)) return {};
          return { weight_min: String(min), weight_max: String(max) };
        }
        const asNum = parseFloat(trimmed);
        if (Number.isNaN(asNum)) return {};
        return { weight_min: String(asNum), weight_max: String(asNum) };
      }
      case 'Gender Ratio': {
        const m = trimmed.split('-').map(s => s.trim()).filter(Boolean);
        if (m.length === 2) {
          const min = parseFloat(m[0]);
          const max = parseFloat(m[1]);
          if (Number.isNaN(min) || Number.isNaN(max)) return {};
          return { gender_ratio_min: String(min), gender_ratio_max: String(max) };
        }
        const asNum = parseFloat(trimmed);
        if (Number.isNaN(asNum)) return {};
        return { gender_ratio_min: String(asNum), gender_ratio_max: String(asNum) };
      }
      default:
        return {};
    }
  }

  // Trigger a search using the accumulated searchParams
  async function handleSearch() {
    try {
      setLoading(true);
      // If no grid buttons are pressed, call search with no params (reset filters)
      if (!pressedGridKeys || pressedGridKeys.length === 0) {
        const res = await fetch(`${API_URL}search`);
        if (!res.ok) throw new Error(`Search failed: ${res.status}`);
        const data = await res.json();
        setCreatures(data);
        setLoading(false);
        return;
      }

      // aggregate into backend query params
      const params: Record<string, string> = {};
      for (const [full, val] of Object.entries(searchParams)) {
        Object.assign(params, mapFieldToQuery(full, val));
      }
      // include separate min/max range params
      for (const [full, range] of Object.entries(searchRangeParams)) {
        if (!range) continue;
        const { min, max } = range;
        if (min !== undefined && min !== null && String(min).trim() !== '') {
          // map to backend names
          if (full === 'Height') params['height_min'] = String(min);
          if (full === 'Weight') params['weight_min'] = String(min);
          if (full === 'Gender Ratio') params['gender_ratio_min'] = String(min);
        }
        if (max !== undefined && max !== null && String(max).trim() !== '') {
          if (full === 'Height') params['height_max'] = String(max);
          if (full === 'Weight') params['weight_max'] = String(max);
          if (full === 'Gender Ratio') params['gender_ratio_max'] = String(max);
        }
      }
      const query = new URLSearchParams(params).toString();
      const url = `${API_URL}search${query ? `?${query}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Search failed: ${res.status}`);
      const data = await res.json();
      setCreatures(data);
      setLoading(false);
    } catch (err: any) {
      setError(err?.message ?? String(err));
      setLoading(false);
    }
  }

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

  // Memoize the left panel so it doesn't re-render on list-only updates
  const leftPane = React.useMemo(() => {
    return (
      <div
        id="pokedex-left-pane"
        style={{
          flex: 1,
          background: 'linear-gradient(135deg, var(--pokedex-red) 0%, var(--pokedex-dark-red) 100%)',
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
            aspectRatio: '1 / 1',
            background: 'var(--pokedex-bg)',
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
              aspectRatio: '1 / 1',
              background: 'var(--pokedex-screen-bg)',
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
            scrollbarWidth: 'none',
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
    );
  }, [selected, hovered, nameTyped, sciNameTyped, descTyped, kingdomTyped, classTyped, familyTyped, heightTyped, weightTyped]);

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
  showCreature: (_creature: Creature) => { /* no-op: popup/modal not implemented */ },
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
        {leftPane}
        {/* Right panel: list and grid */}
        <div style={{ flex: 1, background: 'none', overflowY: 'auto', minHeight: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={listScreenStyles}>
            {/* Loading / Error overlays local to the list screen so the left pane stays mounted */}
            {loading && (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.6)',
                zIndex: 50,
                color: 'var(--pokedex-bg)',
                fontWeight: 800,
                fontSize: '1.1rem',
              }}>
                Loading creatures...
              </div>
            )}
            {error && (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(160,0,0,0.85)',
                zIndex: 60,
                color: '#fff',
                padding: '1rem',
                textAlign: 'center',
                fontWeight: 800,
              }}>
                Error: {error}
              </div>
            )}
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
            {(
              [
                { short: 'ID', full: 'ID' },
                { short: 'Name', full: 'Name' },
                { short: 'Sci. Name', full: 'Scientific Name' },
                { short: 'Kingdom', full: 'Kingdom' },
                { short: 'Class.', full: 'Classification' },
                { short: 'Family', full: 'Family' },
                { short: 'Body', full: 'Body Shape' },
                { short: 'Height', full: 'Height' },
                { short: 'Weight', full: 'Weight' },
                { short: 'Gender', full: 'Gender Ratio' },
              ].map(({ short, full }) => {
                const pressed = pressedGridKeys.includes(full);
                return (
                  <button
                    key={full}
                    className={`pokedex-grid-btn${pressed ? '-pressed' : ''}`}
                    style={{
                      fontFamily: 'inherit',
                      fontWeight: 600,
                      fontSize: '1em',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-start',
                      padding: 0
                    }}
                    onClick={() => {
                      setPressedGridKeys(prev => {
                        const exists = prev.includes(full);
                        const next = exists ? prev.filter(k => k !== full) : [...prev, full];
                        // show newest pressed or empty
                        setGridFullLabel(next.length ? next[next.length - 1] : '');
                        return next;
                      });
                    }}
                  >
                    <div className={`pokedex-grid-btn-inner${pressed ? '-pressed' : ''}`} style={{ width: '100%', height: '100%', display: 'flex', fontFamily: 'inherit', fontWeight: 600, fontSize: '1em', textAlign: 'left' }}>
                        <span
                          style={{
                            paddingLeft: '0.5rem',
                            paddingTop: '0.5rem',
                            position: 'relative',
                          }}
                          className={`pokedex-grid-label${pressed ? '-pressed' : ''}`}
                        >
                          {short}
                        </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
          {/* Search buttons and text box */}
            <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '12.5%',
            marginTop: '2%',
            marginBottom: '5%',
            marginLeft: 'auto',
            marginRight: 'auto',
            width: '70%',
            }}>
            <div 
              style={{ 
              position: 'relative', 
              flex: 1, 
              width: '100%',
              display: 'flex', 
              alignItems: 'center', 
              height: 'auto', 
              gap: '5%',
              justifyContent: 'flex-start',
              }}>
              <label
              htmlFor="search-input"
              style={{
                background: 'var(--pokedex-bg)',
                border: '3px solid var(--pokedex-bg)',
                borderRadius: '18px',
                height: '3.5rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'flex-start',
                overflow: 'hidden',
                position: 'relative',
                paddingLeft: '1.2rem',
                paddingRight: '1.2rem',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--pokedex-black)',
                width: '30%',
              }}
              >
              {gridFullLabel || 'Field Name'}
              </label>
              {activeIsRange ? (
                <div style={{ display: 'flex', gap: '0.6rem', width: '60%', alignItems: 'center' }}>
                  <input
                    type="number"
                    placeholder="min"
                    value={activeFieldValue ? activeFieldValue.split('-')[0] ?? '' : ''}
                    style={{
                      background: 'var(--pokedex-black)',
                      border: '3px solid var(--pokedex-black)',
                      borderRadius: '18px',
                      height: '3.5rem',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                      paddingLeft: '0.8rem',
                      paddingRight: '0.8rem',
                      outline: 'none',
                      fontSize: '1.0rem',
                      fontWeight: 700,
                      color: 'var(--pokedex-bg)',
                      width: '30%'
                    }}
                    onChange={e => {
                      if (!gridFullLabel) return;
                      const min = e.target.value;
                      setSearchRangeParams(prev => ({ ...prev, [gridFullLabel]: { ...(prev[gridFullLabel] || {}), min } }));
                    }}
                  />
                  <input
                    type="number"
                    placeholder="max"
                    value={activeFieldValue ? activeFieldValue.split('-')[1] ?? activeFieldValue.split('-')[0] ?? '' : ''}
                    style={{
                      background: 'var(--pokedex-black)',
                      border: '3px solid var(--pokedex-black)',
                      borderRadius: '18px',
                      height: '3.5rem',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                      paddingLeft: '0.8rem',
                      paddingRight: '0.8rem',
                      outline: 'none',
                      fontSize: '1.0rem',
                      fontWeight: 700,
                      color: 'var(--pokedex-bg)',
                      width: '30%'
                    }}
                    onChange={e => {
                      if (!gridFullLabel) return;
                      const max = e.target.value;
                      setSearchRangeParams(prev => ({ ...prev, [gridFullLabel]: { ...(prev[gridFullLabel] || {}), max } }));
                    }}
                  />
                </div>
                ) : (
                <>
                  {gridFullLabel === 'ID' ? (
                    <input
                      id="search-input"
                      type="number"
                      step={1}
                      inputMode="numeric"
                      placeholder={gridFullLabel ? `Search ${gridFullLabel}` : 'Search Field'}
                      value={gridFullLabel ? (searchParams[gridFullLabel] ?? '') : ''}
                      style={{
                        background: 'var(--pokedex-black)',
                        border: '3px solid var(--pokedex-black)',
                        borderRadius: '18px',
                        height: '3.5rem',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        overflow: 'hidden',
                        position: 'relative',
                        paddingLeft: '1.2rem',
                        paddingRight: '1.2rem',
                        outline: 'none', // Prevent blue highlight
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: 'var(--pokedex-bg)',
                        width: '30%',
                      }}
                      onFocus={e => e.target.style.outline = 'none'}
                      onBlur={e => e.target.style.outline = 'none'}
                      onChange={e => {
                        if (!gridFullLabel) return;
                        // keep string until submit; enforce integer on submit
                        const v = e.target.value;
                        // allow empty
                        setSearchParams(prev => ({ ...prev, [gridFullLabel]: v }));
                      }}
                    />
                  ) : (
                    <input
                      id="search-input"
                      type="text"
                      placeholder={gridFullLabel ? `Search ${gridFullLabel}` : 'Search Field'}
                      value={gridFullLabel ? (searchParams[gridFullLabel] ?? '') : ''}
                      style={{
                        background: 'var(--pokedex-black)',
                        border: '3px solid var(--pokedex-black)',
                        borderRadius: '18px',
                        height: '3.5rem',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        overflow: 'hidden',
                        position: 'relative',
                        paddingLeft: '1.2rem',
                        paddingRight: '1.2rem',
                        outline: 'none', // Prevent blue highlight
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: 'var(--pokedex-bg)',
                        width: '30%',
                      }}
                      onFocus={e => e.target.style.outline = 'none'}
                      onBlur={e => e.target.style.outline = 'none'}
                      onChange={e => {
                        if (!gridFullLabel) return; // require an active label to edit
                        const v = e.target.value;
                        setSearchParams(prev => ({ ...prev, [gridFullLabel]: v }));
                      }}
                    />
                  )}
                </>
              )}
            </div>
            <button
              className="pokedex-search-btn scan-animated"
              style={{
                width: '3.5em',
                height: '3.5em',
                minWidth: '2.5em',
                minHeight: '2.5em',
                borderRadius: '50%',
                border: '5px solid var(--pokedex-yellow)',
                background: 'var(--pokedex-yellow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                cursor: 'pointer',
                padding: 0,
                marginLeft: '2rem',
              }}
              onClick={() => { handleSearch(); }}
              title="Search"
            >
                <img
                  src={searchIcon}
                  alt="Search"
                  style={{ width: 28, height: 28, objectFit: 'contain'}}
                  onError={e => { (e.target as HTMLImageElement).src = searchIcon; }}
                />
            </button>
            </div>
        </div>
      </div>
    </div>
  );
});

export default CreatureList;
