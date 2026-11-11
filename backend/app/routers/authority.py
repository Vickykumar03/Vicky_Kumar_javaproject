from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.all_models import Complaint, ComplaintUpdate, Authority, User, Notification
from app.schemas.all_schemas import ComplaintStatusUpdateIn
from app.routers.deps import require_current_user, require_roles, log_action

router = APIRouter(prefix="/authority", tags=["Authority Dashboard"])

@router.get("/complaints")
def get_authority_complaints(
    user: User = Depends(require_roles(["authority", "admin"])),
    db: Session = Depends(get_db)
):
    # Retrieve authority records matching user email or general pool
    complaints = db.query(Complaint).order_by(Complaint.created_at.desc()).all()
    
    return [
        {
            "id": c.id,
            "tracking_number": c.tracking_number,
            "category": c.category,
            "scheme_or_service": c.scheme_or_service,
            "incident_date": c.incident_date,
            "description": c.description,
            "accused_name": c.accused_name,
            "accused_designation": c.accused_designation,
            "amount_demanded": c.amount_demanded,
            "payment_made": c.payment_made,
            "confidentiality": c.confidentiality,
            "current_status": c.current_status,
            "is_conflict_flagged": c.is_conflict_flagged,
            "routed_authority_id": c.routed_authority_id,
            "routed_authority_name": c.routed_authority.name_en if c.routed_authority else "Nodal Officer",
            "evidence_count": len(c.evidence),
            "created_at": c.created_at,
            "updated_at": c.updated_at
        }
        for c in complaints
    ]

@router.put("/complaints/{complaint_id}/status")
def update_complaint_status_by_authority(
    complaint_id: str,
    status_in: ComplaintStatusUpdateIn,
    user: User = Depends(require_roles(["authority", "admin"])),
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    prev_status = complaint.current_status
    complaint.current_status = status_in.new_status
    
    update_entry = ComplaintUpdate(
        complaint_id=complaint.id,
        previous_status=prev_status,
        new_status=status_in.new_status,
        action_taken_report=status_in.action_taken_report,
        remarks=status_in.remarks,
        updated_by_user_id=user.id
    )
    db.add(update_entry)
    
    # Notify citizen if complaint has a registered user
    if complaint.user_id:
        notif = Notification(
            user_id=complaint.user_id,
            title_en=f"Complaint Status Update: {complaint.tracking_number}",
            title_hi=f"शिकायत स्थिति में बदलाव: {complaint.tracking_number}",
            message_en=f"The status of your grievance {complaint.tracking_number} has been updated to: {status_in.new_status}.",
            message_hi=f"आपकी शिकायत {complaint.tracking_number} की स्थिति अब '{status_in.new_status}' है।",
            link=f"/complaints/track/{complaint.tracking_number}"
        )
        db.add(notif)
        
    db.commit()
    log_action(db, action="AUTHORITY_STATUS_UPDATE", target_type="COMPLAINT", target_id=complaint.id, user=user)
    return {"message": "Complaint status updated successfully", "status": complaint.current_status}
