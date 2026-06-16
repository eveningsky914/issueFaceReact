import { useEffect, useRef } from 'react';
import { addHistory, makeCountryPairKey } from '../utils/historyStorage';

function useAnalysisHistorySaver(result, loading) {
  const savedHistoryId = useRef(null);

  useEffect(() => {
    if (!result || loading) return;

    const countryPairKey = makeCountryPairKey(result.country1Code, result.country2Code);
    const id = `${countryPairKey}-${result.topic}`;
    if (savedHistoryId.current === id) return;
    savedHistoryId.current = id;

    addHistory({
      id,
      countryPairKey,
      country1: result.country1Code,
      country2: result.country2Code,
      country1Name: result.country1Name,
      country2Name: result.country2Name,
      topic: result.topic,
      tone1: result.country1?.hasData ? result.country1.tone : null,
      tone2: result.country2?.hasData ? result.country2.tone : null,
      summary: result.comparison,
      savedAt: new Date().toISOString(),
    });
  }, [result, loading]);
}

export default useAnalysisHistorySaver;
