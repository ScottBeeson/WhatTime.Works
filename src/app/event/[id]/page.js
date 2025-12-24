import { db } from '@/lib/db';
import Dashboard from '@/components/Dashboard';

export default async function EventPage({ params }) {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const event = await db.getEvent(id);

    if (!event) {
        return (
            <div className="container text-center" style={{ paddingTop: '4rem' }}>
                <h1>Event Not Found</h1>
                <p>This event does not exist or has been deleted.</p>
            </div>
        );
    }

    return <Dashboard initialEvent={event} />;
}
