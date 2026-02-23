from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
import logging
import time
import os
import shutil
from pathlib import Path
from sqlalchemy.orm import Session

from app.crud import crud_project, crud_store, crud_content
from app.models.project import ProjectStatus
from app.api.deps import get_db, get_current_user
from app.schemas.project import ProjectCreate, ProjectUpdate, Project as ProjectSchema

router = APIRouter()


@router.post("", response_model=ProjectSchema)
async def create_project(
    *,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    project_in: ProjectCreate
):
    """
    프로젝트 생성 엔드포인트
    
    - **title**: 프로젝트 제목 (필수)
    - **description**: 프로젝트 설명 (선택)
    - **status**: 프로젝트 상태 (기본값: draft)
    - **store_id**: 가게 ID (필수)
    """
    try:
        # 가게 ID 검증 - 실제 가게 소유자 확인
        from app.crud import crud_store
        
        store = crud_store.get(db=db, id=project_in.store_id)
        if store is None:
            raise HTTPException(
                status_code=404,
                detail="가게를 찾을 수 없습니다."
            )
        
        # 디버깅 로그
        print(f"Store Owner: {store.user_id}, Current User: {current_user.id}")
        
        # 가게 소유권 확인
        if store.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="본인의 가게에만 프로젝트를 생성할 수 있습니다."
            )
        
        project = crud_project.create_with_store(
            db=db, 
            obj_in=project_in, 
            store_id=project_in.store_id
        )
        return project
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"프로젝트 생성 중 오류 발생: {str(e)}"
        )


@router.get("", response_model=List[ProjectSchema])
async def get_projects(
    *,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    skip: int = Query(0, ge=0, description="건너뛸 레코드 수"),
    limit: int = Query(100, ge=1, le=100, description="최대 조회 레코드 수"),
    status: Optional[ProjectStatus] = Query(None, description="프로젝트 상태 필터"),
    active_only: bool = Query(False, description="활성 프로젝트만 조회 (draft, completed)")
):
    """
    프로젝트 목록 조회 엔드포인트
    
    - **skip**: 건너뛸 레코드 수 (페이지네이션용)
    - **limit**: 최대 조회 레코드 수
    - **status**: 특정 상태의 프로젝트만 필터링 (선택)
    - **active_only**: 활성 프로젝트(draft, completed)만 조회
    """
    try:
        # 사용자의 모든 가게 ID 조회
        from app.crud import crud_store
        
        user_stores = crud_store.get_by_user_id(db=db, user_id=current_user.id)
        store_ids = [store.id for store in user_stores]
        
        if not store_ids:
            # 가게가 없으면 빈 목록 반환
            return []
        
        if active_only:
            # 활성 프로젝트만 조회 (사용자의 모든 가게)
            projects = crud_project.get_active_projects_by_stores(
                db=db, 
                store_ids=store_ids, 
                skip=skip, 
                limit=limit
            )
        elif status:
            # 특정 상태의 프로젝트 조회 (사용자의 모든 가게)
            projects = crud_project.get_by_status_and_stores(
                db=db, 
                store_ids=store_ids,
                status=status, 
                skip=skip, 
                limit=limit
            )
        else:
            # 사용자의 모든 가게에 속한 모든 프로젝트 조회
            projects = crud_project.get_by_stores(
                db=db, 
                store_ids=store_ids, 
                skip=skip, 
                limit=limit
            )
        
        return projects
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"프로젝트 목록 조회 중 오류 발생: {str(e)}"
        )


@router.get("/{project_id}", response_model=ProjectSchema)
async def get_project(
    *,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    project_id: int
):
    """
    특정 프로젝트 조회 엔드포인트
    
    - **project_id**: 조회할 프로젝트 ID
    """
    try:
        from app.crud import crud_store
        
        # 1. 프로젝트 단건 조회
        project = crud_project.get(db=db, id=project_id)
        if not project:
            raise HTTPException(
                status_code=404,
                detail=f"프로젝트 ID {project_id}를 찾을 수 없습니다."
            )
            
        # 2. 해당 프로젝트의 가게가 현재 사용자의 소유인지 확인
        store = crud_store.get(db=db, id=project.store_id)
        if not store or store.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="해당 프로젝트를 조회할 권한이 없습니다."
            )
        
        return project
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"프로젝트 조회 중 오류 발생: {str(e)}"
        )


@router.put("/{project_id}", response_model=ProjectSchema)
async def update_project(
    *,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    project_id: int,
    project_in: ProjectUpdate
):
    """
    프로젝트 수정 엔드포인트
    
    - **project_id**: 수정할 프로젝트 ID
    - **title**: 새로운 제목 (선택)
    - **description**: 새로운 설명 (선택)
    - **status**: 새로운 상태 (선택)
    """
    try:
        from app.crud import crud_store
        
        # 1. 프로젝트 단건 조회
        project = crud_project.get(db=db, id=project_id)
        if not project:
            raise HTTPException(
                status_code=404,
                detail=f"프로젝트 ID {project_id}를 찾을 수 없습니다."
            )
            
        # 2. 해당 프로젝트의 가게가 현재 사용자의 소유인지 확인
        store = crud_store.get(db=db, id=project.store_id)
        if not store or store.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="해당 프로젝트를 수정할 권한이 없습니다."
            )
        
        updated_project = crud_project.update(db=db, db_obj=project, obj_in=project_in)
        return updated_project
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"프로젝트 수정 중 오류 발생: {str(e)}"
        )


