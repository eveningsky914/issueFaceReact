import React from 'react';
import { TOPICS } from '../../data/homeOptions';

function TopicSelector({
  topicInput,
  selectedTopic,
  onTopicInputChange,
  onTopicSelect,
}) {
  return (
    <section>
      <p className="section-label mb-3">2. 주제 선택</p>
      <input
        type="text"
        value={topicInput}
        onChange={(event) => onTopicInputChange(event.target.value)}
        placeholder="직접 입력..."
        className="w-full border border-border bg-parchment text-sm font-body px-3 py-2 rounded-sm focus:outline-none focus:border-accent mb-3"
      />
      <p className="text-xs text-muted font-body mb-2">또는 프리셋 선택</p>
      <div className="flex flex-wrap gap-1.5">
        {TOPICS.map((topic) => (
          <button
            key={topic}
            type="button"
            onClick={() => onTopicSelect(topic)}
            className={`text-xs font-body px-2.5 py-1 rounded-full border transition-colors ${
              selectedTopic === topic
                ? 'bg-accent text-cream border-accent'
                : 'bg-cream border-border text-muted hover:border-accent hover:text-accent'
            }`}
          >
            {topic}
          </button>
        ))}
      </div>
    </section>
  );
}

export default TopicSelector;
