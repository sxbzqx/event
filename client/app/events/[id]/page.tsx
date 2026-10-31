import { connection } from 'next/server';
import EventClient from './EventClient';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  await connection();
  
  const { id } = await params;
  return <EventClient eventId={id} />;
}