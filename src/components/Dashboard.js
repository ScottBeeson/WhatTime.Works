'use client';

import { useState } from 'react';
import { formatDay } from '@/lib/date-utils';
import { parseISO, format, parse } from 'date-fns';

export default function Dashboard({ initialEvent }) {
    const [event, setEvent] = useState(initialEvent);
    const [inviteeName, setInviteeName] = useState('');
    const [generatedLink, setGeneratedLink] = useState(null);
    const [loading, setLoading] = useState(false);

    // Helper to parse slot string: "2025-12-27 06:30 PM" or ISO
    const parseSlot = (slotStr) => {
        try {
            // Try standard ISO first if it contains T (e.g. 2023-01-01T12:00:00)
            if (slotStr.includes('T')) return parseISO(slotStr);
            // Parse custom format "2025-12-27 06:30 PM"
            return parse(slotStr, 'yyyy-MM-dd h:mm a', new Date());
        } catch (e) {
            console.error('Error parsing slot:', slotStr, e);
            return new Date(); // Fallback
        }
    };

    const validDates = event.dates ? event.dates.sort() : (event.timeBlocks ? [...new Set(event.timeBlocks.map(tb => tb.date))].sort() : []);

    // Calculate stats
    const totalResponses = event.responses ? event.responses.length : 0;

    // Calculate Best Time
    const slotCounts = {};
    event.responses?.forEach(r => {
        r.availability.forEach(slot => {
            slotCounts[slot] = (slotCounts[slot] || 0) + 1;
        });
    });

    // Find slot(s) with max count
    let bestTime = null;
    let maxCount = 0;
    Object.entries(slotCounts).forEach(([slot, count]) => {
        if (count > maxCount) {
            maxCount = count;
            bestTime = slot;
        }
    });

    const getParticipantsForSlot = (slot) => {
        return event.responses
            ?.filter(r => r.availability.includes(slot))
            .map(r => r.name) || [];
    };

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
                    <div className="between row">
                        <h2>Availability Tracker</h2>
                        <div className="badge" style={{ background: 'var(--surface-active)', color: 'var(--foreground)' }}>
                            {totalResponses} Response{totalResponses !== 1 ? 's' : ''}
                        </div>
                    </div>

                    {(!event.responses || event.responses.length === 0) ? (
                        <div className="card text-center" style={{ padding: '3rem' }}>
                            <p style={{ opacity: 0.5 }}>No responses yet. Share the invite link to get started!</p>
                        </div>
                    ) : (
                        <div className="stack" style={{ gap: '2rem' }}>
                            {/* Best Time Recommendation */}
                            {bestTime && (
                                <div className="card" style={{ background: 'linear-gradient(to right, var(--surface), var(--background))', border: '1px solid var(--primary)' }}>
                                    <p className="text-sm" style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>🌟 Recommendation</p>
                                    <div className="row" style={{ gap: '2rem' }}>
                                        <div>
                                            <p className="text-sm" style={{ opacity: 0.7 }}>Best Time</p>
                                            <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                                                {format(parseSlot(bestTime), 'EEEE, MMM d')} at {format(parseSlot(bestTime), 'h:mm a')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm" style={{ opacity: 0.7 }}>Availability</p>
                                            <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                                                {maxCount} / {totalResponses} people
                                            </p>
                                        </div>
                                    </div>
                                    <div className="row" style={{ marginTop: '1rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {getParticipantsForSlot(bestTime).map(name => (
                                            <span key={name} style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', background: '#dcfce7', color: '#166534', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                                                {name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Detailed List */}
                            <div className="stack" style={{ gap: '1.5rem' }}>
                                {validDates.map(date => {
                                    // Get all unique slots for this day from responses
                                    // Or better, show all slots that have at least one person? 
                                    const dayPrefix = date.split('T')[0];
                                    const slotsForDay = Object.keys(slotCounts)
                                        .filter(slot => slot.startsWith(dayPrefix))
                                        .sort((a, b) => parseSlot(a) - parseSlot(b));

                                    if (slotsForDay.length === 0) return null;

                                    return (
                                        <div key={date} className="card stack" style={{ gap: '1rem' }}>
                                            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                                                {format(parseISO(date), 'EEEE, MMMM d')}
                                            </h3>
                                            <div className="stack" style={{ gap: '0.5rem' }}>
                                                {slotsForDay.map(slot => {
                                                    const count = slotCounts[slot];
                                                    const participants = getParticipantsForSlot(slot);
                                                    const isBest = slot === bestTime;

                                                    // Calculate percentage for visual bar or color intensity if needed
                                                    // For now just list them

                                                    return (
                                                        <div key={slot} className="row" style={{ alignItems: 'flex-start', padding: '0.75rem', background: isBest ? 'var(--surface-hover)' : 'transparent', borderRadius: 'var(--radius)' }}>
                                                            <div style={{ minWidth: '100px', fontWeight: 600 }}>
                                                                {format(parseSlot(slot), 'h:mm a')}
                                                            </div>
                                                            <div className="stack" style={{ flex: 1, gap: '0.5rem' }}>
                                                                <div className="row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                                                                    {participants.map(name => (
                                                                        <span key={name} style={{
                                                                            fontSize: '0.8rem',
                                                                            padding: '0.25rem 0.75rem',
                                                                            background: 'var(--surface-active)',
                                                                            borderRadius: '12px',
                                                                            border: '1px solid var(--border)'
                                                                        }}>
                                                                            {name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                                <div style={{ height: '4px', background: 'var(--surface)', borderRadius: '2px', width: '100%', maxWidth: '200px', overflow: 'hidden' }}>
                                                                    <div style={{ height: '100%', width: `${(count / totalResponses) * 100}%`, background: isBest ? 'var(--primary)' : 'var(--foreground)', opacity: isBest ? 1 : 0.3 }}></div>
                                                                </div>
                                                            </div>
                                                            <div style={{ fontSize: '0.9rem', opacity: 0.7, whiteSpace: 'nowrap' }}>
                                                                {count} / {totalResponses}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}
