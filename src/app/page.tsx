'use client';

import { useState, useEffect } from 'react';
import { CalendarGrid } from '@/components/calendar-grid';
import { loadCalendarData, saveCalendarData, CalendarData, updateBirthdate } from '@/lib/storage';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);

  // Load saved data on mount - always returns valid data (with defaults if none saved)
  useEffect(() => {
    const data = loadCalendarData();
    setCalendarData(data);
    setIsLoading(false);
  }, []);

  const handleUpdateBirthdate = (birthdate: Date, lifeExpectancy: number) => {
    updateBirthdate(birthdate, lifeExpectancy);
    const updated = loadCalendarData();
    setCalendarData(updated);
  };

  const handleNotesUpdate = (notes: Record<number, { text: string; category?: string; eventName?: string }>) => {
    if (!calendarData) return;
    const updated = { ...calendarData, notes };
    saveCalendarData(updated);
    setCalendarData(updated);
  };

  // Show loading spinner briefly
  if (isLoading || !calendarData) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show calendar directly - no setup screen needed
  return (
    <CalendarGrid
      birthdate={new Date(calendarData.birthdate)}
      lifeExpectancy={calendarData.lifeExpectancy}
      notes={calendarData.notes}
      onUpdateBirthdate={handleUpdateBirthdate}
      onNotesUpdate={handleNotesUpdate}
    />
  );
}
