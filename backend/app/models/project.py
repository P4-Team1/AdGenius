from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base


class ProjectStatus(enum.Enum):
    DRAFT = "draft"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)  # 프로젝트 설명 (선택사항)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.DRAFT, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    store = relationship("Store", back_populates="projects")
    contents = relationship("Content", back_populates="project", cascade="all, delete-orphan")
