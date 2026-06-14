# IssueFace 🌍

뉴스 데이터를 기반으로 특정 이슈의 국가별 감정지수를 비교 분석하는 서비스.

## 기술 스택

- **Frontend**: React 18, React Router v6, Tailwind CSS
- **지도**: react-simple-maps
- **차트**: Recharts
- **뉴스 데이터**: GDELT Project API (무료, CORS 허용)
- **AI 분석**: Anthropic Claude API

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example`을 복사해서 `.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일에 Anthropic API 키 입력:

```
REACT_APP_ANTHROPIC_API_KEY=sk-ant-...
```

> API 키는 https://console.anthropic.com 에서 발급받으세요.

### 3. 개발 서버 실행

```bash
npm start
```

## 배포

### GitHub Pages

```bash
npm install --save-dev gh-pages
```

`package.json`에 추가:
```json
{
  "homepage": "https://<username>.github.io/<repo-name>",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

```bash
npm run deploy
```

### Netlify (권장)

1. GitHub에 push
2. https://netlify.com 에서 "Import from Git" 선택
3. Build command: `npm run build`, Publish directory: `build`
4. Environment variables에 `REACT_APP_ANTHROPIC_API_KEY` 추가

### AWS Amplify

1. AWS Console → Amplify → New App → GitHub 연결
2. Build settings 자동 감지
3. Environment variables에 API 키 추가

## 프로젝트 구조

```
src/
├── components/
│   ├── Header.js          # 헤더 (소개, 사용법)
│   ├── UsageModal.js      # 사용법 모달
│   ├── WorldMap.js        # 인터랙티브 세계 지도
│   ├── CountrySelector.js # 국가 검색/선택 드롭다운
│   ├── CountryCard.js     # 분석 결과 카드
│   ├── ToneGauge.js       # Tone 점수 게이지
│   └── ToneCompareChart.js # 비교 바 차트
├── pages/
│   ├── Home.js            # 메인 (지도 + 선택 패널)
│   ├── Introduction.js    # 소개 페이지
│   ├── Analysis.js        # 분석 결과 페이지
│   └── CountryBackground.js # 국가 배경 설명
├── hooks/
│   ├── useCountries.js    # 국가 목록 (restcountries API)
│   └── useNewsAnalysis.js # GDELT + Claude 분석
└── App.js                 # 라우터
```

## 주의사항

- `REACT_APP_ANTHROPIC_API_KEY`는 브라우저에 노출됩니다. 프로덕션에서는 Node.js 백엔드 프록시 서버를 통해 키를 숨기는 것을 권장합니다.
- GDELT API는 영어 뉴스 기반입니다.
