import os
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.config import settings
from app.models.all_models import (
    Complaint, ComplaintEvidence, ComplaintUpdate, ComplaintEscalation, Authority, User, Notification
)
from app.schemas.all_schemas import (
    ComplaintCreate, ComplaintOut, ComplaintStatusUpdateIn, ComplaintEscalateIn, ComplaintFeedbackIn
)
from app.services.complaint_service import generate_tracking_number, route_complaint_with_conflict_check
from app.routers.deps import get_current_user, require_current_user, log_action

router = APIRouter(prefix="/complaints", tags=["Smart Panchayat Grievances"])

@router.post("", response_model=ComplaintOut)
def submit_complaint(
    comp_in: ComplaintCreate,
    user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tracking_num = generate_tracking_number(block_code="CH")
    
    complaint = Complaint(
        tracking_number=tracking_num,
        user_id=user.id if user else None,
        category=comp_in.category,
        scheme_or_service=comp_in.scheme_or_service,
        district_id=comp_in.district_id,
        block_id=comp_in.block_id,
        panchayat_id=comp_in.panchayat_id,
        village_id=comp_in.village_id,
        incident_date=comp_in.incident_date,
        description=comp_in.description,
        accused_name=comp_in.accused_name,
        accused_designation=comp_in.accused_designation,
        amount_demanded=comp_in.amount_demanded or 0.0,
        payment_made=comp_in.payment_made or False,
        confidentiality=comp_in.confidentiality or "confidential",
        current_status="submitted"
    )
    
    # Run conflict-of-interest check and higher authority routing
    routed_authority = route_complaint_with_conflict_check(
        db=db,
        complaint=complaint,
        accused_designation=comp_in.accused_designation,
        category=comp_in.category
    )
    
    db.add(complaint)
    db.flush()
    
    # Create initial timeline entry
    initial_update = ComplaintUpdate(
        complaint_id=complaint.id,
        previous_status="none",
        new_status="submitted",
        remarks=f"Complaint lodged via Smart Panchayat. Assigned tracking number {tracking_num}. "
                f"{'Conflict of interest detected against local Panchayat official: automatically routed to higher vigilance authority.' if complaint.is_conflict_flagged else 'Routed to assigned administrative nodal officer.'}",
        updated_by_user_id=user.id if user else None
    )
    db.add(initial_update)
    
    if user:
        notif = Notification(
            user_id=user.id,
            title_en=f"Complaint Lodged: {tracking_num}",
            title_hi=f"शिकायत दर्ज: {tracking_num}",
            message_en=f"Your grievance has been safely registered with tracking number {tracking_num}. Status updates will be tracked securely.",
            message_hi=f"आपकी शिकायत सुरक्षित रूप से संदर्भ संख्या {tracking_num} के साथ दर्ज कर ली गई है।",
            link=f"/complaints/track/{tracking_num}"
        )
        db.add(notif)
        
    db.commit()
    db.refresh(complaint)
    
    log_action(db, action="SUBMIT_COMPLAINT", target_type="COMPLAINT", target_id=complaint.id, user=user)
    
    return ComplaintOut(
        id=complaint.id,
        tracking_number=complaint.tracking_number,
        category=complaint.category,
        scheme_or_service=complaint.scheme_or_service,
        district_id=complaint.district_id,
        block_id=complaint.block_id,
        panchayat_id=complaint.panchayat_id,
        village_id=complaint.village_id,
        incident_date=complaint.incident_date,
        description=complaint.description,
        accused_name=complaint.accused_name,
        accused_designation=complaint.accused_designation,
        amount_demanded=complaint.amount_demanded,
        payment_made=complaint.payment_made,
        confidentiality=complaint.confidentiality,
        current_status=complaint.current_status,
        is_conflict_flagged=complaint.is_conflict_flagged,
        routed_authority_id=complaint.routed_authority_id,
        routed_authority_name=routed_authority.name_en if routed_authority else "Nodal Officer",
        citizen_feedback=complaint.citizen_feedback,
        reopen_reason=complaint.reopen_reason,
        created_at=complaint.created_at,
        updated_at=complaint.updated_at,
        evidence=[],
        updates=[{
            "id": initial_update.id,
            "previous_status": initial_update.previous_status,
            "new_status": initial_update.new_status,
            "action_taken_report": initial_update.action_taken_report,
            "remarks": initial_update.remarks,
            "created_at": initial_update.created_at
        }]
    )

@router.post("/{complaint_id}/evidence")
async def upload_evidence(
    complaint_id: str,
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    # File validation
    allowed_types = ["image/jpeg", "image/png", "image/webp", "application/pdf", "audio/mpeg", "audio/wav"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload JPG, PNG, PDF, or audio evidence.")
        
    safe_name = f"{complaint.tracking_number}_{file.filename}"
    file_path = settings.UPLOAD_DIR / safe_name
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    evidence = ComplaintEvidence(
        complaint_id=complaint.id,
        file_path=str(file_path),
        file_name=file.filename,
        file_type=file.content_type or "unknown",
        file_size_bytes=os.path.getsize(file_path),
        description=description
    )
    db.add(evidence)
    db.commit()
    
    log_action(db, action="UPLOAD_EVIDENCE", target_type="COMPLAINT_EVIDENCE", target_id=evidence.id, user=user)
    
    return {
        "message": "Evidence uploaded successfully",
        "evidence_id": evidence.id,
        "file_name": file.filename
    }

@router.get("/track/{tracking_number}")
def track_complaint(
    tracking_number: str,
    user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(Complaint.tracking_number == tracking_number).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint tracking reference not found.")
        
    updates = (
        db.query(ComplaintUpdate)
        .filter(ComplaintUpdate.complaint_id == complaint.id)
        .order_by(ComplaintUpdate.created_at.asc())
        .all()
    )
    
    evidence_list = []
    # If user is authorized (creator, admin, or authority)
    is_authorized = user and (user.role in ["admin", "authority"] or complaint.user_id == user.id)
    if is_authorized or complaint.confidentiality == "public":
        evidence_list = [
            {
                "id": ev.id,
                "file_name": ev.file_name,
                "file_type": ev.file_type,
                "description": ev.description,
                "created_at": ev.created_at
            }
            for ev in complaint.evidence
        ]
        
    return {
        "id": complaint.id,
        "tracking_number": complaint.tracking_number,
        "category": complaint.category,
        "scheme_or_service": complaint.scheme_or_service,
        "current_status": complaint.current_status,
        "incident_date": complaint.incident_date,
        "description": complaint.description if is_authorized or complaint.confidentiality != "confidential" else "Details kept confidential at citizen request.",
        "accused_designation": complaint.accused_designation,
        "amount_demanded": complaint.amount_demanded,
        "payment_made": complaint.payment_made,
        "is_conflict_flagged": complaint.is_conflict_flagged,
        "routed_authority_name": complaint.routed_authority.name_en if complaint.routed_authority else "Block Development Office, Chandil",
        "routed_authority_dept": complaint.routed_authority.department if complaint.routed_authority else "Administration",
        "citizen_feedback": complaint.citizen_feedback,
        "reopen_reason": complaint.reopen_reason,
        "created_at": complaint.created_at,
        "updated_at": complaint.updated_at,
        "timeline": [
            {
                "id": u.id,
                "previous_status": u.previous_status,
                "new_status": u.new_status,
                "action_taken_report": u.action_taken_report,
                "remarks": u.remarks,
                "created_at": u.created_at
            }
            for u in updates
        ],
        "evidence": evidence_list
    }

@router.get("/my")
def get_my_complaints(
    user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    complaints = (
        db.query(Complaint)
        .filter(Complaint.user_id == user.id)
        .order_by(Complaint.created_at.desc())
        .all()
    )
    return [
        {
            "id": c.id,
            "tracking_number": c.tracking_number,
            "category": c.category,
            "scheme_or_service": c.scheme_or_service,
            "current_status": c.current_status,
            "incident_date": c.incident_date,
            "accused_name": c.accused_name,
            "accused_designation": c.accused_designation,
            "amount_demanded": c.amount_demanded,
            "is_conflict_flagged": c.is_conflict_flagged,
            "routed_authority_name": c.routed_authority.name_en if c.routed_authority else "Nodal Officer",
            "created_at": c.created_at,
            "updated_at": c.updated_at
        }
        for c in complaints
    ]

@router.post("/{complaint_id}/feedback")
def submit_complaint_feedback(
    complaint_id: str,
    feedback_in: ComplaintFeedbackIn,
    user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if complaint.user_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
        
    complaint.citizen_feedback = feedback_in.feedback
    
    if feedback_in.request_reopen:
        prev = complaint.current_status
        complaint.current_status = "reopened"
        complaint.reopen_reason = feedback_in.feedback
        upd = ComplaintUpdate(
            complaint_id=complaint.id,
            previous_status=prev,
            new_status="reopened",
            remarks=f"Citizen requested reopening. Reason: {feedback_in.feedback}",
            updated_by_user_id=user.id
        )
        db.add(upd)
        
    db.commit()
    log_action(db, action="COMPLAINT_FEEDBACK", target_type="COMPLAINT", target_id=complaint.id, user=user)
    return {"message": "Feedback recorded", "status": complaint.current_status}

@router.post("/{complaint_id}/escalate")
def escalate_complaint(
    complaint_id: str,
    escalate_in: ComplaintEscalateIn,
    user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    prev_status = complaint.current_status
    complaint.current_status = "escalated"
    complaint.routed_authority_id = escalate_in.escalate_to_authority_id
    
    escalation = ComplaintEscalation(
        complaint_id=complaint.id,
        reason=escalate_in.reason,
        escalated_to_authority_id=escalate_in.escalate_to_authority_id,
        escalated_by_user_id=user.id
    )
    db.add(escalation)
    
    upd = ComplaintUpdate(
        complaint_id=complaint.id,
        previous_status=prev_status,
        new_status="escalated",
        remarks=f"Escalated by citizen. Reason: {escalate_in.reason}",
        updated_by_user_id=user.id
    )
    db.add(upd)
    db.commit()
    log_action(db, action="ESCALATE_COMPLAINT", target_type="COMPLAINT", target_id=complaint.id, user=user)
    return {"message": "Complaint escalated successfully"}
