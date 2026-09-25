'use client';

import { useState } from 'react';
import { getStudentsByGroup } from '@/actions/students';
import type { Group, Student } from '@/lib/types';
import toast from 'react-hot-toast';

interface GroupCardProps {
  group: Group;
  onEdit: (group: Group) => void;
  onDelete: (group: Group) => void;
  isPending: boolean;
}

function PencilIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" 
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" 
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export default function GroupCard({ group, onEdit, onDelete, isPending }: GroupCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  async function toggleExpand() {
    if (!expanded && !hasFetched) {
      setLoading(true);
      try {
        const data = await getStudentsByGroup(group.id);
        // Supabase join from student_groups to students can return an array or single object depending on types.
        // We ensure it is flat.
        const flatStudents = Array.isArray(data) 
          ? data.flatMap(s => Array.isArray(s) ? s : [s]) 
          : [];
        
        // Sort students alphabetically
        flatStudents.sort((a, b) => (a.last_name + a.first_name).localeCompare(b.last_name + b.first_name));
        
        setStudents(flatStudents as Student[]);
        setHasFetched(true);
      } catch (err) {
        toast.error('Errore nel caricamento degli allievi');
      } finally {
        setLoading(false);
      }
    }
    setExpanded(!expanded);
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 flex items-center justify-between gap-4">
        {/* Info Gruppo */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-green-800 font-bold text-sm">
              {group.name.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-base">{group.name}</p>
            {group.schedule_data && group.schedule_data.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-1">
                {group.schedule_data.map((slot, i) => (
                  <span
                    key={i}
                    className="inline-block rounded-md bg-green-50 border border-green-200 px-2 py-0.5 text-xs text-green-800 font-medium"
                  >
                    {slot.day.slice(0, 3)} {slot.time}
                  </span>
                ))}
              </div>
            ) : group.schedule_description ? (
              <p className="text-sm text-slate-500 truncate mt-0.5">{group.schedule_description}</p>
            ) : (
              <p className="text-sm text-slate-300 italic mt-0.5">Nessun orario impostato</p>
            )}
          </div>
        </div>

        {/* Azioni */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={toggleExpand}
            disabled={isPending}
            title="Vedi Allievi"
            aria-label="Vedi Allievi"
            className={`flex-shrink-0 p-2 rounded-lg transition-colors disabled:opacity-40 ${
              expanded ? 'bg-green-100 text-green-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <EyeIcon />
          </button>
          <button
            onClick={() => onEdit(group)}
            disabled={isPending}
            title="Modifica Gruppo"
            aria-label="Modifica gruppo"
            className="flex-shrink-0 p-2 rounded-lg text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-40"
          >
            <PencilIcon />
          </button>
          <button
            onClick={() => onDelete(group)}
            disabled={isPending}
            title="Elimina Gruppo"
            aria-label="Elimina gruppo"
            className="flex-shrink-0 p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {/* Accordion Allievi */}
      {expanded && (
        <div className="bg-slate-50 border-t border-slate-100 px-4 py-3 animate-in fade-in slide-in-from-top-2">
          {loading ? (
            <p className="text-sm text-center text-slate-400 py-4">Caricamento allievi...</p>
          ) : students.length === 0 ? (
            <p className="text-sm text-center text-slate-400 py-4">Nessun allievo iscritto a questo gruppo.</p>
          ) : (
            <ul className="divide-y divide-slate-200/60">
              {students.map((student) => (
                <li key={student.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">
                      {student.last_name} {student.first_name}
                    </p>
                  </div>
                  {student.phone_number && (
                    <a
                      href={`tel:${student.phone_number}`}
                      className="text-sm text-green-600 hover:text-green-700 hover:underline flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-md border border-green-100"
                    >
                      📞 {student.phone_number}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
