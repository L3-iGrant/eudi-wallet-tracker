#!/usr/bin/env node
/**
 * Build-time generator for per-country OG cards (1200x630 PNG).
 * Runs after country MDX generation. Output: static/img/og/{ISO}.png.
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
const OUT_DIR = path.join(ROOT, 'static', 'img', 'og');
const FONT_DIR = path.join(__dirname, 'fonts');
const TOPO = path.join(__dirname, 'world-atlas-50m.json');

// iGrant.io brand mark: EU-blue rounded square with 12 yellow stars in a ring.
// Same composition as static/img/logo.svg, scaled to 56px for the OG cards.
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

// Europe silhouette: render the same set of jurisdictions as the live map,
// projected with matching parameters, exported as a single SVG path. Used
// as a faded background motif in the OG cards.
function renderEuropeSilhouette(highlightId) {
  const topo = JSON.parse(fs.readFileSync(TOPO, 'utf-8'));
  const countries = feature(topo, topo.objects.countries);
  const projection = geoConicConformal()
    .rotate([-10, -54, 0])
    .center([0, 0])
    .parallels([40, 65])
    .scale(700)
    .translate([550, 280]);
  const pathBuilder = geoPath(projection);
  // Render all geometries; tint the highlight country if any.
  const paths = countries.features
    .map((f) => {
      const d = pathBuilder(f);
      if (!d) return null;
      const highlight = highlightId && String(f.id).padStart(3, '0') === highlightId;
      const fill = highlight ? '#0d9488' : '#0f172a';
      const opacity = highlight ? 0.18 : 0.07;
      return `<path d="${d}" fill="${fill}" fill-opacity="${opacity}" />`;
    })
    .filter(Boolean)
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 560" width="1100" height="560">${paths}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

const STATUS_COLOUR = {
  'Production (EU Notified)': '#15803d',
  'Production (EU Notification Pending)': '#5bd0a6',
  'Public Pilot': '#7fb7e5',
  'Closed Pilot / LSP': '#f5c871',
  'Planned for Production': '#a78bfa',
  'No plans': '#e37070',
  Unknown: '#dce0e6',
};

const STATUS_FG = {
  'Production (EU Notified)': '#166534',
  'Production (EU Notification Pending)': '#166534',
  'Public Pilot': '#1e40af',
  'Closed Pilot / LSP': '#92400e',
  'Planned for Production': '#5b21b6',
  'No plans': '#991b1b',
  Unknown: '#475569',
};

const STATUS_BG = {
  'Production (EU Notified)': '#dcfce7',
  'Production (EU Notification Pending)': '#dcfce7',
  'Public Pilot': '#dbeafe',
  'Closed Pilot / LSP': '#fef3c7',
  'Planned for Production': '#f3e8ff',
  'No plans': '#fee2e2',
  Unknown: '#f1f5f9',
};

function card(c, lastUpdated, silhouetteUri) {
  const dot = STATUS_COLOUR[c.status] ?? '#94a3b8';
  const fg = STATUS_FG[c.status] ?? '#475569';
  const bg = STATUS_BG[c.status] ?? '#f1f5f9';
  const since = c.launchOrPilotDate ?? lastUpdated;
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
        backgroundImage:
          'linear-gradient(135deg, #f4faf9 0%, #ffffff 60%)',
        fontFamily: 'Geist',
        color: '#0f172a',
        position: 'relative',
      },
      children: [
        // Faded Europe silhouette in the background, anchored to the right side.
        {
          type: 'img',
          props: {
            src: silhouetteUri,
            width: 1100,
            height: 560,
            style: {
              position: 'absolute',
              top: '60px',
              right: '-180px',
              opacity: 1,
            },
          },
        },
        // Brand row
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginBottom: '40px',
            },
            children: [
              {
                type: 'img',
                props: {
                  src: LOGO_DATA_URI,
                  width: 44,
                  height: 44,
                  style: {borderRadius: '10px'},
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    lineHeight: 1.1,
                  },
                  children: [
                    {type: 'span', props: {style: {fontSize: '18px', fontWeight: 600}, children: 'iGrant.io'}},
                    {type: 'span', props: {style: {fontSize: '12px', fontWeight: 500, color: '#64748b', letterSpacing: '0.4px', marginTop: '2px'}, children: 'EUDI WALLET STATUS TRACKER'}},
                  ],
                },
              },
            ],
          },
        },
        // Status pill
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              alignSelf: 'flex-start',
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: bg,
              color: fg,
              fontSize: '16px',
              fontWeight: 600,
              marginBottom: '24px',
            },
            children: [
              {type: 'div', props: {style: {width: '8px', height: '8px', borderRadius: '999px', backgroundColor: dot}}},
              c.status,
            ],
          },
        },
        // Country name (huge)
        {
          type: 'div',
          props: {
            style: {
              fontSize: '88px',
              fontWeight: 700,
              letterSpacing: '-2.5px',
              lineHeight: 1.0,
              marginBottom: '8px',
            },
            children: c.name,
          },
        },
        // ISO + group
        {
          type: 'div',
          props: {
            style: {
              fontSize: '18px',
              fontWeight: 500,
              color: '#64748b',
              letterSpacing: '0.6px',
              marginBottom: '36px',
            },
            children: `${c.isoAlpha2} · ${c.group ?? ''}`.trim(),
          },
        },
        // Wallet block
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              marginBottom: '40px',
            },
            children: [
              {type: 'span', props: {style: {fontSize: '12px', fontWeight: 600, letterSpacing: '0.8px', color: '#94a3b8'}, children: 'WALLET'}},
              {type: 'span', props: {style: {fontSize: '24px', fontWeight: 600, color: '#0f172a'}, children: c.walletName ?? '-'}},
              c.walletProvider ? {type: 'span', props: {style: {fontSize: '16px', fontWeight: 500, color: '#475569'}, children: c.walletProvider}} : null,
            ].filter(Boolean),
          },
        },
        // Spacer
        {type: 'div', props: {style: {flex: 1, display: 'flex'}, children: ''}},
        // Footer row
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '20px',
              borderTop: '1px solid #e2e8f0',
              fontSize: '14px',
              color: '#64748b',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {display: 'flex', flexDirection: 'column', lineHeight: 1.3},
                  children: [
                    {type: 'span', props: {style: {fontSize: '16px', fontWeight: 600, color: '#0f172a'}, children: 'eudi-wallet-tracker.igrant.io'}},
                    {type: 'span', props: {style: {marginTop: '2px'}, children: `Updated ${lastUpdated}${c.assuranceLevel ? ` · LoA ${c.assuranceLevel}` : ''}${since && c.launchOrPilotDate ? ` · since ${c.launchOrPilotDate}` : ''}`}},
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
  fs.mkdirSync(OUT_DIR, {recursive: true});

  for (const c of data.countries) {
    const silhouette = renderEuropeSilhouette(c.isoNumeric);
    const tree = card(c, data.lastUpdated, silhouette);
    const svg = await satori(tree, {
      width: 1200,
      height: 630,
      fonts: [
        {name: 'Geist', data: fontRegular, weight: 500, style: 'normal'},
        {name: 'Geist', data: fontBold, weight: 700, style: 'normal'},
      ],
    });
    const png = new Resvg(svg, {fitTo: {mode: 'width', value: 1200}}).render().asPng();
    fs.writeFileSync(path.join(OUT_DIR, `${c.isoAlpha2}.png`), png);
  }
  console.log(`Generated ${data.countries.length} country OG cards.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
