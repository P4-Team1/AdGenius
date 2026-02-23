from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    brand_name = Column(String, index=True, nullable=False)
    brand_tone = Column(String, nullable=False)  # 예: 고급스러운, 친근한, 전문적인 등
    description = Column(Text, nullable=True)  # 가게 설명 (선택사항)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="stores")
    projects = relationship("Project", back_populates="store", cascade="all, delete-orphan")
