'use client';

import { useState } from 'react';
import { formatDay } from '@/lib/date-utils';
import { parseISO, format } from 'date-fns';

export default function Dashboard({ initialEvent }) {
    const [event, setEvent] = useState(initialEvent);
    const [inviteeName, setInviteeName] = useState('');
    const [generatedLink, setGeneratedLink] = useState(null);
    const [loading, setLoading] = useState(false);

    const validDates = event.dates ? event.dates.sort() : [];

    const handleCreateInvite = async (e) => {
        e.preventDefault();
        if (!inviteeName) return;
        setLoading(true);
        try {
            const res = await fetch('/api/invites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId: event.id, name: inviteeName })
            });
            const data = await res.json();
            if (data.id) {
                const url = `${window.location.origin}/invite/${data.id}`;
                setGeneratedLink({ name: inviteeName, url });
                setInviteeName('');
            }
        } catch (e) {
            alert('Error creating invite');
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink.url);
            alert('Copied to clipboard!');
        }
    };

    return (
        <main className="container" style={{ paddingTop: '2rem' }}>
            <div className="stack" style={{ gap: '2rem' }}>

                <div className="between row" style={{ alignItems: 'flex-start' }}>
                    <div>
                        <p className="text-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, color: 'var(--primary)' }}>Organizer Dashboard</p>
                        <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>{event.title}</h1>
                        <p className="text-sm">Organized by <span style={{ color: 'var(--foreground)' }}>{event.organizer}</span></p>
                    </div>
                </div>

                <div className="card stack">
                    <h2>Invite Participants</h2>
                    <p className="text-sm">Enter a name to generate a unique invite link.</p>

                    <form onSubmit={handleCreateInvite} className="row" style={{ gap: '1rem', alignItems: 'stretch' }}>
                        <input
                            className="input"
                            style={{ flex: 1 }}
                            placeholder="Participant Name (e.g. Alice)"
                            value={inviteeName}
                            onChange={(e) => setInviteeName(e.target.value)}
                        />
                        <button className="btn btn-primary" disabled={loading || !inviteeName}>
                            {loading ? 'Generating...' : 'Get Link'}
                        </button>
                    </form>

                    {generatedLink && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius)', border: '1px solid var(--primary)' }}>
                            <p className="text-sm" style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Invite Link for {generatedLink.name}:</p>
                            <div className="row">
                                <code style={{ flex: 1, padding: '0.5rem', background: 'var(--background)', borderRadius: '6px', border: '1px solid var(--border)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                    {generatedLink.url}
                                </code>
                                <button className="btn btn-secondary" onClick={copyLink} style={{ padding: '0.5rem 1rem' }}>
                                    Copy
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="stack">
                    <h2>Availability Responses</h2>
                    {(!event.responses || event.responses.length === 0) ? (
                        <div className="card text-center" style={{ padding: '3rem' }}>
                            <p style={{ opacity: 0.5 }}>No responses yet.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border)' }}>Participant</th>
                                        {validDates.map(date => (
                                            <th key={date} style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                                {format(parseISO(date), 'EEE MMM d')}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {event.responses.map(response => (
                                        <tr key={response.inviteId}>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
                                                {response.name}
                                            </td>
                                            {validDates.map(date => {
                                                const slotsForDate = response.availability.filter(slot => slot.startsWith(date.split('T')[0]));
                                                const count = slotsForDate.length;
                                                return (
                                                    <td key={date} style={{ padding: '1rem', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                                                        {count > 0 ? (
                                                            <span style={{ color: '#15803d', display: 'inline-block', padding: '0.25rem 0.5rem', background: '#dcfce7', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                                                                {count} slots
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: '#ccc' }}>-</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}
