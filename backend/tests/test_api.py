import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "Chandil" in data["pilot_location"]

def test_login_demo_citizen():
    res = client.post("/api/v1/auth/login", json={
        "email": "citizen@gramsaksham.in",
        "password": "Citizen@123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "citizen"
    assert data["user"]["full_name"] == "Sunita Mahato"

def test_geography_tree():
    res = client.get("/api/v1/geography/tree")
    assert res.status_code == 200
    tree = res.json()
    assert len(tree) > 0
    assert tree[0]["name_en"] == "Seraikela-Kharsawan"
    assert tree[0]["blocks"][0]["name_en"] == "Chandil"

def test_schemes_list_and_filter():
    res = client.get("/api/v1/schemes")
    assert res.status_code == 200
    schemes = res.json()
    assert len(schemes) >= 5
    codes = [s["code"] for s in schemes]
    assert "PMAY-G" in codes
    assert "SBM-G" in codes
    assert "ABUA-AWAS" in codes

def test_eligibility_assessment_rule_engine():
    # Fetch PMAY-G scheme
    schemes = client.get("/api/v1/schemes").json()
    pmay = next(s for s in schemes if s["code"] == "PMAY-G")
    
    # Test Kutcha house + low income => potentially eligible
    res = client.post("/api/v1/schemes/assess", json={
        "scheme_id": pmay["id"],
        "house_type": "kutcha",
        "annual_income": 80000,
        "landholding_acres": 1.2
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "potentially_eligible"
    assert len(data["satisfied_criteria"]) >= 2
    
    # Test Pucca house => ineligible under PMAY-G rules
    res2 = client.post("/api/v1/schemes/assess", json={
        "scheme_id": pmay["id"],
        "house_type": "pucca",
        "annual_income": 80000
    })
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["status"] == "ineligible"
    assert any("pucca" in c["text_en"].lower() for c in data2["unsatisfied_criteria"])

def test_complaint_conflict_of_interest_protection():
    # Submit complaint against Mukhiya demanding bribe
    res = client.post("/api/v1/complaints", json={
        "category": "bribery",
        "scheme_or_service": "PMAY-G",
        "incident_date": "2026-03-01",
        "description": "Demanded 10000 rupees bribe for signature.",
        "accused_name": "R. Sharma",
        "accused_designation": "Mukhiya",
        "amount_demanded": 10000,
        "payment_made": False,
        "confidentiality": "confidential"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["tracking_number"].startswith("GS-")
    # CRITICAL SECURITY RULE: must be conflict flagged
    assert data["is_conflict_flagged"] is True
    # Must be routed to BDO or ACB, never Mukhiya!
    assert "Block Development Officer" in data["routed_authority_name"] or "Anti-Corruption" in data["routed_authority_name"]

def test_track_complaint_timeline():
    # Track existing seeded complaint GS-2026-CH-1001
    res = client.get("/api/v1/complaints/track/GS-2026-CH-1001")
    assert res.status_code == 200
    data = res.json()
    assert data["tracking_number"] == "GS-2026-CH-1001"
    assert data["is_conflict_flagged"] is True
    assert len(data["timeline"]) >= 3
    assert data["timeline"][-1]["new_status"] == "investigation_in_progress"

def test_admin_dashboard_stats():
    # Login as admin
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@gramsaksham.in",
        "password": "Admin@123"
    })
    token = login_res.json()["access_token"]
    
    # Get stats
    res = client.get(
        "/api/v1/admin/stats",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    stats = res.json()
    assert stats["total_schemes"] >= 5
    assert stats["total_complaints"] >= 2
    assert stats["conflict_flagged_complaints"] >= 1
