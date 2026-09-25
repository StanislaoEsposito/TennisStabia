'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { formatMonthYear } from '@/lib/date-helpers';

interface MonthSelectorProps {
  currentMonthYear: string;
}

/** Genera gli ultimi N mesi + i prossimi 2, nel formato 'MM-YYYY' */
function generateMonthOptions(count = 14): string[] {
  const options: string[] = [];
  const now = new Date();

  for (let i = count - 2; i >= -2; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    options.push(`${mm}-${yyyy}`);
  }
  return options;
}

export default function MonthSelector({ currentMonthYear }: MonthSelectorProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('mese', value);
    router.push(`/pagamenti?${params.toString()}`);
  }

  const months = generateMonthOptions(14);

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="month-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
        📅 Mese:
      </label>
      <select
        id="month-select"
        value={currentMonthYear}
        onChange={(e) => handleChange(e.target.value)}
        className="input max-w-[200px]"
      >
        {months.map((m) => (
          <option key={m} value={m}>
            {formatMonthYear(m)}
          </option>
        ))}
      </select>
    </div>
  );
}
