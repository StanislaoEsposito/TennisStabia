'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';


// ── Tipi ────────────────────────────────────────────────────

export type PaymentStatus = 'paid' | 'pending';

export type Payment = {
  id: string;
  student_id: string;
  month_year: string;
  amount: number;
  status: PaymentStatus;
  payment_date: string | null;
  created_at: string;
};

/** Riga "arricchita" usata dalla tabella pagamenti */
export type PaymentRow = {
  student_id: string;
  first_name: string;
  last_name: string;
  groups: { name: string; weekly_sessions: number }[];
  payment: Payment | null;
};

// ── Server Actions ───────────────────────────────────────────


/**
 * Recupera tutti gli studenti con i rispettivi gruppi e il loro stato
 * di pagamento per il mese/anno specificato.
 */
export async function getPaymentsForMonth(monthYear: string): Promise<PaymentRow[]> {
  const supabase = createClient();

  // 1. Tutti gli studenti con gruppi
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select(`
      id,
      first_name,
      last_name,
      student_groups (
        weekly_sessions,
        groups ( name )
      )
    `)
    .order('last_name', { ascending: true });

  if (studentsError) throw new Error(studentsError.message);
  if (!students) return [];

  // 2. Pagamenti già esistenti per questo mese
  const studentIds = students.map((s) => s.id);

  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('*')
    .eq('month_year', monthYear)
    .in('student_id', studentIds);

  if (paymentsError) throw new Error(paymentsError.message);

  // 3. Combina
  const paymentsMap = new Map<string, Payment>(
    (payments ?? []).map((p) => [p.student_id, p as Payment])
  );

  return students.map((s) => ({
    student_id: s.id,
    first_name: s.first_name,
    last_name:  s.last_name,
    groups: (s.student_groups ?? []).map((sg: any) => {
      const groupData = Array.isArray(sg.groups) ? sg.groups[0] : sg.groups;
      return {
        name:            groupData?.name ?? '?',
        weekly_sessions: sg.weekly_sessions,
      };
    }),
    payment: paymentsMap.get(s.id) ?? null,
  }));
}

/**
 * Inserisce o aggiorna il pagamento di uno studente per un mese.
 * Se status = 'paid', imposta payment_date = oggi.
 * Se status = 'pending', azzera payment_date.
 */
export async function upsertPayment(
  studentId: string,
  monthYear: string,
  status: PaymentStatus,
  amount: number = 0
) {
  const supabase = createClient();

  const paymentDate = status === 'paid'
    ? new Date().toISOString().split('T')[0]
    : null;

  const { error } = await supabase
    .from('payments')
    .upsert(
      {
        student_id:   studentId,
        month_year:   monthYear,
        status,
        amount,
        payment_date: paymentDate,
      },
      { onConflict: 'student_id,month_year' }
    );

  if (error) throw new Error(error.message);

  revalidatePath('/pagamenti');
}
