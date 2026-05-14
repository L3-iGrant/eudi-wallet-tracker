import React, {useEffect, useMemo, useRef, useState} from 'react';
import data from '@site/data/eudi-status.json';

type Country = (typeof data.countries)[number];

type Props = {
  onSelect: (country: Country) => void;
  onHover?: (iso: string | null) => void;
};

export default function MapSearch({onSelect, onHover}: Props) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return (data.countries as Country[])
      .filter((c) => c.name.toLowerCase().includes(term) || c.isoAlpha2.toLowerCase() === term)
      .slice(0, 8);
  }, [q]);

  useEffect(() => {
    setHighlight(0);
  }, [q]);

  // Keep map highlight in sync with the active keyboard-highlighted result.
  useEffect(() => {
    if (open && matches[highlight]) onHover?.(matches[highlight].isoAlpha2);
    else onHover?.(null);
  }, [open, highlight, matches, onHover]);

  useEffect(() => {
    return () => onHover?.(null);
  }, [onHover]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function pick(c: Country) {
    onSelect(c);
    setQ('');
    setOpen(false);
    inputRef.current?.blur();
  }

  return (
    <div className="map-search" role="search">
      <span className="map-search__icon" aria-hidden>
        <svg width="14" height="14" viewBox="0 0 16 16">
          <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.6 10.6L14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      <input
        ref={inputRef}
        className="map-search__input"
        type="search"
        placeholder="Find a country"
        aria-label="Find a country"
        value={q}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlight((h) => Math.min(matches.length - 1, h + 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlight((h) => Math.max(0, h - 1));
          } else if (e.key === 'Enter' && matches[highlight]) {
            e.preventDefault();
            pick(matches[highlight]);
          } else if (e.key === 'Escape') {
            setQ('');
            setOpen(false);
            inputRef.current?.blur();
          }
        }}
      />
      <span className="map-search__hint" aria-hidden>⌘K</span>
      {open && matches.length > 0 && (
        <ul
          className="map-search__results"
          role="listbox"
          onMouseLeave={() => onHover?.(null)}
        >
          {matches.map((m, i) => (
            <li
              key={m.isoAlpha2}
              role="option"
              aria-selected={highlight === i}
              className={'map-search__opt' + (highlight === i ? ' is-active' : '')}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(m);
              }}
              onMouseEnter={() => {
                setHighlight(i);
                onHover?.(m.isoAlpha2);
              }}
            >
              <span className="map-search__opt-name">{m.name}</span>
              <span className="map-search__opt-meta">{m.isoAlpha2} · {m.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
