import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import UsageModal from './UsageModal';

function Header() {
  const [showUsage, setShowUsage] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-cream/90 backdrop-blur-sm sticky top-0 z-50">
        <Link to="/" className="font-display font-bold text-xl tracking-tight text-ink hover:text-accent transition-colors">
          IssueFace
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            to="/intro"
            className="font-body text-sm font-medium text-muted hover:text-ink transition-colors px-3 py-1.5"
          >
            소개
          </Link>
          <Link
            to="/history"
            className="font-body text-sm font-medium text-muted hover:text-ink transition-colors px-3 py-1.5"
          >
            히스토리
          </Link>
          <button
            onClick={() => setShowUsage(true)}
            className="btn-secondary text-sm"
          >
            사용법
          </button>
        </nav>
      </header>

      {showUsage && <UsageModal onClose={() => setShowUsage(false)} />}
    </>
  );
}

export default Header;
