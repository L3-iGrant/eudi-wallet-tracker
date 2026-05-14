import React from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import StatusTable from '@site/src/components/StatusTable';
import data from '@site/data/eudi-status.json';

export default function TrackerTable() {
  return (
    <Layout>
      <Head>
        <title>Table | EUDI Wallet Status Tracker</title>
        <meta name="description" content="Sortable, filterable table of EUDI Wallet rollout status across the EU 27, EEA, UK and Switzerland." />
      </Head>
      <main style={{width: '100%', maxWidth: 1280, margin: '0 auto', padding: '1.25rem 1.25rem 4rem', boxSizing: 'border-box'}}>
        <section className="tracker-hero">
          <div className="tracker-hero__text">
            <span className="tracker-hero__eyebrow">Table view</span>
            <h1>Sort, filter and compare jurisdictions.</h1>
            <p className="tracker-hero__lede">
              Every country we track, sortable on every column, filterable by status, Level of Assurance and group.
            </p>
            <p className="tracker-meta">Last updated {data.lastUpdated}.</p>
          </div>
        </section>
        <StatusTable />
      </main>
    </Layout>
  );
}
