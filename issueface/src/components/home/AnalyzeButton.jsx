import React from 'react';

function AnalyzeButton({ disabled, onClick }) {
  return (
    <div className="border-t border-border pt-4">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="w-full btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
      >
        뉴스 분석 시작
      </button>
    </div>
  );
}

export default AnalyzeButton;
