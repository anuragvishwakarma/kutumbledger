-- 20260814000003_create_transactions.sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL, -- Stored in paise (₹1 = 100 paise)
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    category TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('upi', 'cash', 'card', 'bank', 'other')),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule TEXT, -- RRULE format
    local_timestamp BIGINT NOT NULL, -- Client timestamp for conflict resolution
    synced_at TIMESTAMPTZ,
    is_cash BOOLEAN DEFAULT FALSE,
    is_private BOOLEAN DEFAULT FALSE, -- Only visible to admins
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_family_date ON transactions(family_id, date DESC);
CREATE INDEX idx_transactions_member ON transactions(member_id);
CREATE INDEX idx_transactions_synced ON transactions(synced_at) WHERE synced_at IS NULL;

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access family transactions" ON transactions
    FOR ALL USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid()
        )
    );
