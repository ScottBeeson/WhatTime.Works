import { db } from '@/lib/db';
import Dashboard from '@/components/Dashboard';

import EventCreationLoader from '@/components/EventCreationLoader';

export default async function EventPage({ params }) {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    // Don't await db call here if we want to potentially show loader on client.
    // Actually we keep server logic: try fetch.
    const event = await db.getEvent(id);

    if (!event) {
        // If not found, it might be new. Show loader which client-side polls.
        // This handles both "truly not found" (eventually times out)
        // and "just created" (eventually succeeds)
        return <EventCreationLoader eventId={id} />;
    }

    return <Dashboard initialEvent={event} />;
}
