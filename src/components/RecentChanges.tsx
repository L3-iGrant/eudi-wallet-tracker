import React from 'react';
import Link from '@docusaurus/Link';
import data from '@site/data/eudi-status.json';
import StatusBadge from './StatusBadge';

const STATUS_SHORT: Record<string, string> = {
  'Production (EU Notified)': 'Live / Notified',
  'Production (EU Notification Pending)': 'Live / Pending',
  'Public Pilot': 'Public Pilot',
  'Closed Pilot / LSP': 'Closed Pilot / LSP',
  'Planned for Production': 'Planned',
  'No plans': 'No plan',
  'Unknown': 'Unknown',
};

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

type Event = {
  date: string;
  name: string;
  isoAlpha2: string;
  status: string;
  walletName?: string;
  walletProvider?: string;
  assuranceLevel?: string;
  notes?: string;
};

export default function RecentChanges({limit = 8}: {limit?: number}) {
  const events: Event[] = [];
  for (const c of data.countries as any[]) {
    const base = {
      name: c.name,
      isoAlpha2: c.isoAlpha2,
      status: c.status,
      walletName: c.walletName,
      walletProvider: c.walletProvider,
      assuranceLevel: c.assuranceLevel,
      notes: c.notes,
    };
    if (c.launchOrPilotDate) {
      events.push({...base, date: c.launchOrPilotDate});
    }
    if (Array.isArray(c.sources) && c.sources.length) {
      const latest = c.sources
        .filter((s: any) => s.date)
        .sort((a: any, b: any) => (a.date < b.date ? 1 : -1))[0];
      if (latest && (!c.launchOrPilotDate || latest.date > c.launchOrPilotDate)) {
        events.push({...base, date: latest.date});
      }
    }
  }

  const byCountry = new Map<string, Event>();
  for (const e of events.sort((a, b) => (a.date < b.date ? 1 : -1))) {
    if (!byCountry.has(e.name)) byCountry.set(e.name, e);
  }
  const rows = [...byCountry.values()]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit);

  return (
    <div className="recent-changes" role="list">
      {rows.map((e, i) => {
        const note = (e.notes || '').replace(/\s+/g, ' ').trim();
        const noteShort = note.length > 180 ? note.slice(0, 177).trimEnd() + '…' : note;
        return (
          <Link
            key={i}
            to={`/tracker/${slug(e.name)}`}
            className="recent-changes__item"
            role="listitem"
            aria-label={`Open ${e.name} profile`}
          >
            <span className="recent-changes__country">
              <span className="recent-changes__country-name">{e.name}</span>
              <span className="recent-changes__country-iso">
                {e.isoAlpha2}
                <span className="recent-changes__country-date"> &middot; {e.date}</span>
              </span>
            </span>
            <span className="recent-changes__status" title={e.status}>
              <StatusBadge status={e.status}>{STATUS_SHORT[e.status] ?? e.status}</StatusBadge>
            </span>
            <span className="recent-changes__detail">
              <span className="recent-changes__wallet-name">
                {e.walletName ?? '-'}
                {e.walletProvider && (
                  <span className="recent-changes__wallet-provider"> &middot; {e.walletProvider}</span>
                )}
              </span>
              {noteShort && <span className="recent-changes__note">{noteShort}</span>}
            </span>
            <span className="recent-changes__loa">
              {e.assuranceLevel ? (
                <>
                  <span className="recent-changes__loa-label">LoA</span>
                  <span className="recent-changes__loa-value">{e.assuranceLevel}</span>
                </>
              ) : null}
            </span>
            <span className="recent-changes__cta" aria-hidden>
              Open
              <svg width="14" height="14" viewBox="0 0 16 16">
                <path
                  d="M6 4l4 4-4 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
