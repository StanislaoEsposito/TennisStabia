'use client';

import { useTransition, useRef, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { createGroup, updateGroup } from '@/actions/groups';
import type { Group, ScheduleSlot } from '@/lib/types';

interface GroupFormModalProps {
  group?: Group;
  onClose: () => void;
}

// ── Costanti ─────────────────────────────────────────────────

const DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'] as const;
type Day = (typeof DAYS)[number];

/** Orari comuni disponibili nel selettore */
const TIME_OPTIONS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00',
];

const DEFAULT_TIME = '15:00';

// ── Componente principale ─────────────────────────────────────

export default function GroupFormModal({ group, onClose }: GroupFormModalProps) {
  const isEditing = !!group;
  const [isPending, startTransition] = useTransition();
  const nameRef = useRef<HTMLInputElement>(null);

  // Inizializza lo stato con i dati del gruppo se in modifica
  const initialSchedule = group?.schedule_data
    ? group.schedule_data.reduce((acc, slot) => {
        acc[slot.day as Day] = slot.time;
        return acc;
      }, {} as Partial<Record<Day, string>>)
    : {};

  const [schedule, setSchedule] = useState<Partial<Record<Day, string>>>(initialSchedule);
  const [name, setName] = useState(group?.name ?? '');

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

  // Toggle di un giorno: se è già attivo lo rimuove, altrimenti lo aggiunge con orario di default
  function toggleDay(day: Day) {
    setSchedule((prev) => {
      const next = { ...prev };
      if (day in next) {
        delete next[day];
      } else {
        next[day] = DEFAULT_TIME;
      }
      return next;
    });
  }

  function setTime(day: Day, time: string) {
    setSchedule((prev) => ({ ...prev, [day]: time }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const finalName = name.trim();

    if (!finalName) {
      toast.error('Il nome del gruppo è obbligatorio');
      return;
    }

    // Costruisce l'array in ordine canonico dei giorni
    const schedule_data: ScheduleSlot[] = DAYS
      .filter((day) => day in schedule)
      .map((day) => ({ day, time: schedule[day]! }));

    startTransition(async () => {
      try {
        if (isEditing) {
          await updateGroup(group.id, { name: finalName, schedule_data });
          toast.success(`✅ Gruppo "${finalName.toUpperCase()}" aggiornato!`);
        } else {
          await createGroup({ name: finalName, schedule_data });
          toast.success(`✅ Gruppo "${finalName.toUpperCase()}" creato!`);
        }
        onClose();
      } catch (err) {
        toast.error('Errore: ' + (err instanceof Error ? err.message : 'Riprova'));
      }
    });
  }

  const activeCount = Object.keys(schedule).length;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={isPending ? undefined : onClose}
    >
      {/* Pannello */}
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-bold text-slate-900">
            {isEditing ? '✏️ Modifica Gruppo' : '🎾 Nuovo Gruppo'}
          </h2>
          <button
            onClick={onClose}
            disabled={isPending}
            aria-label="Chiudi"
            className="text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-40 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body scrollabile */}
        <div className="overflow-y-auto flex-1">
          <form id="group-form" onSubmit={handleSubmit} className="px-6 py-5 space-y-6">

            {/* ── Nome ── */}
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="es. NADAL"
                className="input"
                disabled={isPending}
              />
              <p className="mt-1 text-xs text-slate-400">Verrà salvato in maiuscolo</p>
            </div>

            {/* ── Selettore giorni/orari ── */}
            <div>
              <p className="label mb-3">Giorni e Orari di Allenamento</p>

              <div className="space-y-3">
                {DAYS.map((day) => {
                  const isActive = day in schedule;
                  return (
                    <div key={day} className="flex items-center gap-3">
                      {/* Bottone giorno (toggle) */}
                      <button
                        type="button"
                        onClick={() => toggleDay(day)}
                        disabled={isPending}
                        className={`
                          w-28 shrink-0 rounded-lg px-3 py-2 text-sm font-semibold
                          transition-all border disabled:opacity-40 text-left
                          ${isActive
                            ? 'bg-green-600 text-white border-green-600 shadow-sm'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-green-400 hover:text-green-700'
                          }
                        `}
                      >
                        {isActive ? '✓ ' : ''}{day}
                      </button>

                      {/* Selettore orario — visibile solo se il giorno è attivo */}
                      {isActive && (
                        <div className="flex items-center gap-2 animate-in fade-in duration-150">
                          <select
                            value={schedule[day]}
                            onChange={(e) => setTime(day, e.target.value)}
                            disabled={isPending}
                            className="input py-2 w-28"
                            aria-label={`Orario per ${day}`}
                          >
                            {TIME_OPTIONS.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <span className="text-xs text-slate-400">
                            {schedule[day]}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {activeCount > 0 && (
                <p className="mt-3 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                  📅 {activeCount} {activeCount === 1 ? 'giorno selezionato' : 'giorni selezionati'}:{' '}
                  {DAYS.filter((d) => d in schedule).map((d) => `${d} ${schedule[d]}`).join(', ')}
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Footer sticky */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0 bg-white">
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
            form="group-form"
            disabled={isPending}
            className="btn-primary flex-1"
          >
            {isPending ? 'Salvataggio…' : (isEditing ? '✅ Salva Modifiche' : '✅ Crea Gruppo')}
          </button>
        </div>
      </div>
    </div>
  );
}
