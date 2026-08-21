-- 20260814000008_create_festival_plans.sql
CREATE TABLE festival_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    festival_name TEXT NOT NULL,
    year INTEGER NOT NULL,
    total_budget BIGINT DEFAULT 0,
    categories_json JSONB NOT NULL DEFAULT '{}',
    start_saving_month INTEGER,
    actual_spending JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(family_id, festival_name, year)
);

ALTER TABLE festival_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family can access festival plans" ON festival_plans
    FOR ALL USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid()
        )
    );
