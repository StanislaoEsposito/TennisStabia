import { getGroups } from '@/actions/students';
import WeeklyCalendar from '@/components/calendario/WeeklyCalendar';

export const dynamic = 'force-dynamic';

export default async function CalendarioPage() {
  const groups = await getGroups();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📅 Calendario Settimanale</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Orari dei gruppi di allenamento — {groups?.length ?? 0} gruppi attivi
        </p>
      </div>

      <WeeklyCalendar groups={groups ?? []} />
    </div>
  );
}
