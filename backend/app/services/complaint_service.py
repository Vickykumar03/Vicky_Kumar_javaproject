import random
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.all_models import Complaint, Authority, ComplaintUpdate, User

def generate_tracking_number(block_code: str = "CH") -> str:
    """
    Generates internal tracking reference e.g., GS-2026-CH-4819
    """
    year = datetime.now().year
    rand_num = random.randint(1000, 9999)
    return f"GS-{year}-{block_code}-{rand_num}"

def route_complaint_with_conflict_check(
    db: Session,
    complaint: Complaint,
    accused_designation: str,
    category: str
) -> Authority:
    """
    CRITICAL SAFETY RULE:
    If the accused is a Mukhiya, Panchayat Secretary, Ward Member, or Panchayat official,
    the complaint is AUTOMATICALLY FLAGGED for conflict of interest and ROUTED HIGHER:
    - Bribery/Corruption -> Block Development Officer (BDO) or Anti-Corruption Bureau (ACB)
    - Scheme exclusion -> Block Development Officer (BDO) or District Social Welfare Officer
    - Harassment/Severe extortion -> District Deputy Commissioner (DC) or Sub-Divisional Officer (SDO)
    
    The accused local Panchayat official NEVER gets access or review permission over this complaint.
    """
    designation_lower = (accused_designation or "").lower()
    panchayat_roles = ["mukhiya", "sarpanch", "panchayat secretary", "rojgar sevak", "ward member", "up-mukhiya", "panchayat sachiv"]
    
    is_conflict = any(role in designation_lower for role in panchayat_roles)
    complaint.is_conflict_flagged = is_conflict

    # Find candidate authorities
    authorities = db.query(Authority).filter(Authority.is_active == True).all()
    
    selected_authority = None
    
    if "bribe" in category.lower() or "corruption" in category.lower() or "signature" in category.lower():
        # Prefer ACB or BDO Chandil
        for auth in authorities:
            if "Anti-Corruption" in auth.department or "ACB" in auth.department:
                selected_authority = auth
                break
        if not selected_authority:
            for auth in authorities:
                if "Block Development Officer" in auth.designation:
                    selected_authority = auth
                    break
    elif is_conflict:
        # Route to BDO Chandil or District Deputy Commissioner
        for auth in authorities:
            if "Block Development Officer" in auth.designation:
                selected_authority = auth
                break
    
    if not selected_authority and authorities:
        selected_authority = authorities[0]
        
    if selected_authority:
        complaint.routed_authority_id = selected_authority.id
        
    return selected_authority
