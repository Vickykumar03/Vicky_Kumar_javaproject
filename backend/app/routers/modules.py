from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.all_models import (
    WaterReport, InfrastructureProject, ProjectEvidence, AgricultureAlert, User
)
from app.schemas.all_schemas import (
    WaterReportCreate, WaterReportOut, InfrastructureProjectOut, AgricultureAlertOut
)
from app.routers.deps import get_current_user, require_current_user, log_action

router = APIRouter(prefix="/modules", tags=["Platform Modules"])

# --- JALWATCH ---
@router.post("/jalwatch", response_model=WaterReportOut)
def submit_water_report(
    report_in: WaterReportCreate,
    user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    report = WaterReport(
        user_id=user.id,
        panchayat_id=report_in.panchayat_id,
        village_id=report_in.village_id,
        issue_type=report_in.issue_type,
        location_landmark=report_in.location_landmark,
        description=report_in.description,
        status="reported"
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    log_action(db, action="SUBMIT_WATER_REPORT", target_type="WATER_REPORT", target_id=report.id, user=user)
    return report

@router.get("/jalwatch", response_model=List[WaterReportOut])
def list_water_reports(db: Session = Depends(get_db)):
    return db.query(WaterReport).order_by(WaterReport.created_at.desc()).all()

# --- WORKVERIFY AI ---
@router.get("/workverify", response_model=List[InfrastructureProjectOut])
def list_infrastructure_projects(db: Session = Depends(get_db)):
    return db.query(InfrastructureProject).order_by(InfrastructureProject.created_at.desc()).all()

# --- KRISHIALERT ---
@router.get("/krishialert", response_model=List[AgricultureAlertOut])
def list_agriculture_alerts(db: Session = Depends(get_db)):
    return db.query(AgricultureAlert).order_by(AgricultureAlert.created_at.desc()).all()
