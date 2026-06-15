# Currents News API / Google Natural Language API Migration Notes

이 문서는 현재 프로젝트의 뉴스 검색 및 감정 분석 로직을 다른 React/Node 기반 IssueFace 프로젝트로 이식하기 위한 메모입니다. API key 값은 포함하지 않고 env 변수 이름만 정리합니다.

## 1. Currents News API 호출 파일 위치

- `server/index.js`
  - `fetchNewsForCountry({ country, searchKeyword })`
  - 호출 URL: `https://api.currentsapi.services/v1/search`
  - query parameter:
    - `apiKey`: `process.env.CURRENTS_API_KEY`
    - `keywords`: 검색어
    - `language`: 국가별 언어 코드
    - `country`: 국가 코드
    - `page_number`: `1`
    - `page_size`: `ARTICLE_LIMIT`

## 2. Google Natural Language API 호출 파일 위치

- `server/index.js`
  - `analyzeSentiment({ text, language })`
  - `requestGoogleSentiment({ text, language })`
  - 호출 URL: `https://language.googleapis.com/v1/documents:analyzeSentiment`
  - header:
    - `Content-Type: application/json; charset=utf-8`
    - `x-goog-api-key`: `process.env.GOOGLE_NL_API_KEY`

## 3. 사용 중인 env 변수 이름

- `CURRENTS_API_KEY`
- `GOOGLE_NL_API_KEY`
- `PORT`

참고 파일:

- `server/.env.example`
- `server/index.js`

## 4. 필요한 npm 패키지

백엔드 필수 패키지:

- `express`
- `cors`
- `dotenv`

외부 API 호출은 별도 SDK 없이 `fetch`를 사용합니다. Node.js의 전역 `fetch`를 쓰는 구조이므로 Node 18 이상 환경을 권장합니다. 더 낮은 Node 버전을 쓴다면 `node-fetch` 같은 패키지를 추가해야 합니다.

프론트 API 호출 자체는 브라우저 기본 `fetch`를 사용합니다. 현재 클라이언트 프로젝트의 주요 패키지는 다음과 같습니다.

- `react`
- `react-dom`
- `react-router`

## 5. 백엔드 API endpoint 구조

파일: `server/index.js`

- `GET /api/health`
  - 서버 상태 확인용
  - response:

```json
{
  "ok": true,
  "service": "IssueFace API",
  "message": "Server is running"
}
```

- `POST /api/analyze`
  - 국가 2개와 키워드를 받아 국가별 뉴스 검색 및 감정 분석 수행
  - 내부에서 두 국가 분석을 `Promise.all`로 병렬 실행
  - 주요 처리 함수:
    - `validateAnalyzeRequest`
    - `analyzeCountry`
    - `fetchNewsForCountry`
    - `buildTextForSentiment`
    - `analyzeSentiment`
    - `buildCountryResult`

## 6. 프론트에서 백엔드로 보내는 request body 구조

파일: `client/src/services/api.js`

`analyzeNews({ country1, country2, keyword, topicId })`에서 아래 JSON을 `POST /api/analyze`로 전송합니다.

```json
{
  "country1": "US",
  "country2": "JP",
  "keyword": "AI",
  "topicId": "ai"
}
```

필드 설명:

- `country1`: 첫 번째 국가 코드. 예: `US`, `JP`, `KR`
- `country2`: 두 번째 국가 코드
- `keyword`: 사용자가 입력했거나 프리셋에서 선택된 분석 키워드
- `topicId`: 선택 프리셋 ID. 없으면 빈 값 또는 생략 가능

프론트 흐름:

- `client/src/pages/MainPage.jsx`
  - 사용자가 국가 2개와 키워드 또는 프리셋 토픽을 선택
  - `/analysis?country1=...&country2=...&keyword=...&topicId=...`로 이동
- `client/src/pages/AnalysisPage.jsx`
  - URL query string을 읽음
  - `analyzeNews` 호출
- `client/src/services/api.js`
  - 백엔드 `http://localhost:4000/api/analyze` 호출

## 7. 백엔드가 프론트로 반환하는 response 구조

성공 response:

