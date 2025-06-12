# 🚀 한국 환율 예측봇 (Korea Forex Prediction Bot)

> **실시간 환율 조회, AI 기반 예측, 전문적인 기술적 분석을 제공하는 Next.js 웹 애플리케이션**

[![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.0.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)](https://supabase.com/)

## 📱 주요 기능

### ✨ 실시간 환율 서비스
- **4개 주요 통화** 실시간 모니터링: USD, JPY, EUR, CNY
- **JPY 100엔 기준** 환율 표시 (한국 실정에 맞춘 표기)
- 히트맵 시각화로 환율 변동 한눈에 파악
- TradingView 위젯 연동

### 🔮 AI 환율 예측
- **7일간 환율 예측** 및 신뢰도 표시
- ARIMA, LSTM, Linear Regression 앙상블 모델
- 일별 예측값과 정확도 퍼센트 제공
- 종합적인 AI 분석 의견

### 📊 전문적인 기술적 분석
- **RSI (Relative Strength Index)** - 과매수/과매도 판단
- **볼린저 밴드** - 가격 변동성 및 지지/저항선
- **이동평균선** - MA20, MA50, MA100 추세 분석
- 실시간 차트 및 기술적 지표 시각화

### 🎨 사용자 경험
- **전문적인 회색 톤** 디자인
- **완전 반응형** 모바일/데스크톱 지원
- 직관적인 탭 기반 네비게이션
- 실시간 데이터 업데이트

## 🛠️ 기술 스택

### Frontend
- **Next.js 15** - App Router 기반 풀스택 프레임워크
- **React 18** - 컴포넌트 기반 UI 라이브러리
- **TypeScript** - 타입 안전성 확보
- **Tailwind CSS** - 유틸리티 퍼스트 CSS 프레임워크

### Data & Visualization
- **Recharts** - React 차트 라이브러리
- **Supabase** - 실시간 데이터베이스
- **TradingView Widgets** - 전문 금융 위젯

### External APIs
- **Alpha Vantage API** - 실시간 환율 데이터
- **CurrencyLayer API** - 보조 환율 소스
- **한국은행 API** - 공식 환율 데이터

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/hjj612/hjj.git
cd hjj
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 외환 API 키 (선택사항)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
CURRENCYLAYER_API_KEY=your_currencylayer_key
```

### 4. 데이터베이스 설정
Supabase에서 다음 테이블을 생성:

```sql
CREATE TABLE forex_rates (
  id SERIAL PRIMARY KEY,
  currency_code VARCHAR(3) NOT NULL,
  rate DECIMAL(10, 4) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  source VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_forex_currency ON forex_rates(currency_code);
CREATE INDEX idx_forex_timestamp ON forex_rates(timestamp);
```

### 5. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 📦 프로덕션 배포

### Vercel 배포 (권장)
1. [Vercel](https://vercel.com)에 가입
2. GitHub 저장소 연동
3. 환경 변수 설정
4. 자동 배포 완료

### 수동 빌드
```bash
npm run build
npm start
```

## 📖 프로젝트 구조

```
hjj/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   ├── components/        # 페이지별 컴포넌트
│   ├── currency/[code]/   # 통화별 상세 페이지
│   ├── globals.css        # 전역 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx          # 메인 페이지
├── components/            # 재사용 가능한 컴포넌트
│   ├── ForexPredictionBot.tsx
│   ├── ForexChatbot.tsx
│   ├── ForexHeatmap.tsx
│   └── tradingview/
├── utils/                 # 유틸리티 함수
│   ├── supabase.ts       # Supabase 클라이언트
│   ├── arimaModel.ts     # ARIMA 모델
│   └── seed-forex-data.js
├── public/               # 정적 파일
└── supabase/            # DB 마이그레이션
```

## 🔧 API 엔드포인트

- `GET /api/fetch-real-forex` - 실시간 환율 데이터 수집
- `GET /api/fetch-ohlc-forex` - OHLC 캔들스틱 데이터
- 통화별 페이지: `/currency/[code]` (USD, JPY, EUR, CNY)

## 🎯 라이브 데모

**🌐 배포된 사이트**: [https://hjj-gilt.vercel.app](https://hjj-gilt.vercel.app)

### 📸 스크린샷
- 메인 페이지: 실시간 환율 대시보드
- 통화별 상세: 예측 및 기술적 분석
- 모바일 반응형: 모든 기기에서 최적화

## 🤝 기여하기

1. Fork 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 📝 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 💫 향후 계획

- [ ] 알림 시스템 추가
- [ ] 더 많은 통화 쌍 지원
- [ ] 고급 차트 기능
- [ ] 모바일 앱 버전
- [ ] 다국어 지원

## 📞 문의

- **작성자**: hjj612
- **이메일**: hjj612@example.com
- **프로젝트 링크**: [https://github.com/hjj612/hjj](https://github.com/hjj612/hjj)

---

⭐ **이 프로젝트가 유용하다면 Star를 눌러주세요!** 