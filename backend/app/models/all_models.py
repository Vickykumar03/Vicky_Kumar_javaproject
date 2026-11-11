import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def get_utc_now():
    return datetime.now(timezone.utc)

# --- GEOGRAPHY ---
class District(Base):
    __tablename__ = "districts"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name_en = Column(String(100), nullable=False)
    name_hi = Column(String(100), nullable=False)
    state = Column(String(100), default="Jharkhand", nullable=False)
    
    blocks = relationship("Block", back_populates="district", cascade="all, delete-orphan")

class Block(Base):
    __tablename__ = "blocks"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    district_id = Column(String(36), ForeignKey("districts.id"), nullable=False)
    name_en = Column(String(100), nullable=False)
    name_hi = Column(String(100), nullable=False)
    
    district = relationship("District", back_populates="blocks")
    panchayats = relationship("Panchayat", back_populates="block", cascade="all, delete-orphan")

class Panchayat(Base):
    __tablename__ = "panchayats"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    block_id = Column(String(36), ForeignKey("blocks.id"), nullable=False)
    name_en = Column(String(100), nullable=False)
    name_hi = Column(String(100), nullable=False)
    
    block = relationship("Block", back_populates="panchayats")
    villages = relationship("Village", back_populates="panchayat", cascade="all, delete-orphan")

class Village(Base):
    __tablename__ = "villages"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    panchayat_id = Column(String(36), ForeignKey("panchayats.id"), nullable=False)
    name_en = Column(String(100), nullable=False)
    name_hi = Column(String(100), nullable=False)
    
    panchayat = relationship("Panchayat", back_populates="villages")

# --- USERS & CITIZEN PROFILES ---
class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(20), index=True, nullable=True)
    full_name = Column(String(150), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(30), default="citizen", nullable=False) # citizen, facilitator, authority, admin
    is_active = Column(Boolean, default=True, nullable=False)
    preferred_language = Column(String(10), default="hi", nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    
    citizen_profile = relationship("CitizenProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    household = relationship("Household", back_populates="user", uselist=False, cascade="all, delete-orphan")
    complaints = relationship("Complaint", back_populates="user")
    applications = relationship("SchemeApplication", foreign_keys="[SchemeApplication.user_id]", back_populates="user")

class CitizenProfile(Base):
    __tablename__ = "citizen_profiles"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    district_id = Column(String(36), ForeignKey("districts.id"), nullable=True)
    block_id = Column(String(36), ForeignKey("blocks.id"), nullable=True)
    panchayat_id = Column(String(36), ForeignKey("panchayats.id"), nullable=True)
    village_id = Column(String(36), ForeignKey("villages.id"), nullable=True)
    
    gender = Column(String(20), nullable=True) # Male, Female, Other
    dob = Column(String(20), nullable=True) # YYYY-MM-DD
    aadhaar_last_four = Column(String(4), nullable=True)
    social_category = Column(String(20), nullable=True) # ST, SC, OBC, General
    occupation = Column(String(100), nullable=True)
    annual_income = Column(Float, default=0.0, nullable=True)
    is_bpl = Column(Boolean, default=False, nullable=True)
    ration_card_type = Column(String(50), nullable=True) # Antyodaya, PHH, White, None
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)
    
    user = relationship("User", back_populates="citizen_profile")

class Household(Base):
    __tablename__ = "households"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    house_type = Column(String(50), default="kutcha") # kutcha, pucca, semi_pucca, homeless
    has_toilet = Column(Boolean, default=False)
    has_electricity = Column(Boolean, default=True)
    landholding_acres = Column(Float, default=0.0)
    has_piped_water = Column(Boolean, default=False)
    members_count = Column(Integer, default=1)
    has_elderly_or_widow = Column(Boolean, default=False)
    has_differently_abled = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)
    
    user = relationship("User", back_populates="household")

