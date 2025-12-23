'use client';

import { useState, useMemo } from 'react';
import { format, parseISO, parse, isBefore, isAfter, isEqual, addMinutes, startOfDay } from 'date-fns'; // Added imports
import { generateTimeSlots } from '@/lib/date-utils';

export default function ParticipantView({ invite, event }) {
    const [availability, setAvailability] = useState([]); // Array of "YYYY-MM-DD THH:MM" strings? Or "YYYY-MM-DD HH:MM"
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Support for timeBlocks
    const { validDates, timeSlots, isSlotValid } = useMemo(() => {
        if (!event.timeBlocks) {
            // Fallback for old events (if any) or empty
            return { validDates: [], timeSlots: [], isSlotValid: () => false };
        }

        const dates = [...new Set(event.timeBlocks.map(b => b.date))].sort();

        // Find global min start and max end
        let globalStart = new Date();
        globalStart.setHours(23, 59, 0, 0);
        let globalEnd = new Date();
        globalEnd.setHours(0, 0, 0, 0);

        const parseTime = (tStr, baseDate) => {
            return parse(tStr, 'hh:mm a', baseDate);
        };

        const today = startOfDay(new Date());

        event.timeBlocks.forEach(block => {
            const start = parseTime(block.startTime, today);
            const end = parseTime(block.endTime, today);
            if (isBefore(start, globalStart)) globalStart = start;
            if (isAfter(end, globalEnd)) globalEnd = end;
        });

        // Generate slots from globalStart to globalEnd
        const slots = [];
        let current = globalStart;
        while (isBefore(current, globalEnd)) {
            slots.push(format(current, 'hh:mm a'));
            current = addMinutes(current, 30);
        }

        // Helper to check validity
        const checkValidity = (dateStr, timeStr) => {
            const block = event.timeBlocks.find(b => b.date === dateStr); // Assumption: 1 block per day for MVP, or filter
            if (!block) return false;

            // Handle multiple blocks per day? The UI allows adding multiple.
            // So we need to check if ANY block on that date covers this time.
            const dayBlocks = event.timeBlocks.filter(b => b.date === dateStr);
            const slotTime = parse(timeStr, 'hh:mm a', today);

            return dayBlocks.some(b => {
                const s = parse(b.startTime, 'hh:mm a', today);
                const e = parse(b.endTime, 'hh:mm a', today);
                // Valid if slotTime >= start && slotTime < end
                return (isAfter(slotTime, s) || isEqual(slotTime, s)) && isBefore(slotTime, e);
            });
        };

        return { validDates: dates, timeSlots: slots, isSlotValid: checkValidity };

    }, [event]);

    const toggleSlot = (dateStr, timeStr) => {
        // timeStr is "9:00 AM"
        // Convert to logic string: "YYYY-MM-DD HH:MM" ? 
        // Or keep distinct inputs.
        // Let's store "YYYY-MM-DD::TimeLabel" for uniqueness
        const composite = `${dateStr}::${timeStr}`;
        if (availability.includes(composite)) {
            setAvailability(availability.filter(a => a !== composite));
        } else {
            setAvailability([...availability, composite]);
        }
    };

    // For drag select? MVP: Click.

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            // Need to convert availability to array of strings used in backend?
            // Backend stored array. I'll just store the composite strings or standardized ISO relative to date?
            // "2023-10-01T09:00"
            // timeSlots are labels "9:00 AM". I need to parse back or just store labels if consistent.
            // Let's store labels if consistent. But better: "2023-10-01 09:00 AM"
            const formatted = availability.map(a => {
                const [d, t] = a.split('::');
                return `${d} ${t}`; // "2023-10-01 9:00 AM"
            });

            await fetch('/api/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId: event.id,
                    inviteId: invite.id,
                    availability: formatted
                })
            });
            setSubmitted(true);
        } catch (e) {
            alert('Error submitting');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <main className="container text-center" style={{ paddingTop: '4rem' }}>
                <div className="card stack" style={{ alignItems: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '3rem', color: 'green' }}>✓</div>
                    <h1>You're all set, {invite.name}!</h1>
                    <p>Your availability has been recorded.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="container" style={{ paddingTop: '2rem' }}>
            <div className="stack" style={{ gap: '2rem' }}>
                <div className="text-center">
                    <p className="text-sm">You are invited to</p>
                    <h1 style={{ fontSize: '2rem' }}>{event.title}</h1>
                    <p className="text-sm">by {event.organizer}</p>
                    <div style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'var(--surface)', borderRadius: '50px', display: 'inline-block' }}>
                        👋 Hi, <strong>{invite.name}</strong>
                    </div>
                </div>

                <div className="card stack">
                    <div className="between row">
                        <h2>Select your availability</h2>
                        <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Click slots to select</div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: `auto repeat(${validDates.length}, minmax(100px, 1fr))`, gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                            <div style={{ background: 'var(--surface)', padding: '1rem' }}></div>
                            {validDates.map(d => (
                                <div key={d} style={{ background: 'var(--surface)', padding: '1rem', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>
                                    {format(parseISO(d), 'EEE MMM d')}
                                </div>
                            ))}

                            {/* Time Rows */}
                            {timeSlots.map(time => (
                                <>
                                    <div key={time} style={{ background: 'var(--background)', padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: '#888' }}>
                                        {time}
                                    </div>
                                    {validDates.map(date => {
                                        const composite = `${date}::${time}`;
                                        const isSelected = availability.includes(composite);
                                        const valid = isSlotValid(date, time);

                                        if (!valid) {
                                            return (
                                                <div
                                                    key={composite}
                                                    style={{
                                                        background: 'var(--border)', // visually disabled
                                                        opacity: 0.3,
                                                        borderRight: '1px solid #ddd',
                                                        borderBottom: '1px solid #ddd'
                                                    }}
                                                />
                                            );
                                        }

                                        return (
                                            <div
                                                key={composite}
                                                onClick={() => toggleSlot(date, time)}
                                                style={{
                                                    background: isSelected ? 'var(--primary)' : 'var(--background)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.1s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRight: '1px solid var(--border)',
                                                    borderBottom: '1px solid var(--border)'
                                                }}
                                            >
                                                {isSelected && <span style={{ color: 'white', fontSize: '0.7rem' }}>✓</span>}
                                            </div>
                                        );
                                    })}
                                </>
                            ))}
                        </div>
                    </div>

                    <div className="row" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || availability.length === 0}>
                            {submitting ? 'Submitting...' : 'Submit Availability'}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
