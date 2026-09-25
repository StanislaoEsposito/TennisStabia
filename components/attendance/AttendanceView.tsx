'use client';

import { useState, useTransition, useCallback } from 'react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { upsertBatchAttendance } from '@/actions/attendance';
import type { Group, Student, Attendance, AttendanceStatus } from '@/lib/types';

interface AttendanceViewProps {
  groups: Group[];
}

/** Mappa studentId → status locale (ottimistica) */
type LocalStatus = Record<string, AttendanceStatus>;

export default function AttendanceView({ groups }: AttendanceViewProps) {
  const today = new Date().toISOString().split('T')[0];

  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedDate,    setSelectedDate]    = useState<string>(today);
  const [students,        setStudents]        = useState<Student[]>([]);
  const [localStatus,     setLocalStatus]     = useState<LocalStatus>({});
  const [loading,         setLoading]         = useState(false);
  const [isPending,       startTransition]    = useTransition();

  const supabase = createClient();

  /** Carica gli allievi del gruppo e le presenze già registrate */
  const loadGroupData = useCallback(async (groupId: string, date: string) => {
    if (!groupId) return;
    setLoading(true);
    setStudents([]);
    setLocalStatus({});

    try {
      // 1. Studenti del gruppo
      const { data: sgData, error: sgError } = await supabase
        .from('student_groups')
        .select('students(*)')
        .eq('group_id', groupId);

      if (sgError) throw sgError;

      const loadedStudents: Student[] = (sgData ?? [])
        .map((row: { students: Student | Student[] | null }) => {
          if (!row.students) return null;
          return Array.isArray(row.students) ? row.students[0] : row.students;
        })
        .filter(Boolean) as Student[];

      setStudents(loadedStudents);

      // 2. Presenze già registrate per questo gruppo/data
      const { data: attData, error: attError } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('group_id', groupId)
        .eq('date', date);

      if (attError) throw attError;

      const statusMap: LocalStatus = {};
      (attData ?? []).forEach((a: Pick<Attendance, 'student_id' | 'status'>) => {
        statusMap[a.student_id] = a.status;
      });
      setLocalStatus(statusMap);
    } catch (err) {
      toast.error('Errore nel caricamento: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  function handleGroupChange(groupId: string) {
    setSelectedGroupId(groupId);
    if (groupId) loadGroupData(groupId, selectedDate);
  }

  function handleDateChange(date: string) {
    setSelectedDate(date);
    if (selectedGroupId) loadGroupData(selectedGroupId, date);
  }

  function toggleStatus(studentId: string, next: AttendanceStatus) {
    setLocalStatus((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === next ? 'absent' : next,
    }));
  }

  /** Salva tutte le presenze in un batch */
  function handleSave() {
    if (!selectedGroupId || students.length === 0) return;

    const records = students.map((s) => ({
      groupId:   selectedGroupId,
      studentId: s.id,
      date:      selectedDate,
      status:    localStatus[s.id] ?? 'absent',
    }));

    startTransition(async () => {
      try {
        await upsertBatchAttendance(records);
        toast.success('Presenze salvate! ✅');
      } catch (err) {
        toast.error('Errore nel salvataggio: ' + (err instanceof Error ? err.message : ''));
      }
    });
  }

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);
  const presentCount  = students.filter((s) => localStatus[s.id] === 'present').length;
  const lateCount     = students.filter((s) => localStatus[s.id] === 'late').length;

  return (
    <div className="space-y-5">
      {/* Controlli selezione */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
        <div>
          <label className="label">Gruppo</label>
          <select
            value={selectedGroupId}
            onChange={(e) => handleGroupChange(e.target.value)}
            className="input"
          >
            <option value="">— Seleziona un gruppo —</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
                {g.schedule_description ? ` — ${g.schedule_description}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Data</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Lista allievi */}
      {loading && (
        <div className="text-center py-10 text-gray-400">
          <div className="animate-spin text-4xl mb-2">⟳</div>
          <p>Caricamento…</p>
        </div>
      )}

      {!loading && !selectedGroupId && (
        <div className="text-center py-10 text-gray-400">
          <p className="text-3xl mb-2">🎾</p>
          <p>Seleziona un gruppo per iniziare</p>
        </div>
      )}

      {!loading && selectedGroupId && students.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <p>Nessun allievo iscritto a questo gruppo.</p>
        </div>
      )}

      {!loading && students.length > 0 && (
        <>
          {/* Header lista */}
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">
              {selectedGroup?.name} — {new Date(selectedDate + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
            <span className="text-sm text-gray-500">
              {presentCount + lateCount}/{students.length} presenti
            </span>
          </div>

          {/* Cards allievi */}
          <div className="space-y-2">
            {students.map((student) => {
              const status = localStatus[student.id] ?? 'absent';
              return (
                <div
                  key={student.id}
                  className={`
                    flex items-center justify-between rounded-xl border p-4 transition-colors
                    ${status === 'present' ? 'border-green-300 bg-green-50' : ''}
                    ${status === 'absent'  ? 'border-gray-200 bg-white'     : ''}
                    ${status === 'late'    ? 'border-yellow-300 bg-yellow-50' : ''}
                  `}
                >
                  {/* Nome */}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {student.last_name} {student.first_name}
                    </p>
                    {student.phone_number && (
                      <p className="text-xs text-gray-400">{student.phone_number}</p>
                    )}
                  </div>

                  {/* Bottoni stato */}
                  <div className="flex gap-2 flex-shrink-0 ml-3">
                    <button
                      onClick={() => toggleStatus(student.id, 'present')}
                      className={`
                        w-11 h-11 rounded-xl text-xl transition-all active:scale-90
                        ${status === 'present'
                          ? 'bg-green-600 shadow-md shadow-green-200'
                          : 'bg-gray-100 hover:bg-green-100'
                        }
                      `}
                      title="Presente"
                      aria-label={`Presenza ${student.first_name}`}
                    >
                      ✅
                    </button>
                    <button
                      onClick={() => toggleStatus(student.id, 'late')}
                      className={`
                        w-11 h-11 rounded-xl text-xl transition-all active:scale-90
                        ${status === 'late'
                          ? 'bg-yellow-400 shadow-md shadow-yellow-200'
                          : 'bg-gray-100 hover:bg-yellow-100'
                        }
                      `}
                      title="In ritardo"
                      aria-label={`Ritardo ${student.first_name}`}
                    >
                      🕐
                    </button>
                    <button
                      onClick={() => toggleStatus(student.id, 'absent')}
                      className={`
                        w-11 h-11 rounded-xl text-xl transition-all active:scale-90
                        ${status === 'absent'
                          ? 'bg-red-500 shadow-md shadow-red-200'
                          : 'bg-gray-100 hover:bg-red-100'
                        }
                      `}
                      title="Assente"
                      aria-label={`Assenza ${student.first_name}`}
                    >
                      ❌
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottone salva — sticky su mobile */}
          <div className="sticky bottom-4 pt-2">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="btn-primary w-full justify-center py-3 text-base shadow-xl shadow-green-900/20"
            >
              {isPending ? (
                <span className="animate-spin">⟳</span>
              ) : '💾'}
              {isPending ? ' Salvataggio…' : ' Salva Presenze'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
