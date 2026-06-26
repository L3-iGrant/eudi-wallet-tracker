---
id: methodology
slug: /methodology
title: Methodology
sidebar_position: 10
---

# Methodology

This page is the editorial contract for the tracker. It defines what each status means, what evidence we accept, and how changes flow.

## Status categories

We use six categories, in display order from most advanced to least:

1. **Production (EU Notified)**. A national wallet conforming to the EUDI Wallet rulebook is available to citizens at general-population scale and is officially included on the EU trust list. Evidence required: An official launch announcement or app store listing, paired with verification of its status on the official EU trust list.

    > **What does "EU Notified" mean?** The EU trust list is the European Commission's official registry of notified eID schemes under the eIDAS regulation. Once a wallet is listed, it is recognised across all Member States. You can browse the registry at [EU Trust List Browser](https://eidas.ec.europa.eu/efda/trust-services/browser/#/).

2. **Production (EU Notification Pending)**. A national wallet is available to citizens at general-population scale, but it has not yet appeared on the official EU trust list. Evidence required: An official launch announcement, app store listing, or primary source confirming live availability, alongside its current absence from the EU trust list.

    > **What does "EU Notification Pending" mean?** The wallet is live and available to citizens but the Member State has not yet completed the EU notification process under eIDAS to have it added to the official EU trust list. This may be because the formal notification procedure is still underway or because the wallet is being operated without the official eIDAS notification having been finalised.

3. **Public Pilot**. A publicly accessible test version, beta app, sandbox, or developer playground is live. Citizens or third-party developers can actively download, test, or integrate with the wallet environment. Evidence required: A public URL where users can sign up for the beta, fetch the wallet app, or access the developer sandbox.

4. **Closed Pilot / LSP**. Active testing is underway within a Large Scale Pilot (LSP) or a restricted national programme, but access is limited to a closed user group and is not yet available to the general public. Evidence required: An LSP deliverable, a ministry announcement regarding pilot cohorts, or technical implementation updates showing active closed testing.

5. **Planned for Production**. The country has a confirmed political commitment, ministry announcement, or published implementation roadmap for an EUDI Wallet, but active piloting or production rollout has not yet begun. Evidence required: A published national strategy, legislative act, or official ministry timeline.

6. **No plans**. No public evidence of an active EUDI Wallet implementation programme, timeline, or roadmap, beyond baseline participation in mandatory EU coordination groups. Evidence required: An absence of public wallet announcements, roadmaps, or official development updates.

## Evidence bar

We accept, in order of preference:

1. **Primary**: Member State ministry, agency, or designated wallet provider announcements; Commission notifications; LSP consortium publications; official sandbox or playground URLs.
2. **Secondary**: reputable industry press (Biometric Update, Identity Week, sector blogs by named experts at established vendors).
3. **Tertiary**: aggregator round-ups, used only when the underlying primary or secondary source is also linked.

Anonymous blog posts, vendor marketing material that doubles as analysis without disclosure, and AI-generated summaries without sources are not accepted.

## Source citation

Every entry must cite at least one source with a title, URL and date in `YYYY-MM-DD` format. The tracker's automation snapshots accepted source URLs to the Wayback Machine on merge so the citation survives link rot.

## Large Scale Pilot (LSP) data

Participation in the five EU Large Scale Pilots is the authoritative basis for the `lspParticipation` field and, combined with other evidence, can justify a **Closed Pilot / LSP** status. The member lists below were retrieved from the European Commission's EU Digital Identity Wallet Collaboration Space:

- [EWC](https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/920064565/LSP-EWC)
- [POTENTIAL](https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/924976339/LSP-POTENTIAL)
- [NOBID](https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/924975315/LSP-NOBID)
- [DC4EU](https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/920064520/LSP-DC4EU)
- [APTITUDE](https://aptitude.digital-identity-wallet.eu/our-consortium/)
- [WE BUILD](https://www.webuildconsortium.eu/participating-organisations)

## History and corrections

- The `history` array on every country is **append-only**. Status changes are new entries, not edits.
- Typos and formatting fixes are edited in place.
- Corrections to facts are **new** history entries with `"correction": true` and a one-line rationale.
- Nothing is ever deleted.

The current status of a country is derived from the last entry in its history array.

## Review cadence

- Each country is reviewed at least monthly. A scheduled GitHub Action opens a "Monthly review YYYY-MM" issue on the 1st of each month, sorted by oldest history entry.
- Any single country is reviewed whenever its sources update or a comment or issue flags new information.
- The maintainer aims to acknowledge new issues within five working days.

## Conflict of interest

iGrant.io is itself an identity vendor, providing Data Wallet and Organisation Wallet products in the EUDI ecosystem. The tracker is maintained editorially. Status assessments are not endorsements of any specific wallet provider, including iGrant.io. Where a country's wallet has a known iGrant.io involvement, the country page must disclose that explicitly.

## Licence

- **Code**: EUPL-1.2
- **Data** (`data/eudi-status.json` and the generated MDX): CC BY 4.0

## Maintainer

Maintainers:

- Benjamin Hansson
- George Padayatti
- Lal Chandran
- Sruthi Singareddy

To raise an editorial concern, [open an issue](https://github.com/L3-iGrant/eudi-wallet-tracker/issues/new/choose) or email the address on the [about page](/about).
