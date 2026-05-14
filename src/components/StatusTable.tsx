import React, {useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import data from '@site/data/eudi-status.json';
import StatusBadge from './StatusBadge';

type Country = any;

const STATUS_OPTIONS = data.statusOrder as string[];
const LOA_OPTIONS = ['low', 'substantial', 'high'];
const GROUP_OPTIONS = ['EU', 'EEA', 'Other'];

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function StatusTable() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>('');
  const [loa, setLoa] = useState<string>('');
  const [group, setGroup] = useState<string>('');
  const [sortKey, setSortKey] = useState<string>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const rows: Country[] = useMemo(() => {
    return data.countries
      .filter((c: Country) => !q || c.name.toLowerCase().includes(q.toLowerCase()))
      .filter((c: Country) => !status || c.status === status)
      .filter((c: Country) => !loa || c.assuranceLevel === loa)
      .filter((c: Country) => !group || c.group === group)
      .sort((a: Country, b: Country) => {
        const av = String(a[sortKey] ?? '');
        const bv = String(b[sortKey] ?? '');
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
  }, [q, status, loa, group, sortKey, sortDir]);

  function sortBy(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  return (
    <div>
      <div className="filter-bar">
        <div className="filter-bar__group">
          <label htmlFor="q">Search</label>
          <input
            id="q"
            type="search"
            placeholder="Country name"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="filter-bar__group">
          <label htmlFor="status">Status</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="filter-bar__group">
          <label htmlFor="loa">Assurance</label>
          <select id="loa" value={loa} onChange={(e) => setLoa(e.target.value)}>
            <option value="">All</option>
            {LOA_OPTIONS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
        <div className="filter-bar__group">
          <label htmlFor="group">Group</label>
          <select id="group" value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="">All</option>
            {GROUP_OPTIONS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>
        <div className="filter-bar__group" style={{alignSelf: 'flex-end'}}>
          <span style={{fontSize: '0.85rem', color: 'var(--tracker-text-muted)'}}>{rows.length} of {data.countries.length}</span>
        </div>
      </div>

      <div className="tracker-table-wrap" style={{overflowX: 'auto'}}>
        <table className="tracker-table">
          <thead>
            <tr>
              <th onClick={() => sortBy('name')}>Country</th>
              <th onClick={() => sortBy('walletName')}>Wallet</th>
              <th onClick={() => sortBy('status')}>Status</th>
              <th onClick={() => sortBy('assuranceLevel')}>LoA</th>
              <th onClick={() => sortBy('launchOrPilotDate')}>Date</th>
              <th>Sources</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const noteSnippet = (c.notes || '').replace(/\s+/g, ' ').trim();
              const noteShort =
                noteSnippet.length > 160 ? noteSnippet.slice(0, 157).trimEnd() + '…' : noteSnippet;
              return (
                <tr key={c.isoAlpha2}>
                  <td>
                    <Link to={`/tracker/${slug(c.name)}`}>
                      <strong>{c.name}</strong>
                    </Link>
                    <div className="row-meta">{c.isoAlpha2} · {c.group}</div>
                  </td>
                  <td>
                    {c.walletName}
                    {c.walletProvider && <div className="row-meta">{c.walletProvider}</div>}
                  </td>
                  <td>
                    <StatusBadge status={c.status} />
                    {noteShort && <div className="row-meta status-note">{noteShort}</div>}
                  </td>
                  <td>{c.assuranceLevel ?? '-'}</td>
                  <td>{c.launchOrPilotDate ?? '-'}</td>
                  <td>{(c.sources || []).length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
