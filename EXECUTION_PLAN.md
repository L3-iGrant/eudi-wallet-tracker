# EUDI Wallet Rollout Tracker, execution plan

Single source of truth for the build. Hand to a developer or follow yourself.

Last edited: 13 May 2026
Owner: iGrant.io

> **Phase 1 status (May 2026)**: foundation, interactive map, status table, countdown,
> private-sector activity surface, Apple-style visual refresh, prose linting and CI gates
> are all live. See "Phase 1 status" notes inline below for what landed.

## Goal

Build the authoritative public tracker for EUDI Wallet rollout across the EU 27, EEA (Norway, Iceland, Liechtenstein) plus the UK and Switzerland for context. Anchored on the December 2026 Member State mandate under Regulation (EU) 2024/1183.

It serves two audiences:
1. **External**: journalists, policy analysts, vendors and EU institution staff who need a citable, dated, evidence-backed source.
2. **Internal**: iGrant.io product, sales and marketing teams tracking national readiness.

The tracker must be dynamic, interactive, commentable, and openly editable through a transparent contribution workflow.

## Stack

- **Framework**: Docusaurus 3, TypeScript template
- **Hosting**: Cloudflare Pages with `eudi-wallet-tracker.igrant.io` or `igrant.io/eudi-wallet-tracker`
- **Comments**: Giscus, backed by GitHub Discussions
- **Editorial workflow**: GitHub Issues and Pull Requests, with templates
- **Search**: Algolia DocSearch (free for open source docs)
- **Map**: react-simple-maps + d3-geo, loading Natural Earth TopoJSON
- **Table**: TanStack Table (react-table v8)
- **Charts** (later): Recharts for trend graphs
- **Licence**: EUPL-1.2 on code, CC BY 4.0 on data

## Information architecture

```
/                       Home (visual hero):
                          - Compact two-column hero: title + lede on the left,
                            Apple-style "weeks to deadline" countdown card on the right.
                          - Sleek status chip row.
                          - Interactive Europe map as the dominant feature (full
                            Iceland-to-Cyprus framing, Maximise toggle to fullscreen
                            with explicit Minimise / Exit full screen exit, Esc to close).
                          - Status definitions ("What each label really means").
                          - Latest status feed (date + country + status badge, no
                            external source titles surfaced).
                          - "Wallets you can install right now" cards for production
                            jurisdictions.
                          - At-a-glance numbers (% live or pilot, LoA "high" count,
                            top LSP membership).
                          - "Find the answer you actually came for" navigation cards.
/tracker                Interactive map view (same map and chip row as the home page).
/tracker/table          Sortable, filterable table view.
/tracker/{country}      Per-country page, e.g. /tracker/france. Includes:
                          - status badge, profile dl, sources list,
                          - "Private-sector activity" section (when the country has
                            private-sector entries), share bar, embed badge snippet,
                            comments.
/lsp/potential          One page per Large Scale Pilot.
/lsp/ewc
/lsp/nobid
/lsp/dc4eu
/lsp/we-build
/lsp/aptitude
/changelog              Chronological log of all status changes.
/methodology            Status definitions, evidence bar, review cadence.
/contribute             How to propose changes, add sources, submit corrections.
/about                  iGrant.io, maintainers, licences.
/feed.xml               Site-wide RSS.
/feed/{country}.xml     Per-country RSS.
/sitemap.xml            Auto-generated.
/badge/{ISO}.svg        Per-country embeddable status badge.
```

Every page has: search, language switcher (EN first), breadcrumb, edit-this-page link,
dark / light toggle. Sources and provenance live on country pages; the home page is
deliberately kept free of source-of-record citations to keep the editorial surface
concise.

## Data model

Single source of truth is `data/eudi-status.json`. One entry per country, with current status derived from the last history entry rather than stored separately. Schema:

```json
{
  "lastUpdated": "2026-05-13",
  "deadline": "2026-12-24",
  "countries": [
    {
      "name": "France",
      "isoAlpha2": "FR",
      "isoNumeric": "250",
      "group": "EU",
      "status": "Launched in production",
      "walletName": "France Identité",
      "walletProvider": "France Titres (ANTS)",
      "assuranceLevel": "high",
      "lspParticipation": ["POTENTIAL", "DC4EU", "EWC"],
      "launchOrPilotDate": "2024-04-17",
      "notableIssuers": ["PID", "mDL"],
      "qtspPartner": null,
      "notes": "...",
      "sources": [
        {"title": "France Identité Playground", "url": "https://playground.france-identite.gouv.fr/", "date": "2026-03-01"}
      ],
      "privateActivity": [
        {
          "company": "iGrant.io",
          "hqCountry": "SE",
          "role": "Wallet Provider",
          "product": "Data Wallet for EUDI",
          "url": "https://www.igrant.io/datawallet-for-eudi-wallet.html",
          "notes": "Open-source EUDI Wallet stack with issuer enablement, consent receipts and conformance tooling.",
          "date": "2025-09-01"
        }
      ],
      "history": [
        {"date": "2024-04-17", "status": "Launched in production", "summary": "France Identité goes live as a national identity wallet.", "sources": [...]}
      ]
    }
  ]
}
```

