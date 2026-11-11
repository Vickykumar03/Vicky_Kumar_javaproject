from typing import Dict, Any, List
from datetime import datetime, timezone

def evaluate_scheme_eligibility(scheme_code: str, user_input: Dict[str, Any], rule_criteria: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Evaluates citizen inputs against real scheme rules.
    Outputs:
    - status: 'potentially_eligible' | 'more_info_required' | 'ineligible' | 'requires_official_verification'
    - satisfied_criteria: list of dicts
    - unsatisfied_criteria: list of dicts
    - missing_criteria: list of dicts
    - explanation_en: str
    - explanation_hi: str
    - official_source: str
    """
    satisfied = []
    unsatisfied = []
    missing = []
    
    # Extract inputs with defaults
    income = user_input.get("annual_income")
    house_type = user_input.get("house_type")
    has_toilet = user_input.get("has_toilet")
    occupation = user_input.get("occupation")
    landholding = user_input.get("landholding_acres")
    social_category = user_input.get("social_category")
    is_bpl = user_input.get("is_bpl")
    has_elderly = user_input.get("has_elderly_or_widow")
    has_disabled = user_input.get("has_differently_abled")
    ration_card = user_input.get("ration_card_type")
    
    code = scheme_code.upper()
    
    if code in ["PMAY-G", "PMAYG"]:
        # Pradhan Mantri Awaas Yojana - Gramin
        official_source = "Ministry of Rural Development, GoI (pmayg.nic.in)"
        
        # 1. House condition
        if house_type is None:
            missing.append({
                "rule": "Housing condition",
                "text_en": "Current housing condition is needed (kutcha/semi-pucca/homeless/pucca).",
                "text_hi": "वर्तमान आवास की स्थिति की आवश्यकता है (कच्चा/अर्ध-पक्का/बेघर/पक्का)।"
            })
        elif house_type in ["kutcha", "homeless", "semi_pucca"]:
            satisfied.append({
                "rule": "Housing condition",
                "text_en": f"Family resides in a {house_type} house or is houseless (meets deprivation criteria).",
                "text_hi": f"परिवार {house_type} मकान में रहता है या बेघर है (वंचना मानकों के अनुकूल)।"
            })
        else:
            unsatisfied.append({
                "rule": "Housing condition",
                "text_en": "Family already owns a permanent pucca house, which is an exclusion criterion under PMAY-G.",
                "text_hi": "परिवार के पास पहले से पक्का मकान है, जो पीएमएवाई-जी के तहत अपवर्जन मानक है।"
            })
            
        # 2. Income / BPL / Land
        if income is None and is_bpl is None:
            missing.append({
                "rule": "Income / BPL Status",
                "text_en": "Annual household income or BPL status is needed.",
                "text_hi": "वार्षिक पारिवारिक आय या बीपीएल स्थिति आवश्यक है।"
            })
        elif (income is not None and income <= 150000) or is_bpl is True:
            satisfied.append({
                "rule": "Economic Status",
                "text_en": "Annual household income is within the priority low-income bracket.",
                "text_hi": "वार्षिक पारिवारिक आय प्राथमिकता कम आय सीमा के अंतर्गत है।"
            })
        else:
            unsatisfied.append({
                "rule": "Economic Status",
                "text_en": f"Annual income (₹{income:,.0f}) exceeds the general rural housing assistance priority threshold.",
                "text_hi": f"वार्षिक आय (₹{income:,.0f}) ग्रामीण आवास सहायता की सामान्य प्राथमिकता सीमा से अधिक है।"
            })
            
        # 3. Land ownership exclusion
        if landholding is not None and landholding > 5.0:
            unsatisfied.append({
                "rule": "Landholding",
                "text_en": f"Owning {landholding} acres exceeds the ceiling limit for priority housing.",
                "text_hi": f"{landholding} एकड़ भूमि होना प्राथमिकता आवास की अधिकतम सीमा से अधिक है।"
            })

    elif code in ["SBM-G", "SBMG"]:
        # Swachh Bharat Mission - Gramin
        official_source = "Department of Drinking Water and Sanitation (swachhbharatmission.gov.in)"
        
        # 1. Existing toilet
        if has_toilet is None:
            missing.append({
                "rule": "Sanitation facility",
                "text_en": "Information regarding whether your house has an active individual household latrine (IHHL).",
                "text_hi": "यह जानकारी कि क्या आपके घर में व्यक्तिगत घरेलू शौचालय उपलब्ध है।"
            })
        elif has_toilet is False:
            satisfied.append({
                "rule": "Lack of toilet",
                "text_en": "Household does not have an existing functional toilet, eligible for ₹12,000 IHHL incentive.",
                "text_hi": "घर में शौचालय उपलब्ध नहीं है, परिवार ₹12,000 प्रोत्साहन राशि के लिए पात्र है।"
            })
        else:
            unsatisfied.append({
                "rule": "Existing toilet",
                "text_en": "Household already has an individual toilet; incentive is provided only for new construction.",
                "text_hi": "घर में पहले से शौचालय है; सहायता केवल नए निर्माण के लिए दी जाती है।"
            })
            
        # 2. Priority category
        if social_category in ["SC", "ST"] or is_bpl is True or has_elderly is True or has_disabled is True:
            satisfied.append({
                "rule": "Priority Household Category",
                "text_en": "Falls under priority rural category (SC/ST/BPL/Physically challenged).",
                "text_hi": "प्राथमिकता ग्रामीण श्रेणी (अजा/अजजा/बीपीएल/दिव्यांग) के अंतर्गत आता है।"
            })

    elif code in ["ABUA-AWAS", "ABUA"]:
        # Jharkhand Abua Awas Yojana (3-room housing scheme)
        official_source = "Rural Development Department, Government of Jharkhand"
        
        if house_type is None:
            missing.append({
                "rule": "House type",
                "text_en": "Current housing condition is required.",
                "text_hi": "वर्तमान घर की स्थिति आवश्यक है।"
            })
        elif house_type in ["kutcha", "homeless"]:
            satisfied.append({
                "rule": "Deprived housing",
                "text_en": "Family lives in kutcha house or is houseless, fulfilling core Abua Awas criteria.",
                "text_hi": "परिवार कच्चे मकान में रहता है या बेघर है, अबूआ आवास की मुख्य शर्त पूरी होती है।"
            })
        else:
            unsatisfied.append({
                "rule": "House type",
                "text_en": "Family already has a pucca or satisfactory residential house.",
                "text_hi": "परिवार के पास पहले से पक्का या संतोषजनक आवास उपलब्ध है।"
            })
            
        if income is not None and income <= 250000:
            satisfied.append({
                "rule": "Income limit",
                "text_en": "Household income is within Jharkhand state Abua Awas guidelines.",
                "text_hi": "पारिवारिक आय झारखंड राज्य अबूआ आवास दिशा-निर्देशों के अनुरूप है।"
            })

    elif code in ["BIRSA-HARIT", "BIRSA"]:
        # Birsa Harit Gram Yojana (Jharkhand Orchard & Agroforestry)
        official_source = "MGNREGA Division, Rural Development Department, Jharkhand"
        
        if landholding is None:
            missing.append({
                "rule": "Land ownership",
                "text_en": "Landholding acreage is required (at least 0.5 acre uncultivated/fallow land recommended).",
                "text_hi": "भूमि का विवरण आवश्यक है (कम से कम 0.5 एकड़ परती या कृषि योग्य भूमि अनुशंसित)।"
            })
        elif landholding >= 0.5:
            satisfied.append({
                "rule": "Land availability",
                "text_en": f"You possess {landholding} acres of land suitable for fruit orchard plantation.",
                "text_hi": f"आपके पास फलदार बागवानी के लिए {landholding} एकड़ उपयुक्त भूमि उपलब्ध है।"
            })
        else:
            unsatisfied.append({
                "rule": "Minimum land",
                "text_en": "Birsa Harit Gram Yojana typically requires at least 0.5 acres for a viable mango/fruit orchard unit.",
                "text_hi": "बिरसा हरित ग्राम योजना के लिए कम से कम 0.5 एकड़ भूमि आवश्यक होती है।"
            })

    elif code in ["SARVAJAN-PENSION", "PENSION"]:
        # Jharkhand Sarvajan Pension Yojana
        official_source = "Women, Child Development and Social Security Dept, Jharkhand"
        
        if has_elderly is True or has_disabled is True or (social_category in ["ST", "SC"]):
            satisfied.append({
                "rule": "Target Group",
                "text_en": "Meets universal pension eligibility category (Senior citizen 50+ for ST/SC or 60+ general, widow, or differently-abled).",
                "text_hi": "सर्वजन पेंशन श्रेणी (अजजा/अजा हेतु 50+ वर्ष, सामान्य हेतु 60+ वर्ष, विधवा या दिव्यांग) के योग्य।"
            })
        else:
            unsatisfied.append({
                "rule": "Age / Condition",
                "text_en": "Universal pension requires senior citizen status (60+ years or 50+ for ST/SC), widowhood, or registered disability.",
                "text_hi": "सर्वजन पेंशन हेतु वरिष्ठ नागरिक (60+ वर्ष या अजा/अजजा हेतु 50+ वर्ष), विधवा अथवा दिव्यांगता आवश्यक है।"
            })
            
    else:
        # Generic rule evaluation
        official_source = "Government of Jharkhand / Government of India Official Gazette"
        if is_bpl or (income is not None and income <= 180000):
            satisfied.append({
                "rule": "Income Qualification",
                "text_en": "Household meets low-income baseline criteria.",
                "text_hi": "परिवार न्यूनतम आय पात्रता को पूरा करता है।"
            })
        if social_category:
            satisfied.append({
                "rule": "Demographic Profile",
                "text_en": f"Registered under social category: {social_category}.",
                "text_hi": f"सामाजिक श्रेणी: {social_category} के अंतर्गत दर्ज।"
            })

    # Determine overall status
    # Disqualifying conditions for housing schemes
    if code in ["PMAY-G", "PMAYG", "ABUA-AWAS", "ABUA"] and house_type == "pucca":
        status = "ineligible"
        explanation_en = "Household already owns a permanent pucca house, which is an absolute disqualification under rural housing schemes."
        explanation_hi = "परिवार के पास पहले से पक्का मकान उपलब्ध है, जो ग्रामीण आवास योजनाओं के अंतर्गत पूर्ण अपवर्जन मानक है।"
    elif len(unsatisfied) > 0 and len(satisfied) == 0:
        status = "ineligible"
        explanation_en = "Based on the provided responses, your household currently appears ineligible under the primary statutory rules for this scheme."
        explanation_hi = "दिए गए विवरणों के अनुसार, आपका परिवार वर्तमान में इस योजना के प्राथमिक वैधानिक नियमों के तहत अपात्र प्रतीत होता है।"
    elif len(unsatisfied) > 0 and len(satisfied) > 0:
        status = "requires_official_verification"
        explanation_en = "Your household meets some criteria but has potential exclusions. An in-person verification with the Chandil Block Development Office is required."
        explanation_hi = "आपका परिवार कुछ शर्तों को पूरा करता है परंतु कुछ संभावित अपवर्जन हैं। चांडिल प्रखंड विकास कार्यालय द्वारा भौतिक सत्यापन आवश्यक है।"
    elif len(missing) > 0:
        status = "more_info_required"
        explanation_en = f"You may be eligible, but {len(missing)} key verification detail(s) must be filled in to complete the assessment."
        explanation_hi = f"आप पात्र हो सकते हैं, परंतु आकलन पूरा करने के लिए {len(missing)} महत्वपूर्ण विवरण भरना आवश्यक है।"
    else:
        status = "potentially_eligible"
        explanation_en = "Your household meets all documented preliminary eligibility conditions. You are recommended to proceed with application assistance."
        explanation_hi = "आपका परिवार सभी प्रारंभिक पात्रता शर्तों को पूरा करता है। आपको आवेदन सहायता के साथ आगे बढ़ने की सलाह दी जाती है।"

    return {
        "status": status,
        "satisfied_criteria": satisfied,
        "unsatisfied_criteria": unsatisfied,
        "missing_criteria": missing,
        "explanation_en": explanation_en,
        "explanation_hi": explanation_hi,
        "official_source": official_source,
        "assessment_date": datetime.now(timezone.utc)
    }
