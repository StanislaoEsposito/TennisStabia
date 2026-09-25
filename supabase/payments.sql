-- ============================================================
-- Tabella: payments — Quote mensili degli allievi
-- Aggiungere allo script già eseguito in Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payments (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID        NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  month_year   VARCHAR(7)  NOT NULL,  -- formato: 'MM-YYYY' es. '10-2026'
  amount       DECIMAL(8,2) NOT NULL DEFAULT 0,
  status       TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('paid', 'pending')),
  payment_date DATE,                  -- valorizzato solo se status = 'paid'
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (student_id, month_year)     -- un solo record per allievo per mese
);

COMMENT ON TABLE  public.payments IS 'Quote mensili degli allievi del club.';
COMMENT ON COLUMN public.payments.month_year   IS 'Mensilità nel formato MM-YYYY (es. 10-2026).';
COMMENT ON COLUMN public.payments.payment_date IS 'Data effettiva del pagamento; NULL se pending.';

-- Indici
CREATE INDEX IF NOT EXISTS idx_payments_student    ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_month_year ON public.payments(month_year);

-- ── Row Level Security ──────────────────────────────────────
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read payments"
  ON public.payments FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert payments"
  ON public.payments FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update payments"
  ON public.payments FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete payments"
  ON public.payments FOR DELETE
  TO authenticated USING (true);
