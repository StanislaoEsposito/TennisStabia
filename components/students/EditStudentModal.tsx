'use client';

import { useEffect, useRef, useTransition } from 'react';
import toast from 'react-hot-toast';
import { updateStudent } from '@/actions/students';
import type { Student } from '@/lib/types';

interface EditStudentModalProps {
  student: Student;
  onClose: () => void;
}

export default function EditStudentModal({ student, onClose }: EditStudentModalProps) {
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
        });
        toast.success('Allievo aggiornato con successo! ✏️');
        onClose();
      } catch (err) {
        toast.error('Errore: ' + (err instanceof Error ? err.message : 'Riprova'));
      }
    });
  }

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
