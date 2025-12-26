import { db } from '@/lib/db';
import { deleteEventAction } from './actions';
import { format } from 'date-fns';

export default async function AdminPage() {
    const events = await db.getAllEvents();

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <div className="between row" style={{ marginBottom: '2rem' }}>
                <h1>Admin Dashboard</h1>
                <div className="text-sm" style={{ opacity: 0.7 }}>
                    {events.length} Event{events.length !== 1 ? 's' : ''}
                </div>
            </div>

            <div className="stack" style={{ gap: '1rem' }}>
                {events.length === 0 ? (
                    <div className="card text-center" style={{ padding: '3rem', opacity: 0.5 }}>
                        No events found.
                    </div>
                ) : (
                    events.map(event => (
                        <div key={event.id} className="card row between" style={{ alignItems: 'center' }}>
                            <div>
                                <h3 style={{ marginBottom: '0.25rem' }}>
                                    <a href={`/event/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }} className="hover-underline">
                                        {event.title}
                                    </a>
                                </h3>
                                <div className="row text-sm" style={{ gap: '1rem', opacity: 0.7 }}>
                                    <span>By {event.organizer}</span>
                                    <span>•</span>
                                    <span>{format(new Date(event.created_at), 'MMM d, yyyy h:mm a')}</span>
                                    {event.response_count !== undefined && (
                                        <>
                                            <span>•</span>
                                            <span>{event.response_count} Response{event.response_count !== 1 ? 's' : ''}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <form action={async () => {
                                'use server';
                                await deleteEventAction(event.id);
                            }}>
                                <button type="submit" className="btn btn-danger" style={{
                                    background: '#fee2e2',
                                    color: '#991b1b',
                                    border: '1px solid #f87171',
                                    fontSize: '0.875rem',
                                    padding: '0.5rem 1rem'
                                }}>
                                    Delete
                                </button>
                            </form>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
