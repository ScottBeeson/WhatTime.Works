import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

function readDb() {
    if (!fs.existsSync(DB_PATH)) {
        return { events: {} };
    }
    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // If error reading, return empty
        return { events: {} };
    }
}

function writeDb(data) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export const db = {
    createEvent: (data) => {
        const dbData = readDb();
        const id = uuidv4();
        const event = {
            id,
            created_at: new Date().toISOString(),
            title: data.title,
            organizer: data.organizer,
            dates: data.dates || [], // Array of ISO strings (YYYY-MM-DD)
            timeRange: data.timeRange || { start: '09:00', end: '17:00' },
            responses: [],
            invitees: []
        };
        dbData.events[id] = event;
        writeDb(dbData);
        return event;
    },

    getEvent: (id) => {
        const dbData = readDb();
        return dbData.events[id] || null;
    },

    createInvite: (eventId, name) => {
        const dbData = readDb();
        const event = dbData.events[eventId];
        if (!event) throw new Error('Event not found');

        const inviteId = uuidv4();
        const invite = { id: inviteId, name, eventId };

        if (!event.invitees) event.invitees = [];
        event.invitees.push(invite);

        writeDb(dbData);
        return invite;
    },

    getInvite: (inviteId) => {
        const dbData = readDb();
        for (const eventId in dbData.events) {
            const event = dbData.events[eventId];
            const invite = event.invitees?.find(i => i.id === inviteId);
            if (invite) return { ...invite, event };
        }
        return null;
    },

    respond: (eventId, inviteId, availability) => {
        const dbData = readDb();
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

        writeDb(dbData);
        return true;
    }
};
