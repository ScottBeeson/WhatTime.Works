import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request, { params }) {
    // Await params in Next.js 15+
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const event = db.getEvent(id);

    if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json(event);
}
