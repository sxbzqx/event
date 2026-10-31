import { EventData } from '@/types/eventData';

export function plural(n: number, forms: [string, string, string]) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return forms[0];
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return forms[1];
  return forms[2];
}

export const seatsWord = (n: number) => plural(n, ['место', 'места', 'мест']);

export function dateParts(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString('ru-RU', { day: 'numeric' }),
    month: d.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', ''),
    weekday: d.toLocaleDateString('ru-RU', { weekday: 'long' }),
    time: d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    full: d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
  };
}

export const isPast = (iso: string) => new Date(iso).getTime() <= Date.now();

// Градиенты — литеральные строки, чтобы Tailwind их увидел
const covers = [
  'from-navy-900 via-blue-800 to-blue-500',
  'from-blue-700 via-blue-600 to-sky-400',
  'from-navy-800 via-indigo-700 to-sky-500',
  'from-sky-500 via-blue-600 to-navy-900',
  'from-navy-950 via-navy-700 to-blue-500',
];

export const coverFor = (id: number) => covers[Math.abs(id) % covers.length];

export type SeatState = 'past' | 'full' | 'few' | 'open';

export function seatState(ev: EventData): SeatState {
  if (isPast(ev.startTime)) return 'past';
  if (ev.freeSeats <= 0) return 'full';
  if (ev.freeSeats / ev.maxSeats <= 0.2) return 'few';
  return 'open';
}

export const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 disabled:bg-slate-50 disabled:text-slate-400';

export const primaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none';
