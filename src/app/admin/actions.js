'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function deleteEventAction(id) {
    if (!id) return { success: false, error: 'Event ID required' };

    try {
        await db.deleteEvent(id);
        revalidatePath('/admin');
        return { success: true };
    } catch (e) {
        console.error('Error deleting event:', e);
        return { success: false, error: 'Failed to delete event' };
    }
}
