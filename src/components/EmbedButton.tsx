import React, {useCallback, useEffect, useRef, useState} from 'react';

const FALLBACK_ORIGIN = 'https://eudi-tracker.igrant.io';

function buildSnippet(iso?: string): string {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : FALLBACK_ORIGIN;
  const src = iso ? `${origin}/embed?country=${iso}` : `${origin}/embed`;
  return [
    '<iframe',
    `  src="${src}"`,
    '  width="100%" height="520" frameborder="0"',
    '  loading="lazy" allowfullscreen',
    '  referrerpolicy="no-referrer-when-downgrade"',
    '  title="EUDI Wallet readiness across Europe"',
    '></iframe>',
  ].join('\n');
}

type Props = {
  iso?: string;
  className?: string;
};

/**
 * Small button that opens a modal containing a copy-paste iframe snippet
 * for embedding the readiness map on a third-party page. Pre-fills with
 * `?country=ISO` when an `iso` prop is supplied (used on country pages).
 */
export default function EmbedButton({iso, className}: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const snippet = buildSnippet(iso);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked; user can still select-and-copy */
    }
  }, [snippet]);

  return (
    <>
      <button
        type="button"
        className={`embed-button ${className ?? ''}`.trim()}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Embed this map on another site"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
          <path
            d="M5.5 4.5L2 8l3.5 3.5M10.5 4.5L14 8l-3.5 3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Embed</span>
      </button>
      {open && (
        <div className="embed-modal__backdrop" role="presentation">
          <div
            ref={dialogRef}
            className="embed-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="embed-modal-title"
          >
            <div className="embed-modal__header">
              <strong id="embed-modal-title">Embed this map</strong>
              <button
                type="button"
                className="embed-modal__close"
                onClick={() => setOpen(false)}
                aria-label="Close"
                title="Close (Esc)"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
                  <path
                    d="M3.5 3.5l9 9M12.5 3.5l-9 9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <p className="embed-modal__intro">
              Drop this iframe into any page. Resize the height to suit your
              layout.{iso ? ' The map opens with this country pinned.' : ''}
            </p>
            <textarea
              className="embed-modal__code"
              value={snippet}
              readOnly
              rows={7}
              spellCheck={false}
              onFocus={(e) => e.currentTarget.select()}
            />
            <div className="embed-modal__actions">
              <button
                type="button"
                className="embed-modal__copy"
                onClick={onCopy}
              >
                {copied ? 'Copied' : 'Copy snippet'}
              </button>
              <a
                className="embed-modal__preview"
                href={iso ? `/embed?country=${iso}` : '/embed'}
                target="_blank"
                rel="noopener"
              >
                Preview embed &rarr;
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
