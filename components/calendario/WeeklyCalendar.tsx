'use client';

import type { Group, ScheduleSlot } from '@/lib/types';

// ── Costanti ─────────────────────────────────────────────────

/** Ordine canonico dei giorni per le colonne */
const DAY_ORDER = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

/** Colori ciclici per i badge dei gruppi */
const GROUP_COLORS = [
  'bg-green-100  text-green-800  border-green-300',
  'bg-blue-100   text-blue-800   border-blue-300',
  'bg-purple-100 text-purple-800 border-purple-300',
  'bg-orange-100 text-orange-800 border-orange-300',
  'bg-pink-100   text-pink-800   border-pink-300',
  'bg-teal-100   text-teal-800   border-teal-300',
  'bg-yellow-100 text-yellow-800 border-yellow-300',
];

// ── Componente ────────────────────────────────────────────────

interface WeeklyCalendarProps {
  groups: Group[];
}

export default function WeeklyCalendar({ groups }: WeeklyCalendarProps) {
  // Separa i gruppi con schedule_data strutturato da quelli senza
  const withData    = groups.filter((g) => g.schedule_data && g.schedule_data.length > 0);
  const withoutData = groups.filter((g) => !g.schedule_data || g.schedule_data.length === 0);

  if (withData.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-6 text-center">
          <p className="text-2xl mb-2">📅</p>
          <p className="text-sm font-medium text-yellow-800">
            Nessun gruppo ha ancora un orario strutturato.
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            Vai in <strong>Gruppi</strong> e crea o aggiorna i tuoi gruppi con il selettore giorni/orari.
          </p>
        </div>
        {withoutData.length > 0 && <LegacyWarning groups={withoutData} />}
      </div>
    );
  }

  // ── Costruzione della griglia ─────────────────────────────

  // Raccoglie tutti i giorni e gli orari unici presenti nei dati
  const usedDays  = new Set<string>();
  const usedTimes = new Set<string>();

  for (const group of withData) {
    for (const slot of group.schedule_data!) {
      usedDays.add(slot.day);
      usedTimes.add(slot.time);
    }
  }

  // Ordina secondo l'ordine canonico
  const columns = DAY_ORDER.filter((d) => usedDays.has(d));
  const rows    = [...usedTimes].sort(); // ordinamento lessicografico funziona per HH:MM

  // Mappa  "giorno|orario" → lista di gruppi in quella cella
  const cellMap = new Map<string, { group: Group; color: string }[]>();

  withData.forEach((group, groupIndex) => {
    const color = GROUP_COLORS[groupIndex % GROUP_COLORS.length];
    for (const slot of group.schedule_data!) {
      const key = `${slot.day}|${slot.time}`;
      if (!cellMap.has(key)) cellMap.set(key, []);
      cellMap.get(key)!.push({ group, color });
    }
  });

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Griglia */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 w-20 text-xs uppercase tracking-wider">
                Ora
              </th>
              {columns.map((day) => (
                <th
                  key={day}
                  className="px-4 py-3 text-center font-semibold text-slate-700 min-w-[130px] text-xs uppercase tracking-wider"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((time) => (
              <tr key={time} className="hover:bg-slate-50/60 transition-colors">
                {/* Colonna ora */}
                <td className="px-4 py-3 font-mono text-slate-500 font-semibold text-sm align-top whitespace-nowrap">
                  {time}
                </td>

                {/* Celle per ciascun giorno */}
                {columns.map((day) => {
                  const key   = `${day}|${time}`;
                  const items = cellMap.get(key) ?? [];
                  return (
                    <td key={day} className="px-2 py-2 align-top text-center">
                      {items.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {items.map(({ group, color }) => (
                            <div
                              key={group.id}
                              className={`rounded-lg border px-2 py-2 text-xs font-bold ${color}`}
                            >
                              🎾 {group.name}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-200 select-none text-lg">·</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legenda */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Legenda gruppi
        </h3>
        <div className="flex flex-wrap gap-2">
          {withData.map((group, i) => (
            <span
              key={group.id}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold ${GROUP_COLORS[i % GROUP_COLORS.length]}`}
            >
              🎾 {group.name}
              {group.schedule_data && group.schedule_data.length > 0 && (
                <span className="font-normal opacity-70">
                  — {group.schedule_data.map((s) => `${s.day.slice(0, 3)} ${s.time}`).join(', ')}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Avviso per gruppi senza schedule_data */}
      {withoutData.length > 0 && <LegacyWarning groups={withoutData} />}
    </div>
  );
}

// ── Sotto-componente: avviso gruppi legacy ────────────────────

function LegacyWarning({ groups }: { groups: Group[] }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <strong>⚠️ Gruppi senza orario strutturato:</strong>{' '}
      {groups.map((g) => g.name).join(', ')}.{' '}
      Vai in <strong>Gestione Gruppi</strong>, eliminali e ricrealì usando il selettore giorni/orari
      per farli apparire nel calendario.
    </div>
  );
}
