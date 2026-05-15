# Contributing

Thanks for helping improve the iGrant.io EUDI Wallet Status Tracker.

The dataset is the one in `data/eudi-status.json`. Everything else (per-country MDX pages, SVG status badges, the table view, the map colours) is regenerated from that file.

## Quick paths

- **Comment**: scroll to the foot of any page and use the comments block (GitHub login required).
- **Open an issue**: choose a template at https://github.com/L3-iGrant/eudi-wallet-tracker/issues/new/choose
- **Edit a page**: every page has an "Edit this page" link in the footer. It opens GitHub's web editor.

## Editorial rules

- Every history entry needs a source URL with a date in `YYYY-MM-DD` format.
- Status changes are appended to `history`, never replacing existing entries.
- Corrections are NEW history entries with `"correction": true` and a one-line rationale.
- Use British English. No em dashes anywhere (en dashes are tolerated by the linter
  but discouraged in prose). Standards terminology stays in American spelling
  (`Authorization`, `Organization` in identifiers, SPDX `License`, etc.).
- Use "Unknown" liberally rather than guessing.
- Private-sector activity (companies headquartered in the country working on EUDI
  Wallet) goes in `privateActivity[]`. Roles are restricted to: `Wallet Provider`,
  `Issuer`, `Relying Party`, `QTSP`, `Verifier`, `Conformance`, `LSP partner`,
  `Open-source contributor`, `Other`.

See the full [methodology](docs/methodology.md) for the evidence bar and review cadence.

## Local dev

```sh
npm ci
npm run start            # http://localhost:2025
npm run lint:prose       # em-dash + British English check
npm run validate-data    # JSON schema check
npm run typecheck
npm run build
```

The `prestart` and `prebuild` hooks regenerate per-country MDX pages and SVG badges.
CI runs the prose linter, validator, typecheck and build on every PR; the prose
linter blocks the build on em dashes and on American spellings outside the
standards-terminology allow list.

## House style

- British English
- Concise prose, no filler caveats
- No em dashes, no en dashes
- Names of organisations: as they spell them themselves (so "iGrant.io", not "iGrant" or "iGrant.IO")
- Dates: `YYYY-MM-DD` in data; "21 December 2026" in prose

## Maintainers

- @L3-iGrant/tracker-editors review changes to `data/`, `docs/methodology.md` and `docs/contribute.md`
- @L3-iGrant/tracker-engineers review changes to code under `src/`, `scripts/` and the Docusaurus config
