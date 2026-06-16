import { useState } from 'react';
import { analyzeNews } from '../services/newsAnalysisApi';
import { adaptAnalysisResponse } from '../utils/analysisResponseAdapter';

function useNewsAnalysis() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async ({
    country1,
    country2,
    country1Name,
    country2Name,
    topic,
    topicId = '',
  }) => {
    setLoading(true);
    setError(null);
    setResult(null);

    const request = {
      country1,
      country2,
      country1Name,
      country2Name,
      topic,
    };

    try {
      const apiResult = await analyzeNews({
        country1,
        country2,
        keyword: topic,
        topicId: topicId || '',
      });
      setResult(adaptAnalysisResponse(apiResult, request));
    } catch (err) {
      console.error('분석 오류:', err);
      setError(err.message || '뉴스 데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return { analyze, result, loading, error };
}

export default useNewsAnalysis;
