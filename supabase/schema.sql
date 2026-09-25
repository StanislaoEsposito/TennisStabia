-- ============================================================
-- ASD Tennis Club Terme di Stabia — Supabase Schema SQL
-- Esegui questo script nell'Editor SQL di Supabase
-- ============================================================

-- ──────────────────────────────────────────────
-- 1. TABELLA: students (anagrafica allievi)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.students (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name          TEXT        NOT NULL,
  last_name           TEXT        NOT NULL,
  medical_cert_expiry DATE,
  phone_number        TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.students IS 'Anagrafica degli allievi del club.';
COMMENT ON COLUMN public.students.medical_cert_expiry IS 'Data di scadenza del certificato medico agonistico/non-agonistico.';

-- ──────────────────────────────────────────────
-- 2. TABELLA: groups (gruppi di allenamento)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.groups (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT        NOT NULL UNIQUE,        -- es. 'SINNER', 'DJOKOVIC'
  schedule_description TEXT,                              -- es. 'H 15 Lun-Merc'
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.groups IS 'Gruppi di allenamento, nominati da tennisti famosi.';
COMMENT ON COLUMN public.groups.schedule_description IS 'Descrizione testuale dell''orario (es. H 15 Lun-Merc).';

-- ──────────────────────────────────────────────
-- 3. TABELLA: student_groups (pivot iscrizioni)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_groups (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID    NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  group_id         UUID    NOT NULL REFERENCES public.groups(id)   ON DELETE CASCADE,
  weekly_sessions  INT     NOT NULL DEFAULT 2 CHECK (weekly_sessions > 0),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, group_id)  -- uno studente non può essere iscritto due volte allo stesso gruppo
);

COMMENT ON TABLE  public.student_groups IS 'Tabella pivot: iscrizione di uno studente a un gruppo.';
COMMENT ON COLUMN public.student_groups.weekly_sessions IS 'Numero di allenamenti settimanali concordati.';

-- ──────────────────────────────────────────────
-- 4. TABELLA: attendance (registro presenze)
-- ──────────────────────────────────────────────
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late');

CREATE TABLE IF NOT EXISTS public.attendance (
  id          UUID                     PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID                     NOT NULL REFERENCES public.groups(id)   ON DELETE CASCADE,
  student_id  UUID                     NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date        DATE                     NOT NULL DEFAULT CURRENT_DATE,
  status      public.attendance_status NOT NULL DEFAULT 'absent',
  created_at  TIMESTAMPTZ              NOT NULL DEFAULT now(),
  UNIQUE(group_id, student_id, date)  -- una sola riga per allievo/gruppo/giorno
);

COMMENT ON TABLE public.attendance IS 'Registro presenze giornaliero per gruppo.';

-- ──────────────────────────────────────────────
-- 5. INDICI
-- ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_student_groups_student ON public.student_groups(student_id);
CREATE INDEX IF NOT EXISTS idx_student_groups_group   ON public.student_groups(group_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date        ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_group_date  ON public.attendance(group_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_student     ON public.attendance(student_id);

-- ──────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY (RLS)
--    Politica base: lettura e scrittura solo per utenti autenticati.
--    Personalizza i ruoli quando aggiungerai autenticazione avanzata.
-- ──────────────────────────────────────────────
ALTER TABLE public.students      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance    ENABLE ROW LEVEL SECURITY;

-- students
CREATE POLICY "Authenticated users can read students"
  ON public.students FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert students"
  ON public.students FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update students"
  ON public.students FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete students"
  ON public.students FOR DELETE
  TO authenticated USING (true);

-- groups
CREATE POLICY "Authenticated users can read groups"
  ON public.groups FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert groups"
  ON public.groups FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update groups"
  ON public.groups FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete groups"
  ON public.groups FOR DELETE
  TO authenticated USING (true);

-- student_groups
CREATE POLICY "Authenticated users can read student_groups"
  ON public.student_groups FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert student_groups"
  ON public.student_groups FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update student_groups"
  ON public.student_groups FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete student_groups"
  ON public.student_groups FOR DELETE
  TO authenticated USING (true);

-- attendance
CREATE POLICY "Authenticated users can read attendance"
  ON public.attendance FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert attendance"
  ON public.attendance FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update attendance"
  ON public.attendance FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete attendance"
  ON public.attendance FOR DELETE
  TO authenticated USING (true);

-- ──────────────────────────────────────────────
-- 7. SEED DATA — dati di esempio
-- ──────────────────────────────────────────────

-- Gruppi
INSERT INTO public.groups (name, schedule_description) VALUES
  ('SINNER',    'H 15:00 Lun-Merc'),
  ('DJOKOVIC',  'H 17:00 Mar-Gio'),
  ('BERRETTINI','H 09:00 Sab'),
  ('MUSETTI',   'H 11:00 Dom')
ON CONFLICT (name) DO NOTHING;

-- Studenti
INSERT INTO public.students (first_name, last_name, medical_cert_expiry, phone_number) VALUES
  ('Marco',      'Esposito',  '2025-12-31', '3331234567'),
  ('Sara',       'De Luca',   '2026-03-15', '3349876543'),
  ('Luca',       'Ferrara',   '2024-11-01', '3357654321'),  -- SCADUTO
  ('Giulia',     'Romano',    '2026-10-05', '3361122334'),  -- Scade entro 30 giorni
  ('Antonio',    'Conte',     '2027-01-20', '3385566778'),
  ('Federica',   'Martino',   NULL,          '3390011223')
ON CONFLICT DO NOTHING;
