# AI 마케팅 콘텐츠 생성 서비스 - 최종 인수인계 보고서

**작성일**: 2026년 2월 19일  
**버전**: 1.0.0  
**상태**: ✅ 백엔드 API 완성

---

## 📊 현재 상태

### ✅ 완료된 기능
- **인증 시스템**: JWT 기반 회원가입/로그인 완료
- **가게 관리**: CRUD API 엔드포인트 완료
- **프로젝트 관리**: CRUD API 엔드포인트 완료
- **AI 콘텐츠 생성**: FLUX.1-schnell 기반 이미지 생성 완료
- **데이터베이스**: SQLite 마이그레이션 완료
- **정적 파일 서빙**: 생성된 이미지 접근 완료

### 🔄 주요 변경 사항

#### 1. 데이터베이스 마이그레이션
- **PostgreSQL → SQLite**: 개발 편의성을 위해 SQLite로 전환
- **자동 테이블 생성**: FastAPI 시작 시 자동으로 테이블 생성
- **로컬 파일 저장**: `app.db` 파일에 데이터 저장

#### 2. 이미지 생성 엔진 전환
- **ComfyUI → Diffusers**: 외부 의존성 제거, 내부 모델 로딩으로 전환
- **모델**: `Keffisor21/flux1-schnell-bnb-nf4` (NF4 양자화 버전)
- **메모리 최적화**: CPU 오프로드, bfloat16 타입 사용
- **Lazy Loading**: 최초 요청 시 모델 로드

#### 3. 이미지 경로 처리 개선
- **문제**: DB에 저장된 경로와 실제 파일 경로 불일치导致的 404 에러
- **해결**: `os.path.basename()`으로 파일명 추출 후 경로 재조립
- **유연성**: `/images/flux_xxx.png`와 `flux_xxx.png` 형식 모두 지원

---

## 🏗️ 아키텍처

### 백엔드 기술 스택
```
FastAPI 0.104.1
├── Database: SQLite
├── Auth: JWT (python-jose)
├── AI Models:
│   ├── FLUX.1-schnell (NF4 quantized)
│   └── OpenAI GPT (prompt optimization)
├── Image Processing: Diffusers, PyTorch
└── File Storage: Local filesystem
```

### 핵심 서비스
- **FluxService**: 이미지 생성 (Diffusers 기반)
- **LLMService**: 프롬프트 최적화 및 광고 문구 생성
- **AuthService**: JWT 인증
- **CRUD Services**: 데이터베이스 조작

---

## 🔌 API 연동 가이드(예시)

### 1. 이미지 생성 API
```python
POST /api/v1/contents/generate

Request Body:
{
    "ad_description": "따뜻한 커피를 파는 카페",
    "image_prompt": "따뜻한 분위기의 카페 내부, 커피 잔, 햇살",
    "text_in_image": "Best Coffee",
    "project_id": 1,
    "seed": 12345,
    "steps": 4,
    "width": 1024,
    "height": 1024
}

Response:
{
    "success": true,
    "content_id": 123,
    "image_url": "/images/flux_a5fb7bfd.png",
    "image_path": "flux_a5fb7bfd.png",
    "optimized_prompt": "A warm cozy coffee shop interior...",
    "ad_copy": "🍺 여름을 시원하게! 상큼한 맥주로...",
    "generation_time": 15.2
}
```

### 2. 이미지 조회 API
```python
GET /api/v1/contents/{id}/image

Headers:
Authorization: Bearer <jwt-token>

Response: FileResponse (PNG 이미지)
```

### 3. 정적 파일 접근
```python
GET /images/{filename}

예: http://localhost:8000/images/flux_a5fb7bfd.png
```

---

## 🗂️ 파일 구조

```
backend/
├── app/
│   ├── api/v1/endpoints
│   │   ├── auth.py          # 인증 API
│   │   ├── contents.py      # 콘텐츠 생성 API
│   │   ├── stores.py        # 가게 관리 API
│   │   └── projects.py      # 프로젝트 관리 API
│   ├── core/
│   │   ├── config.py        # 설정 관리
│   │   └── security.py      # JWT 보안
│   ├── crud/
│   │   ├── crud_store.py    # 가게 CRUD
│   │   ├── crud_project.py  # 프로젝트 CRUD
│   │   └── crud_content.py  # 콘텐츠 CRUD
│   ├── models/
│   │   ├── user.py          # 사용자 모델
│   │   ├── store.py         # 가게 모델
│   │   ├── project.py       # 프로젝트 모델
│   │   └── content.py       # 콘텐츠 모델
│   ├── services/
│   │   ├── flux_service.py  # FLUX 이미지 생성
│   │   ├── llm_service.py   # LLM 서비스
│   ├── db/
│   │   └── session.py       # 데이터베이스 세션
│   └── main.py              # FastAPI 앱
├── outputs/txt2img/         # 생성된 이미지 저장
├── app.db                   # SQLite 데이터베이스
├── requirements.txt         # 의존성
├── .env                     # 환경 변수
└── .gitignore              # Git 무시 파일
```

