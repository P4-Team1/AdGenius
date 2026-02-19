from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_user
from app.models.user import User as UserModel
from app.models.store import Store as StoreModel
from app.schemas.user import User as UserSchema, Store as StoreSchema

router = APIRouter()


@router.get("/me", response_model=UserSchema)
async def get_current_user_info(
    *,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """
    현재 로그인한 사용자 정보 조회
    """
    try:
        # 사용자의 가게 정보 조회
        stores = db.query(StoreModel).filter(StoreModel.user_id == current_user.id).all()
        
        # 사용자 정보에 가게 목록 추가
        user_data = {
            "id": current_user.id,
            "email": current_user.email,
            "username": current_user.username,
            "business_type": current_user.business_type,
            "is_verified": current_user.is_verified,
            "is_active": current_user.is_active,
            "created_at": current_user.created_at,
            "updated_at": current_user.updated_at,
            "stores": stores
        }
        
        return user_data
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"사용자 정보 조회 중 오류 발생: {str(e)}"
        )
