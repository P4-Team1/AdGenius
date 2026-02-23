# 🎨 AdGenius — AI 광고 생성 플랫폼

소상공인을 위한 AI 기반 스마트 광고 솔루션.
디자인 지식 없이도 인스타그램, 틱톡, 당근마켓, 네이버 블로그에 최적화된 광고 이미지를 자동 생성합니다.

---

## 주요 기능

- 🖼️ **AI 이미지 생성** — Flux Schnell 모델 기반 광고 이미지 자동 생성
- 📝 **AI 광고 문구** — GPT-4o-mini 기반 광고 카피 자동 생성
- 📱 **플랫폼 배포** — 인스타그램 / 틱톡 / 당근마켓 / 네이버 블로그 원클릭 배포
- 🏪 **가게 & 프로젝트 관리** — 다중 가게, 프로젝트별 광고 관리
- 🌙 **다크모드** — 라이트 / 다크 / 시스템 테마 지원

---

## 기술 스택

| 영역         | 기술                                             |
| ------------ | ------------------------------------------------ |
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS   |
| **Backend**  | FastAPI, SQLAlchemy, SQLite                      |
| **AI**       | Flux Schnell (이미지 생성), GPT-4o-mini (텍스트) |
| **인증**     | JWT, bcrypt                                      |
| **배포**     | Docker, Docker Compose                           |

---

## 빠른 시작

### 사전 준비

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 설치
- [OpenAI API Key](https://platform.openai.com/api-keys) 발급

### 1. 클론 및 환경변수 설정

```bash
git clone https://github.com/<your-username>/AdsProject.git
cd AdsProject
cp backend/.env.example backend/.env
```

`backend/.env`를 열고 `OPENAI_API_KEY`를 입력합니다.

### 2. Docker로 실행

**GPU 있는 경우** (기본, NVIDIA Container Toolkit 필요):

```bash
docker compose up --build -d
```

**GPU 없는 경우** (CPU 전용):

```bash
docker compose --profile cpu up --build -d frontend backend-cpu
```

### 3. 접속

| 서비스    | URL                        |
| --------- | -------------------------- |
| 웹 서비스 | http://localhost:3000      |
| API 문서  | http://localhost:8000/docs |

> 자세한 배포 방법은 [배포 가이드](배포_가이드.md)를 참고하세요.

---

## 로컬 개발 (Docker 없이)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # API 키 입력
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000/docs

---

## 프로젝트 구조

```
AdsProject/
├── docker-compose.yml       # Docker 오케스트레이션 (GPU/CPU)
├── backend/
│   ├── Dockerfile           # GPU 지원 (CUDA PyTorch)
│   ├── Dockerfile.cpu       # CPU 전용 (경량)
│   ├── .env.example         # 환경변수 템플릿
│   ├── requirements.txt     # Python 의존성
│   ├── requirements-cpu.txt # CPU 전용 의존성
│   └── app/                 # FastAPI 소스코드
│       ├── api/             # API 엔드포인트
│       ├── crud/            # 데이터베이스 CRUD
│       ├── models/          # SQLAlchemy 모델
│       ├── schemas/         # Pydantic 스키마
│       └── services/        # AI 서비스 (Flux, OpenAI)
├── frontend/
│   ├── Dockerfile           # Next.js 프로덕션 빌드
│   ├── app/                 # Next.js 페이지
│   ├── components/          # React 컴포넌트
│   ├── lib/                 # API 클라이언트
│   ├── hooks/               # 커스텀 훅
│   └── contexts/            # React Context
└── 배포_가이드.md             # 팀원용 배포 문서
```

---

## 라이선스

MIT License
