'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Group } from '@/lib/types';

// ── Query ────────────────────────────────────────────────────

/** Tutti i gruppi, ordinati per nome. */
export async function getGroups(): Promise<Group[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Mutazioni ────────────────────────────────────────────────

export async function createGroup(payload: {
  name: string;
  schedule_description: string;
}) {
  const supabase = createClient();

  const { error } = await supabase.from('groups').insert({
    name:                 payload.name.trim().toUpperCase(),
    schedule_description: payload.schedule_description.trim() || null,
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
