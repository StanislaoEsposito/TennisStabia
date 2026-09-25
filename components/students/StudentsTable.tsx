'use client';

import { useState, useTransition } from 'react';
import toast from 'react-hot-toast';
import { deleteStudent } from '@/actions/students';
import CertBadge from './CertBadge';
import EditStudentModal from './EditStudentModal';
import type { Group, Student } from '@/lib/types';

// ── Tipi ──────────────────────────────────────────────────────

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

// ── SVG Icone inline ─────────────────────────────────────────

function PencilIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

// ── Componente principale ─────────────────────────────────────

export default function StudentsTable({ students, groups }: StudentsTableProps) {
  const [search, setSearch]         = useState('');
  const [isPending, startTransition] = useTransition();
  const [editStudent, setEditStudent] = useState<Student | null>(null);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.first_name.toLowerCase().includes(q) ||
      s.last_name.toLowerCase().includes(q)  ||
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
        toast.error("Errore durante l'eliminazione");
      }
    });
  }

  function openEdit(student: StudentRow) {
    setEditStudent({
      id:                  student.id,
      first_name:          student.first_name,
      last_name:           student.last_name,
      phone_number:        student.phone_number,
      medical_cert_expiry: student.medical_cert_expiry,
      created_at:          student.created_at,
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

      {/* ══════════════════════════════════════════
          MOBILE: Card View (visibile solo su mobile)
          ══════════════════════════════════════════ */}
      <div className="grid gap-3 md:hidden">
        {filtered.length === 0 && (
          <p className="py-10 text-center text-slate-400">
            {search ? 'Nessun risultato trovato.' : 'Nessun allievo iscritto.'}
          </p>
        )}
        {filtered.map((student) => (
          <div
            key={student.id}
            className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 relative"
          >
            {/* Azioni top-right */}
            <div className="absolute top-3 right-3 flex gap-1">
              <button
                onClick={() => openEdit(student)}
                disabled={isPending}
                aria-label="Modifica"
                className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-40"
              >
                <PencilIcon />
              </button>
              <button
                onClick={() => handleDelete(student.id, `${student.first_name} ${student.last_name}`)}
                disabled={isPending}
                aria-label="Elimina"
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors disabled:opacity-40"
              >
                <TrashIcon />
              </button>
            </div>

            {/* Nome + Gruppi */}
            <div className="pr-16">
              <p className="font-bold text-slate-900 text-base leading-tight">
                {student.last_name} {student.first_name}
              </p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {student.student_groups.length > 0 ? (
                  student.student_groups.map((sg) =>
                    sg.groups ? (
                      <span
                        key={sg.id}
                        className="inline-block rounded-md bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800"
                      >
                        {sg.groups.name}
                      </span>
                    ) : null
                  )
                ) : (
                  <span className="text-slate-400 text-xs">Nessun gruppo</span>
                )}
              </div>
            </div>

            {/* Dettagli: telefono + certificato */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="text-sm text-slate-500">
                {student.phone_number ? (
                  <a href={`tel:${student.phone_number}`} className="text-green-700 hover:underline">
                    📞 {student.phone_number}
                  </a>
                ) : (
                  <span className="text-slate-300">Nessun telefono</span>
                )}
              </div>
              <CertBadge expiry={student.medical_cert_expiry} />
            </div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP: Table View (nascosta su mobile)
          ══════════════════════════════════════════ */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[800px] w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-4 text-left font-semibold text-slate-600 uppercase text-xs tracking-wider">Cognome</th>
              <th className="px-4 py-4 text-left font-semibold text-slate-600 uppercase text-xs tracking-wider">Nome</th>
              <th className="px-4 py-4 text-left font-semibold text-slate-600 uppercase text-xs tracking-wider">Telefono</th>
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
              <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">{student.last_name}</td>
                <td className="px-4 py-3 text-slate-700">{student.first_name}</td>
                <td className="px-4 py-3 text-slate-600">
                  {student.phone_number ? (
                    <a href={`tel:${student.phone_number}`} className="text-green-700 hover:underline">
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
                    <button
                      onClick={() => openEdit(student)}
                      disabled={isPending}
                      className="text-xs text-blue-600 bg-transparent hover:bg-blue-50 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40 flex items-center gap-1"
                    >
                      <PencilIcon /> Modifica
                    </button>
                    <button
                      onClick={() => handleDelete(student.id, `${student.first_name} ${student.last_name}`)}
                      disabled={isPending}
                      className="text-xs text-red-600 bg-transparent hover:bg-red-50 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40 flex items-center gap-1"
                    >
                      <TrashIcon /> Elimina
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
        <p className="mt-3 text-xs text-slate-400 text-right">
          {filtered.length} di {students.length} allievi
        </p>
      )}

      {/* Modal di modifica */}
      {editStudent && (
        <EditStudentModal
          student={editStudent}
          onClose={() => setEditStudent(null)}
        />
      )}
    </>
  );
}
