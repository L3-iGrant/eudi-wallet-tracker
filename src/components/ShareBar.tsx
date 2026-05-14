import React, {useState} from 'react';

type Props = {
  title: string;
  url?: string;
  text?: string;
};

function buildUrl(): string {
  if (typeof window === 'undefined') return '';
  return window.location.href;
}

export default function ShareBar({title, url, text}: Props) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url ?? buildUrl();
  const shareText = text ?? title;

  const encoded = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const targets = [
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
      icon: 'in',
    },
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedText}`,
      icon: '𝕏',
    },
    {
      label: 'Bluesky',
      href: `https://bsky.app/intent/compose?text=${encodedText}%20${encoded}`,
      icon: 'bsky',
    },
    {
      label: 'Mastodon',
      href: `https://mastodonshare.com/?text=${encodedText}&url=${encoded}`,
      icon: '🐘',
    },
    {
      label: 'Email',
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodedText}%0A%0A${encoded}`,
      icon: '✉',
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      window.prompt('Copy permalink', shareUrl);
    }
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({title, text: shareText, url: shareUrl});
      } catch {
        /* user cancelled */
      }
    } else {
      await copyLink();
    }
  }

  const btnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.35rem 0.65rem',
    border: 'var(--tracker-border)',
    borderRadius: 6,
    background: 'var(--ifm-background-surface-color)',
    color: 'inherit',
    fontSize: '0.85rem',
    cursor: 'pointer',
    textDecoration: 'none',
  };

  return (
    <div
      role="group"
      aria-label="Share this page"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        margin: '1.25rem 0',
      }}
    >
      {targets.map((t) => (
        <a
          key={t.label}
          href={t.href}
          target="_blank"
          rel="noopener noreferrer"
          style={btnStyle}
          aria-label={`Share to ${t.label}`}
        >
          <span aria-hidden>{t.icon}</span>
          {t.label}
        </a>
      ))}
      <button type="button" onClick={copyLink} style={btnStyle}>
        {copied ? '✔ Copied' : '🔗 Copy link'}
      </button>
      <button
        type="button"
        onClick={nativeShare}
        style={btnStyle}
        aria-label="Share via system share sheet"
      >
        ⇪ Share
      </button>
    </div>
  );
}
