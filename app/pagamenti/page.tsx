import { Suspense } from 'react';
import { getPaymentsForMonth } from '@/actions/payments';
import { getCurrentMonthYear, formatMonthYear } from '@/lib/date-helpers';
import PaymentsTable from '@/components/payments/PaymentsTable';
import MonthSelector from '@/components/payments/MonthSelector';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: { mese?: string };
}

export default async function PagamentiPage({ searchParams }: PageProps) {
  // Legge il mese dalla query string, default = mese corrente
  const monthYear = searchParams.mese ?? getCurrentMonthYear();
  const rows = await getPaymentsForMonth(monthYear);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">💰 Gestione Quote</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {formatMonthYear(monthYear)} — {rows.length} allievi
          </p>
        </div>

        {/* Il selettore mese usa useSearchParams → serve Suspense */}
        <Suspense fallback={<div className="input max-w-[200px] h-9 animate-pulse bg-gray-100 rounded-lg" />}>
          <MonthSelector currentMonthYear={monthYear} />
        </Suspense>
      </div>

      <PaymentsTable rows={rows} monthYear={monthYear} />
    </div>
  );
}
