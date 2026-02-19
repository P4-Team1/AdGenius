from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field, field_validator
from typing import Optional
import logging
import time
import os
from sqlalchemy.orm import Session

from app.services.flux_service import flux_service
from app.services.llm_service import llm_service
from app.crud import crud_content, crud_project
from app.models.content import ContentType
from app.api.deps import get_db, get_current_user
from app.schemas.content import ContentCreate, Content as ContentSchema

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic 스키마 정의
class ContentGenerateRequest(BaseModel):
    """콘텐츠 생성 요청 스키마"""
    ad_description: str = Field(..., min_length=1, max_length=1000, description="광고할 제품/가게 설명")
    image_prompt: str = Field(..., min_length=1, max_length=1000, description="생성할 이미지 묘사")
    text_in_image: Optional[str] = Field(None, max_length=100, description="이미지 안의 텍스트")
    negative_prompt: Optional[str] = Field("", max_length=1000, description="부정 프롬프트")
    seed: Optional[int] = Field(None, ge=0, le=4294967295, description="시드 값")
    steps: Optional[int] = Field(None, ge=1, le=100, description="생성 스텝 수")
    cfg: Optional[float] = Field(1.0, ge=1.0, le=20.0, description="CFG 스케일")
    width: Optional[int] = Field(None, ge=256, le=2048, description="이미지 너비")
    height: Optional[int] = Field(None, ge=256, le=2048, description="이미지 높이")
    sampler_name: Optional[str] = Field("euler", description="샘플러 이름")
    scheduler: Optional[str] = Field("simple", description="스케줄러 이름")
    project_id: int = Field(..., description="프로젝트 ID")
    
    @field_validator('sampler_name')
    @classmethod
    def validate_sampler_name(cls, v):
        allowed_samplers = [
            "euler", "euler_ancestral", "heun", "heunpp2", 
            "dpm_2", "dpm_2_ancestral", "lms", "dpm_fast", 
            "dpm_adaptive", "ddim", "uni_pc", "uni_pc_bh2"
        ]
        if v not in allowed_samplers:
            raise ValueError(f'sampler_name은 {allowed_samplers} 중 하나여야 합니다.')
        return v

    @field_validator('scheduler')
    @classmethod
    def validate_scheduler(cls, v):
        allowed_schedulers = ["simple", "normal", "karras", "exponential", "sgm_uniform", "beta"]
        if v not in allowed_schedulers:
            raise ValueError(f'scheduler은 {allowed_schedulers} 중 하나여야 합니다.')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "ad_description": "시원한 여름 맥주 가게. 젊은 층을 타겟으로 신선함과 청량감 강조",
                "image_prompt": "상큼한 맥주 잔이 얼음과 레몬 조각과 함께 놓여있는 여름 해변",
                "negative_prompt": "blurry, low quality, distorted",
                "seed": 12345,
                "steps": 20,
                "cfg": 1.0,
                "width": 1024,
                "height": 1024,
                "sampler_name": "euler",
                "scheduler": "simple"
            }
        }

class ContentGenerateResponse(BaseModel):
    """콘텐츠 생성 응답 스키마"""
    success: bool = Field(..., description="생성 성공 여부")
    message: str = Field(..., description="결과 메시지")
    image_path: Optional[str] = Field(None, description="생성된 이미지 파일 경로")
    image_url: Optional[str] = Field(None, description="생성된 이미지 URL (향후 구현)")
    content_id: Optional[int] = Field(None, description="생성된 콘텐츠 ID")
    generation_time: Optional[int] = Field(None, description="생성 시간 (초)")
    optimized_prompt: Optional[str] = Field(None, description="AI가 최적화한 영어 프롬프트")
    ad_copy: Optional[str] = Field(None, description="AI가 생성한 광고 문구")
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "이미지가 성공적으로 생성되었습니다.",
                "image_path": "backend/outputs/txt2images/qwen_result_20260209_154500_9_0.png",
                "image_url": None,
                "content_id": 123,
                "generation_time": 15,
                "optimized_prompt": "A cinematic shot of a cold beer bottle on a sunny beach, hyper realistic, 8k",
                "ad_copy": "🍺 여름을 시원하게! 상큼한 맥주로 더위를 식혀보세요 ✨ #맥주 #여름음료 #시원한여름 #카페 #상큼함"
            }
        }