---

## 🔧 트러블슈팅 로그

### 1. 404 에러 (이미지)
**증상**: 생성된 이미지에 접근할 수 없었음
**원인**: DB 경로와 파일 시스템 경로 불일치
**해결**: 
- `outputs/txt2img` 폴더 확인
- 디버깅 로그 확인 (DB 원본 값, 추출된 파일명, 최종 경로)
- 권한 확인

### 2. 모델 로딩 에러
**증상**: FLUX 모델 로딩 실패
**원인**: 허깅페이스 연결, VRAM 부족, 토큰 문제
**해결**:
- 인터넷 연결 확인 (최초 다운로드 시)
- HuggingFace 토큰 확인
- VRAM 공간 확인 (NF4 버전으로 최적화됨)

### 3. bcrypt 에러
**증상**: `bcrypt` 관련 설치 에러
**해결**:
```bash
pip install bcrypt==4.0.1
```

### 4. 데이터베이스 에러
**증상**: SQLite 접근 에러
**해결**:
- `app.db` 파일 권한 확인
- 디렉토리 쓰기 권한 확인

---

## 📱 프론트엔드 연동

### 필수 엔드포인트
1. **인증**: `/api/v1/auth/login`, `/api/v1/auth/register`
2. **가게 관리**: `/api/v1/stores`
3. **프로젝트 관리**: `/api/v1/projects`
4. **콘텐츠 생성**: `/api/v1/contents/generate`
5. **이미지 조회**: `/api/v1/contents/{id}/image`

### 인증 방식
- JWT Bearer Token
- Header: `Authorization: Bearer <token>`
- 만료: 30분 (설정 가능)

### 이미지 처리
- 생성: `POST` 응답으로 `image_url` 받음
- 조회: `GET /images/{filename}` 또는 `GET /api/v1/contents/{id}/image`
- 포맷: PNG (1024x1024, 기본값)

---

## 🚀 배포 준비

### 1. 환경 변수
```env
DATABASE_URL=sqlite:///./app.db
SECRET_KEY=your-production-secret-key
OPENAI_API_KEY=your-openai-api-key
HF_TOKEN=your-huggingface-token
```

### 2. 의존성 확인
- `requirements.txt`에 모든 필수 패키지 포함
- 버전 고정하여 안정성 확보

### 3. 보안
- `.env` 파일은 `.gitignore`에 포함
- `SECRET_KEY`는 반드시 변경
- 프로덕션 환경에서는 `DEBUG=False`

### 4. 모델 캐싱
- 최초 실행 시 모델 다운로드 (약 2-3GB)
- 캐싱으로 이후 실행 시 빠른 로드

---

## 📋 향후 개선 가능한 영역

### 1. 성능 최적화
- 이미지 생성 큐 시스템
- 모델 언로딩 기능
- 캐싱 레이어 강화

### 2. 기능 확장
- 다양한 이미지 크기 지원
- 배치 이미지 생성
- 이미지 편집 기능

### 3. 운영
- 로깅 시스템 강화
- 모니터링 대시보드
- 에러 알림 시스템

### 4. 보안 강화
- API 속도 제한
- 사용자 권한 세분화
- 입력값 검증 강화

.
.
.

---

## ✅ 최종 확인리스트

- [✅] SQLite 데이터베이스 연동
- [✅] JWT 인증 시스템
- [✅] 가게/프로젝트 CRUD API
- [✅] FLUX 이미지 생성 (Diffusers)
- [✅] LLM 프롬프트 최적화
- [✅] 이미지 경로 404 해결
- [✅] 정적 파일 서빙
- [✅] API 문서 (Swagger)
- [✅] 에러 핸들링
- [✅] 로깅 시스템
- [✅] 환경 변수 관리
- [✅] Git 무시 설정
- [✅] README 문서화

---

## 🎯 결론

백엔드 API 개발이 완료되었습니다. 핵심 기능인 AI 마케팅 콘텐츠 생성이 안정적으로 동작하며, 프론트엔드 연동이 가능한 상태입니다. FLUX.1-schnell 모델을 통한 고품질 이미지 생성과 LLM을 통한 광고 문구 최적화가 구현되었습니다.

주요 기술적 도전 과제(Diffusers, 양자화 적용, PostgreSQL → SQLite 마이그레이션, 경로 문제)가 모두 해결되었으며, 안정적인 운영이 가능한 아키텍처가 구축되었습니다.

**프로젝트는 프론트엔드 연동 및 배포 단계로 진행할 준비가 되었습니다.** 🚀
