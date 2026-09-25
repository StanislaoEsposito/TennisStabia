'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createStudent } from '@/actions/students';
import type { Group } from '@/lib/types';

interface AddStudentModalProps {
  groups: Group[];
  onClose: () => void;
}

export default function AddStudentModal({ groups, onClose }: AddStudentModalProps) {
  const [isPending, startTransition] = useTransition();
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus sul primo campo all'apertura
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // Chiudi con ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await createStudent({
          firstName:         String(fd.get('first_name') ?? '').trim(),
          lastName:          String(fd.get('last_name') ?? '').trim(),
          phone:             String(fd.get('phone') ?? '').trim(),
          medicalCertExpiry: String(fd.get('cert_expiry') ?? '').trim(),
          groupId:           String(fd.get('group_id') ?? '') || undefined,
          weeklySessions:    Number(fd.get('weekly_sessions') ?? 2),
        });
        toast.success('Allievo aggiunto con successo!');
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
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal */}
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">➕ Nuovo Allievo</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            aria-label="Chiudi"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Nome *</label>
              <input
                ref={firstInputRef}
                name="first_name"
                type="text"
                required
                className="input"
                placeholder="Marco"
              />
            </div>
            <div>
              <label className="label">Cognome *</label>
              <input
                name="last_name"
                type="text"
                required
                className="input"
                placeholder="Esposito"
              />
            </div>
          </div>

          <div>
            <label className="label">Telefono</label>
            <input
              name="phone"
              type="tel"
              className="input"
              placeholder="333 123 4567"
            />
          </div>

          <div>
            <label className="label">Scadenza Certificato Medico</label>
            <input
              name="cert_expiry"
              type="date"
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Gruppo</label>
              <select name="group_id" className="input">
                <option value="">— Nessuno —</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                    {g.schedule_description ? ` (${g.schedule_description})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Sess./settimana</label>
              <input
                name="weekly_sessions"
                type="number"
                min={1}
                max={7}
                defaultValue={2}
                className="input"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
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
                <span className="animate-spin">⟳</span>
              ) : null}
              {isPending ? 'Salvataggio…' : 'Salva Allievo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
