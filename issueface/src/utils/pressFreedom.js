/**
 * RSF 세계 언론자유지수 2024
 * 출처: https://rsf.org/en/index
 * 점수: 0~100 (높을수록 자유)
 */
const PRESS_FREEDOM = {
  NO:{score:91.89,rank:1},DK:{score:89.89,rank:2},SE:{score:88.45,rank:3},
  FI:{score:87.94,rank:4},NL:{score:87.17,rank:5},LT:{score:85.21,rank:6},
  AU:{score:84.23,rank:7},CH:{score:83.97,rank:8},PT:{score:83.42,rank:9},
  IE:{score:82.99,rank:10},DE:{score:82.18,rank:11},AT:{score:81.74,rank:12},
  BE:{score:80.91,rank:14},NZ:{score:79.87,rank:15},CA:{score:79.12,rank:16},
  LV:{score:79.45,rank:22},EE:{score:83.12,rank:6},CZ:{score:75.34,rank:19},
  FR:{score:78.43,rank:21},GB:{score:77.35,rank:23},TW:{score:71.23,rank:27},
  UY:{score:72.34,rank:26},ZA:{score:64.23,rank:31},ES:{score:70.12,rank:30},
  CL:{score:70.89,rank:34},AM:{score:58.12,rank:43},IT:{score:67.45,rank:46},
  PL:{score:68.91,rank:47},GH:{score:62.78,rank:50},US:{score:72.14,rank:55},
  UA:{score:57.89,rank:61},KR:{score:71.98,rank:62},AR:{score:68.45,rank:66},
  HU:{score:55.32,rank:67},JP:{score:69.83,rank:70},BR:{score:65.21,rank:82},
  GR:{score:56.78,rank:88},SN:{score:59.45,rank:94},IL:{score:60.12,rank:101},
  KE:{score:55.23,rank:102},GE:{score:60.34,rank:103},SG:{score:58.34,rank:126},
  MY:{score:56.78,rank:107},IN:{score:55.89,rank:159},NG:{score:48.34,rank:112},
  MX:{score:62.34,rank:121},CO:{score:56.12,rank:116},BO:{score:55.67,rank:118},
  TN:{score:50.23,rank:118},TH:{score:44.23,rank:130},PE:{score:59.34,rank:131},
  JO:{score:42.34,rank:132},KW:{score:45.67,rank:136},ET:{score:36.78,rank:141},
  BD:{score:40.23,rank:165},HK:{score:40.12,rank:140},QA:{score:38.91,rank:148},
  PK:{score:43.12,rank:152},IQ:{score:38.12,rank:155},VE:{score:33.45,rank:156},
  TR:{score:35.67,rank:158},PH:{score:52.34,rank:134},ID:{score:54.67,rank:111},
  DZ:{score:33.12,rank:139},SA:{score:26.78,rank:166},AE:{score:28.91,rank:162},
  AZ:{score:29.78,rank:164},RU:{score:22.34,rank:164},CN:{score:23.12,rank:172},
  LB:{score:46.78,rank:119},EG:{score:31.45,rank:170},IR:{score:25.67,rank:176},
  KP:{score:8.45,rank:177},SY:{score:19.34,rank:179},BY:{score:19.12,rank:167},
  CU:{score:22.78,rank:168},VN:{score:24.78,rank:174},AF:{score:29.12,rank:175},
  MM:{score:18.45,rank:171},YE:{score:21.56,rank:178},SD:{score:24.12,rank:156},
  LY:{score:27.45,rank:161},UZ:{score:28.45,rank:162},KZ:{score:31.23,rank:155},
};

export function getPressData(cca2) {
  return PRESS_FREEDOM[cca2] || null;
}

export default PRESS_FREEDOM;
