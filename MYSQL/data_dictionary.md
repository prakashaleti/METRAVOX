# METRAVOX – Relational Database Tabular Forms & Data Dictionary
**Database Engine**: MySQL 8.0+ / MariaDB 10.5+  
**Collation**: utf8mb4_unicode_ci  
**Standard**: Legal Metrology (General) Rules, 2011 & Ministry of Consumer Affairs, Food & Public Distribution

---

## 1. Table: users
Central identity registry for authentication and authorization with JWT token issuance.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, AUTO_INCREMENT | Unique internal user identifier |
| username | VARCHAR(150) | NOT NULL, UNIQUE | Unique username for login (prakash, officer_ramesh, dmin_rohith) |
| email | VARCHAR(254) | NOT NULL, UNIQUE, INDEX | Official email address for notifications & JWT payload |
| password_hash | VARCHAR(255) | NOT NULL | Cryptographic password hash (PBKDF2/Argon2/bcrypt) |
| irst_name | VARCHAR(150) | DEFAULT '' | Given name of the user |
| last_name | VARCHAR(150) | DEFAULT '' | Surname / initials |
| 
ole | ENUM('CONSUMER', 'OFFICER', 'ADMIN') | NOT NULL, DEFAULT 'CONSUMER' | Role for JWT claim & RBAC checks |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Active account status flag |
| is_staff | BOOLEAN | NOT NULL, DEFAULT FALSE | Administrative privileges flag |
| last_login | DATETIME | NULL | Timestamp of most recent login |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| updated_at | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP | Timestamp of last modification |

---

## 2. Table: pplicant_profiles
Statutory profile of registered business establishments lodging verification requests.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, AUTO_INCREMENT | Profile record ID |
| user_id | BIGINT | UNIQUE, FK -> users(id) | Associated authentication user account |
| ull_name | VARCHAR(255) | NOT NULL | Full name of authorized signatory |
| usiness_name | VARCHAR(255) | NOT NULL | Registered commercial trade/firm name |
| gstin | VARCHAR(20) | NOT NULL, INDEX | 15-character Goods & Services Tax ID |
| email | VARCHAR(254) | NOT NULL | Primary correspondence email (prakash01.aleti@gmail.com) |
| phone | VARCHAR(20) | NOT NULL | Mobile number for OTP & statutory SMS |
| ddress | TEXT | NOT NULL | Physical premises address |
| district | VARCHAR(100) | NOT NULL, INDEX | Administrative district of establishment |
| state | VARCHAR(100) | NOT NULL, DEFAULT 'Kerala' | State jurisdiction |
| pincode | VARCHAR(10) | NOT NULL | Postal PIN code |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Registration timestamp |

---

## 3. Table: officer_profiles
Legal Metrology Officer directory containing official badge credentials and jurisdictional zones.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, AUTO_INCREMENT | Officer profile ID |
| user_id | BIGINT | UNIQUE, FK -> users(id) | Associated auth user (officer_ramesh) |
| officer_name | VARCHAR(255) | NOT NULL | Official name (Ramesh varma) |
| designation | VARCHAR(255) | DEFAULT 'Senior Legal Metrology Officer' | Official post designation |
| adge_number | VARCHAR(50) | NOT NULL, UNIQUE, INDEX | Official gazetted badge serial |
| jurisdiction_zone | VARCHAR(150) | NOT NULL, INDEX | Assigned enforcement jurisdiction |
| district | VARCHAR(100) | NOT NULL | Assigned district |
| phone | VARCHAR(20) | NOT NULL | Official departmental phone |
| email | VARCHAR(254) | NOT NULL | Departmental email address |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Officer duty status |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

---

## 4. Table: erification_applications
Central statutory dossier managing weighing and measuring instrument verification workflows.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, AUTO_INCREMENT | Internal dossier ID |
| pplication_id | VARCHAR(30) | NOT NULL, UNIQUE, INDEX | Public tracking ID (e.g. MV-2026-XXXX) |
| pplicant_id | BIGINT | FK -> applicant_profiles(id) | Applicant profile reference |
| pplicant_name | VARCHAR(255) | NOT NULL | Authorized applicant name |
| usiness_name | VARCHAR(255) | NOT NULL | Establishment name |
| gstin | VARCHAR(20) | NOT NULL | GSTIN of establishment |
| email | VARCHAR(254) | NOT NULL, INDEX | Applicant notification email |
| phone | VARCHAR(20) | NOT NULL | Contact telephone number |
| premises_address| TEXT | NOT NULL | Equipment deployment premises |
| district | VARCHAR(100) | NOT NULL | Equipment location district |
| instrument_category | VARCHAR(150) | NOT NULL | e.g. Electronic Weighing Instruments |
| instrument_type | VARCHAR(255) | NOT NULL | e.g. Class III Electronic Platform Scale |
| ccuracy_class | VARCHAR(100) | NOT NULL | Class I, II, III, or IIII |
| capacity | VARCHAR(100) | NOT NULL | Rated capacity & interval ($) |
| manufacturer | VARCHAR(255) | NOT NULL | Equipment manufacturer name |
| model_number | VARCHAR(150) | NOT NULL | Approved model number |
| serial_number | VARCHAR(150) | NOT NULL, INDEX | Unique hardware serial number |
| year_of_manufacture | INT | NOT NULL, DEFAULT 2025 | Manufacturing year |
| erification_nature | VARCHAR(100) | NOT NULL | Initial / Periodic / Post-repair |
| inspection_venue| VARCHAR(255) | NOT NULL | On-site premises or Standards Lab |
| status | ENUM(...) | NOT NULL, INDEX | Workflow state across the 8 statutory stages |
| 
eturn_reason | TEXT | NULL | Defect reason if returned for correction |
| 
eturned_at | DATETIME | NULL | Return timestamp |
| pplicant_correction_notes | TEXT | NULL | Explanation submitted during resubmission |
| ssigned_officer_id | BIGINT | FK -> officer_profiles(id) | Assigned inspecting officer |
| scheduled_date | DATE | NULL | Scheduled verification date |
| scheduled_slot | VARCHAR(100) | NULL | Scheduled verification time slot |
| special_instructions | TEXT | NULL | Preparation guidelines for applicant |
| statutory_fee | DECIMAL(10,2) | NOT NULL, DEFAULT 850.00 | Schedule XII statutory verification fee |
| ee_status | VARCHAR(50) | NOT NULL, DEFAULT 'PAID_ONLINE' | Payment status |
| 
ejection_reason| TEXT | NULL | Reason if rejected under Section 24 |
| submitted_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Date and time submitted |
| updated_at | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP | Last updated timestamp |

