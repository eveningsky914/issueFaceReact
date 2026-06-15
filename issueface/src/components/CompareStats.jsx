import React from 'react';
import ToneDistributionCompare from './ToneDistributionCompare';
import AnalysisReliability from './AnalysisReliability';
import OverviewRadarCompare from './OverviewRadarCompare';

function CompareStats({ result, c1Name, c2Name, c1Code, c2Code }) {
  const articles1 = result.country1.allArticles || [];
  const articles2 = result.country2.allArticles || [];
  const count1 = result.country1.hasData ? (result.country1.articleCount || 0) : 0;
  const count2 = result.country2.hasData ? (result.country2.articleCount || 0) : 0;

  return (
    <div className="space-y-4">
      {(result.country1.hasData || result.country2.hasData) && (
        <ToneDistributionCompare
          c1Name={c1Name}
          c2Name={c2Name}
          articles1={articles1}
          articles2={articles2}
        />
      )}

      <AnalysisReliability
        c1Name={c1Name}
        c2Name={c2Name}
        c1Code={c1Code}
        c2Code={c2Code}
        count1={count1}
        count2={count2}
      />

      {result.country1.hasData && result.country2.hasData && (
        <OverviewRadarCompare
          c1Name={c1Name}
          c2Name={c2Name}
          c1Code={c1Code}
          c2Code={c2Code}
          count1={count1}
          count2={count2}
          articles1={articles1}
          articles2={articles2}
        />
      )}
    </div>
  );
}

export default CompareStats;
