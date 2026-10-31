'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { EventData } from '@/types/eventData';
import { Registration } from '@/types/registration';
import { dateParts, inputClass, plural, primaryBtn, seatState, seatsWord } from '@/lib/format';
import EventCover from '@/components/EventCover';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
  ChevronIcon,
  ClockIcon,
  UsersIcon,
} from '@/components/Icons';

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

export default function EventClient({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<EventData | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showList, setShowList] = useState(false);

  const fetchEventData = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/events/${eventId}`);
      if (!res.ok) throw new Error('Мероприятие не найдено');
      setEvent(await res.json());

      const regRes = await fetch(`${API_URL}/api/events/${eventId}/registrations`);
      if (regRes.ok) setRegistrations(await regRes.json());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) fetchEventData();
  }, [eventId, fetchEventData]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/events/${eventId}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка при регистрации');

      setSuccessMsg('Готово! Вы записаны на событие.');
      setName('');
      setEmail('');
      fetchEventData();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRegistration = async (regId: number) => {
    if (!window.confirm('Отменить эту запись?')) return;
    try {
      const res = await fetch(`${API_URL}/api/events/${eventId}/registrations/${regId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Не удалось отменить запись');
      fetchEventData();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-12">
        <div className="h-64 animate-pulse rounded-3xl bg-white ring-1 ring-slate-200" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto w-full max-w-xl px-5 py-20 text-center">
        <p className="text-lg font-semibold text-navy-900">{error || 'Мероприятие не найдено'}</p>
        <Link href="/" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600">
          <ArrowLeftIcon className="h-4 w-4" /> Ко всем событиям
        </Link>
      </div>
    );
  }

  const d = dateParts(event.startTime);
  const state = seatState(event);
  const pct = event.maxSeats > 0 ? Math.min(100, Math.round((event.takenSeats / event.maxSeats) * 100)) : 0;
  const closed = state === 'past' || state === 'full';

  return (
    <>
      <EventCover id={event.id} className="bg-navy-900">
        <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-8 text-white">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-white/90 backdrop-blur transition hover:bg-white/20"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Все события
          </Link>

          <div className="mt-10 max-w-3xl space-y-5">
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                state === 'past' || state === 'full'
                  ? 'bg-slate-900/60 text-white'
                  : state === 'few'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-white text-blue-700'
              }`}
            >
              {state === 'past' ? 'Завершено' : state === 'full' ? 'Мест нет' : state === 'few' ? `Осталось ${event.freeSeats}` : 'Открыта регистрация'}
            </span>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">{event.title}</h1>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur">
                <CalendarIcon className="h-4 w-4 text-sky-300" />
                <span>
                  <span className="capitalize">{d.weekday}</span>, {d.full}
                </span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur">
                <ClockIcon className="h-4 w-4 text-sky-300" />
                {d.time}
              </span>
            </div>
          </div>
        </div>
      </EventCover>

      <div className="relative z-10 mx-auto -mt-10 grid w-full max-w-6xl gap-6 px-5 pb-16 lg:grid-cols-[1fr_380px]">
        {/* Левая колонка */}
        <div className="space-y-6">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-bold text-navy-900">Места</h2>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-slate-50 px-3 py-4">
                <div className="text-2xl font-extrabold text-navy-900">{event.maxSeats}</div>
                <div className="mt-0.5 text-xs text-slate-500">Всего</div>
              </div>
              <div className="rounded-2xl bg-blue-50 px-3 py-4">
                <div className="text-2xl font-extrabold text-blue-600">{event.freeSeats}</div>
                <div className="mt-0.5 text-xs text-slate-500">Свободно</div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-3 py-4">
                <div className="text-2xl font-extrabold text-navy-900">{event.takenSeats}</div>
                <div className="mt-0.5 text-xs text-slate-500">Занято</div>
              </div>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all ${state === 'few' ? 'bg-amber-400' : closed ? 'bg-slate-400' : 'bg-blue-600'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <button
              onClick={() => setShowList((v) => !v)}
              aria-expanded={showList}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <UsersIcon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-lg font-bold text-navy-900">Участники</span>
                  <span className="block text-sm text-slate-500">
                    {registrations.length} {plural(registrations.length, ['человек', 'человека', 'человек'])}
                  </span>
                </span>
              </span>
              <ChevronIcon className={`h-5 w-5 text-slate-400 transition-transform ${showList ? 'rotate-180' : ''}`} />
            </button>

            {showList && (
              <div className="mt-5 border-t border-slate-100 pt-5">
                {registrations.length === 0 ? (
                  <p className="text-sm text-slate-500">Пока никто не записался.</p>
                ) : (
                  <ul className="space-y-2">
                    {registrations.map((reg) => (
                      <li
                        key={reg.id}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">
                            {initials(reg.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-navy-900">{reg.name}</p>
                            <p className="truncate text-xs text-slate-500">{reg.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteRegistration(reg.id)}
                          className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                          Отменить
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Правая колонка — регистрация */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-blue-900/10 ring-1 ring-slate-200">
            <div className="bg-navy-900 px-6 py-5 text-white">
              <h2 className="text-lg font-bold">Записаться на событие</h2>
              <p className="mt-0.5 text-sm text-slate-300">
                {state === 'past'
                  ? 'Событие уже прошло'
                  : state === 'full'
                    ? 'Все места заняты'
                    : `Свободно ${event.freeSeats} ${seatsWord(event.freeSeats)}`}
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={closed}
                  placeholder="Как вас зовут"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={closed}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p>
              )}
              {successMsg && (
                <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
                  <CheckIcon className="h-4 w-4" /> {successMsg}
                </p>
              )}

              <button type="submit" disabled={closed || submitting} className={`${primaryBtn} w-full`}>
                {submitting ? 'Отправляем…' : closed ? 'Регистрация закрыта' : 'Записаться'}
              </button>
            </form>
          </div>
        </aside>
      </div>
    </>
  );
}
