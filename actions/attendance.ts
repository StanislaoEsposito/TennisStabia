'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { AttendanceStatus } from '@/lib/types';

/**
 * Salva (o aggiorna se esiste già) un record di presenza.
 * Usa UPSERT su (group_id, student_id, date).
 */
export async function upsertAttendance(
  groupId: string,
  studentId: string,
  date: string,
  status: AttendanceStatus
) {
  const supabase = createClient();

  const { error } = await supabase
    .from('attendance')
    .upsert(
      { group_id: groupId, student_id: studentId, date, status },
      { onConflict: 'group_id,student_id,date' }
    );

  if (error) throw new Error(error.message);

  revalidatePath('/attendance');
}

/**
 * Salva le presenze per tutti gli allievi di un gruppo in un'unica operazione batch.
 */
export async function upsertBatchAttendance(
  records: { groupId: string; studentId: string; date: string; status: AttendanceStatus }[]
) {
  const supabase = createClient();

  const rows = records.map((r) => ({
    group_id: r.groupId,
    student_id: r.studentId,
    date: r.date,
    status: r.status,
  }));

  const { error } = await supabase
    .from('attendance')
    .upsert(rows, { onConflict: 'group_id,student_id,date' });

  if (error) throw new Error(error.message);

  revalidatePath('/attendance');
}

/**
 * Recupera le presenze per un gruppo e una data specifici.
 */
export async function getAttendanceForGroupAndDate(groupId: string, date: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('group_id', groupId)
    .eq('date', date);

  if (error) throw new Error(error.message);
  return data;
}