`privateActivity[]` (optional, per country) records private-sector EUDI Wallet
participants headquartered in that country. Roles must be one of:
`Wallet Provider`, `Issuer`, `Relying Party`, `QTSP`, `Verifier`, `Conformance`,
`LSP partner`, `Open-source contributor`, `Other`. `hqCountry` is ISO alpha-2.
`date` (YYYY-MM-DD) is the milestone or first-tracked date.

Status categories (in display order):
1. Launched in production
2. Public pilot live
3. Closed pilot or LSP only
4. Notified eID, no wallet yet
5. No public plan
6. Unknown

## Interactivity

**Comments**: Giscus injected into every page via a swizzled `DocItem/Footer` and a custom block on the home and tracker pages. One GitHub Discussions category per page, mapped by `pathname`. Anyone with a GitHub account can post. Anonymous comments not supported by design, to preserve accountability.

**Suggestions**: every page has an "Edit this page" link wired through Docusaurus' `editUrl`, pointing at the source MDX or JSON file on GitHub. Clicking it opens GitHub's web editor and creates a PR.

**Issue templates** for non-developers:
- `status-change.yml`: propose a status change for one country, with source URL and date
- `source-addition.yml`: add a new source to an existing entry
- `correction.yml`: report a factual error

**RSS**: feeds for the site as a whole and per country. Lets vendors and journalists subscribe.

**Map**: clickable, keyboard-navigable, colour-coded by status, with hatching as a secondary indicator for accessibility.

**Table**: sortable on every column, filter chips for status, LSP, assurance level, country group (EU / EEA / Other).

## Editorial workflow

1. Anyone opens an issue using one of the templates, or comments via Giscus, or opens a PR directly.
2. An iGrant.io maintainer (or delegated reviewer) checks the source against the methodology page's evidence bar.
3. If accepted, a history entry is appended to the country's `history` array in `eudi-status.json`. Typos are corrected in place. Status changes are always new history entries. Nothing is deleted.
4. Merging the PR triggers a Cloudflare Pages rebuild, which re-renders the country page, updates the changelog, updates the RSS feeds and re-bakes OG images.
5. A monthly review issue is opened automatically by a GitHub Action listing every country sorted by oldest history entry, so the laggards get attention.

## Phased build

### Phase 1, foundation (week 1)
1. Init Docusaurus 3 with the TypeScript template.
2. Configure theme: iGrant.io teal palette, Inter or Source Sans, light default, optional dark.
3. Wire up the sidebar IA matching the section above.
4. Drop `data/eudi-status.json` into the repo and add a JSON Schema in `data/schema.json` for validation.
5. Write `scripts/generate-country-pages.mjs` that emits one MDX file per country at build time.
6. Configure `editUrl` so every page has an edit link.

**Done when**: site builds locally with `npm run start`, sidebar matches IA, one auto-generated country page renders.

### Phase 2, interactive components (week 2)
7. `EuropeMap.tsx`: D3 + topojson + react-simple-maps, colour-coded by status, accessible. Stable hover tooltip with hovered country brought to top of paint order so the dark slate boundary stroke is never clipped by neighbours. Toolbar with Maximise toggle (and explicit Minimise / Exit full screen control + Esc) framed as a card with a soft gradient and grid pattern.
8. `StatusTable.tsx`: TanStack-style table with column filters, wrapped in a hairline-bordered card.
9. `Countdown.tsx`: live countdown to 24 December 2026, expressed in **weeks** (not days) on an Apple-style neutral surface card with a small status dot.
10. `RecentChanges.tsx`: most recent dated position per country (date + country + status badge + wallet name). Source titles are deliberately not surfaced; sources remain on country pages.
11. `StatusBadge.tsx`: reusable status pill, used on map tooltips, country pages, table cells. Refined pastel surfaces with a leading status dot.
12. `StatsGrid.tsx`: sleek inline status chip row (dot + count + label) in a pill container, sitting just above the map.
13. Embed everything on the home and `/tracker` pages.