```json
{
  "ok": true,
  "keyword": "AI",
  "topicId": "ai",
  "country1": {
    "code": "US",
    "nameKo": "...",
    "nameEn": "United States",
    "flag": "...",
    "language": "en",
    "searchKeyword": "AI",
    "toneScore": 0.42,
    "toneMagnitude": 4.3,
    "magnitude": 4.3,
    "toneLabel": "긍정",
    "articleCount": 10,
    "articles": [
      {
        "title": "...",
        "description": "...",
        "url": "...",
        "published": "...",
        "image": "...",
        "source": "..."
      }
    ],
    "topKeywords": ["..."],
    "toneDistribution": {
      "positive": 6,
      "neutral": 3,
      "negative": 1,
      "total": 10,
      "positiveRatio": 60,
      "neutralRatio": 30,
      "negativeRatio": 10,
      "dominantTone": "긍정",
      "interpretation": "..."
    },
    "sentenceSentiments": [
      {
        "text": "...",
        "score": 0.5,
        "magnitude": 0.8,
        "toneLabel": "긍정"
      }
    ]
  },
  "country2": {
    "...": "country1과 동일한 구조"
  }
}
```

검증 실패 response:

```json
{
  "ok": false,
  "message": "validation error message"
}
```

서버 처리 중 실패 response:

```json
{
  "ok": false,
  "message": "analysis error message",
  "detail": "original error message"
}
```

프론트에서는 실패 시 `client/src/services/api.js`가 `mockAnalysisResult`를 fallback으로 반환합니다.

## 8. 뉴스 검색 -> 감정 분석 -> 결과 반환 전체 흐름

1. 사용자가 `MainPage`에서 `country1`, `country2`, `keyword`, `topicId`를 선택합니다.
2. `MainPage`가 `/analysis` 페이지로 query string과 함께 이동합니다.
3. `AnalysisPage`가 query string을 읽고 `analyzeNews`를 호출합니다.
4. `analyzeNews`가 `POST http://localhost:4000/api/analyze`로 request body를 보냅니다.
5. 백엔드 `POST /api/analyze`가 request body를 검증합니다.
6. 백엔드는 `CURRENTS_API_KEY`, `GOOGLE_NL_API_KEY` 존재 여부를 확인합니다.
7. `analyzeCountry`를 두 국가에 대해 병렬 실행합니다.
8. 각 국가 분석에서 `getSearchKeyword`가 프리셋 토픽의 언어별 검색어를 우선 사용하고, 없으면 원래 `keyword`를 사용합니다.
9. `fetchNewsForCountry`가 Currents News API에서 국가별 뉴스 목록을 가져옵니다.
10. Currents 응답의 `news` 배열을 내부 article 구조로 매핑합니다.
11. `buildTextForSentiment`가 기사 제목과 설명을 하나의 plain text로 합칩니다.
12. `extractTopKeywords`가 기사 제목/설명에서 상위 키워드를 추출합니다.
13. 기사 텍스트가 있으면 `analyzeSentiment`가 Google Natural Language API를 호출합니다.
14. 언어 지정 호출이 실패하면 `analyzeSentiment`가 language 없이 한 번 더 Google 감정 분석을 시도합니다.
15. `requestGoogleSentiment`가 문서 전체 sentiment와 sentence sentiment를 내부 구조로 변환합니다.
16. `buildCountryResult`가 국가 정보, 기사, 키워드, tone score, tone distribution을 합쳐 국가별 결과를 만듭니다.
17. `/api/analyze`가 `{ ok, keyword, topicId, country1, country2 }` 형태로 프론트에 반환합니다.
18. 프론트는 결과를 화면에 표시하고 `sessionStorage`에 마지막 분석 결과를 저장합니다.

## 9. 현재 프로젝트에서 재사용 가능한 함수 목록

백엔드 `server/index.js`:

- `validateAnalyzeRequest({ country1, country2, keyword })`
  - 필수 값, 동일 국가, 지원 국가 여부 검증
- `getSearchKeyword({ keyword, topicId, language })`
  - 프리셋 토픽이 있으면 언어별 query로 변환
- `analyzeCountry({ countryCode, keyword, topicId })`
  - 국가 1개의 전체 분석 orchestration
- `buildCountryResult({ country, searchKeyword, articles, articleCount, topKeywords, sentiment })`
  - 프론트 표시용 국가별 결과 구조 생성
- `fetchNewsForCountry({ country, searchKeyword })`
  - Currents News API 호출 및 article 정규화
- `buildTextForSentiment(articles)`
  - 기사 title/description을 감정 분석용 텍스트로 병합
