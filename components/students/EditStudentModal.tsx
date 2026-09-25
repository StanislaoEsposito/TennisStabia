'use client';

import { useEffect, useRef, useTransition } from 'react';
import toast from 'react-hot-toast';
import { updateStudent } from '@/actions/students';
import type { Student, Group } from '@/lib/types';

// Use a type that includes student_groups to be able to read existing groups
type StudentRow = Student & {
  student_groups: {
    id: string;
    weekly_sessions: number;
    groups: { id: string; name: string; schedule_description: string | null } | null;
  }[];
};

interface EditStudentModalProps {
  student: StudentRow;
  groups: Group[];
  onClose: () => void;
}

export default function EditStudentModal({ student, groups, onClose }: EditStudentModalProps) {
  const [isPending, startTransition] = useTransition();
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus sul primo campo all'apertura
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // Chiudi con ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isPending) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, isPending]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await updateStudent(student.id, {
          firstName:         String(fd.get('first_name')  ?? ''),
          lastName:          String(fd.get('last_name')   ?? ''),
          phone:             String(fd.get('phone')       ?? ''),
          medicalCertExpiry: String(fd.get('cert_expiry') ?? ''),
          groupIds:          fd.getAll('group_ids').map(String),
          weeklySessions:    Number(fd.get('weekly_sessions') ?? 2),
        });
        toast.success('Allievo aggiornato con successo! ✏️');
        onClose();
      } catch (err) {
        toast.error('Errore: ' + (err instanceof Error ? err.message : 'Riprova'));
      }
    });
  }

  // Costruisci un set degli ID dei gruppi attualmente assegnati all'allievo
  const currentGroupIds = new Set(
    student.student_groups
      .filter((sg) => sg.groups)
      .map((sg) => sg.groups!.id)
  );

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        // Chiudi cliccando fuori dal modal, ma non durante il salvataggio
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      {/* Modal */}
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">✏️ Modifica Allievo</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {student.first_name} {student.last_name}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition disabled:opacity-40"
            aria-label="Chiudi"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="edit-first-name">Nome *</label>
              <input
                id="edit-first-name"
                ref={firstInputRef}
                name="first_name"
                type="text"
                required
                defaultValue={student.first_name}
                className="input"
                placeholder="Marco"
              />
            </div>
            <div>
              <label className="label" htmlFor="edit-last-name">Cognome *</label>
              <input
                id="edit-last-name"
                name="last_name"
                type="text"
                required
                defaultValue={student.last_name}
                className="input"
                placeholder="Esposito"
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="edit-phone">Telefono</label>
            <input
              id="edit-phone"
              name="phone"
              type="tel"
              defaultValue={student.phone_number ?? ''}
              className="input"
              placeholder="333 123 4567"
            />
          </div>

          <div>
            <label className="label" htmlFor="edit-cert">Scadenza Certificato Medico</label>
            <input
              id="edit-cert"
              name="cert_expiry"
              type="date"
              defaultValue={student.medical_cert_expiry ?? ''}
              className="input"
            />
            {/* Mini-preview dello stato corrente */}
            {student.medical_cert_expiry && (
              <p className="mt-1 text-xs text-gray-400">
                Attuale: {new Date(student.medical_cert_expiry + 'T12:00:00').toLocaleDateString('it-IT')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="label mb-2">Gruppi</label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                {groups.length === 0 && (
                  <p className="text-xs text-gray-500 italic">Nessun gruppo disponibile.</p>
                )}
                {groups.map((g) => (
                  <label key={g.id} className="flex items-start gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="group_ids"
                      value={g.id}
                      defaultChecked={currentGroupIds.has(g.id)}
                      className="mt-0.5 rounded border-gray-300 text-green-600 focus:ring-green-500 transition-colors"
                    />
                    <div className="text-sm">
                      <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                        {g.name}
                      </span>
                      {g.schedule_data && g.schedule_data.length > 0 && (
                        <p className="text-xs text-gray-500">
                          {g.schedule_data.map((s) => `${s.day.slice(0,3)} ${s.time}`).join(', ')}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Sess./settimana</label>
              <input
                name="weekly_sessions"
                type="number"
                min={1}
                max={7}
                defaultValue={
                  student.student_groups.length > 0
                    ? student.student_groups[0].weekly_sessions
                    : 2
                }
                className="input"
              />
              <p className="text-xs text-gray-400 mt-1">Applica a tutti i gruppi scelti</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="btn-secondary flex-1"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary flex-1 justify-center"
            >
              {isPending ? (
                <span className="animate-spin inline-block">⟳</span>
              ) : '💾'}
              {isPending ? ' Salvataggio…' : ' Salva Modifiche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
