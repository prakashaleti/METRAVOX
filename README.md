# METRAVOX – Online Verification System for Weighing and Measuring Instruments

**Under the Ministry of Consumer Affairs, Food & Public Distribution (Government of India)**  
*Problem Statement: "Development of an Online Verification System for Weighing and Measuring Instruments"*

---

## 🏛️ Project Overview

**METRAVOX** is a modern, responsive, government-grade digital verification platform engineered to digitize the complete statutory verification, inspection, stamping, and certification lifecycle of commercial weighing and measuring instruments under the **Legal Metrology Act, 2009** and the **Legal Metrology (General) Rules, 2011**.

Inspired functionally by Kerala's LMOMS, METRAVOX features an original, modern user interface, trustworthy government design system, and multi-tier proactive expiry alert engine.

---

## 🌟 Key Features

### 1. Multi-Role Portals & Navigation
- **Consumer / Applicant**:
  - Register & Sign in.
  - Multi-step wizard application submission (Applicant & Establishment, Instrument Specifications, Document Uploads, Statutory Fee Declaration).
  - Track application status on an interactive visual audit timeline.
  - Address returned applications: view officer comments and resubmit with corrections.
  - View, print, and download official Form V Legal Metrology Certificates.
  - Receive automated **Certificate Expiry Alerts** (30-day reminder, 15-day warning, 7-day urgent, and expired notices).
- **Legal Metrology Officer (Inspector)**:
  - Scrutiny queue to examine submitted dossiers and uploaded documents.
  - **Return for Correction** with specific remarks and checklist.
  - **Schedule Verification**: assign on-site inspection or laboratory testing slots, dates, and test weights squad.
  - **Record Verification Observations**: standard weights readings, error determination vs. Maximum Permissible Error (MPE) tolerance tables, and tamper seal numbers.
  - **Approve or Reject**: approving instantly generates an official Form V Digital Certificate with dynamic QR code.
- **Administrator**:
  - Executive analytics powered by **Recharts**: monthly trajectory, instrument category breakdown, and district compliance rates.
  - Enforcement officer roster, active queue oversight, and jurisdictional zoning.
  - Master certificate registry and centralized verification audit history.

### 2. Complete Verification Lifecycle
$$\text{Submitted} \longrightarrow \text{Under Review} \underset{\text{Resubmit}}{\overset{\text{Return}}{\rightleftharpoons}} \text{Scheduled} \longrightarrow \text{Inspection / Testing} \longrightarrow \text{Approved / Rejected} \longrightarrow \text{Certificate Generated}$$

### 3. Certificate Expiry Alert System
Stores validity dates and automatically calculates remaining days:
- **Overdue / Expired**: Critical Red banner (`STATUTORY EXPIRY NOTICE`) with immediate re-verification action.
- **1 – 7 Days Remaining**: Urgent Rose/Red alert banner prompting immediate renewal to avoid statutory penalties.
- **8 – 15 Days Remaining**: Amber warning advisory prompting scheduling of inspection slot.
- **16 – 30 Days Remaining**: Blue reminder opening periodic renewal window.

### 4. Digital Certificate (Form V) & QR Verification
- Official government certificate template with Ashok Chakra / Scales watermark, gold border, Form V / Schedule IX citations.
- Unique Certificate ID, Security Hash, Seal Serial Number, and digitally signed officer credential.
- **Dynamic QR Code**: Scanning or clicking opens a public validation screen verifying record authenticity directly against the registry.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (3.10+)

### Running the Frontend (Vite + React)
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

To build the production bundle:
```bash
npm run build
```

---

### Running with Python Django
```bash
cd backend
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
Django will serve the API at `/api/v1/` and serve the built React frontend at `/`.

---

## 🧪 Testing User Roles in Prototype

Use the **Active Persona Switcher** in the top navigation bar to seamlessly evaluate the system from any stakeholder's perspective:
1. **Rajesh Kumar** (Applicant / Trader – Apex Agro Ltd)
2. **Inspector S. Venkataraman** (Senior Legal Metrology Officer)
3. **Dr. Priya Sharma** (Assistant Controller of Legal Metrology & State Administrator)

You can also test the full round-trip:
- Submit an application as Applicant ➔ Switch to Officer to review, schedule, and approve ➔ View the generated Certificate and test QR validation!
- Click **"Reset Demo Data"** at any time in the navbar dropdown or Settings to restore the initial reference state.

---

## 📂 Project Architecture

```
metra/
├── frontend/                     # React 18 + Tailwind CSS + Lucide + Recharts
│   ├── src/
│   │   ├── components/           # Reusable UI components & modals
│   │   │   ├── CertificateCard.jsx
│   │   │   ├── ExpiryAlertBanner.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── TrackingTimeline.jsx
│   │   │   └── modals/
│   │   │       ├── QrVerificationModal.jsx
│   │   │       ├── RecordInspectionModal.jsx
│   │   │       ├── ReturnCorrectionModal.jsx
│   │   │       └── ScheduleInspectionModal.jsx
│   │   ├── context/              # AuthContext & AppContext (reactive store)
│   │   ├── pages/                # All role portals and workflow views
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   ├── admin/AdminDashboard.jsx
│   │   │   ├── applications/
│   │   │   │   ├── ApplicationDetails.jsx
│   │   │   │   ├── ApplicationList.jsx
│   │   │   │   ├── ApplicationTracking.jsx
│   │   │   │   └── NewApplication.jsx
│   │   │   ├── certificates/
│   │   │   │   ├── CertificateDetail.jsx
│   │   │   │   └── CertificatesList.jsx
│   │   │   ├── consumer/ConsumerDashboard.jsx
│   │   │   ├── history/VerificationHistory.jsx
│   │   │   ├── officer/OfficerDashboard.jsx
│   │   │   └── public/VerifyCertificate.jsx
│   │   └── services/storage.js   # LocalStorage persistence & mock data
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                      # Python Django Architecture
│   ├── api/                      # REST API app
│   │   ├── admin.py              # Admin model registration
│   │   ├── models.py             # ORM models (Applications, Certs, etc.)
│   │   ├── serializers.py        # DRF ModelSerializers
│   │   ├── views.py              # API Viewsets (Return, Schedule, Inspect)
│   │   └── urls.py
│   ├── metravox_core/            # Django project settings & URLs
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── manage.py
│   └── requirements.txt
│
└── README.md
```
