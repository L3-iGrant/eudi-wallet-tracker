import React, {useCallback, useEffect, useState} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import StatsGrid from './StatsGrid';

function readQueryParam(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function writeQueryParam(name: string, value: string | null) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (value === null || value === '') url.searchParams.delete(name);
  else url.searchParams.set(name, value);
  window.history.replaceState(null, '', url.toString());
}

export default function MapSection() {
  const [filterStatus, setFilterStatusState] = useState<string | null>(null);
  const [pinnedIso, setPinnedIsoState] = useState<string | null>(null);

  // Hydrate from URL once.
  useEffect(() => {
    setFilterStatusState(readQueryParam('status'));
    setPinnedIsoState(readQueryParam('pin'));
  }, []);

  // Sync ESC clears pin.
  useEffect(() => {
    if (!pinnedIso) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPinnedIsoState(null);
        writeQueryParam('pin', null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pinnedIso]);

  const onToggleStatus = useCallback((s: string) => {
    setFilterStatusState((prev) => {
      const next = prev === s ? null : s;
      writeQueryParam('status', next);
      return next;
    });
  }, []);

  const onPin = useCallback((iso: string | null) => {
    setPinnedIsoState(iso);
    writeQueryParam('pin', iso);
  }, []);

  return (
    <section className="tracker-mapsection" aria-label="Readiness map">
      <StatsGrid filterStatus={filterStatus} onToggle={onToggleStatus} animateOnMount />
      <div className="europe-map-wrap">
        <BrowserOnly fallback={<div style={{padding: '4rem 0', textAlign: 'center', color: 'var(--tracker-text-muted)'}}>Loading map&hellip;</div>}>
          {() => {
            const EuropeMap = require('./EuropeMap').default;
            return (
              <EuropeMap
                filterStatus={filterStatus}
                pinnedIso={pinnedIso}
                onPin={onPin}
              />
            );
          }}
        </BrowserOnly>
      </div>
    </section>
  );
}
