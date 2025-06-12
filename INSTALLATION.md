# 🚀 한국 환율 예측봇 설치 가이드

## 📦 시스템 요구사항

- **Node.js**: 18.0.0 이상
- **npm**: 9.0.0 이상  
- **Git**: (선택사항)
- **Supabase 계정**: 데이터베이스 연동용

## 📋 설치 단계

### 1️⃣ 파일 압축 해제
```bash
# ZIP 파일을 원하는 디렉토리에 압축 해제
unzip korea-forex-bot.zip
cd korea-forex-bot
```

### 2️⃣ 의존성 설치
```bash
# npm 패키지 설치
npm install
```

### 3️⃣ 환경 변수 설정
프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 외환 API 키 (선택사항)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
CURRENCYLAYER_API_KEY=your_currencylayer_key
```

### 4️⃣ Supabase 데이터베이스 설정

#### A. Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에 가입
2. 새 프로젝트 생성
3. 프로젝트 URL과 API 키 복사

#### B. 데이터베이스 테이블 생성
Supabase SQL 편집기에서 다음 쿼리 실행:

```sql
-- 환율 데이터 테이블
CREATE TABLE forex_rates (
  id SERIAL PRIMARY KEY,
  currency_code VARCHAR(3) NOT NULL,
  rate DECIMAL(10, 4) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  source VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_forex_currency ON forex_rates(currency_code);
CREATE INDEX idx_forex_timestamp ON forex_rates(timestamp);

-- RLS (Row Level Security) 활성화
ALTER TABLE forex_rates ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능하도록 정책 설정
CREATE POLICY "Allow read access for all users" ON forex_rates
FOR SELECT USING (true);
```

### 5️⃣ 개발 서버 실행
```bash
# 개발 서버 시작
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

## 🛠️ 추가 설정

### 실시간 환율 데이터 수집 (선택사항)
```bash
# 환율 데이터 자동 수집 실행
npm run fetch-forex
```

### 프로덕션 빌드
```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 시작  
npm start
```

## 📱 주요 기능

### ✅ 구현된 기능
- **실시간 환율 조회**: USD, JPY, EUR, CNY
- **환율 예측**: 7일간 예측 데이터
- **기술적 분석**: RSI, 볼린저 밴드, 이동평균선
- **차트 시각화**: 실시간 차트 및 기술적 지표
- **AI 분석 의견**: 종합적인 환율 분석
- **반응형 디자인**: 모바일/데스크톱 지원

### 📊 데이터 소스
- **Supabase**: 메인 데이터베이스
- **Alpha Vantage API**: 실시간 환율 (선택)
- **CurrencyLayer API**: 보조 환율 소스 (선택)
- **한국은행 API**: 공식 환율 데이터 (선택)

## 🔧 문제 해결

### 포트 충돌 문제
```bash
# 다른 포트로 실행
npm run dev -- -p 3001
```

### 의존성 오류
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### Supabase 연결 오류
1. `.env.local` 파일의 URL과 키 확인
2. Supabase 프로젝트가 활성화되어 있는지 확인
3. 네트워크 연결 상태 확인

## 📞 지원

- **이슈 리포트**: GitHub Issues
- **문서**: README.md 파일 참조
- **설정 가이드**: env-setup.md 파일 참조

## 🎯 다음 단계

1. **API 키 설정**: 더 정확한 실시간 데이터를 위해 외부 API 키 추가
2. **데이터 수집**: 정기적인 환율 데이터 수집 스케줄 설정  
3. **알림 설정**: 환율 변동 알림 기능 활성화
4. **커스터마이징**: 원하는 통화 쌍 추가

## ⚡ 빠른 시작 체크리스트

- [ ] Node.js 18+ 설치 확인
- [ ] ZIP 파일 압축 해제
- [ ] `npm install` 실행
- [ ] Supabase 프로젝트 생성
- [ ] `.env.local` 파일 설정
- [ ] 데이터베이스 테이블 생성
- [ ] `npm run dev` 실행
- [ ] 브라우저에서 확인

🎉 **설치 완료!** 이제 한국 환율 예측봇을 사용할 수 있습니다. 