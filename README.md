# 🌏 한국 환율 챗봇 (Korea Forex Chatbot)

실시간 환율 정보와 AI 기반 환율 예측을 제공하는 Next.js 웹 애플리케이션입니다.

## ✨ 주요 기능

- 📊 실시간 환율 정보 (JPY, CNY, EUR)
- 🤖 AI 기반 환율 예측
- 📱 반응형 웹 디자인
- 🔄 다중 API 소스로 정확도 향상
- 📈 과거 환율 데이터 시각화

## 🚀 빠른 시작

### 로컬 개발 환경 설정

1. **저장소 클론**
```bash
git clone https://github.com/your-username/korea-forex-chatbot.git
cd korea-forex-chatbot
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**
프로젝트 루트에 `.env.local` 파일 생성:
```bash
# Supabase 설정 (필수)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API 키들 (선택적 - 더 높은 정확도를 위해 권장)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
CURRENCY_LAYER_API_KEY=your_currency_layer_api_key
FIXER_API_KEY=your_fixer_api_key
BOK_API_KEY=your_bok_api_key
```

4. **개발 서버 실행**
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 🌐 Vercel 배포 가이드

### 1단계: GitHub에 업로드

1. GitHub에서 새 저장소 생성
2. 로컬 프로젝트와 연결:
```bash
git init
git add .
git commit -m "Initial commit: Korea Forex Chatbot"
git branch -M main
git remote add origin https://github.com/your-username/korea-forex-chatbot.git
git push -u origin main
```

### 2단계: Vercel 배포

1. [Vercel](https://vercel.com/)에 로그인
2. "New Project" 클릭
3. GitHub 저장소 선택
4. 환경 변수 설정:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - 기타 API 키들 (선택적)
5. "Deploy" 클릭

### 3단계: 도메인 설정 (선택적)

Vercel 대시보드에서 커스텀 도메인을 설정할 수 있습니다.

## 🔧 기술 스택

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Database**: Supabase
- **차트**: Chart.js, Recharts
- **배포**: Vercel
- **API**: 다중 환율 API (Alpha Vantage, CurrencyLayer, Fixer, 한국은행)

## 📁 프로젝트 구조

```
korea-forex-chatbot/
├── app/                    # Next.js App Router
├── components/             # React 컴포넌트
├── utils/                  # 유틸리티 함수
├── public/                 # 정적 파일
├── supabase/              # Supabase 설정
├── .env.local             # 환경 변수 (로컬)
├── package.json           # 프로젝트 설정
└── README.md              # 프로젝트 문서
```

## 🔑 환경 변수 설명

자세한 환경 변수 설정은 [env-setup.md](./env-setup.md)를 참조하세요.

| 변수명 | 설명 | 필수 여부 |
|--------|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | 필수 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 | 필수 |
| `ALPHA_VANTAGE_API_KEY` | Alpha Vantage API 키 | 선택적 |
| `CURRENCY_LAYER_API_KEY` | CurrencyLayer API 키 | 선택적 |
| `FIXER_API_KEY` | Fixer API 키 | 선택적 |
| `BOK_API_KEY` | 한국은행 API 키 | 선택적 |

## 🤝 기여하기

1. Fork 프로젝트
2. 피처 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 질문이나 제안이 있으시면 이슈를 생성해주세요.

---

⭐ 이 프로젝트가 도움이 되었다면 별표를 눌러주세요! 