import Link from 'next/link';

export default function EventNotFound() {
    return (
        <main className="container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div className="stack" style={{ gap: '2rem', alignItems: 'center', textAlign: 'center', maxWidth: '600px' }}>

                <h1 style={{ fontSize: '6rem', lineHeight: 1, color: 'var(--primary)', fontWeight: 800 }}>404</h1>

                <div className="stack" style={{ gap: '1rem' }}>
                    <h2 style={{ fontSize: '2rem' }}>Event Not Found</h2>
                    <p style={{ fontSize: '1.2rem', opacity: 0.7 }}>
                        The event you are looking for does not exist or has been removed.
                    </p>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <Link href="/" className="btn btn-primary" style={{ padding: '1rem 2rem', borderRadius: '50px' }}>
                        Create New Event
                    </Link>
                </div>

            </div>
        </main>
    );
}
