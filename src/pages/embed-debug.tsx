import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';

/**
 * Local-only debug surface that renders every supported /embed parameter
 * combination side by side. Useful for visually verifying that toolbar,
 * attribution, legend, chrome and host preset all compose correctly.
 *
 * Each tile shows: title, the query string, an open-in-new-tab link, and
 * an iframe pointing at the local /embed surface so the page reflects
 * whatever is on disk right now.
 *
 * Marked noindex so it does not show up in search results.
 */

type Variant = {
  title: string;
  description: string;
  params: string;
};

const VARIANTS: Variant[] = [
  {
    title: 'Default',
    description: 'No params. Full chrome (toolbar, legend chip row, bottom attribution).',
    params: '',
  },
  {
    title: 'toolbar=hide',
    description: 'Top toolbar gone (title + search + share + embed + maximise). Legend and attribution stay.',
    params: 'toolbar=hide',
  },
  {
    title: 'attribution=hide',
    description: 'Bottom attribution gone. Toolbar and legend stay. Map reclaims the freed vertical space.',
    params: 'attribution=hide',
  },
  {
    title: 'legend=hide',
    description: 'Status chip row gone. Toolbar and attribution stay.',
    params: 'legend=hide',
  },
  {
    title: 'legend=hide&attribution=hide',
    description: 'The iGrant.io landing-page combo: keep the in-iframe toolbar so users can search, drop the redundant bottom strip (the host has its own CTA).',
    params: 'legend=hide&attribution=hide',
  },
  {
    title: 'chrome=minimal',
    description: 'Back-compat alias for toolbar=hide AND attribution=hide. Legend stays unless you also pass legend=hide.',
    params: 'chrome=minimal',
  },
  {
    title: 'chrome=minimal&legend=hide',
    description: 'Pure map mode. Every chrome element stripped; map fills the iframe.',
    params: 'chrome=minimal&legend=hide',
  },
  {
    title: 'host=default',
    description: 'Maintainer house style preset (Plus Jakarta Sans body, uppercase outline buttons, white surface).',
    params: 'host=default',
  },
  {
    title: 'host=default&legend=hide&attribution=hide',
    description: 'iGrant.io landing-page configuration with the named preset.',
    params: 'host=default&legend=hide&attribution=hide',
  },
];

export default function EmbedDebug() {
  const [origin, setOrigin] = useState<string>('');
  React.useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin);
  }, []);

  const variants = useMemo(() => VARIANTS, []);

  return (
    <Layout>
      <Head>
        <title>Embed debug</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <main style={{maxWidth: 1280, margin: '0 auto', padding: '2rem 0.75rem 4rem', boxSizing: 'border-box'}}>
        <header style={{marginBottom: '2rem'}}>
          <h1 style={{margin: 0}}>Embed debug</h1>
          <p style={{color: 'var(--tracker-text-muted)', maxWidth: 720}}>
            Visual smoke-test for every supported <code>/embed</code> parameter combination. Each tile loads the local
            embed surface in an iframe, so what you see here matches whatever code is on disk right now.
          </p>
        </header>

        <div
          style={{
            display: 'grid',
            // Use min(100%, 420px) so the minimum column never exceeds the
            // available width. Below ~420px viewports, each tile collapses
            // to a single column instead of spilling beyond the viewport.
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
            gap: '1.5rem',
          }}
        >
          {variants.map((v) => {
            const url = `${origin || ''}/embed${v.params ? `?${v.params}` : ''}`;
            return (
              <section
                key={v.title}
                style={{
                  border: '1px solid var(--tracker-hairline-strong)',
                  borderRadius: 14,
                  overflow: 'hidden',
                  background: 'var(--tracker-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <header style={{padding: '0.85rem 1rem 0.5rem'}}>
                  <h2 style={{margin: 0, fontSize: '1rem', fontWeight: 600}}>{v.title}</h2>
                  <p
                    style={{
                      margin: '0.25rem 0 0',
                      fontSize: '0.8rem',
                      color: 'var(--tracker-text-muted)',
                      lineHeight: 1.4,
                    }}
                  >
                    {v.description}
                  </p>
                </header>
                <div
                  style={{
                    padding: '0.4rem 1rem 0.6rem',
                    borderTop: '1px solid var(--tracker-hairline)',
                    borderBottom: '1px solid var(--tracker-hairline)',
                    fontSize: '0.75rem',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    color: 'var(--tracker-text-muted)',
                    wordBreak: 'break-all',
                  }}
                >
                  /embed{v.params ? `?${v.params}` : ''}{' '}
                  <a href={url} target="_blank" rel="noopener" style={{marginLeft: '0.5rem'}}>
                    open
                  </a>
                </div>
                <iframe
                  src={url}
                  style={{border: 0, width: '100%', height: 460, display: 'block', background: '#f9f9f9'}}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Embed preview: ${v.title}`}
                />
              </section>
            );
          })}
        </div>
      </main>
    </Layout>
  );
}
