import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request) {
    try {
        const { eventId, name } = await request.json();
        if (!eventId || !name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        const invite = db.createInvite(eventId, name);
        return NextResponse.json(invite);
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
