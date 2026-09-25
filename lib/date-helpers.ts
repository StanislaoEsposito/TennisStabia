/**
 * Helper per la gestione delle date — senza 'use server'.
 * Può essere importato sia da Server Components che da Client Components.
 */

/** Restituisce il mese corrente nel formato 'MM-YYYY' es. '10-2026' */
export function getCurrentMonthYear(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  return `${mm}-${yyyy}`;
}

/** Converte 'MM-YYYY' → etichetta leggibile, es. 'ottobre 2026' */
export function formatMonthYear(monthYear: string): string {
  const [mm, yyyy] = monthYear.split('-');
  const date = new Date(Number(yyyy), Number(mm) - 1, 1);
  return date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
}
