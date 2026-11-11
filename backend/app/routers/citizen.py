from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.all_models import (
    User, CitizenProfile, Household, SchemeApplication, Complaint, EligibilityAssessment, Notification
)
from app.schemas.all_schemas import CitizenProfileUpdate, HouseholdUpdate
from app.routers.deps import require_current_user, log_action

router = APIRouter(prefix="/citizen", tags=["Citizen Profile & Dashboard"])

@router.put("/profile")
def update_profile(
    data: CitizenProfileUpdate,
    user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == user.id).first()
    if not profile:
        profile = CitizenProfile(user_id=user.id)
        db.add(profile)
        
    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(profile, field, val)
        
    db.commit()
    db.refresh(profile)
    log_action(db, action="UPDATE_CITIZEN_PROFILE", target_type="CITIZEN_PROFILE", target_id=profile.id, user=user)
    return {"message": "Profile updated successfully", "profile": data}

@router.put("/household")
def update_household(
    data: HouseholdUpdate,
    user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    household = db.query(Household).filter(Household.user_id == user.id).first()
    if not household:
        household = Household(user_id=user.id)
        db.add(household)
        
    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(household, field, val)
        
    db.commit()
    db.refresh(household)
    log_action(db, action="UPDATE_HOUSEHOLD", target_type="HOUSEHOLD", target_id=household.id, user=user)
    return {"message": "Household updated successfully", "household": data}

@router.get("/dashboard-summary")
def get_citizen_dashboard(
    user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == user.id).first()
    household = db.query(Household).filter(Household.user_id == user.id).first()
    
    # Calculate profile completion percentage
    fields_checked = [
        profile.district_id if profile else None,
        profile.block_id if profile else None,
        profile.panchayat_id if profile else None,
        profile.village_id if profile else None,
        profile.gender if profile else None,
        profile.social_category if profile else None,
        profile.annual_income if profile else None,
        profile.occupation if profile else None,
        household.house_type if household else None,
        household.has_toilet if household else None,
    ]
    completed_fields = sum(1 for f in fields_checked if f is not None and f != "")
    profile_completion = int((completed_fields / len(fields_checked)) * 100)
    
    # Recent applications
    applications = (
        db.query(SchemeApplication)
        .filter(SchemeApplication.user_id == user.id)
        .order_by(SchemeApplication.created_at.desc())
        .limit(5)
        .all()
    )
    
    # Recent complaints
    complaints = (
        db.query(Complaint)
        .filter(Complaint.user_id == user.id)
        .order_by(Complaint.created_at.desc())
        .limit(5)
        .all()
    )
    
    # Recent assessments
    assessments = (
        db.query(EligibilityAssessment)
        .filter(EligibilityAssessment.user_id == user.id)
        .order_by(EligibilityAssessment.created_at.desc())
        .limit(5)
        .all()
    )
    
    # Notifications
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "profile_completion": profile_completion,
        "total_applications": db.query(SchemeApplication).filter(SchemeApplication.user_id == user.id).count(),
        "total_complaints": db.query(Complaint).filter(Complaint.user_id == user.id).count(),
        "total_assessments": db.query(EligibilityAssessment).filter(EligibilityAssessment.user_id == user.id).count(),
        "recent_applications": [
            {
                "id": a.id,
                "scheme_name_en": a.scheme.name_en if a.scheme else "Unknown",
                "scheme_name_hi": a.scheme.name_hi if a.scheme else "अज्ञात",
                "status": a.current_status,
                "official_reference_number": a.official_reference_number,
                "created_at": a.created_at
            }
            for a in applications
        ],
        "recent_complaints": [
            {
                "id": c.id,
                "tracking_number": c.tracking_number,
                "category": c.category,
                "status": c.current_status,
                "incident_date": c.incident_date,
                "is_conflict_flagged": c.is_conflict_flagged,
                "created_at": c.created_at
            }
            for c in complaints
        ],
        "recent_assessments": [
            {
                "id": asmt.id,
                "scheme_id": asmt.scheme_id,
                "scheme_name_en": asmt.scheme.name_en if asmt.scheme else "Unknown",
                "scheme_name_hi": asmt.scheme.name_hi if asmt.scheme else "अज्ञात",
                "status": asmt.status,
                "created_at": asmt.created_at
            }
            for asmt in assessments
        ],
        "notifications": [
            {
                "id": n.id,
                "title_en": n.title_en,
                "title_hi": n.title_hi,
                "message_en": n.message_en,
                "message_hi": n.message_hi,
                "link": n.link,
                "is_read": n.is_read,
                "created_at": n.created_at
            }
            for n in notifications
        ]
    }