- `analyzeSentiment({ text, language })`
  - Google 감정 분석 호출 wrapper, language fallback 포함
- `requestGoogleSentiment({ text, language })`
  - Google Natural Language API 직접 호출
- `calculateToneDistribution(sentenceSentiments, documentScore)`
  - sentence score 기반 긍정/중립/부정 분포 계산
- `getToneType(score)`
  - score를 `positive`, `neutral`, `negative`로 분류
- `getDominantTone({ positiveRatio, neutralRatio, negativeRatio })`
  - 가장 큰 tone 비율을 사람이 읽는 label로 변환
- `getDistributionInterpretation({ positiveRatio, neutralRatio, negativeRatio })`
  - tone 분포 해석 문장 생성
- `roundRatio(value)`
  - 비율 소수점 1자리 반올림
- `extractTopKeywords(articles, searchKeyword, limit)`
  - 기사 텍스트에서 top keyword 추출
- `tokenizeText(text)`
  - URL/특수문자 제거 후 토큰화
- `getToneLabel(score)`
  - Google sentiment score를 표시용 label로 변환

프론트:

- `client/src/services/api.js`
  - `analyzeNews({ country1, country2, keyword, topicId })`
- `client/src/utils/safeData.js`
  - `safeNumber`
  - `formatNumber`
  - `safeArticles`
  - `getArticleCount`
  - `normalizeCountry`
  - `hasRequiredAnalysisQuery`

데이터:

- `server/data/countries.js`
  - 백엔드 국가 코드, 표시명, 언어 코드
- `server/data/presetTopics.js`
  - 백엔드 프리셋 토픽 및 언어별 검색어
- `client/src/data/countries.js`
  - 프론트 국가 선택 UI용 데이터
- `client/src/data/presetTopics.js`
  - 프론트 프리셋 토픽 UI용 데이터
- `client/src/data/mockAnalysisResult.js`
  - API 실패 시 fallback 표시용 mock 결과

## 10. IssueFace에 이식할 때 주의할 점

- API key는 반드시 백엔드 env에만 둡니다. 프론트 번들에 `CURRENTS_API_KEY`나 `GOOGLE_NL_API_KEY`가 노출되면 안 됩니다.
- 현재 프론트 API URL은 `http://localhost:4000/api/analyze`로 하드코딩되어 있습니다. 이식 시 환경별 API base URL로 분리하는 것이 좋습니다.
- 현재 Google Natural Language API는 공식 client SDK가 아니라 REST endpoint와 `x-goog-api-key` header를 직접 사용합니다.
- Node 18 이상이 아니면 서버의 전역 `fetch`가 없을 수 있습니다.
- `ARTICLE_LIMIT`은 `10`이고, Google에 보내는 텍스트는 `buildTextForSentiment`에서 최대 12,000자로 자릅니다.
- Currents API 검색은 `country.code`와 `country.language`에 의존합니다. IssueFace의 국가 데이터도 같은 형태를 제공해야 합니다.
- `topicId`가 있으면 사용자가 입력한 `keyword`보다 `presetTopics[topicId].queries[language]`가 우선됩니다.
- Google 감정 분석에서 language를 지정한 호출이 실패하면 language 없이 재시도합니다. 이 fallback 동작을 유지할지 결정해야 합니다.
- 현재 서버 파일은 모든 함수가 `server/index.js`에 모여 있습니다. 이식 시 `routes`, `services/news`, `services/sentiment`, `utils/tone` 등으로 분리하면 유지보수가 쉬워집니다.
- 한국어/다국어 문자열이 일부 파일에서 인코딩이 깨져 보입니다. 이식 전에 UTF-8 인코딩으로 정리하는 것이 좋습니다.
- Currents 응답에서 source는 `article.author || article.source || ''`로 매핑합니다. 실제 응답 필드가 프로젝트 기대와 맞는지 확인해야 합니다.
- Google sentiment score 기준은 `<= -0.25` 부정, `>= 0.25` 긍정, 나머지 중립/혼합입니다. UI 해석과 동일한 기준을 써야 결과가 일관됩니다.
- `toneDistribution`은 sentence sentiment가 있으면 문장 단위로 계산하고, 없으면 document score 하나로 fallback 계산합니다.
- 프론트는 API 실패 시 mock 데이터를 반환하는 구조입니다. 실제 서비스에서는 fallback mock 노출 여부, 에러 표시 정책을 별도로 정해야 합니다.
