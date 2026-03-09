-- 1. Profiles Table (Extends Supabase Auth)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    age INTEGER CHECK (age > 0),
    income TEXT,
    location TEXT,
    occupation TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: We assume RLS enabled, so users can only view/update their own profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile."
    ON profiles FOR SELECT
    USING ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
    ON profiles FOR UPDATE
    USING ( auth.uid() = id );

-- 2. User Activities Table (For Tracking Schemes & Business Procedures)
-- Type: 'scheme' or 'business'
-- Checklist: JSON array of objects e.g., [{"item": "GST Registration", "status": "verified"}]
CREATE TABLE user_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('scheme', 'business')),
    checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities."
    ON user_activities FOR SELECT
    USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert own activities."
    ON user_activities FOR INSERT
    WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update own activities."
    ON user_activities FOR UPDATE
    USING ( auth.uid() = user_id );

-- 3. Complaints Table (Civic Issue Reporting)
-- is_anonymous: If true, frontend hides the user_id / mapping.
CREATE TABLE complaints (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Nullable for true anonymous if desired, or just flag it
    description TEXT NOT NULL,
    dept_assigned TEXT NOT NULL,
    priority_score DECIMAL(3, 1) NOT NULL DEFAULT 5.0,
    status TEXT NOT NULL CHECK (status IN ('Pending', 'Assigned', 'In Progress', 'Resolved')) DEFAULT 'Pending',
    is_anonymous BOOLEAN DEFAULT false,
    verification_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Complaints are fundamentally public feed items (Location filtering happens at application level)
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- Everyone can view complaints (Needed for local feed)
CREATE POLICY "Complaints are viewable by everyone."
    ON complaints FOR SELECT
    USING ( true );

-- Authenticated users can insert complaints
CREATE POLICY "Authenticated users can insert complaints."
    ON complaints FOR INSERT
    WITH CHECK ( auth.role() = 'authenticated' );

-- Note: In a production app, updating verification count would likely explicitly check auth.uid() via an RPC 
-- or edge function to prevent manipulation.
CREATE POLICY "Anyone can update complaints (for verification logic)"
    ON complaints FOR UPDATE
    USING ( true );

-- Setup Realtime functionality for the React UI to consume
alter publication supabase_realtime add table complaints;