# --- SCHEMES & ELIGIBILITY ---
class Scheme(Base):
    __tablename__ = "schemes"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name_en = Column(String(255), nullable=False)
    name_hi = Column(String(255), nullable=False)
    category = Column(String(100), index=True, nullable=False) # Housing, Sanitation, Agriculture, Pension, etc.
    department_en = Column(String(255), nullable=False)
    department_hi = Column(String(255), nullable=False)
    description_en = Column(Text, nullable=False)
    description_hi = Column(Text, nullable=False)
    benefits_en = Column(Text, nullable=False)
    benefits_hi = Column(Text, nullable=False)
    eligibility_summary_en = Column(Text, nullable=False)
    eligibility_summary_hi = Column(Text, nullable=False)
    required_documents = Column(JSON, default=list) # list of document names
    application_procedure_en = Column(Text, nullable=False)
    application_procedure_hi = Column(Text, nullable=False)
    official_website = Column(String(255), nullable=True)
    last_verified_date = Column(String(30), default="2026-03-01", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    rules = relationship("SchemeRule", back_populates="scheme", cascade="all, delete-orphan")
    assessments = relationship("EligibilityAssessment", back_populates="scheme")
    applications = relationship("SchemeApplication", back_populates="scheme")

class SchemeRule(Base):
    __tablename__ = "scheme_rules"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    scheme_id = Column(String(36), ForeignKey("schemes.id"), nullable=False)
    version = Column(Integer, default=1, nullable=False)
    rule_criteria = Column(JSON, nullable=False) 
    # example structure:
    # {
    #   "max_income": 120000,
    #   "allowed_house_types": ["kutcha", "homeless", "semi_pucca"],
    #   "required_no_toilet": false,
    #   "allowed_categories": ["ST", "SC", "OBC", "General"],
    #   "max_land_acres": 2.5
    # }
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    
    scheme = relationship("Scheme", back_populates="rules")

class EligibilityAssessment(Base):
    __tablename__ = "eligibility_assessments"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    scheme_id = Column(String(36), ForeignKey("schemes.id"), nullable=False)
    status = Column(String(50), nullable=False) # potentially_eligible, more_info_required, ineligible, requires_official_verification
    satisfied_criteria = Column(JSON, default=list)
    unsatisfied_criteria = Column(JSON, default=list)
    missing_criteria = Column(JSON, default=list)
    explanation_en = Column(Text, nullable=False)
    explanation_hi = Column(Text, nullable=False)
    input_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    
    scheme = relationship("Scheme", back_populates="assessments")

class SchemeApplication(Base):
    __tablename__ = "scheme_applications"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    scheme_id = Column(String(36), ForeignKey("schemes.id"), nullable=False)
    facilitator_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    official_reference_number = Column(String(100), nullable=True)
    current_status = Column(String(50), default="assistance_requested") # assistance_requested, documents_pending, submitted_to_office, under_scrutiny, approved, rejected
    documents_checklist = Column(JSON, default=list)
    citizen_consent = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)
    
    user = relationship("User", foreign_keys=[user_id], back_populates="applications")
    scheme = relationship("Scheme", back_populates="applications")
    updates = relationship("ApplicationUpdate", back_populates="application", cascade="all, delete-orphan")

class ApplicationUpdate(Base):
    __tablename__ = "application_updates"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("scheme_applications.id"), nullable=False)
    status = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)
    updated_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    
    application = relationship("SchemeApplication", back_populates="updates")

# --- COMPLAINTS & GRIEVANCE MANAGEMENT ---
class Complaint(Base):
    __tablename__ = "complaints"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    tracking_number = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True) # can be null for anonymous
    category = Column(String(100), nullable=False) # bribery, signature_money, pmay_rejection, sanitation_rejection, etc.
    scheme_or_service = Column(String(150), nullable=True)
    district_id = Column(String(36), ForeignKey("districts.id"), nullable=True)
    block_id = Column(String(36), ForeignKey("blocks.id"), nullable=True)
    panchayat_id = Column(String(36), ForeignKey("panchayats.id"), nullable=True)
    village_id = Column(String(36), ForeignKey("villages.id"), nullable=True)
    incident_date = Column(String(30), nullable=True)
    description = Column(Text, nullable=False)
    accused_name = Column(String(150), nullable=True)
    accused_designation = Column(String(100), nullable=True) # Mukhiya, Panchayat Secretary, Rojgar Sevak, BDO, etc.
    amount_demanded = Column(Float, default=0.0)
    payment_made = Column(Boolean, default=False)
    confidentiality = Column(String(30), default="confidential") # confidential, anonymous, public
    current_status = Column(String(50), default="submitted") 
    # submitted, acknowledged, under_review, referred_to_authority, investigation_in_progress, action_reported, awaiting_citizen_verification, closed, reopened, escalated
    is_conflict_flagged = Column(Boolean, default=False) # Flagged if accused is Panchayat official so Mukhiya/Panchayat cannot review
    routed_authority_id = Column(String(36), ForeignKey("authorities.id"), nullable=True)
    citizen_feedback = Column(Text, nullable=True)
    reopen_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)
    
    user = relationship("User", back_populates="complaints")
    evidence = relationship("ComplaintEvidence", back_populates="complaint", cascade="all, delete-orphan")
    updates = relationship("ComplaintUpdate", back_populates="complaint", cascade="all, delete-orphan")
    escalations = relationship("ComplaintEscalation", back_populates="complaint", cascade="all, delete-orphan")
    routed_authority = relationship("Authority", back_populates="assigned_complaints")

