# GramSaksham (ग्रामसक्षम)

**Tagline:** Your Voice. Your Rights. Accountable Governance.  
**Category:** Rural Governance & Citizen Empowerment Platform  
**Pilot Location:** Chandil Block, District Seraikela-Kharsawan, Jharkhand, India  
**Initial Languages:** Hindi (हिन्दी) and English

---

## 1. Project Overview & The Real-World Problem

In many rural Indian communities, citizens face structural obstacles accessing government welfare programs and seeking administrative accountability:
- **Bribery & Corruption Demands:** Families are allegedly asked for cash bribes to obtain official signatures for rural housing installments and sanitation releases.
- **Arbitrary Exclusions:** Needy families living in dilapidated or kutcha homes are excluded from beneficiary lists without written reasons or right to appeal.
- **Panchayat Hegemony & Fear of Retribution:** Citizens do not know that complaints against a Mukhiya or Panchayat representative must be filed with the Block Development Officer (BDO) or Anti-Corruption Bureau (ACB), rather than at the village level.
- **No Meaningful Tracking:** Traditional paper grievances are lost without tracking numbers or auditable timelines.

### The GramSaksham Solution
GramSaksham bridges this gap with:
1. **GramConnect (Welfare Scheme Discovery & Rule Engine):** Preliminary statutory eligibility assessment against verified central and Jharkhand guidelines (PMAY-G, SBM-G, Abua Awas, Birsa Harit Gram, Sarvajan Pension).
2. **Smart Panchayat (Conflict-of-Interest Protected Grievance System):** Automatically flags complaints lodged against local Panchayat officials and routes them to higher administrative vigilance desks (BDO Chandil / Kolhan ACB). **The accused official is never given access or control over complaints filed against them.**
3. **Auditable Timeline Tracking:** Every complaint receives a unique tracking number (`GS-2026-CH-xxxx`) with status timelines and Action Taken Reports (ATR).
4. **Extension Modules:**
   - **JalWatch:** Drinking water breakdown reporting and pump repair tracking.
   - **WorkVerify AI:** Rural infrastructure monitoring with site progress and human verification.
   - **KrishiAlert:** Localized agro-meteorological advisories from IMD Ranchi and Birsa Agricultural University.

---

## 2. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7, TanStack Query, i18next, Lucide React
- **Backend:** Python 3.11+, FastAPI, SQLAlchemy 2.0, Pydantic v2, PyJWT, Bcrypt, Uvicorn
- **Database:** PostgreSQL (with SQLite dual-compatibility for standalone dev)
- **Containerization:** Docker, Docker Compose, Nginx reverse proxy

---

## 3. Seeded Demo Accounts (Fictional Test Personas)

For immediate evaluation, the platform includes pre-seeded demo accounts accessible via 1-click on the top bar or via the login page:

| Persona | Name | Role | Email | Password | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Citizen** | Sunita Mahato | `citizen` | `citizen@gramsaksham.in` | `Citizen@123` | Rural resident in Chilgu, Chandil. Kutcha house, ₹72,000 income. |
| **Facilitator** | Ramesh Soren | `facilitator` | `facilitator@gramsaksham.in` | `Facilitator@123` | Village CSC / VLE operator assisting citizens with documents. |
| **Authority** | P. K. Verma | `authority` | `authority@gramsaksham.in` | `Authority@123` | Block Development Officer (BDO), Chandil Administrative Desk. |
| **Administrator** | Civic Admin | `admin` | `admin@gramsaksham.in` | `Admin@123` | State & District governance administrator. |

---

## 4. Quick Start (Local Development)

### Prerequisites
- Node.js v18+ & npm
- Python 3.10+
- (Optional) PostgreSQL

### Step 1: Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -m app.seed_data
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Swagger documentation is available at: `http://127.0.0.1:8000/docs`

### Step 2: Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 5. Running Automated Backend Tests

The backend includes comprehensive verification tests covering health, authentication, geography, rule-based eligibility evaluation, conflict-of-interest grievance routing, and live admin statistics:
```bash
cd backend
python -u test_suite.py
```

---

## 6. Docker Deployment

To spin up the entire production stack (PostgreSQL + FastAPI + Nginx React Frontend):
```bash
docker-compose up --build
```
Access points:
- Web Application: `http://localhost:80`
- API Backend: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## 7. Pilot Geography Structure (Chandil Block, Jharkhand)

- **State:** Jharkhand
- **District:** Seraikela-Kharsawan
- **Block:** Chandil
  - **Panchayat 1:** Chilgu (Villages: Chilgu, Kadma, Asanbani)
  - **Panchayat 2:** Chandil (Villages: Chandil Bajar, Damodarpur, Gangudih)
  - **Panchayat 3:** Rangaon (Villages: Rangaon, Tiruldih, Rugri)
  - **Panchayat 4:** Hurlung (Villages: Hurlung, Tamulia, Kapali)

---

## 8. Security & Data Protection Compliance

- **Conflict-of-Interest Escrow:** Complies with fundamental principles of administrative justice (`Nemo judex in causa sua`). Grievances against a Mukhiya or Panchayat representative bypass local accounts and are routed to the Chandil BDO and Kolhan Anti-Corruption Bureau.
- **DPDP Act Alignment:** Supports data minimization, confidentiality preferences, and explicit citizen consent tracking.
- **Audit Logging:** Every user login, eligibility check, status update, and role change is permanently appended to `audit_logs`.
