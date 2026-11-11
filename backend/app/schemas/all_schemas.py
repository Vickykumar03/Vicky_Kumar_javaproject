from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- AUTH SCHEMAS ---
class UserRegister(BaseModel):
    email: str
    phone: Optional[str] = None
    full_name: str
    password: str = Field(..., min_length=6)
    role: str = "citizen" # citizen, facilitator, authority, admin
    preferred_language: str = "hi"

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None

class UserOut(BaseModel):
    id: str
    email: str
    phone: Optional[str]
    full_name: str
    role: str
    preferred_language: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- GEOGRAPHY SCHEMAS ---
class VillageOut(BaseModel):
    id: str
    name_en: str
    name_hi: str
    panchayat_id: str
    class Config:
        from_attributes = True

class PanchayatOut(BaseModel):
    id: str
    name_en: str
    name_hi: str
    block_id: str
    villages: List[VillageOut] = []
    class Config:
        from_attributes = True

class BlockOut(BaseModel):
    id: str
    name_en: str
    name_hi: str
    district_id: str
    panchayats: List[PanchayatOut] = []
    class Config:
        from_attributes = True

class DistrictOut(BaseModel):
    id: str
    name_en: str
    name_hi: str
    state: str
    blocks: List[BlockOut] = []
    class Config:
        from_attributes = True

# --- CITIZEN & HOUSEHOLD SCHEMAS ---
class CitizenProfileUpdate(BaseModel):
    district_id: Optional[str] = None
    block_id: Optional[str] = None
    panchayat_id: Optional[str] = None
    village_id: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None
    aadhaar_last_four: Optional[str] = None
    social_category: Optional[str] = None
    occupation: Optional[str] = None
    annual_income: Optional[float] = None
    is_bpl: Optional[bool] = None
    ration_card_type: Optional[str] = None

class HouseholdUpdate(BaseModel):
    house_type: Optional[str] = "kutcha"
    has_toilet: Optional[bool] = False
    has_electricity: Optional[bool] = True
    landholding_acres: Optional[float] = 0.0
    has_piped_water: Optional[bool] = False
    members_count: Optional[int] = 1
    has_elderly_or_widow: Optional[bool] = False
    has_differently_abled: Optional[bool] = False

class CitizenProfileOut(BaseModel):
    id: str
    district_id: Optional[str]
    block_id: Optional[str]
    panchayat_id: Optional[str]
    village_id: Optional[str]
    gender: Optional[str]
    dob: Optional[str]
    aadhaar_last_four: Optional[str]
    social_category: Optional[str]
    occupation: Optional[str]
    annual_income: Optional[float]
    is_bpl: Optional[bool]
    ration_card_type: Optional[str]
    class Config:
        from_attributes = True

class HouseholdOut(BaseModel):
    id: str
    house_type: str
    has_toilet: bool
    has_electricity: bool
    landholding_acres: float
    has_piped_water: bool
    members_count: int
    has_elderly_or_widow: bool
    has_differently_abled: bool
    class Config:
        from_attributes = True

# --- SCHEMES & ELIGIBILITY SCHEMAS ---
class SchemeOut(BaseModel):
    id: str
    code: str
    name_en: str
    name_hi: str
    category: str
    department_en: str
    department_hi: str
    description_en: str
    description_hi: str
    benefits_en: str
    benefits_hi: str
    eligibility_summary_en: str
    eligibility_summary_hi: str
    required_documents: List[str]
    application_procedure_en: str
    application_procedure_hi: str
    official_website: Optional[str]
    last_verified_date: str
    is_active: bool
    class Config:
        from_attributes = True

class SchemeRuleIn(BaseModel):
    rule_criteria: Dict[str, Any]

class EligibilityCheckInput(BaseModel):
    scheme_id: str
    annual_income: Optional[float] = None
    house_type: Optional[str] = None # kutcha, pucca, semi_pucca, homeless
    has_toilet: Optional[bool] = None
    occupation: Optional[str] = None
    landholding_acres: Optional[float] = None
    social_category: Optional[str] = None # ST, SC, OBC, General
    is_bpl: Optional[bool] = None
    has_elderly_or_widow: Optional[bool] = None
    has_differently_abled: Optional[bool] = None
    has_piped_water: Optional[bool] = None
    ration_card_type: Optional[str] = None

class EligibilityResultOut(BaseModel):
    id: Optional[str] = None
    scheme_id: str
    scheme_name_en: str
    scheme_name_hi: str
    status: str # potentially_eligible, more_info_required, ineligible, requires_official_verification
    satisfied_criteria: List[Dict[str, str]]
    unsatisfied_criteria: List[Dict[str, str]]
    missing_criteria: List[Dict[str, str]]
    explanation_en: str
    explanation_hi: str
    official_source: Optional[str]
    assessment_date: datetime

