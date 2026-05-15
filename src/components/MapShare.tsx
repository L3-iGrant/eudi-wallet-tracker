import React, {useCallback, useEffect, useRef, useState} from 'react';
import data from '@site/data/eudi-status.json';
import {statusColour} from './StatusBadge';

type Country = (typeof data.countries)[number];

type Props = {
  /** CSS selector for the rendered map SVG. */
  svgSelector?: string;
  /** ISO alpha-2 of a pinned country whose detail card should be rendered. */
  pinnedIso?: string | null;
};

const FALLBACK_ORIGIN = 'https://eudi-wallet-tracker.igrant.io';
const SHARE_TITLE = 'EUDI Wallet Tracker';

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getOrigin(): string {
  return typeof window !== 'undefined' ? window.location.origin : FALLBACK_ORIGIN;
}

function buildShare(pinned: Country | null): {url: string; text: string} {
  const origin = getOrigin();
  if (pinned) {
    return {
      url: `${origin}/tracker/${slug(pinned.name)}`,
      text: `${pinned.name}: ${pinned.status}. EUDI Wallet rollout — updated ${data.lastUpdated}.`,
    };
  }
  return {
    url: `${origin}/`,
    text: `EUDI Wallet readiness across the EU, EEA, UK and Switzerland. Updated ${data.lastUpdated}.`,
  };
}

function encodeQuery(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

function IconLinkedIn() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        fill="currentColor"
        d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.37V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"
      />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        fill="currentColor"
        d="M17.47 14.38c-.3-.15-1.74-.86-2.01-.96-.27-.1-.46-.15-.66.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.66-1.6-.91-2.19-.24-.57-.49-.49-.66-.5l-.56-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.62.71.23 1.36.2 1.87.12.57-.08 1.74-.71 1.99-1.4.25-.69.25-1.28.17-1.4-.07-.12-.27-.2-.57-.34zM12.04 21.6h-.01a9.45 9.45 0 0 1-4.82-1.32l-.34-.21-3.59.94.96-3.5-.22-.36a9.42 9.42 0 0 1-1.45-5.04c0-5.21 4.25-9.45 9.47-9.45 2.53 0 4.9.99 6.69 2.78a9.4 9.4 0 0 1 2.77 6.68c0 5.21-4.25 9.45-9.46 9.45zm8.05-17.5A11.32 11.32 0 0 0 12.04 1C5.76 1 .65 6.1.64 12.36c0 2 .53 3.96 1.53 5.69L.55 24l6.07-1.59a11.4 11.4 0 0 0 5.42 1.38h.01c6.28 0 11.39-5.1 11.39-11.36 0-3.04-1.18-5.9-3.34-8.05z"
      />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}

function IconEmail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm0 2v.5l8 5 8-5V7H4zm16 2.62-7.45 4.66a1 1 0 0 1-1.1 0L4 9.62V17h16V9.62z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Inline computed fills + strokes from the live DOM onto a clone of the SVG,
 * so that the cloned SVG renders correctly in an image context (where external
 * stylesheets do not apply).
 */
