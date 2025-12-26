import { db } from '@/lib/db';
import Dashboard from '@/components/Dashboard';

import { notFound } from 'next/navigation';

export default async function EventPage({ params }) {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    // Don't await db call here if we want to potentially show loader on client.
    // Actually we keep server logic: try fetch.
    const event = await db.getEvent(id);

    if (!event) {
        notFound();
    }

    return <Dashboard initialEvent={event} />;
}