**Done when**: map, table and countdown render correctly, clicking a country deep-links to its page, hover tooltip is stable, Maximise / Esc work end-to-end.

### Phase 3, comments and editorial workflow (week 2 to 3)
13. Create GitHub Discussions on the repo with one category per top-level section.
14. Install Giscus, configure mapping by `pathname`.
15. Swizzle `DocItem/Footer` to inject `<GiscusComments />`.
16. Add Giscus to home and `/tracker` pages via custom React mount.
17. Add `.github/ISSUE_TEMPLATE/` files.
18. Add `.github/PULL_REQUEST_TEMPLATE.md`.
19. Write `CONTRIBUTING.md` covering status definitions, evidence bar, review cadence, named maintainer.
20. Add `CODEOWNERS` so changes to `data/eudi-status.json` require editorial review.

**Done when**: a logged-in GitHub user can leave a comment, file an issue, or open a PR from the site.

### Phase 4, content and SEO (week 3)
21. Write Methodology page with the full editorial policy.
22. Write the six LSP pages.
23. Write About and Contribute pages.
24. Add JSON-LD: `Dataset` for the tracker, `Article` per country page, `BreadcrumbList`.
25. Add per-country and per-LSP RSS via a small custom Docusaurus plugin.
26. Auto-generate OG card images (1200x630) per country at build time using satori or Vercel OG.
27. Sitemap.xml with `lastmod` from history dates.
28. Apply for Algolia DocSearch.

**Done when**: Google Rich Results validator passes on the tracker landing page and at least three country pages.

### Phase 5, deploy and operate (week 3 to 4)
29. GitHub Actions for build, lint, JSON Schema validation on every PR.
30. Deploy to Cloudflare Pages on `main` push.
31. Custom domain configured.
32. Monthly review automation: a scheduled Action that opens a "Monthly review YYYY-MM" issue with a checklist sorted by oldest history entry.
33. Optional Phase 5+ automation: `scripts/refresh-status.ts` that crawls a curated list of source URLs weekly, emits `data/eudi-status.proposed.json` with PROPOSED history additions where signals have changed, opens a draft PR. Humans review and merge. The automation never auto-merges.

**Done when**: pushing to `main` deploys the site; the monthly review issue is created on the 1st of each month.

### Phase 6, visual refresh and editorial guardrails (landed May 2026)
34. **Apple-inspired theme overhaul** in `src/css/custom.css`: SF Pro / Inter typography stack, hairline borders, soft layered shadows, refined status pastels, translucent sticky navbar with backdrop blur, generous spacing, refined dark mode tokens.
35. **Map promoted to visual hero**: tighter Iceland-to-Cyprus framing (geoConicConformal, parallels [40, 65], scale 780, viewBox 1240x700), gradient + grid pattern frame card, clean dark-slate hover stroke with paint-order and elevation drop shadow, hovered country lifted to the top of the paint order.
36. **Map view controls**: Maximise toggle (full-viewport modal with Esc + explicit "Minimise" and "Exit full screen" buttons; body scroll lock while maximised).
37. **Newsletter-aligned hero**: two-column hero with a compact Apple-style countdown card on the right (weeks to deadline, target date, status dot), aligned to the H1 baseline.
38. **Home-page IA rewrite**: replaced source-feed and "How this works" with editorially valuable sections (status definitions, latest status without source titles, "Wallets you can install right now", at-a-glance numbers, "Find the answer you actually came for"). Sources remain on country pages.
39. **Private-sector activity**: `privateActivity[]` schema added to `data/eudi-status.json`, validator extended, country MDX generator emits a "Private-sector activity" section. iGrant.io seeded under Sweden as the working example.
40. **Prose linter** at `npm run lint:prose` (`scripts/lint-prose.mjs`):
    - Blocks em dashes (U+2014) anywhere in tracked prose.
    - Flags American spellings against a British-English rule set with a narrow allow list for standards terminology (`Authorization`, `Organization` in identifiers, `License` for SPDX, etc.).
    - Skips `package-lock.json`, `node_modules`, `build`, `.docusaurus`.
    - Wired into `.github/workflows/ci.yml` as the first quality gate.
41. **Port standardisation**: dev server (`npm start`) and `npm run serve` pinned to **port 2025**.

**Done when**: home page lands with the map fully visible, hover tooltip stable, Maximise / Esc / Minimise round-trip cleanly, `npm run lint:prose` returns clean, country pages emit the new private-sector section when data is present.

