-- =============================================================================
-- METRAVOX: Seed Authentication Users & Profiles
-- Designated Personas:
-- 1. User (Consumer / Applicant): prakash
-- 2. Legal Metrology Officer: Ramesh varma
-- 3. Administrator: Rohith
-- =============================================================================

USE metravox_db;

-- Clear previous test entries
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE users;
TRUNCATE TABLE applicant_profiles;
TRUNCATE TABLE officer_profiles;
TRUNCATE TABLE verification_applications;
TRUNCATE TABLE application_documents;
TRUNCATE TABLE application_timeline;
TRUNCATE TABLE inspection_observations;
TRUNCATE TABLE digital_certificates;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Consumer / Applicant: prakash
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, is_active, is_staff)
VALUES (
    1,
    'prakash',
    'prakash01.aleti@gmail.com',
    'pbkdf2_sha256...', -- Applicant@2026
    'prakash',
    '',
    'CONSUMER',
    TRUE,
    FALSE
);

INSERT INTO applicant_profiles (id, user_id, full_name, business_name, gstin, email, phone, address, district, state, pincode)
VALUES (
    1,
    1,
    'prakash',
    'Prakash Agro & Industrial Measuring Solutions',
    '32AABCP9871F1Z2',
    'prakash01.aleti@gmail.com',
    '+91 98470 12345',
    'Plot 14-B, Industrial Development Area, Kalamassery',
    'Ernakulam',
    'Kerala',
    '683109'
);

-- 2. Insert Legal Metrology Officer: Ramesh varma
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, is_active, is_staff)
VALUES (
    2,
    'officer_ramesh',
    'ramesh.varma.lmo@gov.in',
    'pbkdf2_sha256...', -- Officer@2026
    'Ramesh',
    'varma',
    'OFFICER',
    TRUE,
    FALSE
);

INSERT INTO officer_profiles (id, user_id, officer_name, designation, badge_number, jurisdiction_zone, district, phone, email, is_active)
VALUES (
    1,
    2,
    'Ramesh varma',
    'Senior Legal Metrology Officer',
    'LMO-KL-2026-RV',
    'Ernakulam Central Zone 04',
    'Ernakulam',
    '+91 94470 55102',
    'ramesh.varma.lmo@gov.in',
    TRUE
);

-- 3. Insert Administrator: Rohith
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, is_active, is_staff)
VALUES (
    3,
    'admin_rohith',
    'rohith.admin@gov.in',
    'pbkdf2_sha256...', -- Admin@2026
    'Rohith',
    '',
    'ADMIN',
    TRUE,
    TRUE
);
