import { useMemo } from 'react';
import { COUNTRIES } from '../data/countries';

function useCountries() {
  const countries = useMemo(
    () => [...COUNTRIES].sort((a, b) =>
      (a.translations?.kor?.common || a.name.common)
        .localeCompare(b.translations?.kor?.common || b.name.common, 'ko')
    ),
    []
  );

  return { countries, loading: false, error: null };
}

export default useCountries;
