-- 20260814000001_create_families.sql
CREATE TABLE families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE families ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their family
CREATE POLICY "Users can access own family" ON families
    FOR ALL USING (
        id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid()
        )
    );
