import React from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import Countdown from '@site/src/components/Countdown';
import MapSection from '@site/src/components/MapSection';
import RecentChanges from '@site/src/components/RecentChanges';
import data from '@site/data/eudi-status.json';

type CountryRow = {
  name: string;
  isoAlpha2: string;
  status: string;
  walletName?: string;
  walletProvider?: string;
  group?: string;
  lspParticipation?: string[];
  assuranceLevel?: string;
  launchOrPilotDate?: string | null;
  igrantActivity?: {
    summary: string;
    lsps?: string[];
    url?: string;
    since?: string;
  };
};

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function Home() {
  const countries = data.countries as CountryRow[];
  const total = countries.length;
  const live = countries.filter((c) => c.status === 'Launched in production').length;
  const pilot = countries.filter((c) => c.status === 'Public pilot live').length;
  const ready = live + pilot;
  const highLoa = countries.filter((c) => c.assuranceLevel === 'high').length;
  const eu = countries.filter((c) => c.group === 'EU').length;

  const datasetJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'EUDI Wallet Status Tracker',
    alternateName: 'European Digital Identity Wallet Readiness Map',
    description:
      'Open, dated, source-backed editorial record of European Digital Identity (EUDI) Wallet rollout status across the EU 27, EEA (Norway, Iceland, Liechtenstein), the United Kingdom and Switzerland. One row per jurisdiction with status, wallet name, wallet provider, level of assurance, launch or pilot date and primary sources.',
    url: 'https://eudi-wallet-tracker.igrant.io/',
    identifier: 'https://eudi-wallet-tracker.igrant.io/',
    license: 'https://creativecommons.org/licenses/by/4.0/',
    isAccessibleForFree: true,
    creator: {
      '@type': 'Organization',
      name: 'iGrant.io',
      url: 'https://www.igrant.io',
    },
    publisher: {
      '@type': 'Organization',
      name: 'iGrant.io',
      url: 'https://www.igrant.io',
    },
    dateModified: data.lastUpdated,
    keywords: [
      'EUDI Wallet',
      'European Digital Identity Wallet',
      'eIDAS 2',
      'digital identity',
      'wallet readiness',
      'Member State rollout',
      'EU 27',
      'EEA',
    ],
    spatialCoverage: {
      '@type': 'Place',
      name: 'European Union, EEA, United Kingdom, Switzerland',
    },
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: 'https://eudi-wallet-tracker.igrant.io/data/eudi-status.json',
      },
    ],
    variableMeasured: [
      'Wallet rollout status',
      'Level of Assurance',
      'Launch or pilot date',
      'Wallet provider',
    ],
  };

  return (
    <Layout>
      <Head>
        <title>EUDI Wallet Status Tracker</title>
        <meta
          name="description"
          content="Live readiness of every EU 27, EEA, UK and Switzerland EUDI Wallet rollout. Status, wallet name, level of assurance, milestones."
        />
        <script type="application/ld+json">
          {JSON.stringify(datasetJsonLd)}
        </script>
      </Head>
      <main style={{width: '100%', maxWidth: 1280, margin: '0 auto', padding: '1.25rem 1.25rem 4rem', boxSizing: 'border-box'}}>
        <section className="tracker-hero">
          <div className="tracker-hero__text">
            <span className="tracker-hero__eyebrow">Live readiness, {total} jurisdictions</span>
            <h1>Where every Member State stands on the EUDI Wallet.</h1>
            <p className="tracker-hero__lede">
              Live adoption across the region: who has launched, who is in public pilot, and who is still
              preparing to ship.
            </p>
            <div className="tracker-hero__meta">
              <span>
                {ready} of {total} jurisdictions in production or public pilot today.{' '}
                Prefer a sortable list?{' '}
                <Link to="/tracker/table">Open the table view</Link>.
              </span>
            </div>
            <p className="tracker-meta">Last updated {data.lastUpdated}.</p>
          </div>
          <div className="tracker-hero__aside">
            <Countdown target={data.deadline} />
          </div>
        </section>

        <MapSection />
        <p style={{fontSize: '0.88rem', color: 'var(--tracker-text-muted)', marginTop: '0.75rem', textAlign: 'center'}}>
          Click a status chip to filter. Hover a country for status, click to pin its details.
        </p>

        <section className="tracker-section">
          <span className="tracker-section__eyebrow">Latest status</span>
          <h2 className="tracker-section__title">Where things stand by jurisdiction</h2>
          <p className="tracker-section__lede">
            The most recently dated position we hold for each country, newest first.
          </p>
          <RecentChanges limit={10} />
        </section>

        <section className="tracker-section">
          <span className="tracker-section__eyebrow">In production today</span>
          <h2 className="tracker-section__title">Wallets you can install right now</h2>
          <p className="tracker-section__lede">
            Member States with a publicly available EUDI Wallet today, plus the body operating it.
          </p>
          <div className="stats-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'}}>
            {countries
              .filter((c) => c.status === 'Launched in production')
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((c) => (
                <Link
                  key={c.isoAlpha2}
                  className="stat-card"
                  to={`/tracker/${slug(c.name)}`}
                  style={{textDecoration: 'none', color: 'inherit'}}
                >
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem'}}>
                    <span style={{fontWeight: 600, fontSize: '1.05rem'}}>{c.name}</span>
                    <span className="status-badge status-badge--launched">Live</span>
                  </div>
                  <span style={{marginTop: '0.45rem', fontSize: '0.95rem'}}>{c.walletName ?? '-'}</span>
                  <span className="stat-card__label" style={{marginTop: '0.2rem'}}>
                    {c.walletProvider ?? ''}
                    {c.launchOrPilotDate ? ` · live since ${c.launchOrPilotDate.slice(0, 7)}` : ''}
                  </span>
                </Link>
              ))}
          </div>
        </section>

        <section className="tracker-section">
          <span className="tracker-section__eyebrow">At a glance</span>
          <h2 className="tracker-section__title">The picture today, in three numbers</h2>
          <div className="stats-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))'}}>
            <div className="stat-card">
              <span className="stat-card__count">{Math.round((ready / total) * 100)}%</span>
              <span className="stat-card__label">of tracked jurisdictions are live or in public pilot</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__count">{highLoa}</span>
              <span className="stat-card__label">jurisdictions targeting Level of Assurance &ldquo;high&rdquo;</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__count">{eu}</span>
              <span className="stat-card__label">EU Member States tracked, plus EEA, UK and Switzerland</span>
            </div>
          </div>
        </section>

        <section className="tracker-section">
          <span className="tracker-section__eyebrow">Why it matters</span>
          <h2 className="tracker-section__title">Find the answer you actually came for</h2>
          <div className="stats-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'}}>
            <Link className="stat-card" to="/tracker/table" style={{textDecoration: 'none', color: 'inherit'}}>
              <span style={{fontWeight: 600, fontSize: '1.05rem'}}>Which countries are ready to issue?</span>
              <span className="stat-card__label" style={{marginTop: '0.4rem'}}>
                Filter by Level of Assurance, status and group, then export the slice you need.
              </span>
            </Link>
            <Link className="stat-card" to="/tracker" style={{textDecoration: 'none', color: 'inherit'}}>
              <span style={{fontWeight: 600, fontSize: '1.05rem'}}>Where is my wallet rollout up to?</span>
              <span className="stat-card__label" style={{marginTop: '0.4rem'}}>
                Open any country to see wallet name, provider, assurance level and most recent milestone.
              </span>
            </Link>
            <Link className="stat-card" to="/changelog" style={{textDecoration: 'none', color: 'inherit'}}>
              <span style={{fontWeight: 600, fontSize: '1.05rem'}}>What moved this month?</span>
              <span className="stat-card__label" style={{marginTop: '0.4rem'}}>
                The chronological feed of status transitions across all tracked jurisdictions.
              </span>
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
