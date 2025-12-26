import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function runTest() {
    console.log("Starting verification...");

    // Dynamic import to ensure env vars are loaded first
    const { db } = await import('../src/lib/db.js');

    const eventId = uuidv4();
    const title = "Test Event";
    const organizer = "Test Organizer";

    console.log(`Creating event ${eventId}...`);
    try {
        const createdEvent = await db.createEvent({
            title,
            organizer
        });
        console.log("Event created:", createdEvent.id);

        // Create Invite
        console.log(`Creating invite...`);
        const invite = await db.createInvite(createdEvent.id, "Test User");
        console.log("Invite created:", invite.id);

        // Respond
        const availability = ["2024-01-01T10:00"];
        console.log("Responding...");
        await db.respond(createdEvent.id, invite.id, availability);
        console.log("Response submitted.");

        // Read back
        console.log("Reading back event...");
        const fetchedEvent = await db.getEvent(createdEvent.id);

        const response = fetchedEvent.responses.find(r => r.inviteId === invite.id);
        if (response && response.availability[0] === "2024-01-01T10:00") {
            console.log("Verification SUCCESS: Retrieved correct response data.");
        } else {
            console.error("Verification FAILED: Data mismatch.", fetchedEvent);
        }

    } catch (err) {
        console.error("Verification Failed:", err);
    }
}

runTest();
