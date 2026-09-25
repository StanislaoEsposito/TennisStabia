'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const links = [
  { href: '/dashboard',  label: '🖥️ Segreteria'  },
  { href: '/gruppi',     label: '🏅 Gruppi'       },
  { href: '/pagamenti',  label: '💰 Quote'         },
  { href: '/calendario', label: '📅 Calendario'    },
  { href: '/attendance', label: '📋 Presenze'      },
];

// ── Icona Hamburger ──────────────────────────────────────────
function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {open ? (
        // X
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      ) : (
        // Hamburger
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  );
}

export default function NavBar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Chiudi il menu quando si naviga
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Blocca lo scroll del body quando il menu mobile è aperto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-green-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          {/* ── Logo ── */}
          <Link href="/dashboard" className="flex items-center text-white font-bold text-base sm:text-lg leading-tight shrink-0 gap-3">
            <Image
              src="/web-app-manifest-192x192.png"
              alt="Logo"
              width={56}
              height={56}
              className="rounded-full bg-white p-1 shadow-sm"
            />
            <span className="hidden md:block">ASD Tennis Club Terme di Stabia</span>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ href, label }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-green-900 text-white'
                      : 'text-green-100 hover:bg-green-700 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* ── Hamburger Button (mobile only) ── */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Chiudi menu' : 'Apri menu'}
            aria-expanded={menuOpen}
            className="md:hidden p-2 rounded-lg text-white hover:bg-green-700 transition-colors"
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="fixed top-0 right-0 z-50 h-full w-72 bg-green-900 shadow-2xl md:hidden flex flex-col">
            {/* Header drawer */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-green-700">
              <span className="text-white font-bold text-sm">Menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Chiudi menu"
                className="p-2 rounded-lg text-green-200 hover:bg-green-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Links */}
            <nav className="flex flex-col gap-1 p-4 flex-1">
              {links.map(({ href, label }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? 'bg-green-700 text-white'
                        : 'text-green-100 hover:bg-green-800 hover:text-white'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Footer drawer */}
            <div className="px-5 py-4 border-t border-green-700">
              <p className="text-xs text-green-400 text-center">ASD Tennis Club Terme di Stabia</p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
