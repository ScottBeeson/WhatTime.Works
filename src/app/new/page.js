'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getNextDays, formatDay } from '@/lib/date-utils';
import { startOfToday, addDays, format, isSameDay } from 'date-fns';

export default function NewEvent() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        organizer: '',
        dates: []
    });
    const [loading, setLoading] = useState(false);

    // Generate next 14 days for selection
    const days = [];
    const today = startOfToday();
    for (let i = 0; i < 14; i++) {
        days.push(addDays(today, i));
    }

    const toggleDate = (date) => {
        const dateStr = date.toISOString();
        const exists = formData.dates.includes(dateStr);
        if (exists) {
            setFormData({ ...formData, dates: formData.dates.filter(d => d !== dateStr) });
        } else {
            setFormData({ ...formData, dates: [...formData.dates, dateStr].sort() });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.organizer || formData.dates.length === 0) return;

        setLoading(true);
        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.id) {
                router.push(`/event/${data.id}`);
            }
        } catch (err) {
            alert('Error creating event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="container" style={{ maxWidth: '600px', paddingTop: '4rem' }}>
            <div className="stack" style={{ gap: '2rem' }}>
                <div className="text-center">
                    <h1 style={{ fontSize: '2rem' }}>Create New Event</h1>
                    <p className="text-sm">Step {step} of 2</p>
                </div>

                {step === 1 && (
                    <div className="card stack animate-in">
                        <div className="stack">
                            <label className="text-sm" style={{ fontWeight: 600 }}>Event Title</label>
                            <input
                                className="input"
                                placeholder="e.g. Q3 Roadmap Planning"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                autoFocus
                            />
                        </div>
                        <div className="stack">
                            <label className="text-sm" style={{ fontWeight: 600 }}>Your Name</label>
                            <input
                                className="input"
                                placeholder="To let invitees know who you are"
                                value={formData.organizer}
                                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                            />
                        </div>
                        <button
                            className="btn btn-primary"
                            disabled={!formData.title || !formData.organizer}
                            onClick={() => setStep(2)}
                            style={{ marginTop: '1rem' }}
                        >
                            Next: Select Dates
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="card stack animate-in">
                        <div className="stack" style={{ gap: '0.5rem' }}>
                            <label className="text-sm" style={{ fontWeight: 600 }}>Which dates might work?</label>
                            <p className="text-sm" style={{ opacity: 0.7 }}>Select a few options.</p>
                        </div>

                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
                            {days.map((date) => {
                                const isSelected = formData.dates.includes(date.toISOString());
                                return (
                                    <button
                                        key={date.toISOString()}
                                        type="button"
                                        onClick={() => toggleDate(date)}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: 'var(--radius)',
                                            border: '1px solid',
                                            borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                                            background: isSelected ? 'var(--primary)' : 'transparent',
                                            color: isSelected ? 'white' : 'var(--foreground)',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            transition: 'all 0.2s ease',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        <div style={{ fontWeight: 'bold', fontSize: '0.8rem', opacity: isSelected ? 0.9 : 0.6 }}>{format(date, 'EEE')}</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{format(date, 'd')}</div>
                                        <div style={{ fontSize: '0.75rem', opacity: isSelected ? 0.9 : 0.6 }}>{format(date, 'MMM')}</div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="row between" style={{ marginTop: '1rem' }}>
                            <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSubmit}
                                disabled={loading || formData.dates.length === 0}
                            >
                                {loading ? 'Creating...' : 'Create Event'}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}
