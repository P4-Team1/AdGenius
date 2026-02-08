# 소상공인 광고 생성 서비스 - Frontend

AI를 활용하여 소상공인이 광고 콘텐츠를 손쉽게 제작할 수 있는 웹 서비스의 프론트엔드입니다.

## 🚀 기술 스택

- **Framework**: Next.js 16.1.6
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Package Manager**: npm

## 📁 프로젝트 구조
```
frontend/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # 메인 페이지
│   ├── login/                    # 로그인
│   ├── register/                 # 회원가입
│   ├── dashboard/                # 대시보드 (프로젝트 목록)
│   ├── projects/
│   │   ├── new/                  # 프로젝트 생성
│   │   └── [id]/
│   │       ├── page.tsx          # 프로젝트 상세
│   │       └── generate/         # AI 콘텐츠 생성
│   └── settings/                 # 설정 (가게 관리)
├── components/
│   └── ui/                       # shadcn/ui 컴포넌트
├── lib/
│   ├── api.ts                    # API 호출 함수
│   └── utils.ts                  # 유틸리티 함수
├── public/                       # 정적 파일
├── Dockerfile                    # Docker 이미지 빌드 설정
├── .dockerignore                 # Docker 빌드 시 제외 파일
└── package.json                  # 프로젝트 의존성
```

## 🎨 주요 기능

### 1. 인증
- 회원가입 (사업자 정보 포함)
- 로그인
- 토큰 기반 인증

### 2. 프로젝트 관리
- 프로젝트 생성/조회/수정/삭제
- 프로젝트별 콘텐츠 관리

### 3. AI 콘텐츠 생성
- **이미지 생성** (4가지 모드)
  - Text-to-Image: 텍스트 설명으로 생성
  - Image-to-Image: 레퍼런스 이미지 기반
  - Inpainting: 제품 사진 보존
  - ControlNet: 스케치 기반 생성
- **텍스트 생성**: 광고 문구 자동 생성
- **스타일 선택**: 모던, 미니멀, 빈티지, 화려한, 전문적, 귀여운

### 4. 가게 관리
- 가게 정보 등록/수정/삭제
- 여러 가게 관리 가능

## 🛠️ 로컬 개발 환경 설정

### 사전 요구사항

- Node.js 20 이상
- npm

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 접속
# http://localhost:3000
```

### 환경 변수 설정

`.env.local` 파일 생성:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🐳 Docker 실행

### 이미지 빌드
```bash
docker build -t ads-project .
```

### 컨테이너 실행
```bash
docker run -p 3000:3000 ads-project
```

### 백그라운드 실행
```bash
docker run -d -p 3000:3000 --name ads-frontend ads-project
```

### 컨테이너 관리
```bash
# 중지
docker stop ads-frontend

# 시작
docker start ads-frontend

# 삭제
docker rm -f ads-frontend
```

## 📡 API 연동

현재는 Mock 데이터로 동작합니다. 백엔드 연결 시 `lib/api.ts` 파일 수정:
```typescript
// Mock 모드 끄기
const USE_MOCK = false

// API URL 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
```

## 🎯 주요 페이지

| 경로 | 설명 |
|------|------|
| `/` | 메인 페이지 |
| `/login` | 로그인 |
| `/register` | 회원가입 |
| `/dashboard` | 프로젝트 목록 |
| `/projects/new` | 프로젝트 생성 |
| `/projects/[id]` | 프로젝트 상세 |
| `/projects/[id]/generate` | AI 콘텐츠 생성 |
| `/settings` | 가게 관리 |

## 🔧 개발 진행 상황

- [x] 프로젝트 초기 설정
- [x] 페이지 구조 설계
- [x] UI 컴포넌트 구현 (shadcn/ui)
- [x] Mock API 연동
- [x] Docker 설정
- [ ] 백엔드 API 연동
- [ ] 이미지 실시간 표시
- [ ] 반응형 디자인 최적화
- [ ] 에러 처리 강화

## 📝 개발 노트

### UI 라이브러리 선택

- **Tailwind CSS**: 유틸리티 기반 스타일링
- **shadcn/ui**: 복사-붙여넣기 방식의 컴포넌트
  - 완전한 커스터마이징 가능
  - 번들 크기 최소화
  - 실무 표준 기술

### Mock 데이터 사용

백엔드 개발 완료 전까지 `lib/api.ts`의 Mock 데이터로 UI/UX 개발 진행
```typescript
const USE_MOCK = true  // 백엔드 준비되면 false로 변경
```