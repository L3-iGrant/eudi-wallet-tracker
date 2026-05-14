# EUDI Wallet Tracker

Open editorial record of EUDI Wallet readiness across the EU 27, EEA (Norway, Iceland, Liechtenstein), the UK and Switzerland. Anchored on the 21 December 2026 Member State obligation under Regulation (EU) 2024/1183.

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
<a href="https://eudi-tracker.igrant.io/tracker/france">
  <img alt="France EUDI Wallet status"
       src="https://eudi-tracker.igrant.io/badge/FR.svg" />
</a>
```

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
