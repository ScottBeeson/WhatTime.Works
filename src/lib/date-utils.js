import { format, addDays, startOfToday, setHours, setMinutes, parseISO, isSameDay } from 'date-fns';

export function getNextDays(count = 14) {
    const days = [];
    let current = startOfToday();
    for (let i = 0; i < count; i++) {
        days.push(addDays(current, i));
    }
    return days;
}

export function formatDay(date) {
    return format(date, 'EEE, MMM d');
}

export function formatDayFull(date) {
    return format(date, 'EEEE, MMMM d, yyyy');
}

export function generateTimeSlots(startStr = '09:00', endStr = '17:00', intervalMinutes = 30) {
    // Generate times for a generic day
    const [startH, startM] = startStr.split(':').map(Number);
    const [endH, endM] = endStr.split(':').map(Number);

    const slots = [];
    let current = setMinutes(setHours(new Date(), startH), startM);
    const end = setMinutes(setHours(new Date(), endH), endM);

    while (current < end) {
        slots.push(format(current, 'h:mm a'));
        current = new Date(current.getTime() + intervalMinutes * 60000);
    }
    return slots;
}
