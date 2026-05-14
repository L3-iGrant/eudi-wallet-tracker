#!/usr/bin/env node
/**
 * Build-time generator: emits one MDX file per country into docs/tracker/
 * from data/eudi-status.json.
 *
 * Run on every `npm start` and `npm run build` via the pre-hooks in
 * package.json. Safe to commit the generated files; they are deterministic.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data', 'eudi-status.json');
const OUT = path.join(ROOT, 'docs', 'tracker');
const BADGE_DIR = path.join(ROOT, 'static', 'badge');

const data = JSON.parse(fs.readFileSync(DATA, 'utf-8'));

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function escapeMdx(s) {
  if (s == null) return '';
  return String(s).replace(/[{}<>]/g, (c) => ({'{': '\\{', '}': '\\}', '<': '&lt;', '>': '&gt;'}[c]));
}

function badgeSvg(country) {
  const status = country.status;
  const colour = {
    'Launched in production': '#15803d',
    'Public pilot live': '#2563eb',
    'Closed pilot or LSP only': '#f59e0b',
    'Notified eID, no wallet yet': '#b45309',
    'No public plan': '#dc2626',
    'Unknown': '#6b7280',
  }[status] ?? '#6b7280';

  const label = country.isoAlpha2;
  const value = status;
  // Rough width math; SVG remains responsive enough for badges.
  const labelW = 8 + label.length * 8;
  const valueW = 14 + value.length * 7;
  const totalW = labelW + valueW;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="22" role="img" aria-label="${label}: ${value}">
  <title>${country.name}: ${value}</title>
  <linearGradient id="g" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <rect width="${totalW}" height="22" rx="3" fill="#111827"/>
  <rect x="${labelW}" width="${valueW}" height="22" rx="3" fill="${colour}"/>
  <rect width="${totalW}" height="22" rx="3" fill="url(#g)"/>
  <g fill="#fff" font-family="Verdana,Geneva,sans-serif" font-size="11" text-anchor="middle">
    <text x="${labelW/2}" y="15">${label}</text>
    <text x="${labelW + valueW/2}" y="15">${value}</text>
  </g>
</svg>`;
}

function renderIgrantActivity(c) {
  const ig = c.igrantActivity;
  if (!ig || !ig.summary) return '';
  const parts = [];
  if (ig.lsps && ig.lsps.length) parts.push(`Via ${ig.lsps.join(', ')}`);
  if (ig.since) parts.push(`since ${ig.since}`);
  const meta = parts.length ? `<p className="igrant-callout__meta">${parts.join(' &middot; ')}</p>` : '';
  const link = ig.url
    ? `<a className="igrant-callout__link" href="${ig.url}" target="_blank" rel="noopener">Learn more &rarr;</a>`
    : '';
  return `
<aside className="igrant-callout" aria-label="iGrant.io activity">
  <span className="igrant-callout__eyebrow">iGrant.io in ${c.name}</span>
  <p className="igrant-callout__body">${escapeMdx(ig.summary)}</p>
  ${meta}
  ${link}
</aside>
`;
}

function renderPrivateActivity(c) {
  const items = c.privateActivity || [];
  if (!items.length) return '';
  const rows = items
    .map((p) => {
      const link = p.url
        ? `[${escapeMdx(p.company)}](${p.url})`
        : escapeMdx(p.company);
      const product = p.product ? ` &middot; ${escapeMdx(p.product)}` : '';
      const date = p.date ? ` &middot; ${p.date}` : '';
      const notes = p.notes ? `\n  ${escapeMdx(p.notes)}` : '';
      return `- **${link}** &middot; ${escapeMdx(p.role)}${product}${date}${notes}`;
    })
    .join('\n');
  return `## Private-sector activity

Companies headquartered in ${c.name} working in the EUDI Wallet ecosystem.

${rows}
`;
}

function renderCountry(c) {
  const slugged = slug(c.name);
  const sources = (c.sources || [])
    .map((s) => `- [${s.title}](${s.url}) (${s.date})`)
    .join('\n');
  const issuers = (c.notableIssuers || []).join(', ') || 'None recorded';
  const privateActivity = renderPrivateActivity(c);
  const igrantActivity = renderIgrantActivity(c);
  const description = c.notes
    ? c.notes.replace(/\n/g, ' ').slice(0, 155)
    : `${c.name} EUDI Wallet status: ${c.status}`;
  // Pick datePublished (earliest dated event) and dateModified (latest).
  const allDates = [
    c.launchOrPilotDate,
    ...(Array.isArray(c.sources) ? c.sources.map((s) => s.date) : []),
  ].filter(Boolean);
  const datePublished = allDates.length
    ? allDates.slice().sort()[0]
    : data.lastUpdated;
  const dateModified = allDates.length
    ? allDates.slice().sort().reverse()[0]
    : data.lastUpdated;
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${c.name}: ${c.status}`,
    description: description.replace(/"/g, '\\"'),
    inLanguage: 'en',
    datePublished,
    dateModified,
    author: {
      '@type': 'Organization',
      name: 'iGrant.io',
      url: 'https://www.igrant.io',
    },
    publisher: {
      '@type': 'Organization',
      name: 'iGrant.io',
      url: 'https://www.igrant.io',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://eudi-wallet-tracker.igrant.io/tracker/${slugged}`,
    },
    image: `https://eudi-wallet-tracker.igrant.io/badge/${c.isoAlpha2}.svg`,
    about: {
      '@type': 'Place',
      name: c.name,
      identifier: c.isoAlpha2,
    },
    isAccessibleForFree: true,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    keywords: [
      'EUDI Wallet',
      c.name,
      c.walletName,
      'eIDAS 2',
      c.status,
    ].filter(Boolean).join(', '),
  };

  return `---
id: ${slugged}
slug: /tracker/${slugged}
title: ${c.name}
description: ${escapeMdx(description)}
sidebar_label: ${c.name}
image: /img/og/${c.isoAlpha2}.png
keywords: [EUDI Wallet, ${c.name}, ${c.walletName ?? ''}, eIDAS 2]
---

import StatusBadge from '@site/src/components/StatusBadge';
import ShareBar from '@site/src/components/ShareBar';
import EmbedButton from '@site/src/components/EmbedButton';
import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">{\`${JSON.stringify(articleJsonLd).replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`}</script>
</Head>

# ${c.name}

<StatusBadge status="${c.status}" />

${c.notes ?? ''}
${igrantActivity}
## Profile

<dl className="country-meta">
  <div><dt>ISO code</dt><dd>${c.isoAlpha2}</dd></div>
  <div><dt>Group</dt><dd>${c.group}</dd></div>
  <div><dt>Wallet</dt><dd>${escapeMdx(c.walletName) || '-'}</dd></div>
  <div><dt>Provider</dt><dd>${escapeMdx(c.walletProvider) || '-'}</dd></div>
  <div><dt>Assurance level</dt><dd>${c.assuranceLevel ?? '-'}</dd></div>
  <div><dt>Launch / pilot date</dt><dd>${c.launchOrPilotDate ?? '-'}</dd></div>
  <div><dt>Notable issuers</dt><dd>${issuers}</dd></div>
  <div><dt>QTSP partner</dt><dd>${escapeMdx(c.qtspPartner) || '-'}</dd></div>
</dl>

${privateActivity}
## Sources

${sources || '_No sources recorded yet._'}

## Share

<ShareBar
  title="${c.name} EUDI Wallet status: ${c.status}"
  text="${c.name} EUDI Wallet status: ${c.status}. Source: iGrant.io EUDI Wallet Tracker."
/>

<EmbedButton iso="${c.isoAlpha2}" />

### Embed the status badge

A tiny SVG you can drop into any site, README or slide deck.

\`\`\`html
<a href="https://eudi-wallet-tracker.igrant.io/tracker/${slugged}">
  <img alt="${c.name} EUDI Wallet status"
       src="https://eudi-wallet-tracker.igrant.io/badge/${c.isoAlpha2}.svg" />
</a>
\`\`\`

![${c.name} badge](/badge/${c.isoAlpha2}.svg)

## Comments

Use the comments below to flag a missing source, a status change, or a correction. For larger edits, [open a pull request](https://github.com/L3-iGrant/eudi-wallet-tracker/edit/main/data/eudi-status.json).
`;
}

// Ensure directories exist
fs.mkdirSync(OUT, {recursive: true});
fs.mkdirSync(BADGE_DIR, {recursive: true});

// Write per-country MDX
for (const c of data.countries) {
  const file = path.join(OUT, `${slug(c.name)}.mdx`);
  fs.writeFileSync(file, renderCountry(c), 'utf-8');
}

// Write per-country SVG badges
for (const c of data.countries) {
  const file = path.join(BADGE_DIR, `${c.isoAlpha2}.svg`);
  fs.writeFileSync(file, badgeSvg(c), 'utf-8');
}

// Write sidebar category metadata.
// No `link` field: avoids registering a docs index at /tracker, which would
// otherwise conflict with the custom page in src/pages/tracker.tsx.
fs.writeFileSync(
  path.join(OUT, '_category_.json'),
  JSON.stringify({
    label: 'Countries',
    position: 2,
    collapsible: true,
    collapsed: true,
  }, null, 2),
);

console.log(
  `Generated ${data.countries.length} country MDX pages and ${data.countries.length} SVG badges.`,
);
