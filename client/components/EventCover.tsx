import { coverFor } from '@/lib/format';

export default function EventCover({
  id,
  className = '',
  children,
}: {
  id: number;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`relative overflow-hidden bg-linear-to-br ${coverFor(id)} ${className}`}>
      <div className="bg-dots absolute inset-0 opacity-60" />
      <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-sky-300/25 blur-2xl" />
      <div className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
