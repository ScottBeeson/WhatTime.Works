'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { startOfToday, format, parseISO } from 'date-fns';

export default function NewEvent() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        organizer: '',
        timeBlocks: []
    });
    const [currentBlock, setCurrentBlock] = useState({
        date: '',
        startTime: '09:00 AM',
        endTime: '05:00 PM'
    });
    const [loading, setLoading] = useState(false);

    const generateTimeOptions = () => {
        const options = [];
        for (let i = 0; i < 24 * 60; i += 15) {
            const h = Math.floor(i / 60);
            const m = i % 60;
            const d = new Date();
            d.setHours(h, m);
            options.push(format(d, 'hh:mm a'));
        }
        return options;
    };

    const addTimeBlock = () => {
        if (!currentBlock.date) return;
        setFormData({
            ...formData,
            timeBlocks: [...formData.timeBlocks, { ...currentBlock }].sort((a, b) => a.date.localeCompare(b.date))
        });
        // Reset or keep? Let's keep for easy multiple adds on same day
    };

    const removeTimeBlock = (index) => {
        const newBlocks = [...formData.timeBlocks];
        newBlocks.splice(index, 1);
        setFormData({ ...formData, timeBlocks: newBlocks });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.organizer || formData.timeBlocks.length === 0) return;

        setLoading(true);
        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const data = await res.json();
                router.push(`/event/${data.id}`);
            } else {
                throw new Error('Failed to create event');
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
                            <label className="text-sm" style={{ fontWeight: 600 }}>When are you free?</label>
                            <p className="text-sm" style={{ opacity: 0.7 }}>Add dates and time windows.</p>
                        </div>

                        <div className="stack" style={{ gap: '1rem', padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius)' }}>
                            <div className="grid" style={{ gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
                                <div className="stack">
                                    <label className="text-sm">Date</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={currentBlock.date}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setCurrentBlock({ ...currentBlock, date: e.target.value })}
                                    />
                                </div>
                                <div className="stack">
                                    <label className="text-sm">Start</label>
                                    <select
                                        className="input"
                                        value={currentBlock.startTime}
                                        onChange={(e) => setCurrentBlock({ ...currentBlock, startTime: e.target.value })}
                                    >
                                        {generateTimeOptions().map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="stack">
                                    <label className="text-sm">End</label>
                                    <select
                                        className="input"
                                        value={currentBlock.endTime}
                                        onChange={(e) => setCurrentBlock({ ...currentBlock, endTime: e.target.value })}
                                    >
                                        {generateTimeOptions().map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={addTimeBlock}
                                    style={{ height: '42px' }}
                                    disabled={!currentBlock.date}
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        <div className="stack" style={{ gap: '0.5rem' }}>
                            {formData.timeBlocks?.length === 0 && (
                                <p className="text-center text-sm" style={{ opacity: 0.5, padding: '1rem' }}>No times added yet.</p>
                            )}
                            {formData.timeBlocks?.map((block, i) => (
                                <div key={i} className="row between" style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                                    <div className="row" style={{ gap: '1rem' }}>
                                        <div style={{ fontWeight: 600 }}>{format(parseISO(block.date), 'EEE, MMM d')}</div>
                                        <div>{block.startTime} - {block.endTime}</div>
                                    </div>
                                    <button
                                        className="btn"
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: 'red' }}
                                        onClick={() => removeTimeBlock(i)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="row between" style={{ marginTop: '1rem' }}>
                            <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSubmit}
                                disabled={loading || !formData.timeBlocks || formData.timeBlocks.length === 0}
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
