'use client';

import { useTransition, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createGroup } from '@/actions/groups';

interface AddGroupModalProps {
  onClose: () => void;
}

export default function AddGroupModal({ onClose }: AddGroupModalProps) {
  const [isPending, startTransition] = useTransition();
  const nameRef = useRef<HTMLInputElement>(null);

  // Focus sul primo campo all'apertura
  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  // Chiudi con ESC (solo se non in loading)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isPending, onClose]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const name = (data.get('name') as string).trim();
    const schedule_description = (data.get('schedule_description') as string).trim();

    if (!name) {
      toast.error('Il nome del gruppo è obbligatorio');
      return;
    }

    startTransition(async () => {
      try {
        await createGroup({ name, schedule_description });
        toast.success(`✅ Gruppo "${name.toUpperCase()}" creato!`);
        onClose();
      } catch (err) {
        toast.error('Errore: ' + (err instanceof Error ? err.message : 'Riprova'));
      }
    });
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={isPending ? undefined : onClose}
    >
      {/* Pannello modale */}
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">🎾 Nuovo Gruppo</h2>
          <button
            onClick={onClose}
            disabled={isPending}
            aria-label="Chiudi"
            className="text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-40 p-1"
          >
            {/* X icon */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Nome gruppo */}
          <div>
            <label className="label" htmlFor="group-name">
              Nome Gruppo *
            </label>
            <input
              ref={nameRef}
              id="group-name"
              name="name"
              type="text"
              required
              placeholder="es. NADAL"
              className="input"
              disabled={isPending}
            />
            <p className="mt-1 text-xs text-slate-400">
              Il nome verrà salvato in maiuscolo (es. SINNER, DJOKOVIC…)
            </p>
          </div>

          {/* Orario */}
          <div>
            <label className="label" htmlFor="group-schedule">
              Orario / Giorni
            </label>
            <input
              id="group-schedule"
              name="schedule_description"
              type="text"
              placeholder="es. H 15 LUN-MERC"
              className="input"
              disabled={isPending}
            />
            <p className="mt-1 text-xs text-slate-400">
              Formato libero. Il Calendario lo interpreterà automaticamente.
            </p>
          </div>

          {/* Footer */}
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
              className="btn-primary flex-1"
            >
              {isPending ? 'Salvataggio…' : '✅ Crea Gruppo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
