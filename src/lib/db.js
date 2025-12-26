import { turso } from './turso.js';
import { v4 as uuidv4 } from 'uuid';

export const db = {
    createEvent: async (data) => {
        const id = uuidv4();
        const created_at = new Date().toISOString();
        const { title, organizer, timeBlocks = [] } = data;

        await turso.execute({
            sql: "INSERT INTO events (id, title, organizer, created_at) VALUES (?, ?, ?, ?)",
            args: [id, title, organizer, created_at]
        });

        for (const block of timeBlocks) {
            await turso.execute({
                sql: "INSERT INTO time_blocks (event_id, date, start_time, end_time) VALUES (?, ?, ?, ?)",
                args: [id, block.date, block.startTime, block.endTime]
            });
        }

        return {
            id,
            created_at,
            title,
            organizer,
            timeBlocks,
            responses: [],
            invitees: []
        };
    },

    getEvent: async (id) => {
        const eventResult = await turso.execute({
            sql: "SELECT * FROM events WHERE id = ?",
            args: [id]
        });

        if (eventResult.rows.length === 0) return null;
        const event = eventResult.rows[0];

        const timeBlocksResult = await turso.execute({
            sql: "SELECT date, start_time as startTime, end_time as endTime FROM time_blocks WHERE event_id = ?",
            args: [id]
        });

        const invitesResult = await turso.execute({
            sql: "SELECT * FROM invites WHERE event_id = ?",
            args: [id]
        });

        const responsesResult = await turso.execute({
            sql: `
                SELECT r.*, i.name, i.id as inviteId 
                FROM responses r 
                JOIN invites i ON r.invite_id = i.id 
                WHERE i.event_id = ?
            `,
            args: [id]
        });

        return {
            ...event,
            timeBlocks: timeBlocksResult.rows.map(r => ({ ...r })),
            invitees: invitesResult.rows.map(r => ({ ...r })),
            responses: responsesResult.rows.map(r => ({
                ...r,
                availability: JSON.parse(r.availability)
            }))
        };
    },

    createInvite: async (eventId, name) => {
        const inviteId = uuidv4();

        // ensure event exists
        const eventResult = await turso.execute({
            sql: "SELECT id FROM events WHERE id = ?",
            args: [eventId]
        });
        if (eventResult.rows.length === 0) throw new Error('Event not found');

        await turso.execute({
            sql: "INSERT INTO invites (id, event_id, name) VALUES (?, ?, ?)",
            args: [inviteId, eventId, name]
        });

        return { id: inviteId, name, eventId };
    },

    getInvite: async (inviteId) => {
        const inviteResult = await turso.execute({
            sql: "SELECT * FROM invites WHERE id = ?",
            args: [inviteId]
        });

        if (inviteResult.rows.length === 0) return null;
        const invite = inviteResult.rows[0];

        // Fetch event data to return structure { ...invite, event: { ... } }
        const eventData = await db.getEvent(invite.event_id);

        return {
            ...invite,
            event: eventData
        };
    },

    respond: async (eventId, inviteId, availability) => {
        // verify event and invite exist (optional but good practice)
        // For now, simpler: just upsert response
        const updated_at = new Date().toISOString();

        await turso.execute({
            sql: `
                INSERT INTO responses (invite_id, availability, updated_at) 
                VALUES (?, ?, ?)
                ON CONFLICT(invite_id) DO UPDATE SET
                availability = excluded.availability,
                updated_at = excluded.updated_at
            `,
            args: [inviteId, JSON.stringify(availability), updated_at]
        });

        return true;
    }
};
