"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";
import { inputClass, primaryBtn } from "@/lib/format";
import { ArrowLeftIcon, CheckIcon } from "@/components/Icons";

const PERKS = [
  "Публикуется сразу после создания",
  "Лимит мест считается автоматически",
  "Один email — одна запись на событие",
];

export default function CreateEventPage() {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [maxSeats, setMaxSeats] = useState(10);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [description, setDescription] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description.trim() || null,
          startTime: new Date(startTime).toISOString(),
          maxSeats: Number(maxSeats),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Не удалось создать событие");

      router.push(`/events/${data.id}`);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:py-14">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-navy-900"
      >
        <ArrowLeftIcon className="h-4 w-4" /> Все события
      </Link>

      <div className="mt-6 grid overflow-hidden rounded-3xl bg-white shadow-xl shadow-blue-900/10 ring-1 ring-slate-200 md:grid-cols-[2fr_3fr]">
        <div className="relative overflow-hidden bg-navy-900 p-8 text-white">
          <div className="bg-dots absolute inset-0 opacity-40" />
          <div className="absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-blue-500/40 blur-3xl" />
          <div className="relative space-y-6">
            <h1 className="text-3xl font-extrabold leading-tight">
              Создать мероприятие
            </h1>
            <p className="text-sm text-slate-300">
              Укажите название, время и количество мест — остальное сделает
              EventFlow.
            </p>
            <ul className="space-y-3 text-sm">
              {PERKS.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-slate-200">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-400/20 text-sky-300">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-8">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Название
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Например, Frontend Meetup"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Описание
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="О чём событие (необязательно)"
              className={inputClass}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Дата и время
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Максимум мест
              </label>
              <input
                type="number"
                value={maxSeats}
                onChange={(e) => setMaxSeats(Number(e.target.value))}
                min={1}
                required
                className={inputClass}
              />
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`${primaryBtn} w-full py-3`}
          >
            {submitting ? "Создаём…" : "Создать событие"}
          </button>
        </form>
      </div>
    </div>
  );
}
