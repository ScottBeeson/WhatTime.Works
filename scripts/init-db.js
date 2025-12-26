import { createClient } from "@libsql/client";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  process.exit(1);
}

const db = createClient({
  url,
  authToken,
});

async function main() {
  console.log("Initializing database...");

  try {
    // Events table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        organizer TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
    console.log("Checked/Created table: events");

    // Time blocks table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS time_blocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id TEXT NOT NULL,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      )
    `);
    console.log("Checked/Created table: time_blocks");

    // Invites table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS invites (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        name TEXT NOT NULL,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      )
    `);
    console.log("Checked/Created table: invites");

    // Responses table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS responses (
        invite_id TEXT PRIMARY KEY,
        availability TEXT NOT NULL, -- JSON string
        updated_at TEXT NOT NULL,
        FOREIGN KEY (invite_id) REFERENCES invites(id) ON DELETE CASCADE
      )
    `);
    console.log("Checked/Created table: responses");

    console.log("Database initialization completed successfully.");
  } catch (err) {
    console.error("Error initializing database:", err);
    process.exit(1);
  }
}

main();
