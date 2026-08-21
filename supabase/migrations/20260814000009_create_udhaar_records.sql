-- 20260814000009_create_udhaar_records.sql
CREATE TABLE udhaar_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    lender_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    borrower_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL,
    purpose TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'lent' CHECK (status IN ('lent', 'received', 'partial', 'written_off')),
    whatsapp_sent_at TIMESTAMPTZ,
    settled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE udhaar_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family can access udhaar" ON udhaar_records
    FOR ALL USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid()
        )
    );
