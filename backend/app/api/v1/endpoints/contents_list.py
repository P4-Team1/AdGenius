from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from sqlalchemy.orm import Session

from app.crud import crud_content, crud_project, crud_store
from app.models.content import ContentType
from app.api.deps import get_db, get_current_user
from app.schemas.content import Content as ContentSchema

router = APIRouter()


@router.get("/", response_model=List[ContentSchema])
async def get_contents(
    *,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    skip: int = Query(0, ge=0, description="건너뛸 레코드 수"),
    limit: int = Query(100, ge=1, le=100, description="최대 조회 레코드 수"),
    project_id: int = Query(..., description="프로젝트 ID"),
    content_type: Optional[ContentType] = Query(None, description="콘텐츠 타입 필터")
):
    """
    콘텐츠 목록 조회 엔드포인트
    
    - **skip**: 건너뛸 레코드 수 (페이지네이션용)
    - **limit**: 최대 조회 레코드 수
    - **content_type**: 특정 타입의 콘텐츠만 필터링 (선택)
    """
    try:
        # 권한 확인: 해당 프로젝트가 사용자의 것인지 검증
        project = crud_project.get(db=db, id=project_id)
        if not project:
            raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")
            
        store = crud_store.get(db=db, id=project.store_id)
        if not store or store.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="프로젝트에 접근할 권한이 없습니다.")
        
        if content_type:
            # 특정 타입의 콘텐츠만 조회
            contents = crud_content.get_by_type(
                db=db, 
                content_type=content_type, 
                skip=skip, 
                limit=limit
            )
        else:
            # 프로젝트에 속한 모든 콘텐츠 조회
            contents = crud_content.get_by_project(
                db=db, 
                project_id=project_id, 
                skip=skip, 
                limit=limit
            )
        
        return contents
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"콘텐츠 목록 조회 중 오류 발생: {str(e)}"
        )


@router.get("/{content_id}", response_model=ContentSchema)
async def get_content(
    *,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    content_id: int
):
    """
    특정 콘텐츠 조회 엔드포인트
    
    - **content_id**: 조회할 콘텐츠 ID
    """
    try:
        content = crud_content.get(db=db, id=content_id)
        
        if not content:
            raise HTTPException(
                status_code=404,
                detail=f"콘텐츠 ID {content_id}를 찾을 수 없습니다."
            )
            
        # 권한 확인
        project = crud_project.get(db=db, id=content.project_id)
        if not project:
            raise HTTPException(status_code=404, detail="관련 프로젝트를 찾을 수 없습니다.")
            
        store = crud_store.get(db=db, id=project.store_id)
        if not store or store.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="이 콘텐츠에 접근할 권한이 없습니다.")
        
        if not content:
            raise HTTPException(
                status_code=404,
                detail=f"콘텐츠 ID {content_id}를 찾을 수 없습니다."
            )
        
        return content
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"콘텐츠 조회 중 오류 발생: {str(e)}"
        )


@router.delete("/{content_id}")
async def delete_content(
    *,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    content_id: int
):
    """
    콘텐츠 삭제 엔드포인트
    
    - **content_id**: 삭제할 콘텐츠 ID
    """
    try:
        # 1. 콘텐츠 및 권한 확인
        content = crud_content.get(db=db, id=content_id)
        if not content:
            raise HTTPException(status_code=404, detail=f"콘텐츠 ID {content_id}를 찾을 수 없습니다.")
            
        project = crud_project.get(db=db, id=content.project_id)
        if not project:
            raise HTTPException(status_code=404, detail="관련 프로젝트를 찾을 수 없습니다.")
            
        store = crud_store.get(db=db, id=project.store_id)
        if not store or store.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="이 콘텐츠를 삭제할 권한이 없습니다.")
            
        # 2. 실제 삭제 수행
        crud_content.remove(db=db, id=content_id)
        
        return {"message": f"콘텐츠 ID {content_id}가 성공적으로 삭제되었습니다."}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"콘텐츠 삭제 중 오류 발생: {str(e)}"
        )
