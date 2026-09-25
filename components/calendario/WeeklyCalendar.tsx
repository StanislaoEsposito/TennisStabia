'use client';

import type { Group } from '@/lib/types';

// ── Parsing schedule_description ─────────────────────────────────────────────
//
// Esempi reali del campo:
//   'H 15:00 Lun-Merc'   → ore 15, giorni Lunedì e Mercoledì
//   'H 16 LUN-MERC'      → ore 16, giorni Lunedì e Mercoledì
//   'H 09:00 Sab'        → ore 9, solo Sabato
//   'H 11:00 Dom'        → ore 11, solo Domenica
//
// La funzione restituisce { hour: number, days: DayKey[] }

export type DayKey = 'lun' | 'mar' | 'mer' | 'gio' | 'ven' | 'sab' | 'dom';

const DAY_LABELS: Record<DayKey, string> = {
  lun: 'Lunedì',
  mar: 'Martedì',
  mer: 'Mercoledì',
  gio: 'Giovedì',
  ven: 'Venerdì',
  sab: 'Sabato',
  dom: 'Domenica',
};

/** Mappa token → DayKey (case-insensitive, plurali e singolari) */
const TOKEN_TO_DAY: Record<string, DayKey> = {
  lun: 'lun', luns: 'lun', lunedì: 'lun', lunedi: 'lun',
  mar: 'mar', mars: 'mar', mart: 'mar', martedì: 'mar', martedi: 'mar',
  mer: 'mer', mers: 'mer', merc: 'mer', mercoledì: 'mer', mercoledi: 'mer',
  gio: 'gio', gios: 'gio', giov: 'gio', giovedì: 'gio', giovedi: 'gio',
  ven: 'ven', vens: 'ven', venerdì: 'ven', venerdi: 'ven',
  sab: 'sab', sabs: 'sab', sabato: 'sab',
  dom: 'dom', doms: 'dom', domenica: 'dom',
};

const DAY_ORDER: DayKey[] = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'];

type ParsedSchedule = {
  hour: number;
  days: DayKey[];
};

export function parseSchedule(desc: string | null): ParsedSchedule | null {
  if (!desc) return null;

  // Estrai l'ora: cerca pattern come "15", "15:00", "9"
  const hourMatch = desc.match(/\b(\d{1,2})(?::\d{2})?\b/);
  if (!hourMatch) return null;
  const hour = parseInt(hourMatch[1], 10);

  // Rimuovi la parte dell'ora e il prefisso "H" per tenere solo i giorni
  const withoutHour = desc.replace(/\bH\b/i, '').replace(hourMatch[0], '').trim();

  // Dividi per spazi, virgole, trattini (es. 'Lun-Merc' diventa ['Lun', 'Merc'])
  const tokens = withoutHour.split(/[\s,\-]+/).filter(Boolean);
  
  const days: DayKey[] = [];
  for (const tok of tokens) {
    const day = TOKEN_TO_DAY[tok.toLowerCase()];
    if (day && !days.includes(day)) {
      days.push(day);
    }
  }

  if (days.length === 0) return null;
  return { hour, days };
}

// ── Componente ────────────────────────────────────────────────────────────────

interface WeeklyCalendarProps {
  groups: Group[];
}

/** Colori ciclici per i gruppi */
const GROUP_COLORS = [
  'bg-green-100 text-green-800 border-green-300',
  'bg-blue-100  text-blue-800  border-blue-300',
  'bg-purple-100 text-purple-800 border-purple-300',
  'bg-orange-100 text-orange-800 border-orange-300',
  'bg-pink-100  text-pink-800  border-pink-300',
  'bg-teal-100  text-teal-800  border-teal-300',
  'bg-yellow-100 text-yellow-800 border-yellow-300',
];

export default function WeeklyCalendar({ groups }: WeeklyCalendarProps) {
  // Calcola le ore usate (min e max) per determinare le righe della griglia
  const parsed = groups.map((g, i) => ({
    group:  g,
    sched:  parseSchedule(g.schedule_description),
    color:  GROUP_COLORS[i % GROUP_COLORS.length],
  }));

  const usedHours = parsed
    .map((p) => p.sched?.hour)
    .filter((h): h is number => h !== undefined);

  const minHour = usedHours.length > 0 ? Math.min(...usedHours) : 9;
  const maxHour = usedHours.length > 0 ? Math.max(...usedHours) : 18;
  const hours = Array.from({ length: maxHour - minHour + 1 }, (_, i) => minHour + i);

  // Colonne: solo i giorni della settimana che compaiono effettivamente
  const usedDays = new Set(parsed.flatMap((p) => p.sched?.days ?? []));
  const columns: DayKey[] = DAY_ORDER.filter((d) => usedDays.has(d));

  // Mappa: `${hour}-${day}` → gruppi
  type CellKey = string;
  const cellMap = new Map<CellKey, typeof parsed>();
  for (const item of parsed) {
    if (!item.sched) continue;
    for (const day of item.sched.days) {
      const key: CellKey = `${item.sched.hour}-${day}`;
      if (!cellMap.has(key)) cellMap.set(key, []);
      cellMap.get(key)!.push(item);
    }
  }

  // Gruppi non parsati (schedule_description non riconoscibile)
  const unparsed = parsed.filter((p) => !p.sched);

  return (
    <div className="space-y-6">
      {/* Griglia */}
      {columns.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-400">
          Nessun orario riconoscibile nelle schedule description dei gruppi.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-500 w-20">Ora</th>
                {columns.map((day) => (
                  <th
                    key={day}
                    className="px-4 py-3 text-center font-semibold text-gray-700 min-w-[120px]"
                  >
                    {DAY_LABELS[day]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {hours.map((hour) => (
                <tr key={hour} className="hover:bg-gray-50/50 transition-colors">
                  {/* Colonna ora */}
                  <td className="px-4 py-3 font-mono text-gray-500 font-medium whitespace-nowrap align-top">
                    {String(hour).padStart(2, '0')}:00
                  </td>
                  {/* Celle giorno */}
                  {columns.map((day) => {
                    const key = `${hour}-${day}`;
                    const items = cellMap.get(key) ?? [];
                    return (
                      <td key={day} className="px-2 py-2 align-top text-center">
                        {items.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {items.map(({ group, color }) => (
                              <div
                                key={group.id}
                                className={`
                                  rounded-lg border px-2 py-1.5 text-xs font-bold
                                  ${color}
                                `}
                              >
                                🎾 {group.name}
                                {group.schedule_description && (
                                  <p className="font-normal text-[10px] mt-0.5 opacity-75">
                                    {group.schedule_description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-200 select-none">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legenda gruppi */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Legenda gruppi</h3>
        <div className="flex flex-wrap gap-2">
          {parsed.map(({ group, color }) => (
            <span
              key={group.id}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold ${color}`}
            >
              🎾 {group.name}
              {group.schedule_description && (
                <span className="font-normal opacity-75">{group.schedule_description}</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Avvisi per gruppi con schedule non parsabile */}
      {unparsed.length > 0 && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          <strong>⚠️ Gruppi con orario non riconosciuto:</strong>{' '}
          {unparsed.map((p) => p.group.name).join(', ')}.{' '}
          Verifica il formato del campo <code className="font-mono bg-yellow-100 px-1 rounded">schedule_description</code>{' '}
          (esempio valido: <code className="font-mono bg-yellow-100 px-1 rounded">H 15:00 Lun-Mer</code>).
        </div>
      )}
    </div>
  );
}