function inlineStyles(original: SVGElement, clone: SVGElement) {
  const originalPaths = original.querySelectorAll('path');
  const clonePaths = clone.querySelectorAll('path');
  originalPaths.forEach((p, i) => {
    const cs = getComputedStyle(p);
    const target = clonePaths[i];
    if (!target) return;
    target.setAttribute('fill', cs.fill);
    target.setAttribute('stroke', cs.stroke);
    target.setAttribute('stroke-width', cs.strokeWidth);
    target.setAttribute('stroke-linejoin', cs.strokeLinejoin);
  });
  // Force-fill background rect if one is added later. For now, the wrapper bg
  // is painted onto the canvas itself.
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const trial = line ? `${line} ${w}` : w;
    if (ctx.measureText(trial).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = trial;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): Path2D {
  const p = new Path2D();
  if (typeof (p as any).roundRect === 'function') {
    (p as any).roundRect(x, y, w, h, r);
  } else {
    p.moveTo(x + r, y);
    p.lineTo(x + w - r, y);
    p.quadraticCurveTo(x + w, y, x + w, y + r);
    p.lineTo(x + w, y + h - r);
    p.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    p.lineTo(x + r, y + h);
    p.quadraticCurveTo(x, y + h, x, y + h - r);
    p.lineTo(x, y + r);
    p.quadraticCurveTo(x, y, x + r, y);
    p.closePath();
  }
  return p;
}

async function generateMapPng(svg: SVGElement, pinned: Country | null): Promise<Blob | null> {
  const clone = svg.cloneNode(true) as SVGElement;
  inlineStyles(svg, clone);
  // Ensure xmlns is set so the serialized SVG is a valid standalone image.
  if (!clone.getAttribute('xmlns')) clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  // Strip filter refs that won't resolve outside the live DOM.
  clone.querySelectorAll('[filter]').forEach((el) => el.removeAttribute('filter'));

  const xml = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([xml], {type: 'image/svg+xml;charset=utf-8'});
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.crossOrigin = 'anonymous';

  return new Promise((resolve) => {
    img.onload = () => {
      // Canvas large enough for the map to render at full visible size.
      // Without a pin the canvas hugs the map; with a pin we widen to fit
      // the detail card side-by-side.
      const H = 1000;
      const W = pinned ? 1700 : 1320;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(null);
        return;
      }

      // Soft background gradient.
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(1, '#f3f4f6');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // Title (left-aligned).
      ctx.fillStyle = '#0f172a';
      ctx.font = '700 44px Geist, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", system-ui, sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText('European Digital Identity Wallet Readiness Map', 60, 56);

      ctx.fillStyle = '#475569';
      ctx.font = '500 22px Geist, -apple-system, "Inter", system-ui, sans-serif';
      ctx.fillText(
        `Readiness across the EU 27, EEA, UK and Switzerland · Updated ${data.lastUpdated}`,
        60,
        110,
      );

      // Map card sized for the 1320×1000 (or 1700×1000 with pin) canvas.
      const margin = 60;
      const mapY = 170;
      const mapH = 680;
      const radius = 22;
      const pinW = pinned ? 360 : 0;
      const pinGap = pinned ? 24 : 0;
      const innerPad = 16;
      const svgAspect = (img.naturalWidth || 1240) / (img.naturalHeight || 700);
      const drawH = mapH - innerPad * 2;
      const drawW = Math.min(drawH * svgAspect, W - margin * 2 - pinW - pinGap - innerPad * 2);
      const mapW = drawW + innerPad * 2;
      // Left-align everything: map card flush to the left margin.
      const mapX = margin;

      const cardPath = drawRoundedRect(ctx, mapX, mapY, mapW, mapH, radius);
      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.10)';
      ctx.shadowBlur = 28;
      ctx.shadowOffsetY = 14;
      ctx.fillStyle = '#ffffff';
      ctx.fill(cardPath);
      ctx.restore();
      ctx.save();
      ctx.clip(cardPath);
      const cardGrad = ctx.createLinearGradient(mapX, mapY, mapX, mapY + mapH);
      cardGrad.addColorStop(0, '#f4faf9');
      cardGrad.addColorStop(0.6, '#ffffff');
      ctx.fillStyle = cardGrad;
      ctx.fillRect(mapX, mapY, mapW, mapH);
      // Map artwork sits inside the card at exactly the computed drawW × drawH.
      const drawX = mapX + (mapW - drawW) / 2;
      const drawY = mapY + (mapH - drawH) / 2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.10)';
      ctx.stroke(cardPath);
      ctx.restore();

      // Pin detail card.
      if (pinned) {
        const pinX = mapX + mapW + pinGap;
        const pinPath = drawRoundedRect(ctx, pinX, mapY, pinW, mapH, radius);
        ctx.save();
        ctx.shadowColor = 'rgba(15, 23, 42, 0.10)';
        ctx.shadowBlur = 28;
        ctx.shadowOffsetY = 14;
        ctx.fillStyle = '#ffffff';
        ctx.fill(pinPath);
        ctx.restore();
        ctx.save();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.10)';
        ctx.stroke(pinPath);
        ctx.restore();

        const padX = 28;
        const colX = pinX + padX;
        const colW = pinW - padX * 2;
        let cy = mapY + 32;

        // Status dot
        ctx.fillStyle = readVar(statusColour(pinned.status));
        ctx.beginPath();
        ctx.arc(colX + 8, cy + 12, 8, 0, Math.PI * 2);
        ctx.fill();

        // Country name
        ctx.fillStyle = '#0f172a';
        ctx.font = '700 28px -apple-system, "SF Pro Display", "Inter", system-ui, sans-serif';
        ctx.textBaseline = 'top';
        ctx.fillText(pinned.name, colX + 28, cy);

        // ISO + group
        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 14px -apple-system, "Inter", system-ui, sans-serif';
        ctx.fillText(`${pinned.isoAlpha2} · ${pinned.group}`, colX + 28, cy + 36);

        cy += 64;

        // Status text
        ctx.fillStyle = '#475569';
        ctx.font = '500 16px -apple-system, "Inter", system-ui, sans-serif';
        ctx.fillText(pinned.status, colX, cy);
        cy += 32;

        // Field rows
        const drawField = (label: string, value: string) => {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '600 11px -apple-system, "Inter", system-ui, sans-serif';
          ctx.fillText(label.toUpperCase(), colX, cy);
          cy += 16;
          ctx.fillStyle = '#0f172a';
          ctx.font = '500 15px -apple-system, "Inter", system-ui, sans-serif';
          const lines = wrapText(ctx, value, colW);
          for (const ln of lines.slice(0, 3)) {
            ctx.fillText(ln, colX, cy);
            cy += 22;
          }
          cy += 6;
        };

        if (pinned.walletName) drawField('Wallet', pinned.walletName);
        if (pinned.walletProvider) drawField('Provider', pinned.walletProvider);
        if (pinned.assuranceLevel) drawField('Level of Assurance', pinned.assuranceLevel);
        if (pinned.launchOrPilotDate) drawField('Since', pinned.launchOrPilotDate);

        if (pinned.notes) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '600 11px -apple-system, "Inter", system-ui, sans-serif';
          ctx.fillText('NOTES', colX, cy);
          cy += 16;
          ctx.fillStyle = '#475569';
          ctx.font = '400 13px -apple-system, "Inter", system-ui, sans-serif';
          const noteLines = wrapText(ctx, pinned.notes, colW);
          const maxLines = Math.floor((mapY + mapH - 60 - cy) / 18);
          for (const ln of noteLines.slice(0, Math.max(0, maxLines))) {
            ctx.fillText(ln, colX, cy);
            cy += 18;
          }
        }
      }

      // Legend chips beneath the map, distributed across the map width.
      const chipY = mapY + mapH + 30;
      const counts: Record<string, number> = {};
      for (const c of data.countries as any[]) counts[c.status] = (counts[c.status] || 0) + 1;
      const countFont = '700 16px Geist, -apple-system, "Inter", system-ui, sans-serif';
      const labelFont = '500 16px Geist, -apple-system, "Inter", system-ui, sans-serif';
      const dotR = 6;
      const chipMeta = data.statusOrder.map((s) => {
        const count = String(counts[s] || 0);
        ctx.font = countFont;
        const countW = ctx.measureText(count).width;
        ctx.font = labelFont;
        const labelW = ctx.measureText(s).width;
        return {s, count, countW, labelW};
      });
      const innerGap = 7;
      let totalW = 0;
      for (const m of chipMeta) totalW += dotR * 2 + innerGap + m.countW + innerGap + m.labelW;
      const available = mapW;
      const slack = Math.max(0, available - totalW);
      const between = Math.max(14, slack / Math.max(1, chipMeta.length - 1));
      let chipX = mapX;
      for (const m of chipMeta) {
        ctx.fillStyle = readVar(statusColour(m.s));
        ctx.beginPath();
        ctx.arc(chipX + dotR, chipY + dotR + 2, dotR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.font = countFont;
        ctx.textBaseline = 'top';
        ctx.fillText(m.count, chipX + dotR * 2 + innerGap, chipY);
        ctx.fillStyle = '#475569';
        ctx.font = labelFont;
        ctx.fillText(m.s, chipX + dotR * 2 + innerGap + m.countW + innerGap, chipY);
        chipX += dotR * 2 + innerGap + m.countW + innerGap + m.labelW + between;
      }

      // Subtle watermark inside the map card, bottom-right.
      // Inside the rounded card so it travels with any crop attempt.
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.36)';
      ctx.font = '500 11px -apple-system, "Inter", system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('eudi-wallet-tracker.igrant.io  ·  iGrant.io', mapX + mapW - 16, mapY + mapH - 12);
      ctx.restore();

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        resolve(blob);
      }, 'image/png', 0.95);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