@router.delete("/{project_id}")
async def delete_project(
    *,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    project_id: int
):
    """
    프로젝트 삭제 엔드포인트
    
    - **project_id**: 삭제할 프로젝트 ID
    """
    try:
        # 1. 프로젝트 조회 및 권한 확인
        project = crud_project.get(db=db, id=project_id)
        if not project:
            raise HTTPException(
                status_code=404,
                detail=f"프로젝트 ID {project_id}를 찾을 수 없습니다."
            )
        
        # 프로젝트의 가게 소유자 확인
        store = crud_store.get(db=db, id=project.store_id)
        if not store or store.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="이 프로젝트를 삭제할 권한이 없습니다."
            )
        
        # 2. 연관된 콘텐츠 삭제
        contents = crud_content.get_by_project(db=db, project_id=project_id)
        for content in contents:
            crud_content.remove(db=db, id=content.id)
        
        # 3. 프로젝트 폴더 삭제
        storage_base_path = Path(__file__).parent.parent.parent / "storage"
        project_folder = storage_base_path / f"store_{project.store_id}" / f"project_{project_id}"
        
        if project_folder.exists():
            try:
                shutil.rmtree(project_folder)
                logger.info(f"프로젝트 폴더 삭제 완료: {project_folder}")
            except Exception as e:
                logger.error(f"프로젝트 폴더 삭제 실패: {e}")
                # 폴더 삭제 실패해도 프로젝트는 삭제 진행
        
        # 4. 프로젝트 삭제
        crud_project.remove(db=db, id=project_id)
        
        return {"message": f"프로젝트 ID {project_id}가 성공적으로 삭제되었습니다."}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"프로젝트 삭제 중 오류 발생: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"프로젝트 삭제 중 오류 발생: {str(e)}"
        )


@router.get("/{project_id}/contents", response_model=List[Dict[str, Any]])
async def get_project_contents(
    *,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    project_id: int
):
    """
    프로젝트 콘텐츠 조회 엔드포인트
    
    - **project_id**: 콘텐츠를 조회할 프로젝트 ID
    """
    try:
        # 1. 프로젝트 조회 및 권한 확인
        project = crud_project.get(db=db, id=project_id)
        if not project:
            raise HTTPException(
                status_code=404,
                detail=f"프로젝트 ID {project_id}를 찾을 수 없습니다."
            )
        
        # 프로젝트의 가게 소유자 확인
        store = crud_store.get(db=db, id=project.store_id)
        if not store or store.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="이 프로젝트의 콘텐츠를 조회할 권한이 없습니다."
            )
        
        # 2. 프로젝트 콘텐츠 조회
        contents = crud_content.get_by_project(db=db, project_id=project_id)
        
        # 3. 응답 형식 변환
        result = []
        for content in contents:
            content_data = {
                "id": content.id,
                "type": content.type.value,
                "user_prompt": content.user_prompt,
                "result_image_path": content.result_image_path,
                "is_success": content.is_success,
                "generation_time": content.generation_time,
                "created_at": content.created_at.isoformat() if content.created_at else None,
                "updated_at": content.updated_at.isoformat() if content.updated_at else None,
            }
            result.append(content_data)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"프로젝트 콘텐츠 조회 중 오류 발생: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"프로젝트 콘텐츠 조회 중 오류 발생: {str(e)}"
        )


@router.patch("/{project_id}/status")
async def update_project_status(
    *,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    project_id: int,
    status: ProjectStatus
):
    """
    프로젝트 상태 변경 엔드포인트
    
    - **project_id**: 상태를 변경할 프로젝트 ID
    - **status**: 새로운 상태 (draft, completed, archived)
    """
    try:
        from app.crud import crud_store
        
        # 1. 프로젝트 단건 조회
        project = crud_project.get(db=db, id=project_id)
        if not project:
            raise HTTPException(
                status_code=404,
                detail=f"프로젝트 ID {project_id}를 찾을 수 없습니다."
            )
            
        # 2. 해당 프로젝트의 가게가 현재 사용자의 소유인지 확인
        store = crud_store.get(db=db, id=project.store_id)
        if not store or store.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="해당 프로젝트의 상태를 변경할 권한이 없습니다."
            )
        
        updated_project = crud_project.set_status(db=db, db_obj=project, status=status)
        return updated_project
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"프로젝트 상태 변경 중 오류 발생: {str(e)}"
        )
