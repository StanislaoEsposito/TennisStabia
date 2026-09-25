import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import NavBar from '@/components/NavBar';

export const metadata: Metadata = {
  title: 'Tennis Club Terme di Stabia',
  description: 'Gestione iscritti ASD Tennis Club Terme di Stabia',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tennis Club',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        <NavBar />
        <main className="min-h-[calc(100vh-80px)] px-2 py-4 md:p-8">
          {children}
        </main>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { borderRadius: '8px', fontSize: '14px' },
            success: { iconTheme: { primary: '#15803d', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
