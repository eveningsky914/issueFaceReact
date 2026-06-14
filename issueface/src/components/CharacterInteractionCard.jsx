import React from 'react';

function CharacterInteractionCard() {
  return (
    <div className="card p-5">
      <p className="section-label mb-2">국가 간 캐릭터 상호작용</p>
      <h2 className="font-display text-2xl font-bold text-ink mb-4">대화 중</h2>
      <div className="bg-parchment border border-border rounded-sm overflow-hidden">
        <img
          src="/character.png"
          alt="국가 간 캐릭터 상호작용"
          className="w-full h-[360px] object-contain bg-[#f8f7f5]"
        />
      </div>
    </div>
  );
}

export default CharacterInteractionCard;
