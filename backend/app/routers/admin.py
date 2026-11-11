from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.all_models import (
    User, Scheme, SchemeRule, EligibilityAssessment, SchemeApplication,
    Complaint, Authority, AuditLog, WaterReport, InfrastructureProject
)
from app.schemas.all_schemas import (
    AdminStatsOut, AuthorityCreate, AuthorityOut, AuditLogOut, SchemeOut
)
from app.routers.deps import require_roles, log_action

router = APIRouter(prefix="/admin", tags=["Administrator Dashboard"])

@router.get("/stats", response_model=AdminStatsOut)
def get_admin_stats(
    user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    total_citizens = db.query(User).filter(User.role == "citizen").count()
    total_facilitators = db.query(User).filter(User.role == "facilitator").count()
    total_authorities = db.query(User).filter(User.role == "authority").count()
    total_schemes = db.query(Scheme).count()
    total_assessments = db.query(EligibilityAssessment).count()
    total_applications = db.query(SchemeApplication).count()
    
    total_complaints = db.query(Complaint).count()
    pending_complaints = db.query(Complaint).filter(Complaint.current_status.in_(["submitted", "acknowledged"])).count()
    under_review_complaints = db.query(Complaint).filter(Complaint.current_status.in_(["under_review", "referred_to_authority", "investigation_in_progress"])).count()
    action_reported_complaints = db.query(Complaint).filter(Complaint.current_status == "action_reported").count()
    closed_complaints = db.query(Complaint).filter(Complaint.current_status == "closed").count()
    conflict_flagged_complaints = db.query(Complaint).filter(Complaint.is_conflict_flagged == True).count()
    
    total_water = db.query(WaterReport).count()
    total_infra = db.query(InfrastructureProject).count()
    
    return AdminStatsOut(
        total_citizens=total_citizens,
        total_facilitators=total_facilitators,
        total_authorities=total_authorities,
        total_schemes=total_schemes,
        total_assessments=total_assessments,
        total_applications=total_applications,
        total_complaints=total_complaints,
        pending_complaints=pending_complaints,
        under_review_complaints=under_review_complaints,
        action_reported_complaints=action_reported_complaints,
        closed_complaints=closed_complaints,
        conflict_flagged_complaints=conflict_flagged_complaints,
        total_water_reports=total_water,
        total_infrastructure_projects=total_infra
    )

@router.get("/users")
def list_users(
    user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "phone": u.phone,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at
        }
        for u in users
    ]

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: str,
    role: str,
    current_admin: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    if role not in ["citizen", "facilitator", "authority", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
        
    target_user.role = role
    db.commit()
    log_action(db, action="UPDATE_USER_ROLE", target_type="USER", target_id=target_user.id, user=current_admin, details={"new_role": role})
    return {"message": f"User role updated to {role}"}

@router.get("/authorities", response_model=List[AuthorityOut])
def list_authorities(
    user: User = Depends(require_roles(["admin", "authority"])),
    db: Session = Depends(get_db)
):
    return db.query(Authority).all()

@router.post("/authorities", response_model=AuthorityOut)
def create_authority(
    auth_in: AuthorityCreate,
    current_admin: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    authority = Authority(
        name_en=auth_in.name_en,
        name_hi=auth_in.name_hi,
        department=auth_in.department,
        designation=auth_in.designation,
        hierarchy_level=auth_in.hierarchy_level,
        district_id=auth_in.district_id,
        block_id=auth_in.block_id,
        contact_email=auth_in.contact_email,
        contact_phone=auth_in.contact_phone
    )
    db.add(authority)
    db.commit()
    db.refresh(authority)
    log_action(db, action="CREATE_AUTHORITY", target_type="AUTHORITY", target_id=authority.id, user=current_admin)
    return authority

@router.get("/audit-logs", response_model=List[AuditLogOut])
def get_audit_logs(
    user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()
