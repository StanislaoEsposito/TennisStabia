'use client';

import { useTransition } from 'react';
import toast from 'react-hot-toast';
import { upsertPayment } from '@/actions/payments';
import { formatMonthYear } from '@/lib/date-helpers';
import type { PaymentRow } from '@/actions/payments';

interface PaymentsTableProps {
  rows: PaymentRow[];
  monthYear: string;
}

export default function PaymentsTable({ rows, monthYear }: PaymentsTableProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggle(row: PaymentRow) {
    const nextStatus = row.payment?.status === 'paid' ? 'pending' : 'paid';
    const label = `${row.first_name} ${row.last_name}`;

    startTransition(async () => {
      try {
        await upsertPayment(row.student_id, monthYear, nextStatus, row.payment?.amount ?? 0);
        toast.success(
          nextStatus === 'paid'
            ? `✅ ${label} — pagamento registrato`
            : `↩️ ${label} — reimpostato come in attesa`
        );
      } catch (err) {
        toast.error('Errore: ' + (err instanceof Error ? err.message : 'Riprova'));
      }
    });
  }

  const paidCount    = rows.filter((r) => r.payment?.status === 'paid').length;
  const pendingCount = rows.length - paidCount;

  return (
    <div className="space-y-4">
      {/* Riepilogo mese */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{rows.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Allievi totali</p>
        </div>
        <div className="rounded-xl bg-green-50 border border-green-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{paidCount}</p>
          <p className="text-xs text-green-600 mt-0.5">Pagamenti ricevuti</p>
        </div>
        <div className="rounded-xl bg-orange-50 border border-orange-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
          <p className="text-xs text-orange-500 mt-0.5">In attesa</p>
        </div>
      </div>

      {/* Tabella */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Allievo</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden sm:table-cell">
                Gruppo / Sessioni
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">
                Stato — {formatMonthYear(monthYear)}
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600 hidden md:table-cell">
                Data pagamento
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">Azione</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                  Nessun allievo trovato.
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const isPaid = row.payment?.status === 'paid';
              return (
                <tr
                  key={row.student_id}
                  className={`transition-colors ${isPaid ? 'bg-green-50/40' : 'hover:bg-gray-50'}`}
                >
                  {/* Nome */}
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {row.last_name} {row.first_name}
                  </td>

                  {/* Gruppi */}
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {row.groups.length > 0 ? (
                        row.groups.map((g, i) => (
                          <span
                            key={i}
                            title={`${g.weekly_sessions} sessioni/sett.`}
                            className="inline-block rounded-md bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800"
                          >
                            {g.name}
                            <span className="ml-1 font-normal text-green-600">
                              ×{g.weekly_sessions}
                            </span>
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">Nessuno</span>
                      )}
                    </div>
                  </td>

                  {/* Stato badge */}
                  <td className="px-4 py-3 text-center">
                    {isPaid ? (
                      <span className="badge-ok">✅ Pagato</span>
                    ) : (
                      <span className="badge-expiring">⏳ In attesa</span>
                    )}
                  </td>

                  {/* Data pagamento */}
                  <td className="px-4 py-3 text-center text-gray-500 hidden md:table-cell">
                    {row.payment?.payment_date
                      ? new Date(row.payment.payment_date + 'T12:00:00').toLocaleDateString('it-IT')
                      : <span className="text-gray-300">—</span>
                    }
                  </td>

                  {/* Azione */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggle(row)}
                      disabled={isPending}
                      className={`
                        text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-40
                        ${isPaid
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                        }
                      `}
                    >
                      {isPaid ? '↩️ Annulla' : '💰 Segna Pagato'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
