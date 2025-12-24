import { put, list } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';

const DB_FILENAME = 'db.json';

async function readDb() {
    try {
        const { blobs } = await list();
        const blob = blobs.find(b => b.pathname === DB_FILENAME);
        if (!blob) {
            return { events: {} };
        }
        const response = await fetch(blob.url, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error('Failed to fetch db');
        }
        return await response.json();
    } catch (error) {
        console.error("Error reading db:", error);
        return { events: {} };
    }
}

async function writeDb(data) {
    await put(DB_FILENAME, JSON.stringify(data, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN, // Explicitly pass token if needed, but usually auto-detected
        allowOverwrite: true // Required to update the existing db.json
    });
}

export const db = {
    createEvent: async (data) => {
        const dbData = await readDb();
        const id = uuidv4();
        const event = {
            id,
            created_at: new Date().toISOString(),
            title: data.title,
            organizer: data.organizer,
            timeBlocks: data.timeBlocks || [], // Array of { date, startTime, endTime }
            responses: [],
            invitees: []
        };
        dbData.events[id] = event;
        await writeDb(dbData);
        return event;
    },

    getEvent: async (id) => {
        const dbData = await readDb();
        return dbData.events[id] || null;
    },

    createInvite: async (eventId, name) => {
        const dbData = await readDb();
        const event = dbData.events[eventId];
        if (!event) throw new Error('Event not found');

        const inviteId = uuidv4();
        const invite = { id: inviteId, name, eventId };

        if (!event.invitees) event.invitees = [];
        event.invitees.push(invite);

        await writeDb(dbData);
        return invite;
    },

    getInvite: async (inviteId) => {
        const dbData = await readDb();
        for (const eventId in dbData.events) {
            const event = dbData.events[eventId];
            const invite = event.invitees?.find(i => i.id === inviteId);
            if (invite) return { ...invite, event };
        }
        return null;
    },

    respond: async (eventId, inviteId, availability) => {
        const dbData = await readDb();
        const event = dbData.events[eventId];
        if (!event) throw new Error('Event not found');

        // Update responses
        event.responses = event.responses ? event.responses.filter(r => r.inviteId !== inviteId) : [];

        // Find invitee name
        const invite = event.invitees?.find(i => i.id === inviteId);
        const name = invite ? invite.name : 'Unknown';

        event.responses.push({
            inviteId,
            name,
            availability, // Array of strings e.g. "2023-01-01T10:00"
            updated_at: new Date().toISOString()
        });

        await writeDb(dbData);
        return true;
    }
};
