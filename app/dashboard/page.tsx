import Image from 'next/image';
import { getStudentsWithGroups, getGroups } from '@/actions/students';
import StudentsTable from '@/components/students/StudentsTable';
import AddStudentButton from '@/components/students/AddStudentButton';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [students, groups] = await Promise.all([
    getStudentsWithGroups(),
    getGroups(),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="flex items-center text-3xl font-bold text-gray-900">
            <Image 
              src="/web-app-manifest-192x192.png" 
              alt="Logo" 
              width={56} 
              height={56} 
              className="mr-4 rounded-full bg-white p-1 shadow-sm" 
            />
            Dashboard Segreteria
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {students.length} allievi iscritti
          </p>
        </div>
        <AddStudentButton groups={groups ?? []} />
      </div>

      {/* Legenda certificati */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
          Certificato valido
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
          Scade entro 30 giorni
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
          Scaduto
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" />
          Non inserito
        </span>
      </div>

      {/* Tabella */}
      <StudentsTable students={students ?? []} groups={groups ?? []} />
    </div>
  );
}
