'use client';

import { useState, useEffect } from 'react';
import { SetupScreen } from '@/components/setup-screen';
import { CalendarGrid } from '@/components/calendar-grid';
import { loadCalendarData, saveCalendarData, CalendarData } from '@/lib/storage';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);

  // Load saved data on mount
  useEffect(() => {
    const saved = loadCalendarData();
    if (saved) {
      setCalendarData(saved);
    }
    setIsLoading(false);
  }, []);

  const handleSetupComplete = (birthdate: Date, lifeExpectancy: number) => {
    const data: CalendarData = {
      birthdate: birthdate.toISOString(),
      lifeExpectancy,
      notes: {},
    };
    saveCalendarData(data);
    setCalendarData(data);
  };

  const handleReset = () => {
    setCalendarData(null);
  };

  // Show nothing while loading to prevent flash
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show setup if no saved data
  if (!calendarData) {
    return <SetupScreen onComplete={handleSetupComplete} />;
  }

  // Show calendar
  return (
    <CalendarGrid
      birthdate={new Date(calendarData.birthdate)}
      lifeExpectancy={calendarData.lifeExpectancy}
      notes={calendarData.notes}
      onReset={handleReset}
    />
  );
}
