// ──────────────────────────────────────────────────────────────────────────────
// TypeScript types che rispecchiano esattamente lo schema Supabase
// ──────────────────────────────────────────────────────────────────────────────

export type Student = {
  id: string;
  first_name: string;
  last_name: string;
  medical_cert_expiry: string | null; // ISO date string 'YYYY-MM-DD'
  phone_number: string | null;
  created_at: string;
};

export type Group = {
  id: string;
  name: string;
  schedule_description: string | null;
  created_at: string;
};

export type StudentGroup = {
  id: string;
  student_id: string;
  group_id: string;
  weekly_sessions: number;
  created_at: string;
};

export type AttendanceStatus = 'present' | 'absent' | 'late';

export type Attendance = {
  id: string;
  group_id: string;
  student_id: string;
  date: string;
  status: AttendanceStatus;
  created_at: string;
};

// ── Tipi "arricchiti" usati dalla UI ─────────────────────────────────────────

/** Studente con i suoi gruppi, usato nella tabella Dashboard */
export type StudentWithGroups = Student & {
  student_groups: (StudentGroup & { groups: Group })[];
};

/** Studente con eventuale presenza, usato nel registro presenze */
export type StudentWithAttendance = Student & {
  attendance: Attendance | null;
};

/** Stato del certificato medico */
export type CertStatus = 'ok' | 'expiring_soon' | 'expired' | 'missing';

/** Calcola lo stato del certificato medico rispetto ad oggi */
export function getCertStatus(expiry: string | null): CertStatus {
  if (!expiry) return 'missing';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiryDate = new Date(expiry);
  if (expiryDate < today) return 'expired';
  const in30Days = new Date(today);
  in30Days.setDate(today.getDate() + 30);
  if (expiryDate <= in30Days) return 'expiring_soon';
  return 'ok';
}
