import asyncio
import httpx
from app.main import app
from app.core.database import Base, engine
from app.seed_data import seed

async def run_all_tests():
    print("Initializing test environment...")
    Base.metadata.create_all(bind=engine)
    seed()
    
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health
        res = await client.get("/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        data = res.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed:", data["pilot_location"])

        # 2. Login Citizen
        res = await client.post("/api/v1/auth/login", json={
            "email": "citizen@gramsaksham.in",
            "password": "Citizen@123"
        })
        assert res.status_code == 200, f"Citizen login failed: {res.text}"
        citizen_token = res.json()["access_token"]
        print("✓ Citizen login passed (Sunita Mahato)")

        # 3. Geography Tree
        res = await client.get("/api/v1/geography/tree")
        assert res.status_code == 200, f"Geography failed: {res.text}"
        tree = res.json()
        assert len(tree) > 0
        assert tree[0]["name_en"] == "Seraikela-Kharsawan"
        print(f"✓ Geography tree passed: {tree[0]['name_en']} -> {tree[0]['blocks'][0]['name_en']}")

        # 4. Schemes List
        res = await client.get("/api/v1/schemes")
        assert res.status_code == 200
        schemes = res.json()
        assert len(schemes) >= 5
        pmay = next(s for s in schemes if s["code"] == "PMAY-G")
        print(f"✓ Schemes directory passed: {len(schemes)} verified schemes loaded")

        # 5. Rule-based Eligibility Assessment Engine
        # Case A: Kutcha house -> potentially eligible
        res = await client.post("/api/v1/schemes/assess", json={
            "scheme_id": pmay["id"],
            "house_type": "kutcha",
            "annual_income": 72000,
            "landholding_acres": 0.8
        })
        assert res.status_code == 200
        eval1 = res.json()
        assert eval1["status"] == "potentially_eligible"
        print("✓ Rule engine test A passed (Kutcha house => potentially_eligible)")

        # Case B: Pucca house -> ineligible
        res = await client.post("/api/v1/schemes/assess", json={
            "scheme_id": pmay["id"],
            "house_type": "pucca",
            "annual_income": 72000
        })
        assert res.status_code == 200
        eval2 = res.json()
        assert eval2["status"] == "ineligible"
        print("✓ Rule engine test B passed (Pucca house => ineligible)")

        # 6. Grievance Reporting & Conflict of Interest Check
        res = await client.post("/api/v1/complaints", json={
            "category": "bribery",
            "scheme_or_service": "PMAY-G",
            "incident_date": "2026-03-01",
            "description": "Mukhiya demanded ₹15,000 to sign foundation verification.",
            "accused_name": "Local Representative",
            "accused_designation": "Mukhiya",
            "amount_demanded": 15000,
            "payment_made": False,
            "confidentiality": "confidential"
        })
        assert res.status_code == 200
        comp = res.json()
        assert comp["is_conflict_flagged"] is True
        assert comp["tracking_number"].startswith("GS-")
        print(f"✓ Grievance & Conflict-of-Interest test passed: {comp['tracking_number']} (Flagged={comp['is_conflict_flagged']}, Routed={comp['routed_authority_name']})")

        # 7. Timeline Tracking
        res = await client.get(f"/api/v1/complaints/track/{comp['tracking_number']}")
        assert res.status_code == 200
        track_data = res.json()
        assert len(track_data["timeline"]) >= 1
        print("✓ Status timeline tracking passed")

        # 8. Admin Dashboard
        login_admin = await client.post("/api/v1/auth/login", json={
            "email": "admin@gramsaksham.in",
            "password": "Admin@123"
        })
        admin_token = login_admin.json()["access_token"]
        res = await client.get("/api/v1/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
        assert res.status_code == 200
        stats = res.json()
        assert stats["total_schemes"] >= 5
        assert stats["conflict_flagged_complaints"] >= 1
        print("✓ Admin dashboard stats passed:", stats)

        # 9. Additional Modules (JalWatch, KrishiAlert, WorkVerify)
        res_water = await client.get("/api/v1/modules/jalwatch")
        assert res_water.status_code == 200
        res_infra = await client.get("/api/v1/modules/workverify")
        assert res_infra.status_code == 200
        res_agri = await client.get("/api/v1/modules/krishialert")
        assert res_agri.status_code == 200
        print("✓ Additional modules (JalWatch, WorkVerify, KrishiAlert) passed")

    print("\n=============================================")
    print("ALL 9 BACKEND INTEGRATION TEST SUITES PASSED!")
    print("=============================================")

if __name__ == "__main__":
    asyncio.run(run_all_tests())
