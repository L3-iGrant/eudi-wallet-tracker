import React from 'react';

export type Status =
  | 'Launched in production'
  | 'Public pilot live'
  | 'Closed pilot or LSP only'
  | 'Notified eID, no wallet yet'
  | 'No public plan'
  | 'Unknown';

const statusToClass: Record<Status, string> = {
  'Launched in production': 'status-badge--launched',
  'Public pilot live': 'status-badge--pilot',
  'Closed pilot or LSP only': 'status-badge--closed',
  'Notified eID, no wallet yet': 'status-badge--eid-only',
  'No public plan': 'status-badge--no-plan',
  'Unknown': 'status-badge--unknown',
};

const statusToMapColour: Record<Status, string> = {
  'Launched in production': 'var(--map-launched)',
  'Public pilot live': 'var(--map-pilot)',
  'Closed pilot or LSP only': 'var(--map-closed)',
  'Notified eID, no wallet yet': 'var(--map-eid-only)',
  'No public plan': 'var(--map-no-plan)',
  'Unknown': 'var(--map-unknown)',
};

export function statusColour(status: string): string {
  return statusToMapColour[status as Status] ?? 'var(--map-unknown)';
}

export default function StatusBadge({status, children}: {status: string; children?: React.ReactNode}) {
  const cls = statusToClass[status as Status] ?? 'status-badge--unknown';
  return <span className={`status-badge ${cls}`}>{children ?? status}</span>;
}
