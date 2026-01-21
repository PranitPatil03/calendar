// LocalStorage utilities for persisting calendar data

import { CalendarData } from './calendar-utils';
export type { CalendarData } from './calendar-utils';

const STORAGE_KEY = 'life-calendar-data';

// Default values - November 3, 2002 with 100 year life expectancy
export const DEFAULT_BIRTHDATE = new Date(2002, 10, 3); // Month is 0-indexed, so 10 = November
export const DEFAULT_LIFE_EXPECTANCY = 100;

export function getDefaultCalendarData(): CalendarData {
    return {
        birthdate: DEFAULT_BIRTHDATE.toISOString(),
        lifeExpectancy: DEFAULT_LIFE_EXPECTANCY,
        notes: {},
    };
}

export function saveCalendarData(data: CalendarData): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadCalendarData(): CalendarData {
    if (typeof window === 'undefined') return getDefaultCalendarData();

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultCalendarData();

    try {
        return JSON.parse(stored) as CalendarData;
    } catch {
        return getDefaultCalendarData();
    }
}

export function updateBirthdate(birthdate: Date, lifeExpectancy: number): void {
    const data = loadCalendarData();
    data.birthdate = birthdate.toISOString();
    data.lifeExpectancy = lifeExpectancy;
    saveCalendarData(data);
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
