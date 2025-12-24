'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EventCreationLoader({ eventId }) {
    const router = useRouter();
    const [status, setStatus] = useState('Creating your event...');
    const [attempts, setAttempts] = useState(0);

    useEffect(() => {
        let isMounted = true;
        const checkEvent = async () => {
            try {
                const res = await fetch(`/api/events/${eventId}`);
                if (res.ok) {
                    if (isMounted) {
                        setStatus('Event created! Redirecting...');
                        router.push(`/event/${eventId}`);
                        router.refresh();
                    }
                    return true;
                }
            } catch (e) {
                console.error("Error checking event:", e);
            }
            return false;
        };

        const interval = setInterval(async () => {
            const found = await checkEvent();
            if (found) clearInterval(interval);
        }, 2000);

        // Initial check immediately
        checkEvent();

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [eventId, router]);

    return (
        <div className="container" style={{
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
        }}>
            <div className="spinner" style={{
                width: '40px',
                height: '40px',
                border: '4px solid rgba(0,0,0,0.1)',
                borderTopColor: 'var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '1.5rem'
            }}></div>
            <style jsx global>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
            <h1>{status}</h1>
            <p className="text-muted" style={{ marginTop: '1rem', maxWidth: '400px' }}>
                This might take a minute or two.
            </p>
        </div>
    );
}
