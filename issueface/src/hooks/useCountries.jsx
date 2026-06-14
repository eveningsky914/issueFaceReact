import { useState, useEffect } from 'react';
import { isSupportedCountry } from '../utils/supportedCountries';

function useCountries() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name,flags,cca2,translations,flag,capital,population,currencies')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error('Invalid data format');
        const sorted = data
          .filter((country) => isSupportedCountry(country.cca2))
          .sort((a, b) =>
            (a.translations?.kor?.common || a.name.common)
              .localeCompare(b.translations?.kor?.common || b.name.common, 'ko')
          );
        setCountries(sorted);
      })
      .catch((err) => {
        console.error('국가 목록 로드 실패:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return { countries, loading, error };
}

export default useCountries;
