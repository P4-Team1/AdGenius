from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.content import Content, ContentType
from app.schemas.content import ContentCreate, ContentUpdate


class CRUDContent:
    """Content CRUD operations"""
    
    def create_with_project(self, db: Session, *, obj_in: ContentCreate, project_id: int) -> Content:
        """
        프로젝트에 속한 콘텐츠 생성
        
        Args:
            db: 데이터베이스 세션
            obj_in: 생성할 콘텐츠 데이터
            project_id: 프로젝트 ID
            
        Returns:
            생성된 콘텐츠 객체
        """
        db_obj = Content(
            project_id=project_id,
            type=obj_in.type,
            user_prompt=obj_in.user_prompt,
            ai_config=obj_in.ai_config,
            original_image_path=obj_in.original_image_path,
            is_success=True  # 기본값은 성공으로 설정
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_by_project(self, db: Session, *, project_id: int, skip: int = 0, limit: int = 100) -> list[Content]:
        """
        프로젝트에 속한 콘텐츠 목록 조회
        
        Args:
            db: 데이터베이스 세션
            project_id: 프로젝트 ID
            skip: 건너뛸 레코드 수
            limit: 최대 조회 레코드 수
            
        Returns:
            콘텐츠 목록
        """
        return (
            db.query(Content)
            .filter(Content.project_id == project_id)
            .order_by(Content.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_project_and_id(self, db: Session, *, project_id: int, content_id: int) -> Optional[Content]:
        """
        프로젝트에 속한 특정 콘텐츠 조회
        
        Args:
            db: 데이터베이스 세션
            project_id: 프로젝트 ID
            content_id: 콘텐츠 ID
            
        Returns:
            콘텐츠 객체 또는 None
        """
        return (
            db.query(Content)
            .filter(and_(Content.project_id == project_id, Content.id == content_id))
            .first()
        )
    
    def get_by_type(self, db: Session, *, content_type: ContentType, skip: int = 0, limit: int = 100) -> list[Content]:
        """
        타입별 콘텐츠 목록 조회
        
        Args:
            db: 데이터베이스 세션
            content_type: 콘텐츠 타입
            skip: 건너뛸 레코드 수
            limit: 최대 조회 레코드 수
            
        Returns:
            콘텐츠 목록
        """
        return (
            db.query(Content)
            .filter(Content.type == content_type)
            .order_by(Content.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def update_generation_result(
        self, 
        db: Session, 
        *, 
        db_obj: Content, 
        result_image_path: Optional[str] = None,
        ad_copy: Optional[str] = None,
        generation_time: Optional[int] = None,
        is_success: bool = True,
        error_message: Optional[str] = None
    ) -> Content:
        """
        생성 결과 업데이트
        
        Args:
            db: 데이터베이스 세션
            db_obj: 업데이트할 콘텐츠 객체
            result_image_path: 결과 이미지 경로
            ad_copy: 생성된 광고 문구
            generation_time: 생성 시간 (초)
            is_success: 생성 성공 여부
            error_message: 에러 메시지
            
        Returns:
            업데이트된 콘텐츠 객체
        """
        update_data = {
            "is_success": is_success
        }
        
        if result_image_path is not None:
            update_data["result_image_path"] = result_image_path
        if ad_copy is not None:
            update_data["ad_copy"] = ad_copy
        if generation_time is not None:
            update_data["generation_time"] = generation_time
        if error_message is not None:
            update_data["error_message"] = error_message
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update(self, db: Session, *, db_obj: Content, obj_in: ContentUpdate) -> Content:
        """
        콘텐츠 정보 업데이트
        
        Args:
            db: 데이터베이스 세션
            db_obj: 업데이트할 콘텐츠 객체
            obj_in: 업데이트할 데이터
            
        Returns:
            업데이트된 콘텐츠 객체
        """
        update_data = obj_in.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get(self, db: Session, id: int) -> Optional[Content]:
        """
        ID로 콘텐츠 조회
        
        Args:
            db: 데이터베이스 세션
            id: 콘텐츠 ID
            
        Returns:
            콘텐츠 객체 또는 None
        """
        return db.query(Content).filter(Content.id == id).first()
    
    def get_multi(self, db: Session, *, skip: int = 0, limit: int = 100) -> list[Content]:
        """
        여러 콘텐츠 조회
        
        Args:
            db: 데이터베이스 세션
            skip: 건너뛸 레코드 수
            limit: 최대 조회 레코드 수
            
        Returns:
            콘텐츠 목록
        """
        return (
            db.query(Content)
            .order_by(Content.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_project(self, db: Session, *, project_id: int) -> list[Content]:
        """
        프로젝트에 속한 모든 콘텐츠 조회
        
        Args:
            db: 데이터베이스 세션
            project_id: 프로젝트 ID
            
        Returns:
            콘텐츠 목록
        """
        return (
            db.query(Content)
            .filter(Content.project_id == project_id)
            .order_by(Content.created_at.desc())
            .all()
        )
    
    def remove_by_project_and_id(self, db: Session, *, project_id: int, content_id: int) -> Content:
        """
        프로젝트에 속한 콘텐츠 삭제
        
        Args:
            db: 데이터베이스 세션
            project_id: 프로젝트 ID
            content_id: 콘텐츠 ID
            
        Returns:
            삭제된 콘텐츠 객체
        """
        obj = self.get_by_project_and_id(db=db, project_id=project_id, content_id=content_id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj
    
    def update_llm_results(self, db: Session, *, db_obj: Content, optimized_prompt: Optional[str] = None, ad_copy: Optional[str] = None) -> Content:
        """
        LLM 결과 업데이트
        
        Args:
            db: 데이터베이스 세션
            db_obj: 업데이트할 콘텐츠 객체
            optimized_prompt: 최적화된 프롬프트
            ad_copy: 광고 문구
            
        Returns:
            업데이트된 콘텐츠 객체
        """
        if optimized_prompt is not None:
            db_obj.optimized_prompt = optimized_prompt
        if ad_copy is not None:
            db_obj.ad_copy = ad_copy
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def remove(self, db: Session, *, id: int) -> Content:
        """
        콘텐츠 삭제
        
        Args:
            db: 데이터베이스 세션
            id: 콘텐츠 ID
            
        Returns:
            삭제된 콘텐츠 객체
        """
        obj = self.get(db=db, id=id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj


# CRUD 인스턴스 생성
crud_content = CRUDContent()
