from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.all_models import SchemeApplication, ApplicationUpdate, Scheme, User, Notification
from app.schemas.all_schemas import ApplicationCreate, ApplicationUpdateIn, ApplicationOut
from app.routers.deps import require_current_user, log_action

router = APIRouter(prefix="/applications", tags=["Scheme Applications & Assistance"])

@router.post("", response_model=ApplicationOut)
def request_application_assistance(
    app_in: ApplicationCreate,
    user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    scheme = db.query(Scheme).filter(Scheme.id == app_in.scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
        
    application = SchemeApplication(
        user_id=user.id,
        scheme_id=app_in.scheme_id,
        official_reference_number=app_in.official_reference_number,
        documents_checklist=app_in.documents_checklist or [],
        citizen_consent=app_in.citizen_consent,
        notes=app_in.notes,
        current_status="assistance_requested"
    )
    db.add(application)
    db.flush()
    
    # Add initial update entry
    initial_update = ApplicationUpdate(
        application_id=application.id,
        status="assistance_requested",
        notes="Citizen initiated assistance request via GramConnect.",
        updated_by_user_id=user.id
    )
    db.add(initial_update)
    
    # Notify user
    notif = Notification(
        user_id=user.id,
        title_en=f"Application Assistance Request Logged: {scheme.name_en}",
        title_hi=f"आवेदन सहायता अनुरोध दर्ज किया गया: {scheme.name_hi}",
        message_en=f"Your assistance request for {scheme.name_en} has been recorded. A GramSaksham facilitator or village representative will assist with document verification.",
        message_hi=f"{scheme.name_hi} के लिए आपका सहायता अनुरोध दर्ज कर लिया गया है। दस्तावेज़ सत्यापन में सहायता प्रदान की जाएगी।",
        link=f"/applications/{application.id}"
    )
    db.add(notif)
    
    db.commit()
    db.refresh(application)
    
    log_action(db, action="CREATE_APPLICATION", target_type="APPLICATION", target_id=application.id, user=user)
    
    return ApplicationOut(
        id=application.id,
        user_id=application.user_id,
        scheme_id=application.scheme_id,
        scheme_name_en=scheme.name_en,
        scheme_name_hi=scheme.name_hi,
        facilitator_id=application.facilitator_id,
        official_reference_number=application.official_reference_number,
        current_status=application.current_status,
        documents_checklist=application.documents_checklist,
        citizen_consent=application.citizen_consent,
        notes=application.notes,
        created_at=application.created_at,
        updated_at=application.updated_at
    )

@router.get("/my")
def get_my_applications(
    user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    apps = (
        db.query(SchemeApplication)
        .filter(SchemeApplication.user_id == user.id)
        .order_by(SchemeApplication.created_at.desc())
        .all()
    )
    return [
        {
            "id": a.id,
            "scheme_id": a.scheme_id,
            "scheme_name_en": a.scheme.name_en if a.scheme else "",
            "scheme_name_hi": a.scheme.name_hi if a.scheme else "",
            "official_reference_number": a.official_reference_number,
            "current_status": a.current_status,
            "documents_checklist": a.documents_checklist,
            "notes": a.notes,
            "created_at": a.created_at,
            "updated_at": a.updated_at
        }
        for a in apps
    ]

@router.get("/{app_id}")
def get_application_details(
    app_id: str,
    user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    application = db.query(SchemeApplication).filter(SchemeApplication.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
        
    # Check permissions
    if user.role == "citizen" and application.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this application")
        
    updates = (
        db.query(ApplicationUpdate)
        .filter(ApplicationUpdate.application_id == application.id)
        .order_by(ApplicationUpdate.created_at.asc())
        .all()
    )
    
    return {
        "id": application.id,
        "user_id": application.user_id,
        "scheme_id": application.scheme_id,
        "scheme_name_en": application.scheme.name_en if application.scheme else "",
        "scheme_name_hi": application.scheme.name_hi if application.scheme else "",
        "official_reference_number": application.official_reference_number,
        "current_status": application.current_status,
        "documents_checklist": application.documents_checklist,
        "notes": application.notes,
        "created_at": application.created_at,
        "updated_at": application.updated_at,
        "updates": [
            {
                "id": u.id,
                "status": u.status,
                "notes": u.notes,
                "created_at": u.created_at
            }
            for u in updates
        ]
    }

@router.put("/{app_id}/status")
def update_application_status(
    app_id: str,
    update_in: ApplicationUpdateIn,
    user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    application = db.query(SchemeApplication).filter(SchemeApplication.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
        
    # Ensure allowed role
    if user.role not in ["facilitator", "admin", "authority"] and application.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    application.current_status = update_in.status
    if update_in.notes:
        application.notes = update_in.notes
        
    upd = ApplicationUpdate(
        application_id=application.id,
        status=update_in.status,
        notes=update_in.notes,
        updated_by_user_id=user.id
    )
    db.add(upd)
    db.commit()
    log_action(db, action="UPDATE_APPLICATION_STATUS", target_type="APPLICATION", target_id=application.id, user=user)
    return {"message": "Status updated successfully", "status": update_in.status}
