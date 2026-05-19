# EUDI Wallet Status Tracker

[![CI](https://github.com/L3-iGrant/eudi-wallet-tracker/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/L3-iGrant/eudi-wallet-tracker/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/L3-iGrant/eudi-wallet-tracker/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/L3-iGrant/eudi-wallet-tracker/actions/workflows/deploy.yml)
[![Security](https://github.com/L3-iGrant/eudi-wallet-tracker/actions/workflows/security.yml/badge.svg?branch=main)](https://github.com/L3-iGrant/eudi-wallet-tracker/actions/workflows/security.yml)
[![Last commit](https://img.shields.io/github/last-commit/L3-iGrant/eudi-wallet-tracker/main?label=last%20commit)](https://github.com/L3-iGrant/eudi-wallet-tracker/commits/main)
[![Open issues](https://img.shields.io/github/issues/L3-iGrant/eudi-wallet-tracker?label=open%20issues)](https://github.com/L3-iGrant/eudi-wallet-tracker/issues)
[![Open PRs](https://img.shields.io/github/issues-pr/L3-iGrant/eudi-wallet-tracker?label=open%20PRs)](https://github.com/L3-iGrant/eudi-wallet-tracker/pulls)
[![Code: EUPL-1.2](https://img.shields.io/badge/code-EUPL--1.2-1d4ed8.svg)](./LICENSE)
[![Data: CC BY 4.0](https://img.shields.io/badge/data-CC%20BY%204.0-0ea5e9.svg)](./DATA-LICENSE)
[![Contributor Covenant 2.1](https://img.shields.io/badge/code%20of%20conduct-Contributor%20Covenant%202.1-4baaaa.svg)](./CODE_OF_CONDUCT.md)
[![Anchor: Regulation (EU) 2024/1183](https://img.shields.io/badge/anchor-Regulation%20(EU)%202024%2F1183-1d4ed8)](https://eur-lex.europa.eu/eli/reg/2024/1183/oj)
[![Site: eudi-wallet-tracker.igrant.io](https://img.shields.io/badge/site-eudi--wallet--tracker.igrant.io-0ea5e9)](https://eudi-wallet-tracker.igrant.io)

Open editorial record of EUDI Wallet readiness across the EU 27, EEA (Norway, Iceland, Liechtenstein), the UK and Switzerland. Anchored on the 24 December 2026 Member State obligation under Regulation (EU) 2024/1183.

Built with Docusaurus 3. Comments via Giscus (GitHub Discussions). Edits via GitHub Pull Requests.

## Quick start

```sh
npm ci
npm run start            # http://localhost:2025
```

That runs `scripts/generate-country-pages.mjs` first, which writes one MDX page per country into `docs/tracker/` and one SVG status badge into `static/badge/` from `data/eudi-status.json`.

## Build

```sh
npm run build
```

## Repo layout

```
data/
  eudi-status.json         # source of truth, edit this
docs/
  intro.md                 # overview
  methodology.md           # editorial policy
  contribute.md            # how to suggest changes
  changelog.md             # placeholder, regenerated from history
  about.md                 # iGrant.io, maintainer, licences
  lsp/                     # one page per Large Scale Pilot
  tracker/                 # auto-generated per-country MDX (do not edit by hand)
src/
  components/              # EuropeMap (with Maximise toggle), StatusTable, StatsGrid (chip row),
                           # Countdown (weeks), RecentChanges, StatusBadge, ShareBar, Giscus, Legend
  pages/                   # / (home with map hero), /tracker (map), /tracker/table
  theme/DocItem/Footer/    # swizzled to inject ShareBar + comments
  css/custom.css           # Apple-style theme (SF / Inter, hairlines, soft shadows, status pastels)
scripts/
  generate-country-pages.mjs   # emits per-country MDX (incl. private-sector activity section)
  validate-data.mjs            # JSON schema check
  lint-prose.mjs               # blocks em dashes, enforces British English
static/
  badge/                   # auto-generated per-country status SVGs
.github/
  ISSUE_TEMPLATE/          # status-change, source-addition, correction
  PULL_REQUEST_TEMPLATE.md
  workflows/ci.yml
  workflows/monthly-review.yml
docusaurus.config.ts
sidebars.ts
```

## Updating the data

1. Edit `data/eudi-status.json`.
2. Run `npm run start` to preview locally.
3. Open a pull request following `.github/PULL_REQUEST_TEMPLATE.md`.

CODEOWNERS routes data changes to the editorial team automatically.

## Sharing

Every page has a ShareBar with LinkedIn, X, Bluesky, Mastodon, Email, Web Share and Copy-link. Every country has an embeddable SVG badge under `/badge/{ISO}.svg`:

```html
<a href="https://eudi-wallet-tracker.igrant.io/tracker/france">
  <img alt="France EUDI Wallet status"
       src="https://eudi-wallet-tracker.igrant.io/badge/FR.svg" />
</a>
```

## Embed the live map

The interactive map can be embedded on any page (Google-Maps style) via an
iframe pointing at `/embed`:

```html
<iframe
  src="https://eudi-wallet-tracker.igrant.io/embed?country=SE"
  width="100%" height="520" frameborder="0"
  loading="lazy" allowfullscreen
  referrerpolicy="no-referrer-when-downgrade"
  title="EUDI Wallet readiness across Europe"
></iframe>
```

Optional query parameters:

| Param                       | Effect                                                                |
| --------------------------- | --------------------------------------------------------------------- |
| `?country=SE`               | Open with that country pinned in the side panel.                      |
| `?pin=SE`                   | Same as above (canonical name).                                       |
| `?status=Public pilot live` | Pre-apply the status chip filter.                                     |
| `?legend=hide`              | Hide the colored status chip row above the map.                       |
| `?attribution=hide`         | Hide only the bottom "EUDI Wallet Status Tracker / View larger map" strip. |
| `?chrome=minimal`           | Hide both the map toolbar AND the bottom attribution strip.           |
| `?host=default`             | Apply a named host design preset (alias: `?preset=default`).          |

Unknown values for `legend`, `chrome`, `host` and `preset` fall back to the
defaults.

### Host presets

Host presets let third-party pages match the embed to their own design system
without forking the tracker. Today the following preset ships:

| Preset    | Matches                                                                  |
| --------- | ------------------------------------------------------------------------ |
| `default` | Neutral base look: Title Case heading, rounded pill outline buttons, standard surface. Acts as a no-op on the visual layer so the embed reads as a clean, brand-agnostic widget on any host page. |

Add a new preset by extending `HOST_PRESETS` in `src/pages/embed.tsx` and
adding the matching `body.is-embed.theme--<name>` CSS block in
`src/css/custom.css`.

The embed surface omits all site chrome (navbar, footer) and includes a
small "View larger map" link back to the canonical tracker.

## Roadmap

See [`EXECUTION_PLAN.md`](EXECUTION_PLAN.md) for the phased plan (Phase 1 to 6),
or [Issues](https://github.com/L3-iGrant/eudi-wallet-tracker/issues) for current work.

Phases 1, 2 and 6 are live. The home page features the Apple-style refresh, with
the interactive map as the hero (Maximise / Minimise / Esc), a weeks-to-deadline
countdown, sleek status chip row, and editorially valuable sections in place of
source feeds. Per-country pages render private-sector activity when present in
`data/eudi-status.json`.

## Licence

- Code: EUPL-1.2
- Data: CC BY 4.0
