import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request) {
    try {
        const data = await request.json();
        if (!data.title || !data.organizer) {
            return NextResponse.json({ error: 'Missing title or organizer' }, { status: 400 });
        }
        const event = db.createEvent(data);
        return NextResponse.json(event);
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
