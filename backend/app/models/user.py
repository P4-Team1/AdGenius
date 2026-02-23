from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base


class BusinessType(enum.Enum):
    restaurant = "restaurant"
    clothing = "clothing"
    service = "service"
    beauty = "beauty"
    education = "education"
    medical = "medical"
    retail = "retail"
    etc = "etc"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    business_type = Column(Enum(BusinessType), nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    stores = relationship("Store", back_populates="owner", cascade="all, delete-orphan")
