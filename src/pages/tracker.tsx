import React from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import Countdown from '@site/src/components/Countdown';
import MapSection from '@site/src/components/MapSection';
import data from '@site/data/eudi-status.json';

export default function Tracker() {
  const total = (data.countries as any[]).length;
  return (
    <Layout>
      <Head>
        <title>Map | EUDI Wallet Status Tracker</title>
        <meta name="description" content="Interactive EUDI Wallet rollout map across the EU 27, EEA, UK and Switzerland." />
      </Head>
      <main style={{width: '100%', maxWidth: 1280, margin: '0 auto', padding: '0.5rem 1.25rem 4rem', boxSizing: 'border-box'}}>
        <section className="tracker-hero">
          <div className="tracker-hero__text">
            <span className="tracker-hero__eyebrow">Map view</span>
            <h1>Readiness across Europe.</h1>
            <p className="tracker-hero__lede">
              Hover any country for status. Click to pin its details. Prefer a sortable list?{' '}
              <Link to="/tracker/table">Open the table view</Link>.
            </p>
            <div className="tracker-hero__meta">
              <span>{total} jurisdictions tracked.</span>
            </div>
            <p className="tracker-meta">Last updated {data.lastUpdated}.</p>
          </div>
          <div className="tracker-hero__aside">
            <Countdown target={data.deadline} />
          </div>
        </section>
        <MapSection />
      </main>
    </Layout>
  );
}