class ApplicationCreate(BaseModel):
    scheme_id: str
    official_reference_number: Optional[str] = None
    documents_checklist: Optional[List[str]] = []
    citizen_consent: bool = True
    notes: Optional[str] = None

class ApplicationUpdateIn(BaseModel):
    status: str
    notes: Optional[str] = None

class ApplicationOut(BaseModel):
    id: str
    user_id: str
    scheme_id: str
    scheme_name_en: Optional[str] = None
    scheme_name_hi: Optional[str] = None
    facilitator_id: Optional[str] = None
    official_reference_number: Optional[str] = None
    current_status: str
    documents_checklist: List[str] = []
    citizen_consent: bool
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# --- COMPLAINTS SCHEMAS ---
class ComplaintCreate(BaseModel):
    category: str
    scheme_or_service: Optional[str] = None
    district_id: Optional[str] = None
    block_id: Optional[str] = None
    panchayat_id: Optional[str] = None
    village_id: Optional[str] = None
    incident_date: Optional[str] = None
    description: str
    accused_name: Optional[str] = None
    accused_designation: Optional[str] = None
    amount_demanded: Optional[float] = 0.0
    payment_made: Optional[bool] = False
    confidentiality: str = "confidential" # confidential, anonymous, public

class ComplaintEvidenceOut(BaseModel):
    id: str
    file_name: str
    file_type: str
    description: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

class ComplaintUpdateOut(BaseModel):
    id: str
    previous_status: str
    new_status: str
    action_taken_report: Optional[str]
    remarks: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

class ComplaintOut(BaseModel):
    id: str
    tracking_number: str
    category: str
    scheme_or_service: Optional[str]
    district_id: Optional[str]
    block_id: Optional[str]
    panchayat_id: Optional[str]
    village_id: Optional[str]
    incident_date: Optional[str]
    description: str
    accused_name: Optional[str]
    accused_designation: Optional[str]
    amount_demanded: float
    payment_made: bool
    confidentiality: str
    current_status: str
    is_conflict_flagged: bool
    routed_authority_id: Optional[str]
    routed_authority_name: Optional[str] = None
    citizen_feedback: Optional[str]
    reopen_reason: Optional[str]
    created_at: datetime
    updated_at: datetime
    evidence: List[ComplaintEvidenceOut] = []
    updates: List[ComplaintUpdateOut] = []
    class Config:
        from_attributes = True

class ComplaintStatusUpdateIn(BaseModel):
    new_status: str
    action_taken_report: Optional[str] = None
    remarks: Optional[str] = None

class ComplaintEscalateIn(BaseModel):
    reason: str
    escalate_to_authority_id: str

class ComplaintFeedbackIn(BaseModel):
    feedback: str
    request_reopen: bool = False

# --- ADDITIONAL MODULES SCHEMAS ---
class WaterReportCreate(BaseModel):
    panchayat_id: Optional[str] = None
    village_id: Optional[str] = None
    issue_type: str
    location_landmark: str
    description: str

class WaterReportOut(BaseModel):
    id: str
    issue_type: str
    location_landmark: str
    description: str
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class InfrastructureProjectOut(BaseModel):
    id: str
    title_en: str
    title_hi: str
    project_type: str
    sanctioned_amount: float
    contractor_or_agency: Optional[str]
    status: str
    progress_percentage: int
    created_at: datetime
    evidence: List[Any] = []
    class Config:
        from_attributes = True

class AgricultureAlertOut(BaseModel):
    id: str
    title_en: str
    title_hi: str
    category: str
    content_en: str
    content_hi: str
    severity: str
    source: str
    created_at: datetime
    class Config:
        from_attributes = True

# --- ADMIN & AUTHORITIES SCHEMAS ---
class AuthorityCreate(BaseModel):
    name_en: str
    name_hi: str
    department: str
    designation: str
    hierarchy_level: str = "block"
    district_id: Optional[str] = None
    block_id: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None

class AuthorityOut(BaseModel):
    id: str
    name_en: str
    name_hi: str
    department: str
    designation: str
    hierarchy_level: str
    district_id: Optional[str]
    block_id: Optional[str]
    contact_email: Optional[str]
    contact_phone: Optional[str]
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class AdminStatsOut(BaseModel):
    total_citizens: int
    total_facilitators: int
    total_authorities: int
    total_schemes: int
    total_assessments: int
    total_applications: int
    total_complaints: int
    pending_complaints: int
    under_review_complaints: int
    action_reported_complaints: int
    closed_complaints: int
    conflict_flagged_complaints: int
    total_water_reports: int
    total_infrastructure_projects: int

class AuditLogOut(BaseModel):
    id: str
    user_email: Optional[str]
    action: str
    target_type: str
    target_id: Optional[str]
    details: Dict[str, Any] = {}
    ip_address: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True
