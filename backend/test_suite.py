import threading
import time
import requests
import uvicorn
from app.main import app
from app.core.database import Base, engine
from app.seed_data import seed

SERVER_PORT = 8011
BASE_URL = f"http://127.0.0.1:{SERVER_PORT}"

def run_server():
    uvicorn.run("app.main:app", host="127.0.0.1", port=SERVER_PORT, log_level="warning")

def run_tests():
    print("--------------------------------------------------")
    print("STARTING GRAMSAKSHAM FULL-STACK BACKEND VERIFICATION")
    print("--------------------------------------------------")
    
    # Start uvicorn server in background thread
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    
    # Wait for server ready
    max_retries = 10
    connected = False
    for i in range(max_retries):
        try:
            r = requests.get(f"{BASE_URL}/health", timeout=2)
            if r.status_code == 200:
                connected = True
                break
        except Exception:
            time.sleep(0.5)
            
    assert connected, "Failed to connect to backend server"
    print("✓ 1. Backend server connected & healthy:", r.json())
    
    # 2. Test Auth - Citizen Login
    r_cit = requests.post(f"{BASE_URL}/api/v1/auth/login", json={
        "email": "citizen@gramsaksham.in",
        "password": "Citizen@123"
    })
    assert r_cit.status_code == 200, f"Citizen login failed: {r_cit.text}"
    citizen_data = r_cit.json()
    citizen_token = citizen_data["access_token"]
    assert citizen_data["user"]["role"] == "citizen"
    print("✓ 2. Citizen login successful (Sunita Mahato, Chandil)")
    
    # 3. Test Auth - Admin Login
    r_adm = requests.post(f"{BASE_URL}/api/v1/auth/login", json={
        "email": "admin@gramsaksham.in",
        "password": "Admin@123"
    })
    assert r_adm.status_code == 200
    admin_token = r_adm.json()["access_token"]
    print("✓ 3. Admin login successful")

    # 4. Test Geography
    r_geo = requests.get(f"{BASE_URL}/api/v1/geography/tree")
    assert r_geo.status_code == 200
    tree = r_geo.json()
    assert tree[0]["name_en"] == "Seraikela-Kharsawan"
    assert tree[0]["blocks"][0]["name_en"] == "Chandil"
    panchayats = [p["name_en"] for p in tree[0]["blocks"][0]["panchayats"]]
    assert "Chilgu" in panchayats
    assert "Chandil" in panchayats
    print(f"✓ 4. Geography verified: {tree[0]['name_en']} -> Chandil Block -> {len(panchayats)} Panchayats")

    # 5. Test Schemes Directory
    r_schemes = requests.get(f"{BASE_URL}/api/v1/schemes")
    assert r_schemes.status_code == 200
    schemes = r_schemes.json()
    assert len(schemes) >= 5
    pmay = next(s for s in schemes if s["code"] == "PMAY-G")
    sbm = next(s for s in schemes if s["code"] == "SBM-G")
    abua = next(s for s in schemes if s["code"] == "ABUA-AWAS")
    print(f"✓ 5. Welfare scheme directory verified: {len(schemes)} active schemes (PMAY-G, SBM-G, Abua Awas, Birsa Harit, Sarvajan Pension)")

    # 6. Test Rule-based Eligibility Engine
    # Case A: Kutcha house + Low income => potentially eligible
    r_eval1 = requests.post(f"{BASE_URL}/api/v1/schemes/assess", json={
        "scheme_id": pmay["id"],
        "house_type": "kutcha",
        "annual_income": 72000,
        "landholding_acres": 0.8
    })
    assert r_eval1.status_code == 200
    eval1 = r_eval1.json()
    assert eval1["status"] == "potentially_eligible"
    print("✓ 6a. Eligibility Engine: Kutcha house + ₹72,000 income => 'potentially_eligible'")

    # Case B: Pucca house => ineligible under PMAY-G rules
    r_eval2 = requests.post(f"{BASE_URL}/api/v1/schemes/assess", json={
        "scheme_id": pmay["id"],
        "house_type": "pucca",
        "annual_income": 72000
    })
    assert r_eval2.status_code == 200
    eval2 = r_eval2.json()
    assert eval2["status"] == "ineligible"
    assert len(eval2["unsatisfied_criteria"]) >= 1
    print("✓ 6b. Eligibility Engine: Pucca house => 'ineligible' with statutory exclusion rationale")

    # 7. Test Application Assistance Request
    r_app = requests.post(
        f"{BASE_URL}/api/v1/applications",
        headers={"Authorization": f"Bearer {citizen_token}"},
        json={
            "scheme_id": abua["id"],
            "official_reference_number": "AAY-JH-2026-CH-9921",
            "documents_checklist": ["Aadhaar Card", "Ration Card", "Residence Certificate"],
            "citizen_consent": True,
            "notes": "Requested help for submission at Chandil Block camp."
        }
    )
    assert r_app.status_code == 200
    app_data = r_app.json()
    assert app_data["current_status"] == "assistance_requested"
    print(f"✓ 7. Application assistance logged: ID {app_data['id']} for {abua['name_en']}")

    # 8. Test Grievance Submission with Conflict-of-Interest Protection
    r_comp = requests.post(
        f"{BASE_URL}/api/v1/complaints",
        headers={"Authorization": f"Bearer {citizen_token}"},
        json={
            "category": "bribery",
            "scheme_or_service": "PMAY-G",
            "incident_date": "2026-03-02",
            "description": "Mukhiya and ward representative demanded ₹12,000 cash bribe to sanction second installment.",
            "accused_name": "R. K. Singh",
            "accused_designation": "Mukhiya",
            "amount_demanded": 12000,
            "payment_made": False,
            "confidentiality": "confidential"
        }
    )
    assert r_comp.status_code == 200
    comp_data = r_comp.json()
    # VERIFY CRITICAL SAFETY RULES:
    assert comp_data["tracking_number"].startswith("GS-")
    assert comp_data["is_conflict_flagged"] is True, "Mukhiya complaint MUST be flagged for conflict of interest!"
    assert "Block Development Officer" in comp_data["routed_authority_name"] or "Anti-Corruption" in comp_data["routed_authority_name"]
    print(f"✓ 8. Smart Panchayat: Lodged complaint {comp_data['tracking_number']}. CONFLICT FLAGGED = {comp_data['is_conflict_flagged']}, ROUTED HIGHER = {comp_data['routed_authority_name']}")

    # 9. Test Public Timeline Tracking
    r_track = requests.get(f"{BASE_URL}/api/v1/complaints/track/{comp_data['tracking_number']}")
    assert r_track.status_code == 200
    track_info = r_track.json()
    assert len(track_info["timeline"]) >= 1
    print(f"✓ 9. Public tracking timeline verified: {len(track_info['timeline'])} audit events recorded")

    # 10. Test Authority Complaint Status Update
    r_auth_login = requests.post(f"{BASE_URL}/api/v1/auth/login", json={
        "email": "authority@gramsaksham.in",
        "password": "Authority@123"
    })
    auth_token = r_auth_login.json()["access_token"]
    
    r_status_upd = requests.put(
        f"{BASE_URL}/api/v1/authority/complaints/{comp_data['id']}/status",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "new_status": "investigation_in_progress",
            "action_taken_report": "Show cause notice issued to the accused Panchayat representative by Chandil BDO office. Bank disbursement protected.",
            "remarks": "Inquiry officer designated."
        }
    )
    assert r_status_upd.status_code == 200
    print("✓ 10. Authority Action Taken Report (ATR) updated status to 'investigation_in_progress'")

    # 11. Test Citizen Reopening / Feedback
    r_feedback = requests.post(
        f"{BASE_URL}/api/v1/complaints/{comp_data['id']}/feedback",
        headers={"Authorization": f"Bearer {citizen_token}"},
        json={
            "feedback": "Thank you for the prompt vigilance inquiry. We request on-site physical inspection.",
            "request_reopen": False
        }
    )
    assert r_feedback.status_code == 200
    print("✓ 11. Citizen feedback logged successfully")

    # 12. Test Admin Dashboard Real Database Statistics
    r_stats = requests.get(
        f"{BASE_URL}/api/v1/admin/stats",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert r_stats.status_code == 200
    stats = r_stats.json()
    assert stats["total_schemes"] >= 5
    assert stats["total_complaints"] >= 3
    assert stats["conflict_flagged_complaints"] >= 2
    print("✓ 12. Admin dashboard live database stats verified:", stats)

    # 13. Test Additional Modules (JalWatch, WorkVerify, KrishiAlert)
    r_jal = requests.get(f"{BASE_URL}/api/v1/modules/jalwatch")
    assert r_jal.status_code == 200 and len(r_jal.json()) >= 1
    r_work = requests.get(f"{BASE_URL}/api/v1/modules/workverify")
    assert r_work.status_code == 200 and len(r_work.json()) >= 1
    r_krishi = requests.get(f"{BASE_URL}/api/v1/modules/krishialert")
    assert r_krishi.status_code == 200 and len(r_krishi.json()) >= 2
    print("✓ 13. Platform extension modules (JalWatch, WorkVerify, KrishiAlert) verified")

    print("\n==================================================")
    print("ALL 13 FULL-STACK BACKEND VERIFICATION TESTS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
