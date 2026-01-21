// LocalStorage utilities for persisting calendar data

import { CalendarData } from './calendar-utils';
export type { CalendarData } from './calendar-utils';

const STORAGE_KEY = 'life-calendar-data';

export function saveCalendarData(data: CalendarData): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadCalendarData(): CalendarData | null {
    if (typeof window === 'undefined') return null;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    try {
        return JSON.parse(stored) as CalendarData;
    } catch {
        return null;
    }
}

export function clearCalendarData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
}

export function updateNote(
    weekIndex: number,
    text: string,
    category?: string,
    eventName?: string
): void {
    const data = loadCalendarData();
    if (!data) return;

    if (!data.notes) {
        data.notes = {};
    }

    if (text.trim() === '' && !eventName) {
        delete data.notes[weekIndex];
    } else {
        data.notes[weekIndex] = { text, category, eventName };
    }

    saveCalendarData(data);
}

export function getNote(weekIndex: number): { text: string; category?: string; eventName?: string } | null {
    const data = loadCalendarData();
    if (!data?.notes) return null;
    return data.notes[weekIndex] || null;
}
