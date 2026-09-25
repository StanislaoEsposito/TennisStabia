'use client';

import { getCertStatus, type CertStatus } from '@/lib/types';

interface CertBadgeProps {
  expiry: string | null;
}

const config: Record<CertStatus, { label: string; className: string; icon: string }> = {
  ok:            { label: 'Valido',      className: 'badge-ok',      icon: '✅' },
  expiring_soon: { label: 'In scadenza', className: 'badge-expiring', icon: '⚠️' },
  expired:       { label: 'Scaduto',     className: 'badge-expired',  icon: '🔴' },
  missing:       { label: 'Mancante',    className: 'badge-missing',  icon: '—'  },
};

export default function CertBadge({ expiry }: CertBadgeProps) {
  const status = getCertStatus(expiry);
  const { label, className, icon } = config[status];

  const formattedDate = expiry
    ? new Date(expiry).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null;

  return (
    <span className={className} title={formattedDate ?? 'Non inserito'}>
      {icon} {formattedDate ?? label}
    </span>
  );
}