function readVar(value: string): string {
  // value is like "var(--map-launched)". Read from :root.
  const match = /var\((--[a-z-]+)\)/.exec(value);
  if (!match) return value;
  const v = getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim();
  return v || '#94a3b8';
}

export default function MapShare({svgSelector = '.europe-map', pinnedIso = null}: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pinnedCountry: Country | null = pinnedIso
    ? ((data.countries as Country[]).find((c) => c.isoAlpha2 === pinnedIso) ?? null)
    : null;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const onDownload = useCallback(async () => {
    const svg = document.querySelector(svgSelector) as SVGElement | null;
    if (!svg) return;
    setBusy(true);
    try {
      const blob = await generateMapPng(svg, pinnedCountry);
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `eudi-wallet-tracker-${data.lastUpdated}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }, [svgSelector, pinnedCountry]);

  const share = buildShare(pinnedCountry);

  const onCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(share.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }, [share.url]);

  const onNativeShare = useCallback(async () => {
    const svg = document.querySelector(svgSelector) as SVGElement | null;
    if (navigator.share && svg) {
      const blob = await generateMapPng(svg, pinnedCountry);
      const files = blob
        ? [new File([blob], `eudi-wallet-tracker-${data.lastUpdated}.png`, {type: 'image/png'})]
        : undefined;
      try {
        if (files && navigator.canShare && navigator.canShare({files})) {
          await navigator.share({title: SHARE_TITLE, text: share.text, url: share.url, files});
        } else {
          await navigator.share({title: SHARE_TITLE, text: share.text, url: share.url});
        }
      } catch {
        /* user cancelled */
      }
      setOpen(false);
    }
  }, [svgSelector, pinnedCountry, share.text, share.url]);

  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?${encodeQuery({url: share.url})}`;
  const whatsapp = `https://wa.me/?${encodeQuery({text: `${share.text} ${share.url}`})}`;
  const x = `https://twitter.com/intent/tweet?${encodeQuery({text: `${share.text} ${share.url}`})}`;
  const email = `mailto:?${encodeQuery({subject: SHARE_TITLE, body: `${share.text}\n\n${share.url}`})}`;

  return (
    <div className="map-share" ref={wrapRef}>
      <button
        type="button"
        className="europe-map__btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        title="Share map"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
          <path
            d="M11.5 5.5L8 2 4.5 5.5M8 2v9M3 11v2.5A1.5 1.5 0 004.5 15h7a1.5 1.5 0 001.5-1.5V11"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Share</span>
      </button>
      {open && (
        <div className="map-share__menu" role="menu">
          <div className="map-share__heading">Share to</div>
          <div className="map-share__grid">
            <a
              className="map-share__chip map-share__chip--linkedin"
              href={linkedin}
              target="_blank"
              rel="noopener"
              role="menuitem"
              title="Share on LinkedIn"
            >
              <IconLinkedIn />
              <span>LinkedIn</span>
            </a>
            <a
              className="map-share__chip map-share__chip--whatsapp"
              href={whatsapp}
              target="_blank"
              rel="noopener"
              data-action="share/whatsapp/share"
              role="menuitem"
              title="Share on WhatsApp"
            >
              <IconWhatsApp />
              <span>WhatsApp</span>
            </a>
            <a
              className="map-share__chip map-share__chip--x"
              href={x}
              target="_blank"
              rel="noopener"
              role="menuitem"
              title="Share on X"
            >
              <IconX />
              <span>X</span>
            </a>
            <a
              className="map-share__chip map-share__chip--email"
              href={email}
              role="menuitem"
              title="Share via email"
            >
              <IconEmail />
              <span>Email</span>
            </a>
          </div>
          <p className="map-share__hint">
            Image preview comes from the page&rsquo;s share card automatically.
          </p>
          <div className="map-share__divider" />
          <button
            type="button"
            className="map-share__item"
            onClick={onDownload}
            disabled={busy}
            role="menuitem"
          >
            <strong>{busy ? 'Rendering…' : 'Download PNG snapshot'}</strong>
            <span>{pinnedCountry ? '1700 × 1000, includes country card' : '1320 × 1000, social-ready'}</span>
          </button>
          {typeof navigator !== 'undefined' && (navigator as any).share && (
            <button type="button" className="map-share__item" onClick={onNativeShare} role="menuitem">
              <strong>Share via device&hellip;</strong>
              <span>Uses the system share sheet, attaches the PNG</span>
            </button>
          )}
          <button type="button" className="map-share__item" onClick={onCopyLink} role="menuitem">
            <strong>{copied ? 'Link copied' : 'Copy link'}</strong>
            <span>{share.url}</span>
          </button>
        </div>
      )}
    </div>
  );
}
