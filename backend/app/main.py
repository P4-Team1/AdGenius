import sys
import asyncio
import traceback

# Windows 환경에서 비동기 루프 정책 설정
if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

import os

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.v1.api import api_router
from app.services.flux_service import flux_service
from app.db.base_class import Base
from app.db.session import engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 수명 주기 관리"""
    # 시작 시 실행
    print("🚀 Application startup...")
    
    # SQLite 테이블 생성
    print("🔧 Creating database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")
    
    try:
        # Flux 모델을 백그라운드에서 로드 (서버 시작을 블로킹하지 않음)
        import threading
        def _load_flux():
            try:
                print("🔧 Flux 모델 로딩 중... (백그라운드)")
                flux_service._load_model()
                print("✅ Flux 모델 준비 완료")
            except Exception as e:
                print(f"⚠️ Flux 모델 로딩 실패: {e}")
                print("   이미지 생성 요청 시 자동으로 재시도됩니다.")
        threading.Thread(target=_load_flux, daemon=True).start()
    except Exception as e:
        print(f"⚠️ Flux 백그라운드 로딩 시작 실패: {e}")
    
    yield
    
    # 종료 시 실행
    print("🛑 Application shutdown...")
    try:
        if flux_service.pipe is not None:
            del flux_service.pipe
            flux_service.pipe = None
        print("✅ Flux 모델 정리 완료")
    except Exception as e:
        print(f"⚠️ Flux 모델 정리 실패: {e}")

app = FastAPI(
    title=settings.APP_NAME,
    description="소상공인 자동 배너광고 서비스 API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

# 정적 파일 서빙 - 생성된 이미지 접근
app.mount("/images", StaticFiles(directory="outputs/txt2img"), name="images")
app.mount("/static", StaticFiles(directory="static"), name="static")

# 전역 예외 처리기
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print("=" * 50)
    print("GLOBAL EXCEPTION CAUGHT:")
    print(f"Request: {request.method} {request.url}")
    print(f"Error Type: {type(exc).__name__}")
    print(f"Error Message: {str(exc)}")
    print("Traceback:")
    traceback.print_exc()
    print("=" * 50)
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal Server Error",
            "error_type": type(exc).__name__,
            "error_message": str(exc)
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.get("/")
async def root():
    return {
        "message": "소상공인 자동 배너광고 서비스 API", 
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "app_name": settings.APP_NAME}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