@router.post("/generate", response_model=ContentGenerateResponse)
async def create_content(
    request: ContentGenerateRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    AI 마케팅 콘텐츠 생성 엔드포인트
    
    1. LLM으로 프롬프트 최적화 및 광고 문구 생성
    2. FLUX 모델로 이미지 생성
    3. 생성 결과를 DB에 저장하고 반환
    
    Args:
        request: 콘텐츠 생성 요청 (광고 설명, 이미지 프롬프트 등)
        db: 데이터베이스 세션
        current_user: 현재 인증된 사용자
        
    Returns:
        ContentGenerateResponse: 생성된 콘텐츠 정보 (image_url, optimized_prompt, ad_copy 등)
    """
    try:
        logger.info(f"이미지 생성 요청: 광고 내용={request.ad_description[:50]}..., 이미지 묘사={request.image_prompt[:50]}...")
        logger.info(f"🔍 DEBUG: 수신된 project_id: {request.project_id}")
        
        # 생성 시작 시간 기록
        start_time = time.time()
        
        # 파라미터 준비 (기본값 설정)
        params = {
            "negative_prompt": request.negative_prompt or "",
            "cfg": request.cfg if request.cfg is not None else 1.0,
            "sampler_name": request.sampler_name,
            "scheduler": request.scheduler
        }
        
        # 선택적 파라미터 추가 (None 값만 필터링)
        if request.seed is not None:
            params["seed"] = request.seed
        if request.steps is not None:
            params["steps"] = request.steps
        if request.width is not None:
            params["width"] = request.width
        if request.height is not None:
            params["height"] = request.height
        
        # 프로젝트 ID 사용 (요청에서 받은 ID 사용)
        project_id = request.project_id
        logger.info(f"🔍 DEBUG: 사용할 project_id: {project_id}")
        
        # 1. 콘텐츠 생성 기록 시작
        content_create = ContentCreate(
            project_id=project_id,
            type=ContentType.IMAGE_GEN,
            user_prompt=request.ad_description,  # 광고 내용 저장
            image_prompt=request.image_prompt,  # 이미지 묘사 저장
            ai_config=params
        )
        
        content_record = crud_content.create_with_project(db, obj_in=content_create, project_id=project_id)
        logger.info(f"콘텐츠 생성 기록 시작: ID {content_record.id}")
        
        # 2. 프로젝트 정보 조회
        project = crud_project.get(db=db, id=project_id)
        if not project:
            raise HTTPException(
                status_code=404,
                detail="프로젝트를 찾을 수 없습니다."
            )
        
        # LLM으로 프롬프트 최적화
        optimized_prompt = await llm_service.optimize_prompt(
            request.image_prompt, 
            request.text_in_image
        )
        
        # 광고 문구 생성
        ad_copy = await llm_service.generate_ad_copy(
            request.ad_description,
            optimized_prompt
        )
        
        # 이미지 생성
        result = await flux_service.generate_image(
            prompt=optimized_prompt,
            width=1024,
            height=1024,
            steps=4,
            seed=request.seed
        )
        
        image_path = result.get("image_path")
        
        # 최종 결과값 로깅
        logger.info(f" Final Results - image_path: {image_path}")
        logger.info(f" Final Results - optimized_prompt: {optimized_prompt}")
        logger.info(f" Final Results - ad_copy: {ad_copy}")
        
        # 4. 생성 시간 계산
        generation_time = int(time.time() - start_time)
        
        if image_path:
            # 5. 성공 시 DB 업데이트
            crud_content.update_generation_result(
                db=db,
                db_obj=content_record,
                result_image_path=image_path,
                generation_time=generation_time,
                is_success=True
            )
            
            # LLM 결과 저장
            if optimized_prompt or ad_copy:
                crud_content.update_llm_results(
                    db=db,
                    db_obj=content_record,
                    optimized_prompt=optimized_prompt,
                    ad_copy=ad_copy
                )
            
            logger.info(f"이미지 생성 성공: {image_path} (소요 시간: {generation_time}초)")
            
            # 🔍 응답 데이터 최종 확인
            response_data = ContentGenerateResponse(
                success=True,
                message="이미지가 성공적으로 생성되었습니다.",
                image_path=image_path,
                image_url=f"/images/{image_path}",  # 정적 파일 URL 생성 (순수 파일명)
                content_id=content_record.id,
                generation_time=generation_time,
                optimized_prompt=optimized_prompt,
                ad_copy=ad_copy
            )
            logger.info(f"🔍 Response Data - optimized_prompt: {response_data.optimized_prompt}")
            logger.info(f"🔍 Response Data - ad_copy: {response_data.ad_copy}")
            
            return response_data
        else:
            # 6. 실패 시 DB 업데이트
            crud_content.update_generation_result(
                db=db,
                db_obj=content_record,
                generation_time=generation_time,
                is_success=False,
                error_message="이미지 생성 실패: 결과 없음"
            )
            
            logger.error(f"이미지 생성 실패: 결과 없음 (소요 시간: {generation_time}초)")
            raise HTTPException(
                status_code=500,
                detail="이미지 생성에 실패했습니다. 서버 로그를 확인해주세요."
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"이미지 생성 중 예외 발생: {str(e)}")
        
        # 실패 시 DB에 에러 기록 (content_record가 있는 경우)
        try:
            if 'content_record' in locals():
                crud_content.update_generation_result(
                    db=db,
                    db_obj=content_record,
                    generation_time=int(time.time() - start_time) if 'start_time' in locals() else 0,
                    is_success=False,
                    error_message=str(e)
                )
        except:
            pass  # DB 기록 실패는 무시
        
        raise HTTPException(
            status_code=500,
            detail=f"서버 내부 오류가 발생했습니다: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """서비스 상태 확인 엔드포인트"""
    return {"status": "healthy", "service": "content_generator"}


@router.get("/{content_id}/image")
async def get_content_image(
    content_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    콘텐츠 이미지 파일 서빙 엔드포인트
    
    DB에 저장된 이미지 경로에서 파일명을 추출하여 실제 파일을 서빙합니다.
    os.path.basename()을 사용하여 /images/ 접두어가 있는 경우와 없는 경우를 모두 처리합니다.
    
    Args:
        content_id: 이미지를 가져올 콘텐츠 ID
        db: 데이터베이스 세션
        current_user: 현재 인증된 사용자
        
    Returns:
        FileResponse: PNG 이미지 파일
        
    Raises:
        404: 콘텐츠가 없거나 이미지 파일을 찾을 수 없을 때
        403: 접근 권한이 없을 때
    """
    try:
        # 1. 콘텐츠 조회
        content = crud_content.get(db=db, id=content_id)
        if not content:
            raise HTTPException(
                status_code=404,
                detail="콘텐츠를 찾을 수 없습니다."
            )
        
        # 2. 접근 권한 확인 (프로젝트 소유자인지 체크)
        project = crud_project.get(db=db, id=content.project_id)
        if not project:
            raise HTTPException(
                status_code=404,
                detail="프로젝트를 찾을 수 없습니다."
            )
        
        # 프로젝트의 가게 소유자 확인
        from app.crud import crud_store
        store = crud_store.get(db=db, id=project.store_id)
        if not store or store.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="이 콘텐츠에 접근할 권한이 없습니다."
            )
        
        # 3. 이미지 파일 존재 확인
        if not content.result_image_path:
            raise HTTPException(
                status_code=404,
                detail="이미지 파일이 없습니다."
            )
        
        # 4. 강력한 파일명 추출
        import os
        db_path = str(content.result_image_path)
        filename = os.path.basename(db_path)
        
        # 5. 경로 결합
        from app.core.config import settings
        file_path = settings.BASE_DIR / "outputs" / "txt2img" / filename
        
        # 6. 디버깅 로그 강화
        print(f"=== 이미지 경로 디버깅 ===")
        print(f"DB 원본 값: {db_path}")
        print(f"추출된 파일명: {filename}")
        print(f"최종 조립된 절대 경로: {file_path.absolute()}")
        print(f"파일 존재 여부: {file_path.exists()}")
        
        # 7. 파일 존재 여부 체크 및 폴더 내용 확인
        if not file_path.exists():
            outputs_dir = settings.BASE_DIR / "outputs" / "txt2img"
            print(f"outputs/txt2img 폴더 내용:")
            try:
                files = os.listdir(outputs_dir)
                for f in files[:10]:  # 처음 10개 파일만 표시
                    print(f"  - {f}")
                if len(files) > 10:
                    print(f"  ... 그 외 {len(files) - 10}개 파일")
            except Exception as e:
                print(f"  폴더 목록 조회 실패: {e}")
            
            logger.error(f"이미지 파일을 찾을 수 없음: {file_path}")
            raise HTTPException(
                status_code=404,
                detail="이미지 파일을 찾을 수 없습니다."
            )
        
        # 8. 파일 반환
        return FileResponse(
            path=str(file_path),
            media_type="image/png",
            filename=f"content_{content_id}_image.png"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"이미지 서빙 중 오류 발생: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"이미지를 가져오는 중 오류가 발생했습니다: {str(e)}"
        )
