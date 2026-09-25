'use client';

import { useState, useTransition } from 'react';
import toast from 'react-hot-toast';
import { deleteStudent } from '@/actions/students';
import CertBadge from './CertBadge';
import EditStudentModal from './EditStudentModal';
import type { Group, Student } from '@/lib/types';

type StudentRow = {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  medical_cert_expiry: string | null;
  created_at: string;
  student_groups: {
    id: string;
    weekly_sessions: number;
    groups: { id: string; name: string; schedule_description: string | null } | null;
  }[];
};

interface StudentsTableProps {
  students: StudentRow[];
  groups: Group[];
}

export default function StudentsTable({ students, groups }: StudentsTableProps) {
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();
  const [editStudent, setEditStudent] = useState<Student | null>(null);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.first_name.toLowerCase().includes(q) ||
      s.last_name.toLowerCase().includes(q) ||
      (s.phone_number ?? '').includes(q)
    );
  });

  function handleDelete(studentId: string, name: string) {
    if (!confirm(`Eliminare ${name}? Questa azione non è reversibile.`)) return;
    startTransition(async () => {
      try {
        await deleteStudent(studentId);
        toast.success(`${name} eliminato`);
      } catch {
        toast.error('Errore durante l\'eliminazione');
      }
    });
  }

  return (
    <>
      {/* Barra di ricerca */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Cerca per nome o telefono…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input max-w-sm"
        />
      </div>

      {/* Tabella desktop */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[800px] w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-4 text-left font-semibold text-slate-600 uppercase text-xs tracking-wider">Cognome</th>
              <th className="px-4 py-4 text-left font-semibold text-slate-600 uppercase text-xs tracking-wider">Nome</th>
              <th className="px-4 py-4 text-left font-semibold text-slate-600 uppercase text-xs tracking-wider hidden md:table-cell">Telefono</th>
              <th className="px-4 py-4 text-left font-semibold text-slate-600 uppercase text-xs tracking-wider">Gruppi</th>
              <th className="px-4 py-4 text-left font-semibold text-slate-600 uppercase text-xs tracking-wider">Cert. Medico</th>
              <th className="px-4 py-4 text-center font-semibold text-slate-600 uppercase text-xs tracking-wider">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  {search ? 'Nessun risultato trovato.' : 'Nessun allievo iscritto.'}
                </td>
              </tr>
            )}
            {filtered.map((student) => (
              <tr
                key={student.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-slate-900">{student.last_name}</td>
                <td className="px-4 py-3 text-slate-700">{student.first_name}</td>
                <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                  {student.phone_number ? (
                    <a
                      href={`tel:${student.phone_number}`}
                      className="text-green-700 hover:underline"
                    >
                      {student.phone_number}
                    </a>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {student.student_groups.length > 0 ? (
                      student.student_groups.map((sg) =>
                        sg.groups ? (
                          <span
                            key={sg.id}
                            title={`${sg.weekly_sessions} ses/sett. — ${sg.groups.schedule_description ?? ''}`}
                            className="inline-block rounded-md bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800"
                          >
                            {sg.groups.name}
                          </span>
                        ) : null
                      )
                    ) : (
                      <span className="text-slate-400 text-xs">Nessuno</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <CertBadge expiry={student.medical_cert_expiry} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    {/* ── Modifica ── */}
                    <button
                      onClick={() =>
                        setEditStudent({
                          id:                   student.id,
                          first_name:           student.first_name,
                          last_name:            student.last_name,
                          phone_number:         student.phone_number,
                          medical_cert_expiry:  student.medical_cert_expiry,
                          created_at:           student.created_at,
                        })
                      }
                      disabled={isPending}
                      className="text-xs text-blue-600 bg-transparent hover:bg-blue-50 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40"
                    >
                      ✏️ Modifica
                    </button>

                    {/* ── Elimina ── */}
                    <button
                      onClick={() =>
                        handleDelete(
                          student.id,
                          `${student.first_name} ${student.last_name}`
                        )
                      }
                      disabled={isPending}
                      className="text-xs text-red-600 bg-transparent hover:bg-red-50 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40"
                    >
                      🗑️ Elimina
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      {filtered.length > 0 && (
        <p className="mt-3 text-xs text-gray-400 text-right">
          {filtered.length} di {students.length} allievi
        </p>
      )}

      {/* Modal di modifica — montato solo quando un allievo è selezionato */}
      {editStudent && (
        <EditStudentModal
          student={editStudent}
          onClose={() => setEditStudent(null)}
        />
      )}
    </>
  );
}