## Beyond December 2026, sustaining the tracker

The 24 December 2026 obligation is the launch milestone, not the end of the
story. The tracker is designed to keep earning attention well past that date
without becoming a stale countdown widget.

The pivot is from "Will Member State X be ready in time?" to
"Is Member State X's wallet actually working, useful and trusted?". Same data
spine, same editorial discipline, evolving lenses on top.

### What changes after the deadline passes

1. **Status taxonomy expands**. Today: production / pilot / closed pilot / no
   plan / unknown. From 2027: add operational sub-states like "available but
   <50% national coverage", "issuer outage", "RP integration backlog",
   "withdrawn or paused". Old statuses do not disappear, they migrate.
2. **Countdown rotates**. The 24 Dec 2026 hero countdown gives way to the
   next regulatory milestone (Article 5a, Implementing Acts review windows,
   QTSP audit cycles), then to a rolling "days since first national wallet"
   counter. The component stays, the target moves.
3. **Map colour scale** repurposed: a healthy live wallet stays green, but
   degraded operational health (incidents, outages, low adoption) shifts the
   country into a new amber tier. Methodology page documents the bar.

### New sections to add post-deadline

4. **Adoption metrics** per country, sourced from national digital agencies
   and ENISA: wallets installed, monthly active users, PID issuance rate,
   share of population with an active wallet. New JSON fields under
   `adoption: { activated, monthlyActive, asOf, source }`.
5. **Use-case directory**, aggregated across Member States: which sectors
   actually consume EUDI Wallet credentials (banking onboarding, healthcare,
   age verification, mobility, education, public administration, e-signing).
   New `/use-cases` index plus per-country links.
6. **Relying-party catalogue**: who actually accepts each national wallet,
   with last-tested date and supported credential types. Heavy long-term
   value for journalists, vendors and citizens.
7. **Cross-border interoperability scorecard**: which Member States accept
   which others' wallets for what. Matrix view at `/interop`. Reflects LSP
   outcomes once they wind down.
8. **Conformance and certification tracking**: per-wallet certification
   status against the EUDI Architecture and Reference Framework, including
   audit dates, lab references and gap reports.
9. **Incident log** per country, append-only, with severity, scope and
   resolution time. Same `history[]` discipline applied to operations.

### Editorial cadence shift

10. **Monthly review** continues, retargeted from "did anything launch?" to
    "are any live wallets degrading?". GitHub Action template updates
    automatically based on the `lastUpdated` date.
11. **Quarterly state-of-the-EUDI-Wallet brief** auto-generated from the
    dataset (markdown plus PDF export) and published as a permalinkable
    snapshot. Builds an ongoing citation surface.
12. **Annual report** in December anchored on the anniversary of the
    deadline.

### Engineering moves to keep cost flat

13. **Static-first** stays the rule. Every new view (use cases, RP catalogue,
    interop matrix) renders from `data/eudi-status.json` plus sibling files
    such as `data/use-cases.json`, `data/relying-parties.json`. No backend.
14. **Data partitioning**: split the monolithic JSON into per-country files
    once `data/eudi-status.json` exceeds ~3,000 lines, with a build-time
    aggregator. Keeps PRs reviewable.
15. **Source automation** (Phase 5+ in this plan) moves from "nice to have"
    to "essential": the bigger the dataset, the more the weekly crawler and
    PROPOSED-PR draft pattern earns its keep. Humans still sign off.
16. **Embeddable views**: the iframe widget and dynamic OG cards from the
    shareability roadmap keep the tracker visible in third-party content
    even when no big launch is happening that month.

### Funding and stewardship

17. **iGrant.io continues as steward** under the same EUPL-1.2 / CC BY 4.0
    licences. Editorial neutrality is documented on the methodology page.
18. **Co-maintainers** (named on the methodology page) absorb editorial load
    once monthly review volume rises. Targets: at least one analyst from a
    research institution, one from an LSP, one independent.
19. **Optional sponsored brief** track, clearly labelled, where vendors or
    Member States can commission deep-dives that link back to the tracker.
    Sponsorship never influences status calls; that wall is part of the
    methodology.
20. **Grant routes** for "EU digital public infrastructure observability"
    (NGI, eSSIF-Lab successor programmes, national digital agencies) keep
    automation work funded.

**Done when** (post-2026): the home page hero is no longer dominated by a
deadline countdown, the map shows operational health alongside readiness,
the use-case and RP directories are searchable, and the tracker is cited as
the default source for "is the EUDI Wallet actually working?" questions.

