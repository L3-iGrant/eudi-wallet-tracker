---
id: embed
title: Embed the tracker
sidebar_label: Overview
slug: /embedding
---

# Embed the tracker

The interactive readiness map can be dropped onto any third-party page through a single iframe. The embed surface lives at `/embed`, strips the site chrome (navbar, footer) and exposes a small set of URL parameters so the host page can control behaviour and visual style without forking the tracker.

## Basic snippet

```html
<iframe
  src="https://eudi-wallet-tracker.igrant.io/embed"
  width="100%" height="520" frameborder="0"
  loading="lazy" allowfullscreen
  referrerpolicy="no-referrer-when-downgrade"
  title="EUDI Wallet readiness across Europe">
</iframe>
```

For a layout that does not shift while the iframe loads, wrap it in an aspect-ratio container:

```html
<div style="aspect-ratio: 16 / 10; max-width: 1100px; margin: 0 auto;">
  <iframe
    src="https://eudi-wallet-tracker.igrant.io/embed"
    width="100%" height="100%" style="border: 0; display: block;"
    loading="lazy" allowfullscreen
    referrerpolicy="no-referrer-when-downgrade"
    title="EUDI Wallet readiness across Europe">
  </iframe>
</div>
```

## Query parameters

All parameters are optional. Unknown values fall back to the defaults.

| Parameter | Values | Effect |
| --- | --- | --- |
| `country` | ISO alpha-2 (e.g. `SE`) | Opens with that country pinned in the detail panel. |
| `pin` | ISO alpha-2 | Same as `country`. The canonical name used by the in-app map. |
| `status` | `Launched in production`, `Public pilot live`, `Closed pilot or LSP only`, `Notified eID, no wallet yet`, `No public plan`, `Unknown` | Pre-applies the status chip filter. |
| `legend` | `show` (default), `hide` | Hides the coloured status chip row above the map. |
| `chrome` | `full` (default), `minimal` | Hides the map toolbar title and the "View larger map" attribution at the bottom. |
| `host` | `igrant` | Applies a named host design preset. |
| `preset` | `igrant` | Alias of `host`. |

## Common patterns

**Open with a country pinned**

```
https://eudi-wallet-tracker.igrant.io/embed?country=SE
```

**Pre-filter to wallets in public pilot**

```
https://eudi-wallet-tracker.igrant.io/embed?status=Public%20pilot%20live
```

**Slim map-only mode** for tight host sections, with both the legend and chrome stripped so the map fills the iframe:

```
https://eudi-wallet-tracker.igrant.io/embed?legend=hide&chrome=minimal
```

**iGrant.io house style** combined with map-only mode:

```
https://eudi-wallet-tracker.igrant.io/embed?host=igrant&legend=hide&chrome=minimal
```

## Host presets

Host presets let third-party pages match the embed to their own design system without forking the tracker.

### `host=igrant`

Matches the conventions used on https://www.igrant.io:

- Heading font: `Byrd`, weight 300, uppercase, letter spacing 2px, word spacing 8px.
- Body font: `Plus Jakarta Sans`, loaded from Google Fonts inside the iframe.
- Primary CTAs: square outline buttons, 1px solid #000, uppercase, hover fills #000 with white text.
- Surface: white background with a 1px #cfcfcf top border.
- Link colour: #337ab7.

Live preview: [/embed?host=igrant](https://eudi-wallet-tracker.igrant.io/embed?host=igrant).

### Adding a new preset

Open a pull request that:

1. Adds the new preset name to `HOST_PRESETS` in `src/pages/embed.tsx`.
2. Adds a matching `body.is-embed.theme--<name>` CSS block in `src/css/custom.css` covering at minimum the surface colour, the heading and body fonts, the CTA button style and the link colour.
3. Updates the table above with a one-line description of the visual contract.

If the preset depends on a font that is not on Google Fonts, host the font file under `static/fonts/` and declare it with `@font-face` so the iframe can load it without inheriting from the parent page.

## Responsive layout

The embed wraps its status chip row onto multiple lines on narrow widths. At iframe widths under 768px the chip row may need an extra line and the toolbar buttons collapse to icon-only pills. To keep the map readable on narrow screens, give the iframe a taller aspect ratio on small viewports:

```css
.tracker-embed { aspect-ratio: 16 / 10; }

@media (max-width: 768px) {
  .tracker-embed { aspect-ratio: 4 / 5; }
}
```

## Attribution and licensing

The map data is published under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). When you embed the tracker, the default `chrome=full` mode shows a small "EUDI Wallet Status Tracker / View larger map" attribution at the bottom of the iframe. If you set `chrome=minimal` you are asked to provide equivalent attribution on the host page itself, for example:

```html
<p>
  Data source:
  <a href="https://eudi-wallet-tracker.igrant.io">EUDI Wallet Status Tracker by iGrant.io</a>
  (CC BY 4.0).
</p>
```

## Tracking embed traffic

The tracker does not run cross-origin analytics on third-party pages. If you want to measure how often visitors click through from your embed, append a UTM parameter on the iframe URL and on any outbound link you place near it:

```
https://eudi-wallet-tracker.igrant.io/embed?host=igrant&utm_source=acme_home
```

Sessions that flow from the embed into the canonical tracker will then carry the source through the tracker's own analytics.
