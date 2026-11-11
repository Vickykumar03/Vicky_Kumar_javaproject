from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.all_models import Scheme, SchemeRule, EligibilityAssessment, User
from app.schemas.all_schemas import SchemeOut, EligibilityCheckInput, EligibilityResultOut
from app.services.eligibility_engine import evaluate_scheme_eligibility
from app.routers.deps import get_current_user, require_current_user, log_action

router = APIRouter(prefix="/schemes", tags=["GramConnect Schemes"])

@router.get("", response_model=List[SchemeOut])
def list_schemes(
    category: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Scheme).filter(Scheme.is_active == True)
    if category and category.lower() != "all":
        query = query.filter(Scheme.category.ilike(f"%{category}%"))
    if q:
        query = query.filter(
            (Scheme.name_en.ilike(f"%{q}%")) |
            (Scheme.name_hi.ilike(f"%{q}%")) |
            (Scheme.description_en.ilike(f"%{q}%")) |
            (Scheme.description_hi.ilike(f"%{q}%"))
        )
    return query.all()

@router.get("/{scheme_id}", response_model=SchemeOut)
def get_scheme(scheme_id: str, db: Session = Depends(get_db)):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return scheme

@router.post("/assess", response_model=EligibilityResultOut)
def assess_eligibility(
    check_in: EligibilityCheckInput,
    user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scheme = db.query(Scheme).filter(Scheme.id == check_in.scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
        
    eval_result = evaluate_scheme_eligibility(
        scheme_code=scheme.code,
        user_input=check_in.model_dump()
    )
    
    assessment_id = None
    if user:
        assessment = EligibilityAssessment(
            user_id=user.id,
            scheme_id=scheme.id,
            status=eval_result["status"],
            satisfied_criteria=eval_result["satisfied_criteria"],
            unsatisfied_criteria=eval_result["unsatisfied_criteria"],
            missing_criteria=eval_result["missing_criteria"],
            explanation_en=eval_result["explanation_en"],
            explanation_hi=eval_result["explanation_hi"],
            input_data=check_in.model_dump()
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)
        assessment_id = assessment.id
        log_action(db, action="ASSESS_ELIGIBILITY", target_type="SCHEME", target_id=scheme.id, user=user)

    return {
        "id": assessment_id,
        "scheme_id": scheme.id,
        "scheme_name_en": scheme.name_en,
        "scheme_name_hi": scheme.name_hi,
        "status": eval_result["status"],
        "satisfied_criteria": eval_result["satisfied_criteria"],
        "unsatisfied_criteria": eval_result["unsatisfied_criteria"],
        "missing_criteria": eval_result["missing_criteria"],
        "explanation_en": eval_result["explanation_en"],
        "explanation_hi": eval_result["explanation_hi"],
        "official_source": eval_result["official_source"],
        "assessment_date": eval_result["assessment_date"]
    }

@router.get("/assessments/my")
def get_my_assessments(
    user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    assessments = (
        db.query(EligibilityAssessment)
        .filter(EligibilityAssessment.user_id == user.id)
        .order_by(EligibilityAssessment.created_at.desc())
        .all()
    )
    return [
        {
            "id": a.id,
            "scheme_id": a.scheme_id,
            "scheme_name_en": a.scheme.name_en if a.scheme else "",
            "scheme_name_hi": a.scheme.name_hi if a.scheme else "",
            "status": a.status,
            "explanation_en": a.explanation_en,
            "explanation_hi": a.explanation_hi,
            "satisfied_criteria": a.satisfied_criteria,
            "unsatisfied_criteria": a.unsatisfied_criteria,
            "missing_criteria": a.missing_criteria,
            "created_at": a.created_at
        }
        for a in assessments
    ]
