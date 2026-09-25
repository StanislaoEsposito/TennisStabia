import { getGroups } from '@/actions/students';
import AttendanceView from '@/components/attendance/AttendanceView';

export const dynamic = 'force-dynamic';

export default async function AttendancePage() {
  const groups = await getGroups();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📋 Registro Presenze</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Seleziona un gruppo e segna le presenze
        </p>
      </div>

      <AttendanceView groups={groups ?? []} />
    </div>
  );
}
