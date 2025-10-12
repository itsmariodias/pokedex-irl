import React, { useState, useRef, useEffect } from 'react';

interface Option {
  key: string;
  label: string;
  iconUrl: string;
}

interface CustomDropdownProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const selected = options.find(opt => opt.key === value);

  return (
    <div ref={ref} style={{ width: '100%', position: 'relative', zIndex: 100 }}>
      <div
        style={{
          width: '100%',
          height: '3.5rem',
          borderRadius: '18px',
          border: '3px solid var(--pokedex-black)',
          background: 'var(--pokedex-black)',
          color: 'var(--pokedex-bg)',
          fontWeight: 700,
          fontSize: '1.1rem',
          paddingLeft: '1.2rem',
          paddingRight: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setOpen(o => !o)}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') setOpen(o => !o);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected ? (
          <>
            <img
              src={selected.iconUrl}
              alt={selected.label}
              style={{ width: 28, height: 28, objectFit: 'contain', marginRight: 12 }}
            />
            <span>{selected.label}</span>
          </>
        ) : (
          <span style={{ color: '#aaa' }}>Select body shape...</span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: '1.3em', color: 'var(--pokedex-bg)' }}>&#9662;</span>
      </div>
      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 4px)',
            left: 0,
            width: '100%',
            background: 'var(--pokedex-black)',
            border: '3px solid var(--pokedex-black)',
            borderRadius: '18px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
            zIndex: 200,
            maxHeight: 320,
            overflowY: 'auto',
            padding: 4,
          }}
          role="listbox"
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {options.map(opt => (
              <div
                key={opt.key}
                onClick={() => { onChange(opt.key); setOpen(false); }}
                style={{
                  border: value === opt.key ? '2px solid var(--pokedex-yellow)' : '2px solid transparent',
                  borderRadius: 10,
                  padding: 4,
                  cursor: 'pointer',
                  background: value === opt.key ? 'rgba(255,255,0,0.08)' : 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: 64,
                  marginBottom: 4,
                }}
                role="option"
                aria-selected={value === opt.key}
                tabIndex={-1}
              >
                <img
                  src={opt.iconUrl}
                  alt={opt.label}
                  style={{ width: 36, height: 36, objectFit: 'contain', marginBottom: 2 }}
                />
                <span style={{ fontSize: '0.85em', color: 'var(--pokedex-bg)', fontWeight: 600, textAlign: 'center' }}>{opt.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
