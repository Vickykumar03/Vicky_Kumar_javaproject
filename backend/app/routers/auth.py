from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.all_models import User, CitizenProfile, Household
from app.schemas.all_schemas import UserRegister, UserLogin, Token, UserOut
from app.routers.deps import get_current_user, require_current_user, log_action

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if email exists
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
    
    # Hash password and create user
    user = User(
        email=user_in.email,
        phone=user_in.phone,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role if user_in.role in ["citizen", "facilitator", "authority", "admin"] else "citizen",
        preferred_language=user_in.preferred_language or "hi"
    )
    db.add(user)
    db.flush() # populate user.id
    
    # Create CitizenProfile and Household if citizen
    if user.role == "citizen":
        profile = CitizenProfile(user_id=user.id)
        household = Household(user_id=user.id)
        db.add(profile)
        db.add(household)
        
    db.commit()
    db.refresh(user)
    
    log_action(db, action="USER_REGISTER", target_type="USER", target_id=user.id, user=user)
    
    token = create_access_token(data={"sub": user.id, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "phone": user.phone,
            "preferred_language": user.preferred_language
        }
    }

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account has been deactivated."
        )
        
    token = create_access_token(data={"sub": user.id, "role": user.role})
    log_action(db, action="USER_LOGIN", target_type="USER", target_id=user.id, user=user)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "phone": user.phone,
            "preferred_language": user.preferred_language
        }
    }

@router.get("/me")
def get_current_user_profile(user: User = Depends(require_current_user), db: Session = Depends(get_db)):
    profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == user.id).first()
    household = db.query(Household).filter(Household.user_id == user.id).first()
    
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "phone": user.phone,
            "full_name": user.full_name,
            "role": user.role,
            "preferred_language": user.preferred_language,
            "created_at": user.created_at
        },
        "citizen_profile": {
            "district_id": profile.district_id if profile else None,
            "block_id": profile.block_id if profile else None,
            "panchayat_id": profile.panchayat_id if profile else None,
            "village_id": profile.village_id if profile else None,
            "gender": profile.gender if profile else None,
            "dob": profile.dob if profile else None,
            "aadhaar_last_four": profile.aadhaar_last_four if profile else None,
            "social_category": profile.social_category if profile else None,
            "occupation": profile.occupation if profile else None,
            "annual_income": profile.annual_income if profile else 0.0,
            "is_bpl": profile.is_bpl if profile else False,
            "ration_card_type": profile.ration_card_type if profile else None,
        } if profile else None,
        "household": {
            "house_type": household.house_type if household else "kutcha",
            "has_toilet": household.has_toilet if household else False,
            "has_electricity": household.has_electricity if household else True,
            "landholding_acres": household.landholding_acres if household else 0.0,
            "has_piped_water": household.has_piped_water if household else False,
            "members_count": household.members_count if household else 1,
            "has_elderly_or_widow": household.has_elderly_or_widow if household else False,
            "has_differently_abled": household.has_differently_abled if household else False
        } if household else None
    }
