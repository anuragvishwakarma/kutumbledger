-- 20260814000007_create_domestic_helpers.sql
CREATE TABLE domestic_helpers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('maid', 'cook', 'driver', 'nanny', 'gardener', 'other')),
    base_salary BIGINT NOT NULL,
    festival_bonus_pct INTEGER DEFAULT 50,
    advances BIGINT DEFAULT 0,
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'upi', 'bank')),
    upi_id TEXT,
    bank_account TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE helper_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    helper_id UUID REFERENCES domestic_helpers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'half_day')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(helper_id, date)
);

ALTER TABLE domestic_helpers ENABLE ROW LEVEL SECURITY;

ALTER TABLE helper_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage helpers" ON domestic_helpers
    FOR ALL USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins manage attendance" ON helper_attendance
    FOR ALL USING (
        helper_id IN (
            SELECT id FROM domestic_helpers
            WHERE family_id IN (
                SELECT family_id FROM family_members
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        )
    );
