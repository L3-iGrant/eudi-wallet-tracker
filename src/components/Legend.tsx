import React from 'react';
import data from '@site/data/eudi-status.json';
import {statusColour} from './StatusBadge';

export default function Legend() {
  return (
    <div className="legend" role="list">
      {data.statusOrder.map((s) => (
        <div className="legend__item" role="listitem" key={s}>
          <span
            className="legend__swatch"
            style={{background: statusColour(s)}}
            aria-hidden
          />
          {s}
        </div>
      ))}
    </div>
  );
}
