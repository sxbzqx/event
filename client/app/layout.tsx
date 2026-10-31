import './globals.css';
import Link from 'next/link';
import { PlusIcon, TicketIcon } from '@/components/Icons';

export const metadata = {
  title: 'EventFlow',
  description: 'Находите события и бронируйте места за пару кликов',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="flex min-h-screen flex-col antialiased">
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-lg">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-navy-900 to-blue-600 text-white shadow-md shadow-blue-600/30">
                <TicketIcon className="h-5 w-5" />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-navy-900">
                Event<span className="text-blue-600">Flow</span>
              </span>
            </Link>

            <nav className="flex items-center gap-2 text-sm font-medium">
              <Link
                href="/events/create"
                className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-4 py-2 text-white transition hover:bg-navy-700"
              >
                <PlusIcon className="h-4 w-4" />
                Создать событие
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="bg-navy-950 text-slate-400">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-5 py-8 text-sm sm:flex-row">
            <span className="font-semibold text-white">
              Event<span className="text-sky-400">Flow</span>
            </span>
            <span>&copy; 2026 EventFlow. Все права защищены.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
