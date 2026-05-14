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

1. **Launched in production**. A national wallet conforming to or actively converging to the EUDI Wallet rulebook is available to citizens at general-population scale. Evidence required: an official launch announcement, an app store listing, or a primary source confirming live availability.

2. **Public pilot live**. A publicly accessible test or beta version is available, typically with a sandbox or developer playground. Evidence required: a public URL where third parties can sign up or fetch the wallet.

3. **Closed pilot or LSP only**. Work is happening inside a Large Scale Pilot or a closed national programme but is not yet available to the public. Evidence required: an LSP deliverable, a ministry announcement, or a published implementation plan.

4. **Notified eID, no wallet yet**. The country has a notified eID under eIDAS but no published EUDI Wallet implementation programme. Evidence required: the Commission's notified eID register or an absence of wallet announcements paired with the eID notification.

5. **No public plan**. No public evidence of an EUDI Wallet programme, beyond participation in EU coordination groups. Used sparingly.

6. **Unknown**. We do not have enough public evidence to place the country in any of the above. Used liberally rather than guessing.

## Evidence bar

We accept, in order of preference:

1. **Primary**: Member State ministry, agency, or designated wallet provider announcements; Commission notifications; LSP consortium publications; official sandbox or playground URLs.
2. **Secondary**: reputable industry press (Biometric Update, Identity Week, sector blogs by named experts at established vendors).
3. **Tertiary**: aggregator round-ups, used only when the underlying primary or secondary source is also linked.

Anonymous blog posts, vendor marketing material that doubles as analysis without disclosure, and AI-generated summaries without sources are not accepted.

## Source citation

Every entry must cite at least one source with a title, URL and date in `YYYY-MM-DD` format. The tracker's automation snapshots accepted source URLs to the Wayback Machine on merge so the citation survives link rot.

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

Maintainer name and contact: _to be filled in before launch_.

To raise an editorial concern, [open an issue](https://github.com/L3-iGrant/eudi-wallet-tracker/issues/new/choose) or email the address on the [about page](/about).
