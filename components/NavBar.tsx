'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard',  label: '🖥️ Segreteria',  shortLabel: 'Dashboard' },
  { href: '/pagamenti',  label: '💰 Quote',         shortLabel: 'Quote'     },
  { href: '/calendario', label: '📅 Calendario',    shortLabel: 'Calendario'},
  { href: '/attendance', label: '📋 Presenze',      shortLabel: 'Presenze'  },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-green-800 shadow-md">
      <div className="max-w-7xl mx-auto px-2 md:px-4 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center text-white font-bold text-base sm:text-lg leading-tight shrink-0">
          <Image 
            src="/web-app-manifest-192x192.png" 
            alt="Logo" 
            width={56} 
            height={56} 
            className="rounded-full bg-white p-1 shadow-sm" 
          />
          <span className="hidden md:block ml-3">ASD Tennis Club Terme di Stabia</span>
        </div>

        {/* Navigation links (scrollabili orizzontalmente su mobile) */}
        <div className="flex overflow-x-auto whitespace-nowrap gap-2 w-full md:w-auto md:justify-end items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {links.map(({ href, label, shortLabel }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition
                  ${active
                    ? 'bg-white text-green-800'
                    : 'text-green-100 hover:bg-green-700 hover:text-white'
                  }
                `}
              >
                <span className="sm:hidden">{shortLabel}</span>
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