class ComplaintEvidence(Base):
    __tablename__ = "complaint_evidence"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_id = Column(String(36), ForeignKey("complaints.id"), nullable=False)
    file_path = Column(String(255), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    
    complaint = relationship("Complaint", back_populates="evidence")

class ComplaintUpdate(Base):
    __tablename__ = "complaint_updates"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_id = Column(String(36), ForeignKey("complaints.id"), nullable=False)
    previous_status = Column(String(50), nullable=False)
    new_status = Column(String(50), nullable=False)
    action_taken_report = Column(Text, nullable=True)
    remarks = Column(Text, nullable=True)
    updated_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    
    complaint = relationship("Complaint", back_populates="updates")

class ComplaintEscalation(Base):
    __tablename__ = "complaint_escalations"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_id = Column(String(36), ForeignKey("complaints.id"), nullable=False)
    reason = Column(Text, nullable=False)
    escalated_to_authority_id = Column(String(36), ForeignKey("authorities.id"), nullable=False)
    escalated_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    
    complaint = relationship("Complaint", back_populates="escalations")

# --- AUTHORITIES & ADMIN ---
class Authority(Base):
    __tablename__ = "authorities"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name_en = Column(String(150), nullable=False)
    name_hi = Column(String(150), nullable=False)
    department = Column(String(150), nullable=False)
    designation = Column(String(100), nullable=False)
    hierarchy_level = Column(String(50), default="block") # block, district, state
    district_id = Column(String(36), ForeignKey("districts.id"), nullable=True)
    block_id = Column(String(36), ForeignKey("blocks.id"), nullable=True)
    contact_email = Column(String(150), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    
    assigned_complaints = relationship("Complaint", back_populates="routed_authority")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    user_email = Column(String(150), nullable=True)
    action = Column(String(100), nullable=False)
    target_type = Column(String(50), nullable=False)
    target_id = Column(String(50), nullable=True)
    details = Column(JSON, default=dict)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    title_en = Column(String(200), nullable=False)
    title_hi = Column(String(200), nullable=False)
    message_en = Column(Text, nullable=False)
    message_hi = Column(Text, nullable=False)
    link = Column(String(200), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

# --- EXTENSION MODULES (JalWatch, WorkVerify AI, KrishiAlert) ---
class WaterReport(Base):
    __tablename__ = "water_reports"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    panchayat_id = Column(String(36), ForeignKey("panchayats.id"), nullable=True)
    village_id = Column(String(36), ForeignKey("villages.id"), nullable=True)
    issue_type = Column(String(100), nullable=False) # handpump_broken, contaminated_water, pipeline_leakage, supply_interruption
    location_landmark = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    photo_path = Column(String(255), nullable=True)
    status = Column(String(50), default="reported") # reported, team_dispatched, repaired, verified
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

class InfrastructureProject(Base):
    __tablename__ = "infrastructure_projects"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    title_en = Column(String(255), nullable=False)
    title_hi = Column(String(255), nullable=False)
    panchayat_id = Column(String(36), ForeignKey("panchayats.id"), nullable=True)
    village_id = Column(String(36), ForeignKey("villages.id"), nullable=True)
    project_type = Column(String(100), nullable=False) # Road, Community Hall, Drainage, School Building, Check Dam
    sanctioned_amount = Column(Float, default=0.0)
    contractor_or_agency = Column(String(150), nullable=True)
    status = Column(String(50), default="in_progress") # planned, in_progress, completed, stalled
    progress_percentage = Column(Integer, default=0)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    
    evidence = relationship("ProjectEvidence", back_populates="project", cascade="all, delete-orphan")

class ProjectEvidence(Base):
    __tablename__ = "project_evidence"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("infrastructure_projects.id"), nullable=False)
    photo_url = Column(String(255), nullable=False)
    stage = Column(String(50), nullable=False) # foundation, ongoing, completed
    remarks = Column(Text, nullable=True)
    human_verified = Column(Boolean, default=False)
    uploaded_by = Column(String(150), nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    
    project = relationship("InfrastructureProject", back_populates="evidence")

class AgricultureAlert(Base):
    __tablename__ = "agriculture_alerts"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    title_en = Column(String(255), nullable=False)
    title_hi = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False) # Weather, Crop Disease, Subsidy, Advisory
    content_en = Column(Text, nullable=False)
    content_hi = Column(Text, nullable=False)
    severity = Column(String(20), default="info") # info, warning, alert
    source = Column(String(150), default="Birsa Agricultural University / IMD Ranchi")
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
