import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request) {
    try {
        const { eventId, inviteId, availability } = await request.json();
        if (!eventId || !inviteId || !Array.isArray(availability)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const result = await db.respond(eventId, inviteId, availability);
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
