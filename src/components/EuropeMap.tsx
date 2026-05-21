import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {ComposableMap, Geographies, Geography, ZoomableGroup} from 'react-simple-maps';
import {useHistory} from '@docusaurus/router';
import data from '@site/data/eudi-status.json';
import {statusColour} from './StatusBadge';
import MapShare from './MapShare';
import MapSearch from './MapSearch';
import EmbedButton from './EmbedButton';

const GEO_URL =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

type Country = (typeof data.countries)[number];

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

type HoverState = {
  c: Country;
  x: number;
  y: number;
} | null;

const IconMaximise = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
    <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconMinimise = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
    <path d="M2 6h4V2M14 10h-4v4M10 2v4h4M6 14v-4H2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
    <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

type Props = {
  filterStatus?: string | null;
  pinnedIso?: string | null;
  onPin?: (iso: string | null) => void;
};

export default function EuropeMap({filterStatus = null, pinnedIso = null, onPin}: Props) {
  const [searchHoverIso, setSearchHoverIso] = useState<string | null>(null);
  const history = useHistory();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<HoverState>(null);
  const [maximised, setMaximisedState] = useState(false);
  const [pulseIso, setPulseIso] = useState<string | null>(null);
  // Zoom + pan state for the ZoomableGroup. `center` is in geographic
  // coordinates ([longitude, latitude]) so it must match the projection's
  // rotate centre. With rotate [-10, -54, 0] the default visual centre is
  // 10E/54N; using [0,0] instead anchors zoom on the Atlantic off Africa
  // and shoves the map several thousand pixels off-screen as zoom grows.
  const ZOOM_MIN = 1;
  const ZOOM_MAX = 8;
  const ZOOM_STEP = 1.5;
  const DEFAULT_CENTER: [number, number] = [10, 54];
  const [mapZoom, setMapZoom] = useState(1);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const zoomIn = useCallback(() => {
    setMapZoom((z) => Math.min(ZOOM_MAX, z * ZOOM_STEP));
  }, []);
  const zoomOut = useCallback(() => {
    setMapZoom((z) => Math.max(ZOOM_MIN, z / ZOOM_STEP));
  }, []);
  const zoomReset = useCallback(() => {
    setMapZoom(1);
    setMapCenter(DEFAULT_CENTER);
  }, []);

  const setMaximised = useCallback((next: boolean | ((prev: boolean) => boolean)) => {
    setMaximisedState((prev) => {
      const value = typeof next === 'function' ? (next as (p: boolean) => boolean)(prev) : next;
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (value) url.searchParams.set('max', '1');
        else url.searchParams.delete('max');
        window.history.replaceState(null, '', url.toString());
      }
      return value;
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('max') === '1') setMaximisedState(true);
  }, []);

  const byNumeric = useMemo(() => {
    const m = new Map<string, Country>();
    for (const c of data.countries) m.set(c.isoNumeric, c as Country);
    return m;
  }, []);

  const byAlpha2 = useMemo(() => {
    const m = new Map<string, Country>();
    for (const c of data.countries) m.set(c.isoAlpha2, c as Country);
    return m;
  }, []);

  const trackPointer = useCallback((e: React.MouseEvent, c: Country) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHover({c, x: e.clientX - rect.left, y: e.clientY - rect.top});
  }, []);

  useEffect(() => {
    if (!maximised) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMaximised(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [maximised, setMaximised]);

  // Clear pulse state after animation.
  useEffect(() => {
    if (!pulseIso) return;
    const t = setTimeout(() => setPulseIso(null), 1400);
    return () => clearTimeout(t);
  }, [pulseIso]);

  const onSearchSelect = useCallback(
    (c: Country) => {
      setPulseIso(c.isoAlpha2);
      onPin?.(c.isoAlpha2);
    },
    [onPin],
  );

  const pinnedCountry = pinnedIso ? byAlpha2.get(pinnedIso) ?? null : null;

  const frame = (
    <div
      className={
        'europe-map-frame' +
        (maximised ? ' europe-map-frame--maximised' : '') +
        (pinnedCountry ? ' europe-map-frame--pin-open' : '')
      }
    >
      <div className="europe-map__toolbar" role="toolbar" aria-label="Map view controls">
        <span className="europe-map__title">
          European Digital Identity Wallet Readiness Map
          <span className="europe-map__title-meta">
            {maximised
              ? 'Press Esc to exit full screen'
              : `Updated ${data.lastUpdated} · ${data.countries.length} jurisdictions`}
          </span>
        </span>
        <div className="europe-map__buttons">
          <MapSearch onSelect={onSearchSelect} onHover={setSearchHoverIso} />
          <MapShare pinnedIso={pinnedIso} />
          <EmbedButton iso={pinnedIso ?? undefined} />
          {maximised ? (
            <button
              type="button"
              className="europe-map__btn europe-map__btn--close"
              onClick={() => setMaximised(false)}
              aria-label="Exit full screen"
              title="Exit full screen (Esc)"
            >
              <IconClose />
              <span>Exit full screen</span>
            </button>
          ) : (
            <button
              type="button"
              className="europe-map__btn"
              onClick={() => setMaximised(true)}
              aria-label="Maximise map"
              title="Maximise"
            >
              <IconMaximise />
              <span>Maximise</span>
            </button>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className="europe-map__canvas"
        onMouseLeave={() => setHover(null)}
      >
        <ComposableMap
          projection="geoConicConformal"
          projectionConfig={{
            rotate: [-10, -54, 0],
            center: [0, 0],
            parallels: [40, 65],
            scale: 780,
          }}
          className="europe-map"
          width={1240}
          height={700}
          preserveAspectRatio="xMidYMid meet"
          style={{width: '100%', height: 'auto', display: 'block'}}
        >
          <defs>
            <filter id="euMapShadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.4" floodOpacity="0.12" />
            </filter>
            <pattern id="scope-hatch" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)">
              <rect width="7" height="7" fill="#eef0f3" />
              <line x1="0" y1="0" x2="0" y2="7" stroke="#d8dde4" strokeWidth="1" />
            </pattern>
          </defs>
          <ZoomableGroup
            zoom={mapZoom}
            center={mapCenter}
            minZoom={ZOOM_MIN}
            maxZoom={ZOOM_MAX}
            onMoveEnd={({coordinates, zoom}) => {
              setMapCenter(coordinates as [number, number]);
              setMapZoom(zoom);
            }}
          >
          <Geographies geography={GEO_URL}>
            {({geographies: rawGeographies}) => {
              // Drop the unrecognised 'N. Cyprus' (Turkish Republic of
              // Northern Cyprus) geometry so the island renders as a single
              // territory under the Republic of Cyprus (id=196). The EU
              // (and the tracker) recognises only the Republic of Cyprus.
              const geographies = rawGeographies.filter(
                (g) => g.properties?.name !== 'N. Cyprus',
              );
              // Lift the currently emphasised country (mouse hover, search
              // hover, pulse, or pin) to the top of the paint order so its
              // border isn't clipped by neighbours. Hover state now only
              // updates on mouseEnter (not mouseMove) so this reorder fires
              // once per country transition rather than per pixel.
              const topIso =
                hover?.c.isoAlpha2 ??
                searchHoverIso ??
                pulseIso ??
                pinnedIso ??
                null;
              const ordered = topIso
                ? [
                    ...geographies.filter((g) => {
                      const code = byNumeric.get(String(g.id).padStart(3, '0'));
                      return !code || code.isoAlpha2 !== topIso;
                    }),
                    ...geographies.filter((g) => {
                      const code = byNumeric.get(String(g.id).padStart(3, '0'));
                      return code && code.isoAlpha2 === topIso;
                    }),
                  ]
                : geographies;
              return ordered.map((geo) => {
                const c = byNumeric.get(String(geo.id).padStart(3, '0'));
                const inScope = !!c;
                const fill = inScope ? statusColour(c.status) : 'url(#scope-hatch)';
                const label = c
                  ? `${c.name}: ${c.status}`
                  : geo.properties?.name ?? '';
                const dim = inScope && filterStatus && c.status !== filterStatus;
                const isPinned = inScope && pinnedIso && c.isoAlpha2 === pinnedIso;
                const isPulsing = inScope && pulseIso && c.isoAlpha2 === pulseIso;
                const isSearchHover = inScope && searchHoverIso && c.isoAlpha2 === searchHoverIso;
                const classes = [
                  inScope ? 'is-scope' : 'is-outscope',
                  dim ? 'is-dimmed' : '',
                  isPinned ? 'is-pinned' : '',
                  isPulsing ? 'is-pulsing' : '',
                  isSearchHover ? 'is-search-hover' : '',
                ]
                  .filter(Boolean)
                  .join(' ');
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    role="button"
                    aria-label={label}
                    tabIndex={c ? 0 : -1}
                    filter={c ? 'url(#euMapShadow)' : undefined}
                    className={classes}
                    onMouseEnter={(e) => {
                      if (c) trackPointer(e, c);
                    }}
                    onMouseLeave={() => setHover(null)}
                    onClick={(e) => {
                      if (!c) return;
                      if (e.metaKey || e.ctrlKey) {
                        history.push(`/tracker/${slug(c.name)}`);
                        return;
                      }
                      onPin?.(c.isoAlpha2);
                    }}
                    onKeyDown={(e) => {
                      if (c && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onPin?.(c.isoAlpha2);
                      }
                    }}
                    style={{
                      default: {outline: 'none', cursor: c ? 'pointer' : 'default'},
                      hover: {outline: 'none', cursor: c ? 'pointer' : 'default'},
                      pressed: {outline: 'none'},
                    }}
                  />
                );
              });
            }}
          </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        <div className="europe-map__zoom" role="group" aria-label="Map zoom controls">
          <button
            type="button"
            className="europe-map__zoom-btn"
            onClick={zoomIn}
            disabled={mapZoom >= ZOOM_MAX - 0.001}
            aria-label="Zoom in"
            title="Zoom in"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
              <path d="M8 3.5v9M3.5 8h9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            className="europe-map__zoom-btn"
            onClick={zoomOut}
            disabled={mapZoom <= ZOOM_MIN + 0.001}
            aria-label="Zoom out"
            title="Zoom out"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
              <path d="M3.5 8h9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            className="europe-map__zoom-btn"
            onClick={zoomReset}
            disabled={mapZoom === 1 && mapCenter[0] === DEFAULT_CENTER[0] && mapCenter[1] === DEFAULT_CENTER[1]}
            aria-label="Reset zoom"
            title="Reset view"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
              <path d="M2.5 5.5V2.5h3M13.5 5.5V2.5h-3M2.5 10.5v3h3M13.5 10.5v3h-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {hover && (
          <div
            className="europe-map__tooltip"
            style={{
              left: Math.min(hover.x + 14, (containerRef.current?.clientWidth ?? 0) - 240),
              top: hover.y + 14,
            }}
            role="status"
            aria-live="polite"
          >
            <strong>{hover.c.name}</strong>
            <div className="europe-map__tooltip-status">{hover.c.status}</div>
            {hover.c.walletName && <div className="europe-map__tooltip-wallet">{hover.c.walletName}</div>}
            {hover.c.assuranceLevel && (
              <div className="europe-map__tooltip-loa">Level of Assurance: {hover.c.assuranceLevel}</div>
            )}
          </div>
        )}
      </div>

      {pinnedCountry && (
        <aside className="europe-map__pin" aria-label={`${pinnedCountry.name} detail`}>
          <div className="europe-map__pin-header">
            <span
              className="status-chip__dot"
              style={{background: statusColour(pinnedCountry.status), width: 10, height: 10}}
              aria-hidden
            />
            <strong>{pinnedCountry.name}</strong>
            <span className="europe-map__pin-iso">{pinnedCountry.isoAlpha2} · {pinnedCountry.group}</span>
            <button
              type="button"
              className="europe-map__pin-close"
              onClick={() => onPin?.(null)}
              aria-label="Clear pin"
              title="Clear (Esc)"
            >
              <IconClose />
            </button>
          </div>
          <div className="europe-map__pin-status">{pinnedCountry.status}</div>
          {pinnedCountry.walletName && (
            <dl className="europe-map__pin-meta">
              <div><dt>Wallet</dt><dd>{pinnedCountry.walletName}</dd></div>
              {pinnedCountry.walletProvider && <div><dt>Provider</dt><dd>{pinnedCountry.walletProvider}</dd></div>}
              {pinnedCountry.assuranceLevel && <div><dt>LoA</dt><dd>{pinnedCountry.assuranceLevel}</dd></div>}
              {pinnedCountry.launchOrPilotDate && <div><dt>Since</dt><dd>{pinnedCountry.launchOrPilotDate}</dd></div>}
            </dl>
          )}
          <a
            className="europe-map__pin-cta"
            href={`/tracker/${slug(pinnedCountry.name)}`}
            target="_blank"
            rel="noopener"
          >
            Open full profile <span aria-hidden>→</span>
          </a>
        </aside>
      )}
    </div>
  );

  if (maximised && typeof document !== 'undefined') {
    return createPortal(frame, document.body);
  }
  return frame;
}
