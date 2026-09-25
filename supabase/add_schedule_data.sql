-- ============================================================
-- Migrazione: aggiunge schedule_data (JSONB) alla tabella groups
-- Eseguire nell'SQL Editor di Supabase
-- ============================================================

ALTER TABLE public.groups
  ADD COLUMN IF NOT EXISTS schedule_data JSONB;

COMMENT ON COLUMN public.groups.schedule_data IS
  'Array strutturato degli slot orari. Formato: [{ "day": "Lunedì", "time": "15:00" }, ...]';

-- Indice GIN opzionale per query veloci sul JSONB
CREATE INDEX IF NOT EXISTS idx_groups_schedule_data
  ON public.groups USING gin(schedule_data);

-- ── Aggiornamento dei gruppi seed (opzionale) ──────────────────────────────
-- Decommenta e adatta per aggiornare i gruppi esistenti:
--
-- UPDATE public.groups SET schedule_data = '[{"day":"Lunedì","time":"15:00"},{"day":"Mercoledì","time":"15:00"}]'::jsonb WHERE name = 'SINNER';
-- UPDATE public.groups SET schedule_data = '[{"day":"Lunedì","time":"16:00"},{"day":"Mercoledì","time":"16:00"}]'::jsonb WHERE name = 'DJOKOVIC';
-- UPDATE public.groups SET schedule_data = '[{"day":"Martedì","time":"15:00"},{"day":"Giovedì","time":"15:00"}]'::jsonb WHERE name = 'BERRETTINI';
-- UPDATE public.groups SET schedule_data = '[{"day":"Martedì","time":"17:00"},{"day":"Giovedì","time":"17:00"}]'::jsonb WHERE name = 'MUSETTI';
