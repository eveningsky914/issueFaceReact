# IssueFace

IssueFace는 같은 이슈를 두 국가의 뉴스가 어떤 논조와 표현으로 다루는지 비교하는 React 프로젝트입니다.

## 기술 스택

- Frontend: React 18, React Router, Tailwind CSS
- Map: react-simple-maps
- Charts: Recharts
- Backend: Express
- News: Currents News API
- Sentiment: Google Natural Language API

## 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example`을 복사해 `.env`를 만들고 값을 채웁니다.

```bash
cp .env.example .env
```

필수 값:

```env
PORT=4000
CURRENTS_API_KEY=
GOOGLE_NL_API_KEY=
REACT_APP_API_BASE_URL=http://localhost:4000
```

API key는 서버에서만 사용합니다. 프론트 코드에 직접 넣지 마세요.

### 3. 백엔드 실행

```bash
npm run server
```

### 4. 프론트 실행

```bash
npm start
```

## 주요 구조

```txt
server/index.js                       # /api/analyze, Currents/Google NL 분석
src/services/newsAnalysisApi.js        # 프론트의 분석 API 호출
src/hooks/useNewsAnalysis.jsx          # API 응답을 UI 데이터로 변환
src/pages/Home.jsx                     # 지도/국가/주제 선택
src/pages/Analysis.jsx                 # 결과 화면
src/components/result/ResultHero.jsx   # 상단 브리핑 Hero
src/components/CountryCard.jsx         # 국가별 분석 카드
src/components/CompareStats.jsx        # Tone 분포/신뢰도/종합 지표
src/utils/analysisHero.js              # Hero 데이터 생성
src/utils/characterImages.js           # 국가별 캐릭터 이미지 매핑
src/utils/interactionImages.js         # 국가 간 상호작용 이미지 매핑
```

## 상호작용 이미지 관리

국가쌍 이미지를 추가하거나 교체한 뒤에는 아래 명령으로 import map을 다시 생성합니다.

```bash
npm run generate:interaction-map
npm run check:interactions
```

## 빌드

```bash
npm run build
```
