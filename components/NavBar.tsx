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
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <span className="flex items-center text-white font-bold text-base sm:text-lg leading-tight">
          <Image 
            src="/web-app-manifest-192x192.png" 
            alt="Logo" 
            width={56} 
            height={56} 
            className="mr-3 rounded-full bg-white p-1 shadow-sm" 
          />
          <span><span className="hidden sm:inline">ASD Tennis Club </span>Terme di Stabia</span>
        </span>

        {/* Navigation links */}
        <div className="flex gap-1 sm:gap-2">
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
