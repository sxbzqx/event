'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { EventData } from '@/types/eventData';
import { dateParts, isPast, plural, seatState, seatsWord } from '@/lib/format';
import EventCover from '@/components/EventCover';
import {
  ArrowRightIcon,
  ClockIcon,
  PlusIcon,
  SearchIcon,
  UsersIcon,
} from '@/components/Icons';

type Filter = 'upcoming' | 'free' | 'past';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'upcoming', label: 'Предстоящие' },
  { key: 'free', label: 'Есть места' },
  { key: 'past', label: 'Прошедшие' },
];

const STATUS = {
  open: { text: (e: EventData) => `${e.freeSeats} ${seatsWord(e.freeSeats)}`, cls: 'bg-white text-blue-700' },
  few: { text: (e: EventData) => `Осталось ${e.freeSeats}`, cls: 'bg-amber-100 text-amber-800' },
  full: { text: () => 'Мест нет', cls: 'bg-slate-900/70 text-white' },
  past: { text: () => 'Завершено', cls: 'bg-slate-900/70 text-white' },
} as const;

export default function HomePage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('upcoming');

  useEffect(() => {
    fetch(`${API_URL}/api/events`)
      .then((res) => {
        if (!res.ok) throw new Error('Не удалось загрузить события');
        return res.json();
      })
      .then((data) => setEvents(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const upcoming = events.filter((e) => !isPast(e.startTime));
    return {
      upcoming: upcoming.length,
      free: upcoming.reduce((s, e) => s + e.freeSeats, 0),
    };
  }, [events]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = events.filter((e) => {
      if (q && !e.title.toLowerCase().includes(q)) return false;
      if (filter === 'past') return isPast(e.startTime);
      if (filter === 'free') return !isPast(e.startTime) && e.freeSeats > 0;
      return !isPast(e.startTime);
    });
    return filter === 'past' ? [...list].reverse() : list;
  }, [events, query, filter]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="bg-dots absolute inset-0 opacity-40" />
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-blue-600/40 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-sky-400/25 blur-3xl" />

        <div className="relative mx-auto w-full max-w-6xl px-5 pb-20 pt-16 sm:pt-20">
          <div className="max-w-2xl space-y-5">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Находите события и&nbsp;
              <span className="bg-linear-to-r from-sky-300 to-blue-400 bg-clip-text text-transparent">
                бронируйте места
              </span>
            </h1>
            <p className="text-base text-slate-300 sm:text-lg">
              Выбирайте мероприятие, записывайтесь по имени и почте — без регистрации и лишних шагов.
            </p>
          </div>

          <div className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по названию"
                className="w-full rounded-2xl border border-white/10 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 shadow-xl shadow-navy-950/30 outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-sky-400/40"
              />
            </label>
            <Link
              href="/events/create"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-600/30 transition hover:bg-blue-400"
            >
              <PlusIcon className="h-4 w-4" />
              Создать
            </Link>
          </div>

          {!loading && !error && (
            <dl className="mt-10 flex gap-8 text-sm">
              <div>
                <dt className="text-slate-400">Предстоящих событий</dt>
                <dd className="mt-0.5 text-2xl font-bold">{stats.upcoming}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Свободных мест</dt>
                <dd className="mt-0.5 text-2xl font-bold">{stats.free}</dd>
              </div>
            </dl>
          )}
        </div>
      </section>

      {/* Список */}
      <section className="mx-auto -mt-8 w-full max-w-6xl px-5 pb-16">
        <div className="relative inline-flex max-w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-lg shadow-slate-900/5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${
                filter === f.key ? 'bg-navy-900 text-white shadow' : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}. Проверьте, что API запущен.
          </div>
        )}

        {loading && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-3xl bg-white shadow-sm ring-1 ring-slate-200" />
            ))}
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="text-slate-600">
              {query ? 'По вашему запросу ничего не найдено.' : 'Здесь пока нет мероприятий.'}
            </p>
            <Link
              href="/events/create"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-500"
            >
              Создать мероприятие <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((ev) => {
            const d = dateParts(ev.startTime);
            const state = seatState(ev);
            const pct = ev.maxSeats > 0 ? Math.min(100, Math.round((ev.takenSeats / ev.maxSeats) * 100)) : 0;
            const muted = state === 'past';

            return (
              <Link
                key={ev.id}
                href={`/events/${ev.id}`}
                className={`group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/10 hover:ring-blue-300 ${
                  muted ? 'opacity-75 saturate-50' : ''
                }`}
              >
                <EventCover id={ev.id} className="h-40">
                  <div className="flex h-full items-start justify-between p-4">
                    <div className="rounded-2xl bg-white px-3 py-2 text-center shadow-lg">
                      <div className="text-xl font-extrabold leading-none text-navy-900">{d.day}</div>
                      <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-blue-600">
                        {d.month}
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold shadow ${STATUS[state].cls}`}>
                      {STATUS[state].text(ev)}
                    </span>
                  </div>
                </EventCover>

                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div className="space-y-2">
                    <h3 className="line-clamp-2 text-lg font-bold leading-snug text-navy-900 transition group-hover:text-blue-600">
                      {ev.title}
                    </h3>
                    <p className="flex items-center gap-1.5 text-sm capitalize text-slate-500">
                      <ClockIcon className="h-4 w-4 text-blue-500" />
                      {d.weekday}, {d.time}
                    </p>
                  </div>

                  <div className="mt-auto space-y-3">
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <UsersIcon className="h-4 w-4" />
                          {ev.takenSeats} из {ev.maxSeats}
                        </span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all ${
                            state === 'few' ? 'bg-amber-400' : state === 'full' || muted ? 'bg-slate-400' : 'bg-blue-600'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-semibold text-blue-600">
                      <span>{muted ? 'Посмотреть' : 'Подробнее'}</span>
                      <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {!loading && !error && visible.length > 0 && (
          <p className="mt-8 text-center text-sm text-slate-400">
            {visible.length} {plural(visible.length, ['событие', 'события', 'событий'])}
          </p>
        )}
      </section>
    </>
  );
}
