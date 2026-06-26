import React from 'react';

export type Status =
  | 'Production (EU Notified)'
  | 'Production (EU Notification Pending)'
  | 'Public Pilot'
  | 'Closed Pilot / LSP'
  | 'Planned for Production'
  | 'No plans'
  | 'Unknown';

const statusToClass: Record<Status, string> = {
  'Production (EU Notified)': 'status-badge--launched',
  'Production (EU Notification Pending)': 'status-badge--launched',
  'Public Pilot': 'status-badge--pilot',
  'Closed Pilot / LSP': 'status-badge--closed',
  'Planned for Production': 'status-badge--planned',
  'No plans': 'status-badge--no-plan',
  'Unknown': 'status-badge--unknown',
};

const statusToMapColour: Record<Status, string> = {
  'Production (EU Notified)': 'var(--map-launched)',
  'Production (EU Notification Pending)': 'var(--map-pending)',
  'Public Pilot': 'var(--map-pilot)',
  'Closed Pilot / LSP': 'var(--map-closed)',
  'Planned for Production': 'var(--map-planned)',
  'No plans': 'var(--map-no-plan)',
  'Unknown': 'var(--map-unknown)',
};

export function statusColour(status: string): string {
  return statusToMapColour[status as Status] ?? 'var(--map-unknown)';
}

export default function StatusBadge({status, children}: {status: string; children?: React.ReactNode}) {
  const cls = statusToClass[status as Status] ?? 'status-badge--unknown';
  return <span className={`status-badge ${cls}`}>{children ?? status}</span>;
}
