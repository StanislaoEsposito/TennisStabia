'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * Recupera tutti gli studenti con i loro gruppi (per la Dashboard).
 */
export async function getStudentsWithGroups() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      student_groups (
        id,
        weekly_sessions,
        groups ( id, name, schedule_description )
      )
    `)
    .order('last_name', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Recupera tutti i gruppi disponibili.
 */
export async function getGroups() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Recupera gli studenti iscritti a un gruppo specifico.
 */
export async function getStudentsByGroup(groupId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('student_groups')
    .select(`
      students ( * )
    `)
    .eq('group_id', groupId);

  if (error) throw new Error(error.message);

  // Estrai gli studenti dalla join
  return data.map((row) => row.students).filter(Boolean);
}

/**
 * Crea un nuovo studente e opzionalmente lo assegna a un gruppo.
 */
export async function createStudent(formData: {
  firstName: string;
  lastName: string;
  phone: string;
  medicalCertExpiry: string;
  groupId?: string;
  weeklySessions?: number;
}) {
  const supabase = createClient();

  // 1. Inserisci lo studente
  const { data: student, error: studentError } = await supabase
    .from('students')
    .insert({
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone_number: formData.phone || null,
      medical_cert_expiry: formData.medicalCertExpiry || null,
    })
    .select()
    .single();

  if (studentError) throw new Error(studentError.message);

  // 2. Se specificato, assegna al gruppo
  if (formData.groupId && student) {
    const { error: groupError } = await supabase.from('student_groups').insert({
      student_id: student.id,
      group_id: formData.groupId,
      weekly_sessions: formData.weeklySessions ?? 2,
    });

    if (groupError) throw new Error(groupError.message);
  }

  revalidatePath('/dashboard');
  return student;
}

/**
 * Elimina uno studente (a cascata elimina anche student_groups e attendance).
 */
export async function deleteStudent(studentId: string) {
  const supabase = createClient();

  const { error } = await supabase.from('students').delete().eq('id', studentId);

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard');
}

/**
 * Aggiorna i dati anagrafici di uno studente esistente.
 * Accetta un oggetto plain (non FormData) per compatibilità con useTransition nei Client Components.
 */
export async function updateStudent(
  id: string,
  payload: {
    firstName: string;
    lastName: string;
    phone: string;
    medicalCertExpiry: string;
  }
) {
  const supabase = createClient();

  const { error } = await supabase
    .from('students')
    .update({
      first_name:          payload.firstName.trim(),
      last_name:           payload.lastName.trim(),
      phone_number:        payload.phone.trim()             || null,
      medical_cert_expiry: payload.medicalCertExpiry.trim() || null,
    })
    .eq('id', id);

  if (error) throw new Error(error.message);

  // Invalida sia la dashboard che il root (copertura totale dei path con presenze)
  revalidatePath('/');
  revalidatePath('/dashboard');
}
