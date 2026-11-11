import sys
from datetime import datetime, timezone
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.all_models import (
    District, Block, Panchayat, Village, User, CitizenProfile, Household,
    Scheme, SchemeRule, Authority, Complaint, ComplaintUpdate,
    WaterReport, InfrastructureProject, AgricultureAlert
)

def seed():
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(User).filter(User.email == "admin@gramsaksham.in").first():
        print("Database already seeded with demo data. Skipping...")
        db.close()
        return

    print("Seeding Geography for Pilot Location (Chandil, Seraikela-Kharsawan, Jharkhand)...")
    district = District(
        name_en="Seraikela-Kharsawan",
        name_hi="सरायकेला-खरसावां",
        state="Jharkhand"
    )
    db.add(district)
    db.flush()

    block = Block(
        district_id=district.id,
        name_en="Chandil",
        name_hi="चांडिल"
    )
    db.add(block)
    db.flush()

    panchayats_data = [
        ("Chilgu", "चिलगू", ["Chilgu", "Kadma", "Asanbani"]),
        ("Chandil", "चांडिल", ["Chandil Bajar", "Damodarpur", "Gangudih"]),
        ("Rangaon", "रंगांव", ["Rangaon", "Tiruldih", "Rugri"]),
        ("Hurlung", "हुरलुंग", ["Hurlung", "Tamulia", "Kapali"])
    ]

    panchayat_objs = []
    first_village_id = None
    for p_en, p_hi, villages in panchayats_data:
        p_obj = Panchayat(block_id=block.id, name_en=p_en, name_hi=p_hi)
        db.add(p_obj)
        db.flush()
        panchayat_objs.append(p_obj)
        for v in villages:
            v_obj = Village(panchayat_id=p_obj.id, name_en=v, name_hi=v)
            db.add(v_obj)
            db.flush()
            if not first_village_id:
                first_village_id = v_obj.id

    print("Seeding Authorities...")
    authorities = [
        Authority(
            name_en="Block Development Officer, Chandil",
            name_hi="प्रखंड विकास पदाधिकारी, चांडिल",
            department="Rural Development & Panchayat Raj, Jharkhand",
            designation="Block Development Officer (BDO)",
            hierarchy_level="block",
            district_id=district.id,
            block_id=block.id,
            contact_email="bdo-chandil@jharkhand.gov.in"
        ),
        Authority(
            name_en="District Deputy Commissioner, Seraikela",
            name_hi="उपायुक्त एवं जिला दंडाधिकारी, सरायकेला-खरसावां",
            department="District Administration, Seraikela-Kharsawan",
            designation="Deputy Commissioner (DC)",
            hierarchy_level="district",
            district_id=district.id,
            contact_email="dc-seraikela@jharkhand.gov.in"
        ),
        Authority(
            name_en="Anti-Corruption Bureau, Kolhan Division",
            name_hi="भ्रष्टाचार निरोधक ब्यूरो (एसीबी), कोल्हान",
            department="Jharkhand Anti-Corruption Bureau",
            designation="Superintendent of Police (Vigilance)",
            hierarchy_level="state",
            contact_email="acb-kolhan@jharkhand.gov.in"
        ),
        Authority(
            name_en="Executive Engineer, Drinking Water & Sanitation",
            name_hi="कार्यपालक अभियंता, पेयजल एवं स्वच्छता प्रमंडल",
            department="Drinking Water and Sanitation Department",
            designation="Executive Engineer (EE)",
            hierarchy_level="district",
            district_id=district.id,
            contact_email="ee-dws-seraikela@jharkhand.gov.in"
        )
    ]
    for auth in authorities:
        db.add(auth)
    db.flush()

    print("Seeding Fictional Demo Accounts...")
    # 1. Citizen
    citizen_user = User(
        email="citizen@gramsaksham.in",
        phone="9876543210",
        full_name="Sunita Mahato",
        hashed_password=get_password_hash("Citizen@123"),
        role="citizen",
        preferred_language="hi"
    )
    db.add(citizen_user)
    db.flush()

    citizen_profile = CitizenProfile(
        user_id=citizen_user.id,
        district_id=district.id,
        block_id=block.id,
        panchayat_id=panchayat_objs[0].id,
        village_id=first_village_id,
        gender="Female",
        dob="1992-05-14",
        aadhaar_last_four="8742",
        social_category="OBC",
        occupation="Agricultural Labourer",
        annual_income=72000.0,
        is_bpl=True,
        ration_card_type="PHH"
    )
    household = Household(
        user_id=citizen_user.id,
        house_type="kutcha",
        has_toilet=False,
        has_electricity=True,
        landholding_acres=0.8,
        has_piped_water=False,
        members_count=4,
        has_elderly_or_widow=False,
        has_differently_abled=False
    )
    db.add(citizen_profile)
    db.add(household)

    # 2. Facilitator
    facilitator_user = User(
        email="facilitator@gramsaksham.in",
        phone="9876543211",
        full_name="Ramesh Soren (CSC / VLE)",
        hashed_password=get_password_hash("Facilitator@123"),
        role="facilitator",
        preferred_language="en"
    )
    db.add(facilitator_user)

    # 3. Authority
    authority_user = User(
        email="authority@gramsaksham.in",
        phone="9876543212",
        full_name="P. K. Verma (BDO Chandil)",
        hashed_password=get_password_hash("Authority@123"),
        role="authority",
        preferred_language="hi"
    )
    db.add(authority_user)

    # 4. Administrator
    admin_user = User(
        email="admin@gramsaksham.in",
        phone="9876543213",
        full_name="State Civic Administrator",
        hashed_password=get_password_hash("Admin@123"),
        role="admin",
        preferred_language="en"
    )
    db.add(admin_user)
    db.flush()

    print("Seeding Verified Welfare Schemes...")
    schemes_data = [
        {
            "code": "PMAY-G",
            "name_en": "Pradhan Mantri Awaas Yojana - Gramin",
            "name_hi": "प्रधानमंत्री आवास योजना - ग्रामीण",
            "category": "Housing",
            "department_en": "Ministry of Rural Development, Government of India",
            "department_hi": "ग्रामीण विकास मंत्रालय, भारत सरकार",
            "description_en": "Provides financial grant assistance to houseless rural families and those living in kutcha/dilapidated houses to build a pucca house with basic amenities.",
            "description_hi": "बेघर ग्रामीण परिवारों और कच्चे या जीर्ण-शीर्ण मकानों में रहने वालों को पक्का घर बनाने के लिए सीधे बैंक खाते में वित्तीय सहायता।",
            "benefits_en": "Direct bank transfer of ₹1,20,000 in plain areas / ₹1,30,000 in hilly/difficult areas in installments, plus 90-95 days of MGNREGA unskilled labour wages (₹20,000+) and ₹12,000 for toilet under SBM-G.",
            "benefits_hi": "₹1,20,000 की वित्तीय सहायता किस्तों में डीबीटी द्वारा, साथ ही मनरेगा के तहत 90-95 मानव दिवस की मजदूरी (₹20,000+) और शौचालय हेतु ₹12,000 अतिरिक्त।",
            "eligibility_summary_en": "Rural households residing in kutcha houses (0, 1, or 2 rooms with kutcha roof and wall) based on SECC 2011 / Awaas+ list; no pucca house anywhere in India; no motorized 3/4 wheeler; income below taxable limit.",
            "eligibility_summary_hi": "कच्चे मकान में रहने वाले या बेघर परिवार; देश में कहीं पक्का मकान नहीं होना चाहिए; तीन/चार पहिया वाहन या सरकारी सेवा में सदस्य नहीं होना चाहिए।",
            "required_documents": ["Aadhaar Card", "Bank Passbook with linked Aadhaar", "MGNREGA Job Card", "Ration Card", "Affidavit of land ownership / Gram Sabha consent"],
            "application_procedure_en": "Beneficiary identification through Gram Sabha verified Awaas+ list. Registration on AwaasSoft by Panchayat Secretary/Rojgar Sevak with geotagged site photo.",
            "application_procedure_hi": "ग्राम सभा द्वारा अनुमोदित आवास+ सूची। रोजगार सेवक या पंचायत सचिव द्वारा स्थल की जियोटैग्ड तस्वीर के साथ आवास-सॉफ्ट पर पंजीकरण।",
            "official_website": "https://pmayg.nic.in"
        },
        {
            "code": "SBM-G",
            "name_en": "Swachh Bharat Mission - Gramin (IHHL)",
            "name_hi": "स्वच्छ भारत मिशन - ग्रामीण (व्यक्तिगत घरेलू शौचालय)",
            "category": "Sanitation",
            "department_en": "Department of Drinking Water & Sanitation, Ministry of Jal Shakti",
            "department_hi": "पेयजल एवं स्वच्छता विभाग, जल शक्ति मंत्रालय",
            "description_en": "Financial incentive to rural households for constructing an Individual Household Latrine (IHHL) to ensure 100% open defecation free villages.",
            "description_hi": "ग्रामीण परिवारों को व्यक्तिगत घरेलू शौचालय के निर्माण हेतु प्रोत्साहन राशि, जिससे गांव खुले में शौच से मुक्त रहें।",
            "benefits_en": "Direct incentive grant of ₹12,000 (Central + State share) deposited directly into beneficiary's bank account upon construction and geotagging.",
            "benefits_hi": "शौचालय निर्माण और फोटो सत्यापन के बाद सीधे बैंक खाते में ₹12,000 की प्रोत्साहन सहायता।",
            "eligibility_summary_en": "Rural households without any existing functional toilet; prioritized for BPL, SC/ST, small/marginal farmers, landless labourers, physically handicapped, and women-headed households.",
            "eligibility_summary_hi": "ग्रामीण परिवार जिनके घर में पहले से शौचालय नहीं है; अजा/अजजा, बीपीएल, महिला मुखिया और लघु किसानों को प्राथमिकता।",
            "required_documents": ["Aadhaar Card", "Bank Account Details", "Ration Card", "Electricity Bill or Residence Proof"],
            "application_procedure_en": "Apply online at sbm.gov.in or submit application form at Chandil Block Sanitation Cell with photo verification.",
            "application_procedure_hi": "sbm.gov.in पर ऑनलाइन या प्रखंड स्वच्छता समन्वयक के कार्यालय में आवेदन जमा करें।",
            "official_website": "https://swachhbharatmission.gov.in"
        },
        {
            "code": "ABUA-AWAS",
            "name_en": "Jharkhand Abua Awas Yojana",
            "name_hi": "झारखंड अबूआ आवास योजना",
            "category": "Housing",
            "department_en": "Rural Development Department, Government of Jharkhand",
            "department_hi": "ग्रामीण विकास विभाग, झारखंड सरकार",
            "description_en": "Jharkhand government's flagship 3-room housing scheme for families excluded from PMAY-G and living in kutcha houses or temporary shelters.",
            "description_hi": "झारखंड सरकार की 3 कमरों वाली पक्की आवास योजना, जो पीएमएवाई-जी से वंचित और कच्चे मकानों में रहने वाले परिवारों के लिए है।",
            "benefits_en": "₹2,00,000 grant provided across 4 stages for building a 31 sq. metre 3-room pucca house with kitchen and clean sanitation facility.",
            "benefits_hi": "₹2,00,000 की सहायता 4 किस्तों में; 3 कमरा व रसोईघर युक्त 31 वर्ग मीटर पक्का मकान।",
            "eligibility_summary_en": "Permanent residents of Jharkhand who are houseless, living in kutcha houses, primitive tribes (PVTG), disaster-affected families, or left out of PMAY-G lists.",
            "eligibility_summary_hi": "झारखंड के स्थायी निवासी; कच्चे मकान या झोपड़ी में रहने वाले परिवार; पीवीटीजी आदिम जनजाति व बेघर परिवार।",
            "required_documents": ["Jharkhand Residential Certificate", "Aadhaar Card", "Bank Passbook", "Ration Card", "Gram Sabha Approval Extract"],
            "application_procedure_en": "Applied during 'Aapki Yojana, Aapki Sarkar, Aapke Dwar' camps or through Chandil Block Office verification.",
            "application_procedure_hi": "आपकी योजना, आपकी सरकार, आपके द्वार शिविर में या चांडिल प्रखंड कार्यालय में आवेदन।",
            "official_website": "https://aay.jharkhand.gov.in"
        },
        {
            "code": "BIRSA-HARIT",
            "name_en": "Birsa Harit Gram Yojana (BHGY)",
            "name_hi": "बिरसा हरित ग्राम योजना",
            "category": "Agriculture",
            "department_en": "MGNREGA Division, Rural Development Department, Jharkhand",
            "department_hi": "मनरेगा प्रभाग, ग्रामीण विकास विभाग, झारखंड",
            "description_en": "Promotes fruit orchard plantation (Mango, Guava, Lime) on uncultivated or fallow lands of small/marginal farmers with 100% free saplings, fencing, irrigation pits, and MGNREGA wages.",
            "description_hi": "किसानों की परती/अकृषित भूमि पर आम, अमरूद आदि फलदार बागवानी; पौधे, घेराबंदी, सिंचाई और देखरेख हेतु मनरेगा मजदूरी मुफ्त।",
            "benefits_en": "Free 112 fruit saplings per 0.5 acre, pit digging & maintenance wages under MGNREGA for 3-5 years, providing sustainable annual income of ₹50,000+ per acre after 3 years.",
            "benefits_hi": "प्रति 0.5 एकड़ 112 फलदार पौधे मुफ्त, 3 से 5 वर्ष तक देखरेख हेतु मनरेगा मजदूरी और 3 साल बाद ₹50,000+ की वार्षिक आय।",
            "eligibility_summary_en": "Farmers possessing at least 0.5 to 1 acre of unutilized or cultivable land in rural Jharkhand with active MGNREGA Job Card; SC/ST and women farmers prioritized.",
            "eligibility_summary_hi": "कम से कम 0.5 एकड़ परती या कृषि योग्य भूमि वाले किसान; मनरेगा जॉब कार्ड धारक; अजा/अजजा व महिला किसानों को प्राथमिकता।",
            "required_documents": ["Land Possession Certificate (LPC) / Khatiyan", "MGNREGA Job Card", "Aadhaar Card", "Bank Passbook"],
            "application_procedure_en": "Approval at Gram Sabha meeting, followed by technical verification by Chandil Block BPO/Junior Engineer.",
            "application_procedure_hi": "ग्राम सभा से अनुमोदन के बाद प्रखंड कार्यक्रम पदाधिकारी (BPO) द्वारा तकनीकी स्वीकृति।",
            "official_website": "https://mgnrega.jharkhand.gov.in"
        },
        {
            "code": "SARVAJAN-PENSION",
            "name_en": "Jharkhand Sarvajan Pension Yojana",
            "name_hi": "झारखंड सर्वजन पेंशन योजना",
            "category": "Social Security",
            "department_en": "Department of Women, Child Development & Social Security, Jharkhand",
            "department_hi": "महिला, बाल विकास एवं सामाजिक सुरक्षा विभाग, झारखंड",
            "description_en": "Universal monthly social security pension for eligible senior citizens, destitute widows, and differently-abled individuals without requiring BPL card constraints.",
            "description_hi": "वरिष्ठ नागरिकों, निराश्रित विधवाओं और दिव्यांगजनों को मासिक सामाजिक सुरक्षा पेंशन (बीपीएल कार्ड की बाध्यता समाप्त)।",
            "benefits_en": "Monthly pension of ₹1,000 deposited on the 5th of every calendar month directly into the beneficiary's DBT bank account.",
            "benefits_hi": "प्रत्येक माह की 5 तारीख को सीधे बैंक खाते में ₹1,000 की मासिक सम्मान राशि।",
            "eligibility_summary_en": "All senior citizens aged 60+ (or 50+ for ST/SC and women); widows of any age; differently-abled individuals with 40%+ disability certificate.",
            "eligibility_summary_hi": "60 वर्ष से अधिक आयु के नागरिक (अजा/अजजा व महिलाओं हेतु 50 वर्ष); किसी भी आयु की विधवाएं; 40% से अधिक दिव्यांग।",
            "required_documents": ["Age Proof / Aadhaar Card", "Bank Account Details", "Income Certificate (below ₹2 Lakh)", "Death certificate of husband (for widows)", "Disability Certificate (if applicable)"],
            "application_procedure_en": "Submit prescribed form to Chandil Block Social Security Cell or online at jharsewa.jharkhand.gov.in.",
            "application_procedure_hi": "चांडिल प्रखंड सामाजिक सुरक्षा कोषांग में या झारसेवा पोर्टल पर आवेदन जमा करें।",
            "official_website": "https://jharsewa.jharkhand.gov.in"
        }
    ]

    for s_data in schemes_data:
        scheme = Scheme(
            code=s_data["code"],
            name_en=s_data["name_en"],
            name_hi=s_data["name_hi"],
            category=s_data["category"],
            department_en=s_data["department_en"],
            department_hi=s_data["department_hi"],
            description_en=s_data["description_en"],
            description_hi=s_data["description_hi"],
            benefits_en=s_data["benefits_en"],
            benefits_hi=s_data["benefits_hi"],
            eligibility_summary_en=s_data["eligibility_summary_en"],
            eligibility_summary_hi=s_data["eligibility_summary_hi"],
            required_documents=s_data["required_documents"],
            application_procedure_en=s_data["application_procedure_en"],
            application_procedure_hi=s_data["application_procedure_hi"],
            official_website=s_data["official_website"],
            last_verified_date="2026-03-01",
            is_active=True
        )
        db.add(scheme)
        db.flush()
        
        # Add rule
        rule = SchemeRule(
            scheme_id=scheme.id,
            version=1,
            rule_criteria={"code": s_data["code"], "status": "active"},
            is_active=True
        )
        db.add(rule)

    print("Seeding Realistic Sample Complaints...")
    # Complaint 1: Bribery demanded by local Mukhiya for PMAY-G signature (Conflict Flagged!)
    comp1 = Complaint(
        tracking_number="GS-2026-CH-1001",
        user_id=citizen_user.id,
        category="bribery",
        scheme_or_service="Pradhan Mantri Awaas Yojana - Gramin",
        district_id=district.id,
        block_id=block.id,
        panchayat_id=panchayat_objs[0].id,
        village_id=first_village_id,
        incident_date="2026-02-15",
        description="PMAY-G allotment letter was approved, but the Panchayat Mukhiya and intermediary demanded ₹15,000 cash bribe to issue the foundation clearance signature. When refused, they threatened to cancel the installment.",
        accused_name="D. K. Singh (Panchayat Official / Intermediary)",
        accused_designation="Mukhiya",
        amount_demanded=15000.0,
        payment_made=False,
        confidentiality="confidential",
        current_status="investigation_in_progress",
        is_conflict_flagged=True,
        routed_authority_id=authorities[0].id # BDO Chandil
    )
    db.add(comp1)
    db.flush()

    upd1_1 = ComplaintUpdate(
        complaint_id=comp1.id,
        previous_status="none",
        new_status="submitted",
        remarks="Grievance filed by citizen. Conflict of interest detected against local Mukhiya; safely routed directly to BDO Chandil and ACB Vigilance Cell.",
        created_at=datetime(2026, 2, 16, 10, 30, tzinfo=timezone.utc)
    )
    upd1_2 = ComplaintUpdate(
        complaint_id=comp1.id,
        previous_status="submitted",
        new_status="under_review",
        remarks="Case admitted by Chandil Block Vigilance Cell. Statement recorded confidentially.",
        created_at=datetime(2026, 2, 18, 14, 0, tzinfo=timezone.utc)
    )
    upd1_3 = ComplaintUpdate(
        complaint_id=comp1.id,
        previous_status="under_review",
        new_status="investigation_in_progress",
        remarks="Inquiry committee formed under Assistant Engineer Chandil. Spot inspection scheduled without notifying accused village representatives.",
        action_taken_report="Preliminary evidence reviewed. Accused official instructed to submit explanation within 7 working days. Beneficiary installment safeguarded.",
        created_at=datetime(2026, 2, 22, 11, 15, tzinfo=timezone.utc)
    )
    db.add(upd1_1)
    db.add(upd1_2)
    db.add(upd1_3)

    # Complaint 2: Unfair SBM-G exclusion
    comp2 = Complaint(
        tracking_number="GS-2026-CH-1002",
        user_id=citizen_user.id,
        category="sanitation_rejection",
        scheme_or_service="Swachh Bharat Mission - Gramin",
        district_id=district.id,
        block_id=block.id,
        panchayat_id=panchayat_objs[1].id,
        village_id=first_village_id,
        incident_date="2026-02-10",
        description="Constructed twin-pit toilet as per SBM guidelines 4 months ago. Geo-tagging was completed but ₹12,000 subsidy has not been credited to bank account despite repeated visits to Panchayat Bhavan.",
        accused_name="Panchayat Secretary Office",
        accused_designation="Panchayat Secretary",
        amount_demanded=0.0,
        payment_made=False,
        confidentiality="confidential",
        current_status="action_reported",
        is_conflict_flagged=True,
        routed_authority_id=authorities[3].id # DWSD Executive Engineer
    )
    db.add(comp2)
    db.flush()

    upd2_1 = ComplaintUpdate(
        complaint_id=comp2.id,
        previous_status="submitted",
        new_status="action_reported",
        remarks="Field verification completed by Chandil Block Sanitation Coordinator.",
        action_taken_report="FTO (Fund Transfer Order) generated under batch #JH-SK-2026-088. Subsidy of ₹12,000 sent for PFMS clearance. Bank credit expected within 48 hours.",
        created_at=datetime(2026, 2, 25, 16, 45, tzinfo=timezone.utc)
    )
    db.add(upd2_1)

    print("Seeding Additional Modules (JalWatch, WorkVerify, KrishiAlert)...")
    water_report = WaterReport(
        user_id=citizen_user.id,
        panchayat_id=panchayat_objs[0].id,
        village_id=first_village_id,
        issue_type="handpump_broken",
        location_landmark="Near Primary Health Sub-Centre, Chilgu Chowk",
        description="The primary drinking water India Mark-II handpump handle is broken for the past 12 days. 45 households have to walk 1.5 km to fetching tube-well.",
        status="team_dispatched"
    )
    db.add(water_report)

    infra_project = InfrastructureProject(
        title_en="PCC Road & Covered Drain Construction (Chilgu to Damodarpur Link)",
        title_hi="पीसीसी सड़क एवं कवर्ड नाली निर्माण (चिलगू से दामोदरपुर संपर्क मार्ग)",
        panchayat_id=panchayat_objs[0].id,
        village_id=first_village_id,
        project_type="Road & Drainage",
        sanctioned_amount=1485000.0,
        contractor_or_agency="M/s Jharkhand Infra Buildcon (Block Tender)",
        status="in_progress",
        progress_percentage=65
    )
    db.add(infra_project)

    agri_alerts = [
        AgricultureAlert(
            title_en="Weather Advisory: Isolated Thunderstorms and Light Rain in Chandil Sub-division",
            title_hi="मौसम चेतावनी: चांडिल अनुमंडल में छिटपुट गरज के साथ हल्की वर्षा की संभावना",
            category="Weather",
            content_en="Light to moderate rainfall with wind gusts up to 35 kmph expected over Seraikela-Kharsawan district over the next 48 hours. Farmers are advised to secure harvested rabi crops and postpone chemical spraying.",
            content_hi="सरायकेला-खरसावां जिले में अगले 48 घंटों में 35 किमी/घंटा की रफ्तार से हवाएं और हल्की वर्षा संभावित है। कटी हुई फसलों को सुरक्षित रखें तथा कीटनाशक छिड़काव स्थगित करें।",
            severity="warning",
            source="IMD Regional Meteorological Centre, Ranchi"
        ),
        AgricultureAlert(
            title_en="Birsa Harit Gram Yojana: Free Fruit Saplings Allotment Open for Monsoon 2026",
            title_hi="बिरसा हरित ग्राम योजना: मानसून 2026 हेतु मुफ्त फलदार पौधों का आवंटन प्रारंभ",
            category="Scheme",
            content_en="Gram Sabha applications for Mango (Amrapali & Mallika) orchard planting under Birsa Harit Gram Yojana are now being registered at Chandil Block MGNREGA cell. 112 saplings per half-acre with free fencing support.",
            content_hi="बिरसा हरित ग्राम योजना के तहत आम्रपाली व मल्लिका आम के बगीचे लगाने हेतु चांडिल प्रखंड मनरेगा कोषांग में पंजीकरण प्रारंभ है। आधा एकड़ पर 112 पौधे व घेराबंदी सहायता।",
            severity="info",
            source="Block Program Officer (MGNREGA), Chandil"
        )
    ]
    for alert in agri_alerts:
        db.add(alert)

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed()
