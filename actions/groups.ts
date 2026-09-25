'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Group, ScheduleSlot } from '@/lib/types';

// ── Query ────────────────────────────────────────────────────

/** Tutti i gruppi, ordinati per nome. */
export async function getGroups(): Promise<Group[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Group[];
}

// ── Helpers ──────────────────────────────────────────────────

/**
 * Genera una schedule_description leggibile dall'array strutturato.
 * es. [{ day: 'Lunedì', time: '15:00' }, { day: 'Mercoledì', time: '15:00' }]
 *  →  'Lun 15:00 · Mer 15:00'
 */
const DAY_ABBR: Record<string, string> = {
  'Lunedì':    'Lun',
  'Martedì':   'Mar',
  'Mercoledì': 'Mer',
  'Giovedì':   'Gio',
  'Venerdì':   'Ven',
  'Sabato':    'Sab',
  'Domenica':  'Dom',
};

function slotsToDescription(slots: ScheduleSlot[]): string {
  return slots
    .map((s) => `${DAY_ABBR[s.day] ?? s.day} ${s.time}`)
    .join(' · ');
}

// ── Mutazioni ────────────────────────────────────────────────

export async function createGroup(payload: {
  name: string;
  schedule_data: ScheduleSlot[];
}) {
  const supabase = createClient();

  const description = payload.schedule_data.length > 0
    ? slotsToDescription(payload.schedule_data)
    : null;

  const { error } = await supabase.from('groups').insert({
    name:                 payload.name.trim().toUpperCase(),
    schedule_data:        payload.schedule_data,
    schedule_description: description, // manteniamo il campo legacy sincronizzato
  });

  if (error) throw new Error(error.message);

  revalidatePath('/gruppi');
  revalidatePath('/calendario');
  revalidatePath('/dashboard');
}

export async function deleteGroup(id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/gruppi');
  revalidatePath('/calendario');
  revalidatePath('/dashboard');
}
