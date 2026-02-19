from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from sqlalchemy.orm import Session

from app.crud import crud_content
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
    content_type: Optional[ContentType] = Query(None, description="콘텐츠 타입 필터")
):
    """
    콘텐츠 목록 조회 엔드포인트
    
    - **skip**: 건너뛸 레코드 수 (페이지네이션용)
    - **limit**: 최대 조회 레코드 수
    - **content_type**: 특정 타입의 콘텐츠만 필터링 (선택)
    """
    try:
        # TODO: 실제 프로젝트 ID는 현재 로그인한 사용자의 활성 프로젝트에서 가져와야 함
        # 임시로 사용자 ID를 프로젝트 ID로 사용 (향후 수정 필요)
        project_id = current_user.id
        
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
        # TODO: 실제 프로젝트 ID는 현재 로그인한 사용자의 활성 프로젝트에서 가져와야 함
        # 임시로 사용자 ID를 프로젝트 ID로 사용 (향후 수정 필요)
        project_id = current_user.id
        
        content = crud_content.get_by_project_and_id(
            db=db, 
            project_id=project_id, 
            content_id=content_id
        )
        
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
        # TODO: 실제 프로젝트 ID는 현재 로그인한 사용자의 활성 프로젝트에서 가져와야 함
        # 임시로 사용자 ID를 프로젝트 ID로 사용 (향후 수정 필요)
        project_id = current_user.id
        
        content = crud_content.remove_by_project_and_id(
            db=db, 
            project_id=project_id, 
            content_id=content_id
        )
        
        if not content:
            raise HTTPException(
                status_code=404,
                detail=f"콘텐츠 ID {content_id}를 찾을 수 없습니다."
            )
        
        return {"message": f"콘텐츠 ID {content_id}가 성공적으로 삭제되었습니다."}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"콘텐츠 삭제 중 오류 발생: {str(e)}"
        )
