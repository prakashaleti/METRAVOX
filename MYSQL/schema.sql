-- =============================================================================
-- METRAVOX: Online Verification System for Weighing and Measuring Instruments
-- Relational Database Schema (MySQL 8.0+ / MariaDB 10.5+)
-- Ministry of Consumer Affairs, Food & Public Distribution, Govt. of India
-- =============================================================================

CREATE DATABASE IF NOT EXISTS metravox_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE metravox_db;

-- -----------------------------------------------------------------------------
-- 1. Table: users
-- Purpose: Central authentication & role access control with JWT support
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(150) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(150) DEFAULT '',
    last_name VARCHAR(150) DEFAULT '',
    role ENUM('CONSUMER', 'OFFICER', 'ADMIN') NOT NULL DEFAULT 'CONSUMER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    last_login DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Table: applicant_profiles
-- Purpose: Statutory establishment & trade profile for Applicants / Traders
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS applicant_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NULL,
    full_name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    gstin VARCHAR(20) NOT NULL,
    email VARCHAR(254) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL DEFAULT 'Kerala',
    pincode VARCHAR(10) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_applicant_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_applicant_gstin (gstin),
    INDEX idx_applicant_district (district)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. Table: officer_profiles
-- Purpose: Legal Metrology Officer directory, badge registry, & jurisdiction
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS officer_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NULL,
    officer_name VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL DEFAULT 'Senior Legal Metrology Officer',
    badge_number VARCHAR(50) NOT NULL UNIQUE,
    jurisdiction_zone VARCHAR(150) NOT NULL,
    district VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(254) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_officer_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_officer_badge (badge_number),
    INDEX idx_officer_zone (jurisdiction_zone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. Table: verification_applications
-- Purpose: Central statutory verification dossier for weighing/measuring equipment
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS verification_applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id VARCHAR(30) NOT NULL UNIQUE,
    applicant_id BIGINT NULL,
    applicant_name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    gstin VARCHAR(20) NOT NULL,
    email VARCHAR(254) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    premises_address TEXT NOT NULL,
    district VARCHAR(100) NOT NULL,

    -- Instrument Specifications
    instrument_category VARCHAR(150) NOT NULL,
    instrument_type VARCHAR(255) NOT NULL,
    accuracy_class VARCHAR(100) NOT NULL,
    capacity VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    model_number VARCHAR(150) NOT NULL,
    serial_number VARCHAR(150) NOT NULL,
    year_of_manufacture INT NOT NULL DEFAULT 2025,
    verification_nature VARCHAR(100) NOT NULL DEFAULT 'Re-verification / Periodic Renewal',
    inspection_venue VARCHAR(255) NOT NULL DEFAULT 'Trader Premises (On-site)',

    -- Workflow Status
    status ENUM(
        'Application Submitted',
        'Under Review',
        'Returned for Correction',
        'Verification Scheduled',
        'Inspection in Progress',
        'Approved',
        'Rejected',
        'Certificate Generated'
    ) NOT NULL DEFAULT 'Application Submitted',

    -- Scrutiny & Return Details
    return_reason TEXT NULL,
    returned_at DATETIME NULL,
    applicant_correction_notes TEXT NULL,

    -- Inspection Scheduling
    assigned_officer_id BIGINT NULL,
    scheduled_date DATE NULL,
    scheduled_slot VARCHAR(100) NULL,
    special_instructions TEXT NULL,

    -- Statutory Fees
    statutory_fee DECIMAL(10, 2) NOT NULL DEFAULT 850.00,
    fee_status VARCHAR(50) NOT NULL DEFAULT 'PAID_ONLINE',

    -- Decision Rejection
    rejection_reason TEXT NULL,

    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_app_applicant FOREIGN KEY (applicant_id) 
        REFERENCES applicant_profiles(id) ON DELETE SET NULL,
    CONSTRAINT fk_app_officer FOREIGN KEY (assigned_officer_id) 
        REFERENCES officer_profiles(id) ON DELETE SET NULL,
    INDEX idx_app_id (application_id),
    INDEX idx_app_status (status),
    INDEX idx_app_serial (serial_number),
    INDEX idx_app_applicant_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. Table: application_documents
-- Purpose: Statutory attachments (Model Approval Certificate, Invoice, etc.)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS application_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL DEFAULT 'Model Approval / Invoice',
    file_path VARCHAR(500) NOT NULL,
    file_size_kb INT NOT NULL DEFAULT 0,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_doc_application FOREIGN KEY (application_id) 
        REFERENCES verification_applications(id) ON DELETE CASCADE,
    INDEX idx_doc_app (application_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. Table: application_timeline
-- Purpose: Complete chronological audit trail of all actions and state changes
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS application_timeline (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    stage VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    actor VARCHAR(150) NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_timeline_application FOREIGN KEY (application_id) 
        REFERENCES verification_applications(id) ON DELETE CASCADE,
    INDEX idx_timeline_app (application_id),
    INDEX idx_timeline_time (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. Table: inspection_observations
-- Purpose: Official verification field test measurements, MPE tolerance, & tamper seals
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inspection_observations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL UNIQUE,
    inspector_id BIGINT NULL,
    inspection_date DATE NOT NULL,
    standards_used VARCHAR(255) NOT NULL,
    mpe_tolerance VARCHAR(100) NOT NULL,
    max_observed_error VARCHAR(50) NOT NULL,
    seal_number VARCHAR(100) NOT NULL UNIQUE,
    verdict ENUM('PASSED', 'FAILED') NOT NULL DEFAULT 'PASSED',
    remarks TEXT NOT NULL,
    raw_readings_json JSON NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_insp_application FOREIGN KEY (application_id) 
        REFERENCES verification_applications(id) ON DELETE CASCADE,
    CONSTRAINT fk_insp_officer FOREIGN KEY (inspector_id) 
        REFERENCES officer_profiles(id) ON DELETE SET NULL,
    INDEX idx_insp_seal (seal_number),
    INDEX idx_insp_verdict (verdict)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. Table: digital_certificates
-- Purpose: Form V / Schedule IX Statutory Certificates with security hashes & QR data
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_certificates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    certificate_number VARCHAR(50) NOT NULL UNIQUE,
    application_id BIGINT NULL,
    applicant_name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    gstin VARCHAR(20) NOT NULL,
    premises_address TEXT NOT NULL,

    instrument_type VARCHAR(255) NOT NULL,
    instrument_class VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    model_number VARCHAR(150) NOT NULL,
    serial_number VARCHAR(150) NOT NULL,
    capacity VARCHAR(100) NOT NULL,

    verification_date DATE NOT NULL,
    expiry_date DATE NOT NULL,

    issuing_authority VARCHAR(255) NOT NULL DEFAULT 'Office of the Assistant Controller of Legal Metrology',
    verifying_officer VARCHAR(255) NOT NULL,
    officer_designation VARCHAR(150) NOT NULL DEFAULT 'Senior Legal Metrology Officer',
    seal_number VARCHAR(100) NOT NULL,
    fee_paid VARCHAR(50) NOT NULL,
    security_hash VARCHAR(64) NOT NULL,
    qr_code_payload TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cert_application FOREIGN KEY (application_id) 
        REFERENCES verification_applications(id) ON DELETE SET NULL,
    INDEX idx_cert_number (certificate_number),
    INDEX idx_cert_serial (serial_number),
    INDEX idx_cert_expiry (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
