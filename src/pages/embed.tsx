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
 *   <iframe src="https://eudi-tracker.igrant.io/embed?country=FR" ...></iframe>
 *
 * Supported query parameters (read by MapSection via existing URL state):
 *   ?country=FR       Pin a specific country in the detail panel.
 *   ?status=Launched  Pre-apply the status chip filter.
 *
 * `noindex` so the embed surface does not pollute search results.
 */
export default function Embed() {
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [pinnedIso, setPinnedIso] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.add('is-embed');
    return () => {
      document.body.classList.remove('is-embed');
    };
  }, []);

  // Hydrate from URL once: support both ?country= (Google-Maps-style alias)
  // and ?pin= (canonical, used by the in-app map).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    setFilterStatus(params.get('status'));
    setPinnedIso(params.get('country') ?? params.get('pin'));
  }, []);

  return (
    <Layout>
      <Head>
        <title>EUDI Wallet Status Tracker (embed)</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="referrer" content="no-referrer-when-downgrade" />
      </Head>
      <div className="embed-root">
        <StatsGrid
          filterStatus={filterStatus}
          onToggle={(s) => setFilterStatus((prev) => (prev === s ? null : s))}
          animateOnMount={false}
        />
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
        <div className="embed-attribution">
          <span>EUDI Wallet Status Tracker</span>
          <a
            href={`https://eudi-tracker.igrant.io${pinnedIso ? `/?pin=${pinnedIso}` : '/'}`}
            target="_blank"
            rel="noopener"
          >
            View larger map &rarr;
          </a>
        </div>
      </div>
    </Layout>
  );
}
