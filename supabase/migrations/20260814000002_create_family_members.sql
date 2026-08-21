-- 20260814000002_create_family_members.sql
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'adult', 'dependent', 'child')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    phone_number TEXT, -- For OTP invites
    display_name TEXT,
    avatar_url TEXT,
    UNIQUE(family_id, user_id)
);

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view family members" ON family_members
    FOR SELECT USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage members" ON family_members
    FOR ALL USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );
