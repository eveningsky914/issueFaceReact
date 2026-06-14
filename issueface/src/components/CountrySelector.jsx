import React, { useState, useRef, useEffect } from 'react';

function CountrySelector({ countries, value, onChange, placeholder = '국가 선택', colorDot }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = countries.find((c) => c.cca2 === value);

  const filtered = countries
    .filter((c) =>
      c.name.common.toLowerCase().includes(query.toLowerCase()) ||
      (c.translations?.kor?.common || '').includes(query)
    )
    .slice(0, 50);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 border border-border bg-cream px-3 py-2 text-sm font-body text-left rounded-sm hover:border-muted transition-colors"
      >
        {selected ? (
          <>
            <span className="text-base">{selected.flag}</span>
            <span className="text-ink truncate">{selected.translations?.kor?.common || selected.name.common}</span>
          </>
        ) : (
          <span className="text-muted">{placeholder}</span>
        )}
        <svg className="ml-auto w-4 h-4 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-cream border border-border shadow-lg rounded-sm">
          <div className="p-2 border-b border-border">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색..."
              className="w-full text-sm px-2 py-1.5 border border-border rounded-sm bg-parchment focus:outline-none focus:border-accent font-body"
              autoFocus
            />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted font-body">결과 없음</li>
            ) : (
              filtered.map((c) => (
                <li key={c.cca2}>
                  <button
                    type="button"
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-body hover:bg-parchment text-left transition-colors ${value === c.cca2 ? 'bg-parchment font-semibold' : ''}`}
                    onClick={() => {
                      onChange(c.cca2);
                      setOpen(false);
                      setQuery('');
                    }}
                  >
                    <span>{c.flag}</span>
                    <span>{c.translations?.kor?.common || c.name.common}</span>
                    <span className="ml-auto text-xs text-muted font-mono">{c.cca2}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CountrySelector;
