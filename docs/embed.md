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
| `host` | `default` | Applies a named host design preset. |
| `preset` | `default` | Alias of `host`. |

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

**Maintainer house style** combined with map-only mode:

```
https://eudi-wallet-tracker.igrant.io/embed?host=default&legend=hide&chrome=minimal
```

## Host presets

Host presets let third-party pages match the embed to their own design system without forking the tracker.

### `host=default`

The maintainer house style:

- Heading font: `Byrd`, weight 300, uppercase, letter spacing 2px, word spacing 8px.
- Body font: `Plus Jakarta Sans`, loaded from Google Fonts inside the iframe.
- Primary CTAs: square outline buttons, 1px solid #000, uppercase, hover fills #000 with white text.
- Surface: white background with a 1px #cfcfcf top border.
- Link colour: #337ab7.

Live preview: [/embed?host=default](https://eudi-wallet-tracker.igrant.io/embed?host=default).

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

## Use on Markdown surfaces (LinkedIn, GitHub, Medium)

Most Markdown environments strip `<iframe>` tags for security, so the live interactive embed will not render on a LinkedIn article, a Medium post, a GitHub README or a Substack issue. In those places, link to the canonical tracker (or a country page) and use the auto-generated Open Graph card as a static hero image.

The OG card lives at a predictable path for every page:

- Home: `https://eudi-wallet-tracker.igrant.io/img/og-default.png`
- Per country: `https://eudi-wallet-tracker.igrant.io/img/og/{ISO-alpha-2}.png`

### LinkedIn articles

LinkedIn does not render arbitrary iframes. Two patterns work:

1. **Paste the URL on its own line.** LinkedIn's editor auto-unfurls the link into a card with title, description and the OG image. No image upload required.
2. **Attach the OG image manually** and link to the tracker in the caption when you want explicit control over the visual:

   ```markdown
   ![EUDI Wallet readiness across Europe](https://eudi-wallet-tracker.igrant.io/img/og-default.png)

   See the live tracker: https://eudi-wallet-tracker.igrant.io/
   ```

### GitHub README, issues, PRs and gists

GitHub's HTML sanitiser strips iframes. Use a clickable image:

```markdown
[![EUDI Wallet readiness across Europe](https://eudi-wallet-tracker.igrant.io/img/og-default.png)](https://eudi-wallet-tracker.igrant.io/)
```

For a single country:

```markdown
[![Sweden EUDI Wallet status](https://eudi-wallet-tracker.igrant.io/img/og/SE.png)](https://eudi-wallet-tracker.igrant.io/tracker/sweden/)
```

### Medium, Substack, Hashnode, Dev.to

These platforms also strip iframes. The same image-plus-link pattern works:

```markdown
[![EUDI Wallet readiness across Europe](https://eudi-wallet-tracker.igrant.io/img/og-default.png)](https://eudi-wallet-tracker.igrant.io/)
```

### What works where

| Surface | Live iframe | Image embed | Auto-unfurl on URL paste |
| --- | --- | --- | --- |
| LinkedIn articles | No | Yes | Yes |
| GitHub README, issues, PRs, gists | No | Yes | No |
| Medium | No | Yes | Yes |
| Substack | No | Yes | Yes |
| Notion | Sometimes (via `/embed` block) | Yes | Yes |
| Hashnode, Dev.to | No | Yes | Yes |
| MDX (Docusaurus, Astro, Next.js docs) | Yes | Yes | Not applicable |
| Hugo, Jekyll with raw HTML enabled | Yes | Yes | Not applicable |
| Obsidian, Bear, VSCode preview | Usually yes | Yes | Not applicable |

If a surface ever adds iframe support, the existing `/embed` URL works as-is. No tracker changes are required.

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
https://eudi-wallet-tracker.igrant.io/embed?host=default&utm_source=acme_home
```

Sessions that flow from the embed into the canonical tracker will then carry the source through the tracker's own analytics.
