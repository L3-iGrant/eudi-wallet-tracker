import React, {useEffect, useState} from 'react';

function formatTargetDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export default function Countdown({target = '2026-12-24'}: {target?: string}) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const targetDate = new Date(`${target}T00:00:00Z`);
  const ms = targetDate.getTime() - now.getTime();
  const days = Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
  const weeks = Math.max(0, Math.round(days / 7));

  return (
    <div className="countdown-card" role="status" aria-label={`${weeks} weeks to ${target}`}>
      <span className="countdown-card__eyebrow">Weeks to deadline</span>
      <span className="countdown-card__number">{weeks.toLocaleString('en-GB')}</span>
      <span className="countdown-card__target">{formatTargetDate(target)}</span>
    </div>
  );
}
