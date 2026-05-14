# Security policy

## Reporting a vulnerability

If you discover a security vulnerability in the EUDI Wallet Status Tracker
(this repository), please report it privately. **Do not open a public
GitHub issue for vulnerabilities.**

Two preferred channels:

1. **GitHub private vulnerability reporting**: open a draft advisory at
   <https://github.com/L3-iGrant/eudi-wallet-tracker/security/advisories/new>.
2. **Email**: send the details to **support@igrant.io** with the subject
   line `SECURITY: eudi-wallet-tracker`. PGP key fingerprint available on
   request.

Please include:

- A description of the vulnerability and its potential impact.
- Steps to reproduce, ideally a minimal proof of concept.
- The commit SHA or release tag where the vulnerability is present.
- Any suggested mitigation, if you have one.

## Response timeline

- We will acknowledge receipt within **3 working days**.
- We will provide an initial assessment within **10 working days**.
- We will work with you on a coordinated disclosure timeline. Default
  embargo is 90 days from acknowledgement, which can be shortened or
  extended by mutual agreement.

## Scope

In scope:

- The Docusaurus site code under `src/`, `scripts/`, `docs/`,
  `docusaurus.config.ts`, `sidebars.ts`.
- The build pipeline and GitHub Actions in `.github/workflows/`.
- The data validator and prose linter in `scripts/`.

Out of scope (please report upstream):

- Vulnerabilities in third-party dependencies (e.g. Docusaurus,
  react-simple-maps, Giscus, Cloudflare Pages). We will track upstream
  fixes and update.
- Issues with the world-atlas TopoJSON CDN content. Please report to
  <https://github.com/topojson/world-atlas>.

## Recognition

If you would like to be credited in the published advisory, let us know in
your report. Anonymity is also fine.
