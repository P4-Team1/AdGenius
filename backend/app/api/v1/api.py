from fastapi import APIRouter

from app.api.v1.endpoints import auth, stores, contents, contents_list, projects, users

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["인증"])
api_router.include_router(users.router, prefix="/users", tags=["사용자 관리"])
api_router.include_router(stores.router, prefix="/stores", tags=["가게 관리"])
api_router.include_router(projects.router, prefix="/projects", tags=["프로젝트 관리"])
api_router.include_router(contents.router, prefix="/contents", tags=["콘텐츠 생성"])
api_router.include_router(contents_list.router, prefix="/contents", tags=["콘텐츠 관리"])
