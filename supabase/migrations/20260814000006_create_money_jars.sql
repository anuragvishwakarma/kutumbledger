-- 20260814000006_create_money_jars.sql
CREATE TABLE money_jars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    jar_type TEXT NOT NULL CHECK (jar_type IN ('save', 'spend', 'give', 'invest')),
    target_percentage INTEGER NOT NULL DEFAULT 0, -- 0-100
    current_amount BIGINT DEFAULT 0,
    goal_name TEXT,
    goal_target_amount BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(family_id, member_id, jar_type)
);

ALTER TABLE money_jars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access jars in family" ON money_jars
    FOR SELECT USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Parents can manage kids jars" ON money_jars
    FOR ALL USING (
        member_id IN (
            SELECT id FROM family_members 
            WHERE family_id IN (
                SELECT family_id FROM family_members 
                WHERE user_id = auth.uid() AND role IN ('admin', 'adult')
            )
        )
    );
