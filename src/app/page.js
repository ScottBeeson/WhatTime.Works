import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div className="stack" style={{ gap: '2.5rem', width: '100%', maxWidth: '800px', alignItems: 'center', textAlign: 'center' }}>

        <div className="stack" style={{ gap: '1rem', alignItems: 'center' }}>
          <div className="row" style={{ alignItems: 'center', gap: '1rem' }}>
            <Image
              src="/logo.png"
              alt="WhatTime.Works Logo"
              width={80}
              height={80}
              className="object-contain"
            />
            <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', letterSpacing: '-0.05em', lineHeight: 1, margin: 0 }}>
              WhatTime<span style={{ color: 'var(--primary)' }}>.Works</span>
            </h1>
          </div>
          <p style={{ fontSize: '1.25rem', color: 'var(--foreground)', opacity: 0.7, maxWidth: '500px', margin: '0 auto' }}>
            The simplest way to coordinate meetings. <br />
            Create an event, share the link, find a time.
          </p>
        </div>

        <div className="row" style={{ justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <Link href="/new" className="btn btn-primary" style={{ padding: '1.25rem 2.5rem', fontSize: '1.1rem', borderRadius: '50px' }}>
            Get Started &rarr;
          </Link>
          {/* <Link href="#" className="btn btn-secondary" style={{ padding: '1.25rem 2.5rem', fontSize: '1.1rem', borderRadius: '50px' }}>
            How it works
          </Link> */}
        </div>

        <div style={{ marginTop: '4rem', padding: '2rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', width: '100%' }}>
          <div className="row between" style={{ marginBottom: '1rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c940' }}></div>
            <div style={{ flex: 1 }}></div>
          </div>
          <div className="row" style={{ gap: '2rem', justifyContent: 'center', opacity: 0.8 }}>
            {/* Decorative mock UI */}
            <div className="stack" style={{ alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ddd' }}></div>
              <div style={{ width: '60px', height: '10px', background: '#eee', borderRadius: '4px' }}></div>
            </div>
            <div style={{ fontSize: '2rem', color: 'var(--primary)' }}>➔</div>
            <div className="stack" style={{ alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
              <div style={{ width: '60px', height: '10px', background: '#eee', borderRadius: '4px' }}></div>
            </div>
          </div>
          <p className="text-sm mt-4">100% Free. No Account Needed.</p>
        </div>

      </div>
    </main>
  );
}
