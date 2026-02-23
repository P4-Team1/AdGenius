from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.project import Project, ProjectStatus
from app.schemas.project import ProjectCreate, ProjectUpdate


class CRUDProject:
    """Project CRUD operations"""
    
    def create_with_store(self, db: Session, *, obj_in: ProjectCreate, store_id: int) -> Project:
        """
        가게에 속한 프로젝트 생성
        
        Args:
            db: 데이터베이스 세션
            obj_in: 생성할 프로젝트 데이터
            store_id: 가게 ID
            
        Returns:
            생성된 프로젝트 객체
        """
        db_obj = Project(
            store_id=store_id,
            title=obj_in.title,
            description=obj_in.description,
            status=obj_in.status or ProjectStatus.DRAFT
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_by_store(self, db: Session, *, store_id: int, skip: int = 0, limit: int = 100) -> List[Project]:
        """
        가게에 속한 프로젝트 목록 조회
        
        Args:
            db: 데이터베이스 세션
            store_id: 가게 ID
            skip: 건너뛸 레코드 수
            limit: 최대 조회 레코드 수
            
        Returns:
            프로젝트 목록
        """
        return (
            db.query(Project)
            .filter(Project.store_id == store_id)
            .order_by(Project.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_store_and_id(self, db: Session, *, store_id: int, project_id: int) -> Optional[Project]:
        """
        가게에 속한 특정 프로젝트 조회
        
        Args:
            db: 데이터베이스 세션
            store_id: 가게 ID
            project_id: 프로젝트 ID
            
        Returns:
            프로젝트 객체 또는 None
        """
        return (
            db.query(Project)
            .filter(and_(Project.store_id == store_id, Project.id == project_id))
            .first()
        )
    
    def get_by_status(self, db: Session, *, status: ProjectStatus, skip: int = 0, limit: int = 100) -> List[Project]:
        """
        상태별 프로젝트 목록 조회
        
        Args:
            db: 데이터베이스 세션
            status: 프로젝트 상태
            skip: 건너뛸 레코드 수
            limit: 최대 조회 레코드 수
            
        Returns:
            프로젝트 목록
        """
        return (
            db.query(Project)
            .filter(Project.status == status)
            .order_by(Project.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_stores(self, db: Session, *, store_ids: List[int], skip: int = 0, limit: int = 100) -> List[Project]:
        """
        여러 가게에 속한 모든 프로젝트 조회
        
        Args:
            db: 데이터베이스 세션
            store_ids: 가게 ID 목록
            skip: 건너뛸 레코드 수
            limit: 최대 조회 레코드 수
            
        Returns:
            프로젝트 목록
        """
        return (
            db.query(Project)
            .filter(Project.store_id.in_(store_ids))
            .order_by(Project.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_active_projects_by_stores(self, db: Session, *, store_ids: List[int], skip: int = 0, limit: int = 100) -> List[Project]:
        """
        여러 가게에 속한 활성 프로젝트 목록 조회 (초안, 완성 상태)
        
        Args:
            db: 데이터베이스 세션
            store_ids: 가게 ID 목록
            skip: 건너뛸 레코드 수
            limit: 최대 조회 레코드 수
            
        Returns:
            활성 프로젝트 목록
        """
        return (
            db.query(Project)
            .filter(
                and_(
                    Project.store_id.in_(store_ids),
                    Project.status.in_([ProjectStatus.DRAFT, ProjectStatus.COMPLETED])
                )
            )
            .order_by(Project.updated_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_status_and_stores(self, db: Session, *, store_ids: List[int], status: ProjectStatus, skip: int = 0, limit: int = 100) -> List[Project]:
        """
        여러 가게에 속한 특정 상태의 프로젝트 조회
        
        Args:
            db: 데이터베이스 세션
            store_ids: 가게 ID 목록
            status: 프로젝트 상태
            skip: 건너뛸 레코드 수
            limit: 최대 조회 레코드 수
            
        Returns:
            프로젝트 목록
        """
        return (
            db.query(Project)
            .filter(
                and_(
                    Project.store_id.in_(store_ids),
                    Project.status == status
                )
            )
            .order_by(Project.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def update(self, db: Session, *, db_obj: Project, obj_in: ProjectUpdate) -> Project:
        """
        프로젝트 정보 업데이트
        
        Args:
            db: 데이터베이스 세션
            db_obj: 업데이트할 프로젝트 객체
            obj_in: 업데이트할 데이터
            
        Returns:
            업데이트된 프로젝트 객체
        """
        update_data = obj_in.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get(self, db: Session, id: int) -> Optional[Project]:
        """
        ID로 프로젝트 조회
        
        Args:
            db: 데이터베이스 세션
            id: 프로젝트 ID
            
        Returns:
            프로젝트 객체 또는 None
        """
        return db.query(Project).filter(Project.id == id).first()
    
    def get_multi(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Project]:
        """
        여러 프로젝트 조회
        
        Args:
            db: 데이터베이스 세션
            skip: 건너뛸 레코드 수
            limit: 최대 조회 레코드 수
            
        Returns:
            프로젝트 목록
        """
        return (
            db.query(Project)
            .order_by(Project.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def remove_by_store_and_id(self, db: Session, *, store_id: int, project_id: int) -> Project:
        """
        가게에 속한 프로젝트 삭제
        
        Args:
            db: 데이터베이스 세션
            store_id: 가게 ID
            project_id: 프로젝트 ID
            
        Returns:
            삭제된 프로젝트 객체
        """
        obj = self.get_by_store_and_id(db=db, store_id=store_id, project_id=project_id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj
    
    def remove(self, db: Session, *, id: int) -> Project:
        """
        프로젝트 삭제
        
        Args:
            db: 데이터베이스 세션
            id: 프로젝트 ID
            
        Returns:
            삭제된 프로젝트 객체
        """
        obj = self.get(db=db, id=id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj
    
    def set_status(self, db: Session, *, db_obj: Project, status: ProjectStatus) -> Project:
        """
        프로젝트 상태 변경
        
        Args:
            db: 데이터베이스 세션
            db_obj: 업데이트할 프로젝트 객체
            status: 새로운 상태
            
        Returns:
            업데이트된 프로젝트 객체
        """
        db_obj.status = status
        db.commit()
        db.refresh(db_obj)
        return db_obj


# CRUD 인스턴스 생성
crud_project = CRUDProject()
