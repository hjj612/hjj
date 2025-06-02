# 환율 정확도 향상을 위한 환경 변수 설정 가이드

## 문제 해결 방법

**업데이트 시간이 05:46:17 문제**와 **Ticker Tape와의 환율 차이** 문제를 해결하기 위해 다음과 같이 여러 실시간 환율 API를 설정하는 것을 권장합니다.

## 필수 환경 변수

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Supabase 설정 (필수)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Alpha Vantage API (무료 - 일 500회 제한)
# https://www.alphavantage.co/support/#api-key 에서 무료 API 키 발급
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key

# CurrencyLayer API (무료 - 월 1000회 제한) - 높은 실시간성
# https://currencylayer.com/product 에서 무료 계정 생성
CURRENCY_LAYER_API_KEY=your_currency_layer_api_key

# Fixer API (무료 - 월 100회 제한) - 높은 정확도  
# https://fixer.io/product 에서 무료 계정 생성
FIXER_API_KEY=your_fixer_api_key

# 한국은행 API (무료 - 공식 기준환율)
# https://ecos.bok.or.kr/api/ 에서 무료 인증키 발급
BOK_API_KEY=your_bok_api_key
```

## API 우선순위

시스템은 다음 순서로 환율 데이터를 가져옵니다:

1. **CurrencyLayer API** - 실시간성이 가장 높음
2. **Fixer API** - 정확도가 높음  
3. **Alpha Vantage API** - 시장 데이터 제공
4. **한국은행 API** - 공식 기준환율 (가장 정확)
5. **폴백 시스템** - API 실패 시 시장 실시간 가격 사용

## 주요 개선사항

### 1. 시간 정확성 개선
- 기존: 서버 실행 시간을 타임스탬프로 사용 (`new Date().toISOString()`)
- 개선: API에서 제공하는 실제 환율 업데이트 시간 사용

### 2. 실시간성 향상
- 기존: 하루 1-2회 업데이트되는 무료 API 사용
- 개선: 여러 실시간 API를 연계하여 더 자주 업데이트

### 3. 정확도 향상
- 기존: 단일 소스 의존
- 개선: 한국은행 공식 환율 포함 다중 소스 활용

## 테스트 방법

환경 변수 설정 후 다음 API를 호출하여 테스트:

```bash
# 마켓 실시간 환율 (권장)
GET /api/fetch-market-forex?currency=JPY

# 일반 실시간 환율 (백업)
GET /api/fetch-real-forex?currency=JPY
```

## 주의사항

- API 키 없이도 폴백 시스템이 작동하지만, 정확도가 떨어질 수 있습니다
- 무료 API는 호출 제한이 있으므로 적절히 분산 사용됩니다
- 한국은행 API는 영업일에만 업데이트됩니다

## 권장 설정

최소한 **Alpha Vantage** 와 **한국은행** API 키는 설정하는 것을 권장합니다 (둘 다 완전 무료). 