## Snapshots and shareability

Optimised for citation, embed and social sharing. Built in two waves.

**Phase 1 (already in this scaffold)**:
- **ShareBar** on every country page, the home page and the table page. Buttons for LinkedIn, X, Bluesky, Mastodon, Email, plus Web Share API on mobile and a Copy-link fallback.
- **Static SVG status badges** per country at `/badge/{ISO}.svg` (e.g. `/badge/FR.svg`). Embeddable in any site, README or slide deck. Click links back to the country page.
- **OpenGraph and Twitter card meta** so links unfurl nicely in messaging apps (WhatsApp, Telegram, Signal) and social platforms.

**Phase 4 to 5 (planned)**:
- **Dynamic OG cards per country** at 1200x630, generated at build time with satori or @vercel/og. Country flag, status pill, wallet name, last-updated date, faint map thumbnail, "iGrant.io EUDI Wallet Status Tracker" footer.
- **Snapshot generator page** (`/snapshot`) Carbon-for-code style: pick countries, filters, theme and aspect ratio (LinkedIn 1200x627, X 1200x675, Instagram 1080x1080, Story 1080x1920), get a downloadable PNG.
- **Compare cards** at `/compare?a=FR&b=NL` for side-by-side share assets aimed at journalists.
- **Embeddable iframe widget** at `/embed?country=FR` for blog posts, Notion, Medium. Each embed is a backlink.
- **Dated snapshot URLs** at `/snapshot/2026-05-13.png` so citers can deep-link to a frozen-in-time map.
- **Map evolution GIF** generated weekly from history, auto-attached to scheduled social posts. Genuinely novel for this topic.
- **"Receipt" Story format** vertical 9:16 cards for Instagram Stories and TikTok.
- **Annotated snapshots** where users add a one-line note that gets rendered into the image.
- **Live deadline countdown widget** embeddable for emails and decks.
- **Subscribe to country changes** via email (driven by RSS plus a small newsletter integration).

## House style

- **British English throughout**, with a narrow allow list for standards terminology
  that is American by spec (`Authorization`, `Organization` in identifiers, SPDX
  `License`, etc.). Enforced by `npm run lint:prose`.
- **No em dashes** (U+2014) anywhere. Use a comma, colon, semicolon or full stop.
  Enforced by the same linter and gated in CI.
- Concise prose. No filler caveats. No "it is important to note that".
- Every country data point cites a source URL with a date. Source titles live on
  country pages, not on the home page.
- "Unknown" is used liberally where evidence is thin.
- Status changes are appended to history, never overwritten.
- Corrections are NEW history entries with a `"correction": true` flag and a
  one-line rationale.
- Sources for status changes are recorded in `sources[]`. Private-sector
  activity in a country (companies headquartered there working on EUDI Wallet)
  is recorded in `privateActivity[]`.

## Costs (steady state)

- Cloudflare Pages: free
- GitHub: free for public repo
- Giscus + GitHub Discussions: free
- Algolia DocSearch: free for open source docs
- Domain: existing igrant.io

Total marginal cost: zero. Time cost: roughly four weeks of one developer to ship Phase 1 to 4, then a half-day per month for editorial review.

## Risks and mitigations

- **Source decay**: links rot. Mitigate by snapshotting every accepted source via Wayback Machine on PR merge, and storing the snapshot URL alongside the original in the JSON.
- **Hostile or low-quality comments**: GitHub Discussions has the standard GitHub moderation toolset. Auto-lock comments older than 12 months. Require GitHub login (no anonymous posting).
- **Vendor neutrality**: methodology page must disclose that iGrant.io is itself an identity vendor and that the tracker is editorial, not an endorsement.
- **Translation drift**: launch in English. Add other languages only when there is a named maintainer for each.
- **Scope creep**: keep the tracker focused on rollout status. Do not turn it into a wallet directory or a vendor leaderboard.

## Cite this tracker

> iGrant.io EUDI Wallet Status Tracker. Accessed YYYY-MM-DD. https://eudi-wallet-tracker.igrant.io/

Permalink format for country pages: `https://eudi-wallet-tracker.igrant.io/tracker/{country-slug}`
Permalink format for individual history entries: `https://eudi-wallet-tracker.igrant.io/tracker/{country-slug}#{YYYY-MM-DD}`

## Open decisions

- Final domain: `eudi-wallet-tracker.igrant.io` (sub-domain) or `igrant.io/eudi-wallet-tracker` (path)?
- Maintainer name listed on the methodology page?
- Initial set of LSP page authors?