---

## 5. Table: pplication_documents
Mandatory statutory attachments uploaded by the applicant.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, AUTO_INCREMENT | Attachment record ID |
| pplication_id | BIGINT | FK -> verification_applications(id) | Associated application |
| document_name | VARCHAR(255) | NOT NULL | File name (e.g. Model Approval Certificate) |
| document_type | VARCHAR(100) | NOT NULL | Category of document |
| ile_path | VARCHAR(500) | NOT NULL | Storage URI / path |
| ile_size_kb | INT | NOT NULL, DEFAULT 0 | Size in kilobytes |
| uploaded_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Upload timestamp |

---

## 6. Table: pplication_timeline
Immutable chronological audit log capturing every event and transition.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, AUTO_INCREMENT | Event log ID |
| pplication_id | BIGINT | FK -> verification_applications(id) | Associated application |
| stage | VARCHAR(100) | NOT NULL | Lifecycle stage |
| 	itle | VARCHAR(255) | NOT NULL | Human-readable title |
| description | TEXT | NOT NULL | Detailed description and notes |
| ctor | VARCHAR(150) | NOT NULL | Actor name and role |
| 	imestamp | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Event timestamp |

---

## 7. Table: inspection_observations
Statutory verification test results, MPE tolerance, and tamper sealing data.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, AUTO_INCREMENT | Observation record ID |
| pplication_id | BIGINT | NOT NULL, UNIQUE, FK | One-to-one link to application |
| inspector_id | BIGINT | FK -> officer_profiles(id) | Inspecting officer reference |
| inspection_date| DATE | NOT NULL | Date physical inspection conducted |
| standards_used | VARCHAR(255) | NOT NULL | Working standard weights ID |
| mpe_tolerance | VARCHAR(100) | NOT NULL | Permissible statutory error margin |
| max_observed_error | VARCHAR(50) | NOT NULL | Actual observed deviation |
| seal_number | VARCHAR(100) | NOT NULL, UNIQUE, INDEX | Tamper-evident metallic seal ID |
| erdict | ENUM('PASSED', 'FAILED') | NOT NULL, DEFAULT 'PASSED' | Inspector statutory determination |
| 
emarks | TEXT | NOT NULL | Inspection field notes |
| 
aw_readings_json | JSON | NOT NULL | Structured test readings array |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

---

## 8. Table: digital_certificates
Official Form V / Schedule IX Verification Certificate registry.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, AUTO_INCREMENT | Certificate ID |
| certificate_number | VARCHAR(50) | NOT NULL, UNIQUE, INDEX | Official certificate serial (e.g. CERT-LM-2026-XXXX) |
| pplication_id | BIGINT | FK -> verification_applications(id) | Underlying application |
| pplicant_name | VARCHAR(255) | NOT NULL | Beneficiary name |
| usiness_name | VARCHAR(255) | NOT NULL | Trade name on certificate |
| gstin | VARCHAR(20) | NOT NULL | Trade GSTIN |
| premises_address| TEXT | NOT NULL | Premises where instrument is verified |
| instrument_type | VARCHAR(255) | NOT NULL | Verified instrument category |
| instrument_class| VARCHAR(100) | NOT NULL | Accuracy classification |
| manufacturer | VARCHAR(255) | NOT NULL | Make of equipment |
| model_number | VARCHAR(150) | NOT NULL | Model approved |
| serial_number | VARCHAR(150) | NOT NULL, INDEX | Serial number stamped on instrument |
| capacity | VARCHAR(100) | NOT NULL | Maximum weighing/measuring capacity |
| erification_date | DATE | NOT NULL | Date of stamping & verification |
| expiry_date | DATE | NOT NULL, INDEX | Certificate expiration date |
| issuing_authority| VARCHAR(255) | DEFAULT 'Office of Assistant Controller' | Statutory authority |
| erifying_officer | VARCHAR(255) | NOT NULL | Officer name (Ramesh varma) |
| officer_designation| VARCHAR(150) | DEFAULT 'Senior Legal Metrology Officer' | Officer designation |
| seal_number | VARCHAR(100) | NOT NULL | Metallic seal serial |
| ee_paid | VARCHAR(50) | NOT NULL | Verification fee paid |
| security_hash | VARCHAR(64) | NOT NULL | SHA-256 cryptographic verification digest |
| qr_code_payload | TEXT | NULL | Public verification URL encoded in QR |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Issuance timestamp |
