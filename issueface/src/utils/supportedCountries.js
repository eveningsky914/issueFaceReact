export const SUPPORTED_COUNTRY_CODES = ['ID', 'EG', 'GB', 'KR', 'CN', 'JP', 'US', 'AU', 'BR'];

export function isSupportedCountry(cca2) {
  return SUPPORTED_COUNTRY_CODES.includes(cca2);
}
