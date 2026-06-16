import React from 'react';
import { COUNTRY_GRID, COUNTRY_LABELS } from '../../data/homeOptions';

function CountrySelectionPanel({ country1, country2, onCountryClick }) {
  return (
    <section>
      <p className="section-label mb-3">1. 국가 선택</p>
      <div className="flex items-center gap-2 mb-3 text-sm font-body text-muted">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
          국가 1
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-navy inline-block" />
          국가 2
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {COUNTRY_GRID.flat().map((cca2) => {
          const order = country1 === cca2 ? 1 : country2 === cca2 ? 2 : null;
          const selectedClass = order === 1
            ? 'border-accent bg-accent/5 text-accent scale-[1.06] shadow-sm z-10'
            : order === 2
            ? 'border-navy bg-navy/5 text-navy scale-[1.06] shadow-sm z-10'
            : 'border-border bg-cream text-muted hover:border-muted hover:text-ink';

          return (
            <button
              key={cca2}
              type="button"
              onClick={() => onCountryClick(cca2)}
              className={`relative h-[82px] border rounded-sm px-2 py-2 text-center transition-all duration-150 ${selectedClass}`}
            >
              <p className="font-mono text-base font-bold tracking-wide">{cca2}</p>
              <p className="font-body text-xs mt-1.5">{COUNTRY_LABELS[cca2]}</p>
              {order && (
                <p className="font-body text-[10px] font-bold mt-1.5">
                  {order === 1 ? '① 선택됨' : '② 선택됨'}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default CountrySelectionPanel;
