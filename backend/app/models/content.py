from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base


class ContentType(enum.Enum):
    TEXT_AD = "text_ad"
    IMAGE_GEN = "image_gen"
    BACKGROUND_REMOVAL = "background_removal"
    SKETCH_TO_IMAGE = "sketch_to_image"


class Content(Base):
    __tablename__ = "contents"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    type = Column(Enum(ContentType), nullable=False)
    
    # File paths
    original_image_path = Column(String, nullable=True)  # 원본 이미지 경로 (nullable)
    result_image_path = Column(String, nullable=True)   # 결과 이미지 경로
    
    # Text content
    ad_copy = Column(Text, nullable=True)  # 생성된 광고 문구
    user_prompt = Column(Text, nullable=True)  # 사용자가 입력한 광고 내용 (ad_description)
    image_prompt = Column(Text, nullable=True)  # 사용자가 입력한 이미지 묘사 (image_prompt)
    optimized_prompt = Column(Text, nullable=True)  # AI가 최적화한 영어 프롬프트
    
    # AI configuration (JSON format for flexibility)
    ai_config = Column(JSON, nullable=True)  # seed, cfg_scale 등 재현을 위한 데이터
    
    # Metadata
    generation_time = Column(Integer, nullable=True)  # 생성 시간 (초)
    is_success = Column(String, default=True, nullable=False)  # 생성 성공 여부
    error_message = Column(Text, nullable=True)  # 에러 메시지
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    project = relationship("Project", back_populates="contents")
