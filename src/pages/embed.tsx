import React, {useEffect, useState} from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import BrowserOnly from '@docusaurus/BrowserOnly';
import StatsGrid from '@site/src/components/StatsGrid';

/**
 * Iframe-embeddable view of the readiness map.
 *
 * Strips all site chrome (navbar, footer) so the widget can be dropped onto
 * any third-party page via:
 *   <iframe src="https://eudi-wallet-tracker.igrant.io/embed?country=FR" ...></iframe>
 *
 * Supported query parameters:
 *   ?country=FR        Pin a specific country in the detail panel.
 *   ?pin=FR            Same as country (canonical, used by the in-app map).
 *   ?status=Launched   Pre-apply the status chip filter.
 *   ?legend=hide       Hide the colored status chip row above the map.
 *   ?chrome=minimal    Hide the map toolbar title and "View larger map" link.
 *   ?host=igrant       Apply a named host design preset (see HOST_PRESETS).
 *   ?preset=igrant     Alias of ?host=igrant.
 *
 * Unknown values for legend / chrome / host fall back to defaults.
 *
 * `noindex` so the embed surface does not pollute search results.
 */

// Whitelist of host presets. Add new entries here as more hosts adopt the embed.
const HOST_PRESETS = new Set(['igrant']);

function pickEnum<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export default function Embed() {
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [pinnedIso, setPinnedIso] = useState<string | null>(null);
  const [legend, setLegend] = useState<'show' | 'hide'>('show');
  const [chrome, setChrome] = useState<'full' | 'minimal'>('full');
  const [hostPreset, setHostPreset] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.add('is-embed');
    return () => {
      document.body.classList.remove('is-embed');
    };
  }, []);

  // Apply / remove skinning body classes so CSS can target the chosen preset
  // and visibility flags from a single place.
  useEffect(() => {
    const cls = document.body.classList;
    if (legend === 'hide') cls.add('embed--no-legend');
    else cls.remove('embed--no-legend');
    if (chrome === 'minimal') cls.add('embed--no-chrome');
    else cls.remove('embed--no-chrome');
    // Reset any previously applied preset before adding the current one.
    Array.from(cls).filter((c) => c.startsWith('theme--')).forEach((c) => cls.remove(c));
    if (hostPreset) cls.add(`theme--${hostPreset}`);
    return () => {
      cls.remove('embed--no-legend');
      cls.remove('embed--no-chrome');
      Array.from(cls).filter((c) => c.startsWith('theme--')).forEach((c) => cls.remove(c));
    };
  }, [legend, chrome, hostPreset]);

  // Hydrate from URL once: support both ?country= (Google-Maps-style alias)
  // and ?pin= (canonical, used by the in-app map).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    setFilterStatus(params.get('status'));
    setPinnedIso(params.get('country') ?? params.get('pin'));
    setLegend(pickEnum(params.get('legend'), ['show', 'hide'] as const, 'show'));
    setChrome(pickEnum(params.get('chrome'), ['full', 'minimal'] as const, 'full'));
    const requested = params.get('host') ?? params.get('preset');
    setHostPreset(requested && HOST_PRESETS.has(requested) ? requested : null);
  }, []);

  return (
    <Layout>
      <Head>
        <title>EUDI Wallet Status Tracker (embed)</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="referrer" content="no-referrer-when-downgrade" />
      </Head>
      <div className="embed-root">
        {legend === 'show' && (
          <StatsGrid
            filterStatus={filterStatus}
            onToggle={(s) => setFilterStatus((prev) => (prev === s ? null : s))}
            animateOnMount={false}
          />
        )}
        <div className="europe-map-wrap embed-map-wrap">
          <BrowserOnly fallback={<div style={{padding: '4rem 0', textAlign: 'center', color: 'var(--tracker-text-muted)'}}>Loading map&hellip;</div>}>
            {() => {
              const EuropeMap = require('@site/src/components/EuropeMap').default;
              return (
                <EuropeMap
                  filterStatus={filterStatus}
                  pinnedIso={pinnedIso}
                  onPin={(iso) => setPinnedIso(iso)}
                />
              );
            }}
          </BrowserOnly>
        </div>
        {chrome === 'full' && (
          <div className="embed-attribution">
            <span>EUDI Wallet Status Tracker</span>
            <a
              href={`https://eudi-wallet-tracker.igrant.io${pinnedIso ? `/?pin=${pinnedIso}` : '/'}`}
              target="_blank"
              rel="noopener"
            >
              View larger map &rarr;
            </a>
          </div>
        )}
      </div>
    </Layout>
  );
}
