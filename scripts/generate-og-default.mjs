#!/usr/bin/env node
/**
 * Build-time generator for the default OG card (1200x630 PNG).
 * Output: static/img/og-default.png. Uses the same satori + resvg pipeline
 * as the per-country cards so brand and silhouette styling stays in sync.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import satori from 'satori';
import {Resvg} from '@resvg/resvg-js';
import {feature} from 'topojson-client';
import {geoConicConformal, geoPath} from 'd3-geo';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data', 'eudi-status.json');
const OUT = path.join(ROOT, 'static', 'img', 'og-default.png');
const FONT_DIR = path.join(__dirname, 'fonts');
const TOPO = path.join(__dirname, 'world-atlas-50m.json');

const STATUS_COLOUR = {
  'Production (EU Notified)': '#15803d',
  'Production (EU Notification Pending)': '#5bd0a6',
  'Public Pilot': '#7fb7e5',
  'Closed Pilot / LSP': '#f5c871',
  'Planned for Production': '#a78bfa',
  'No plans': '#e37070',
  Unknown: '#dce0e6',
};

const SHORT = {
  'Production (EU Notified)': 'Live / Notified',
  'Production (EU Notification Pending)': 'Live / Pending',
  'Public Pilot': 'Public Pilot',
  'Closed Pilot / LSP': 'Closed Pilot / LSP',
  'Planned for Production': 'Planned',
  'No plans': 'No plan',
  Unknown: 'Unknown',
};

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="56" height="56">
  <rect width="32" height="32" rx="7" fill="#003399"/>
  <g fill="#FFCC00">
    <circle cx="16" cy="6" r="1.6"/>
    <circle cx="21" cy="7.34" r="1.6"/>
    <circle cx="24.66" cy="11" r="1.6"/>
    <circle cx="26" cy="16" r="1.6"/>
    <circle cx="24.66" cy="21" r="1.6"/>
    <circle cx="21" cy="24.66" r="1.6"/>
    <circle cx="16" cy="26" r="1.6"/>
    <circle cx="11" cy="24.66" r="1.6"/>
    <circle cx="7.34" cy="21" r="1.6"/>
    <circle cx="6" cy="16" r="1.6"/>
    <circle cx="7.34" cy="11" r="1.6"/>
    <circle cx="11" cy="7.34" r="1.6"/>
  </g>
</svg>`;
const LOGO_DATA_URI = `data:image/svg+xml;base64,${Buffer.from(LOGO_SVG).toString('base64')}`;

function renderSilhouette() {
  const topo = JSON.parse(fs.readFileSync(TOPO, 'utf-8'));
  const countries = feature(topo, topo.objects.countries);
  const projection = geoConicConformal()
    .rotate([-10, -54, 0])
    .center([0, 0])
    .parallels([40, 65])
    .scale(700)
    .translate([550, 280]);
  const pathBuilder = geoPath(projection);
  const paths = countries.features
    .map((f) => {
      const d = pathBuilder(f);
      if (!d) return null;
      return `<path d="${d}" fill="#0f172a" fill-opacity="0.07" />`;
    })
    .filter(Boolean)
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 560" width="1100" height="560">${paths}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function chip(s, count) {
  return {
    type: 'div',
    props: {
      style: {display: 'flex', alignItems: 'center', gap: '6px'},
      children: [
        {type: 'div', props: {style: {width: '10px', height: '10px', borderRadius: '999px', backgroundColor: STATUS_COLOUR[s] ?? '#94a3b8'}}},
        {type: 'span', props: {style: {fontSize: '15px', fontWeight: 700, color: '#0f172a'}, children: String(count)}},
        {type: 'span', props: {style: {fontSize: '15px', fontWeight: 500, color: '#475569'}, children: SHORT[s] ?? s}},
      ],
    },
  };
}

function tree(data, silhouetteUri) {
  const counts = {};
  for (const c of data.countries) counts[c.status] = (counts[c.status] || 0) + 1;
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '1200px',
        height: '630px',
        padding: '60px',
        backgroundColor: '#ffffff',
        backgroundImage: 'linear-gradient(135deg, #f4faf9 0%, #ffffff 60%)',
        fontFamily: 'Geist',
        color: '#0f172a',
        position: 'relative',
      },
      children: [
        {
          type: 'img',
          props: {
            src: silhouetteUri,
            width: 1100,
            height: 560,
            style: {position: 'absolute', top: '60px', right: '-180px'},
          },
        },
        {
          type: 'div',
          props: {
            style: {display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '40px'},
            children: [
              {type: 'img', props: {src: LOGO_DATA_URI, width: 44, height: 44, style: {borderRadius: '10px'}}},
              {
                type: 'div',
                props: {
                  style: {display: 'flex', flexDirection: 'column', lineHeight: 1.1},
                  children: [
                    {type: 'span', props: {style: {fontSize: '20px', fontWeight: 600}, children: 'iGrant.io'}},
                    {type: 'span', props: {style: {fontSize: '13px', fontWeight: 500, color: '#64748b', letterSpacing: '0.4px', marginTop: '4px'}, children: 'EUDI WALLET STATUS TRACKER'}},
                  ],
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {fontSize: '60px', fontWeight: 700, letterSpacing: '-1.6px', lineHeight: 1.05, marginBottom: '16px', maxWidth: '900px'},
            children: 'European Digital Identity Wallet Readiness Map',
          },
        },
        {
          type: 'div',
          props: {
            style: {fontSize: '22px', fontWeight: 500, color: '#475569', marginBottom: '40px', maxWidth: '760px'},
            children: 'Live adoption across Europe and beyond.',
          },
        },
        {
          type: 'div',
          props: {
            style: {display: 'flex', flexWrap: 'wrap', gap: '22px', marginBottom: '40px'},
            children: data.statusOrder.map((s) => chip(s, counts[s] || 0)),
          },
        },
        {type: 'div', props: {style: {flex: 1, display: 'flex'}, children: ''}},
        {
          type: 'div',
          props: {
            style: {display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid #e2e8f0'},
            children: [
              {
                type: 'div',
                props: {
                  style: {display: 'flex', flexDirection: 'column', lineHeight: 1.3},
                  children: [
                    {type: 'span', props: {style: {fontSize: '17px', fontWeight: 600, color: '#0f172a'}, children: 'eudi-wallet-tracker.igrant.io'}},
                    {type: 'span', props: {style: {fontSize: '14px', fontWeight: 500, color: '#64748b', marginTop: '4px'}, children: `Updated ${data.lastUpdated} · ${data.countries.length} jurisdictions tracked`}},
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
}

async function main() {
  const data = JSON.parse(fs.readFileSync(DATA, 'utf-8'));
  const fontRegular = fs.readFileSync(path.join(FONT_DIR, 'Geist-Regular.ttf'));
  const fontBold = fs.readFileSync(path.join(FONT_DIR, 'Geist-Bold.ttf'));
  const silhouette = renderSilhouette();
  const svg = await satori(tree(data, silhouette), {
    width: 1200,
    height: 630,
    fonts: [
      {name: 'Geist', data: fontRegular, weight: 500, style: 'normal'},
      {name: 'Geist', data: fontBold, weight: 700, style: 'normal'},
    ],
  });
  const png = new Resvg(svg, {fitTo: {mode: 'width', value: 1200}}).render().asPng();
  fs.writeFileSync(OUT, png);
  console.log('Generated default OG card.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
