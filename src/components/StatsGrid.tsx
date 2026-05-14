import React, {useEffect, useRef, useState} from 'react';
import data from '@site/data/eudi-status.json';
import {statusColour} from './StatusBadge';

type Props = {
  filterStatus?: string | null;
  onToggle?: (status: string) => void;
  animateOnMount?: boolean;
};

// Module-level flag, set after the chips animate the first time in a session.
// Prevents the count-up from re-firing on every client-side navigation.
let hasAnimatedThisSession = false;

function useCountUp(value: number, animate: boolean): number {
  const [n, setN] = useState(animate ? 0 : value);
  const ref = useRef<number>();
  useEffect(() => {
    if (!animate) {
      setN(value);
      return;
    }
    const start = performance.now();
    const dur = 700;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * value));
      if (p < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [value, animate]);
  return n;
}

function Chip({
  status,
  count,
  active,
  any,
  animate,
  onClick,
}: {
  status: string;
  count: number;
  active: boolean;
  any: boolean;
  animate: boolean;
  onClick: () => void;
}) {
  const display = useCountUp(count, animate);
  return (
    <li>
      <button
        type="button"
        className={
          'status-chip status-chip--button' +
          (active ? ' is-active' : '') +
          (any && !active ? ' is-muted' : '')
        }
        onClick={onClick}
        aria-pressed={active}
      >
        <span
          className="status-chip__dot"
          style={{background: statusColour(status)}}
          aria-hidden
        />
        <span className="status-chip__count">{display}</span>
        <span className="status-chip__label">{status}</span>
      </button>
    </li>
  );
}

export default function StatsGrid({filterStatus = null, onToggle, animateOnMount = true}: Props) {
  const counts: Record<string, number> = {};
  for (const c of data.countries as any[]) {
    counts[c.status] = (counts[c.status] || 0) + 1;
  }
  const any = filterStatus !== null;
  const shouldAnimate = animateOnMount && !hasAnimatedThisSession;
  useEffect(() => {
    if (shouldAnimate) hasAnimatedThisSession = true;
  }, [shouldAnimate]);
  return (
    <ul className="status-chiprow" aria-label="Status filter">
      {data.statusOrder.map((s) => (
        <Chip
          key={s}
          status={s}
          count={counts[s] || 0}
          active={filterStatus === s}
          any={any}
          animate={shouldAnimate}
          onClick={() => onToggle?.(s)}
        />
      ))}
    </ul>
  );
}
