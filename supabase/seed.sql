-- Mock Data Seeding for Astra Gov AI (Phase 2 Local Demo)

-- Since we are bypassing Supabase Auth creation for the raw SQL seed (Auth uses GoTrue), 
-- we will insert raw UUIDs directly into the tables. 
-- IN A REAL ENVIRONMENT, you must insert into auth.users first.
-- For local dev/demo without actual Auth integration yet, we temporarily alter the tables 
-- or drop the FOREIGN KEY constraint to auth.users if we are just mocking the UI.

-- TEMPORARY: Drop the FK to auth.users just for the seed to work if auth isn't setup locally.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 1. Insert Dummy Profiles
-- The first user ID is the "Citizen User", the second is the "Admin Nodal Officer"
INSERT INTO profiles (id, full_name, age, income, location, occupation) VALUES
('11111111-1111-1111-1111-111111111111', 'Aryan Sharma', 28, '₹ 3,50,000', 'Chennai South', 'Retail Business Owner'),
('99999999-9999-9999-9999-999999999999', 'Government Nodal Officer', 45, 'N/A', 'Chennai Zone East', 'Administrator');

-- 2. Insert User Activities (Schemes & Business Setup)
INSERT INTO user_activities (id, user_id, title, type, checklist, progress) VALUES
(
    'a1b2c3d4-0000-0000-0000-111111111111', 
    '11111111-1111-1111-1111-111111111111', 
    'Prime Minister Employment Generation Programme (PMEGP)', 
    'scheme',
    '[
        {"name": "Aadhar & PAN Verification", "completed": true}, 
        {"name": "Project Report Submission", "completed": true}, 
        {"name": "Bank Loan Approval", "completed": false}, 
        {"name": "Margin Money Claim", "completed": false}
    ]'::jsonb, 
    50
),
(
    'e5f6e7f8-0000-0000-0000-111111111111', 
    '11111111-1111-1111-1111-111111111111', 
    'FSSAI Retail Cafe License', 
    'business',
    '[
        {"name": "Premises Proof Uploaded", "completed": true}, 
        {"name": "Water Testing Report", "completed": true}, 
        {"name": "NOC from Municipality", "completed": true}, 
        {"name": "Final Inspection", "completed": true}
    ]'::jsonb, 
    100
);

-- 3. Insert Complaints (Public Local Feed & Admin Triage)
INSERT INTO complaints (id, user_id, description, dept_assigned, priority_score, status, is_anonymous, verification_count, created_at) VALUES
(
    'c1111111-0000-0000-0000-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Dangerous open pothole on Main Street near School Zone. Very high risk for two-wheelers during rains.',
    'PWD Sector',
    9.2,
    'In Progress',
    false,
    24,
    timezone('utc', now() - interval '2 days')
),
(
    'c2222222-0000-0000-0000-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Streetlights not working in 4th Avenue, Ward 12. Area is completely dark and unsafe at night.',
    'Electricity Board',
    7.5,
    'Pending',
    true,
    8,
    timezone('utc', now() - interval '1 day')
),
(
    'c3333333-0000-0000-0000-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Illegal garbage dumping near the municipal park drain, causing severe blockages.',
    'Sanitation Dept',
    6.0,
    'Resolved',
    false,
    142,
    timezone('utc', now() - interval '5 days')
);

-- Fix the syntax on the first complaint date insert as well just to be safe
UPDATE complaints SET created_at = timezone('utc', now() - interval '2 days') WHERE priority_score = 9.2;
