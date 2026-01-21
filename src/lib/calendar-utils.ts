// Calendar calculation utilities

export type CalendarViewMode = 'life' | 'year' | 'goal';

export interface WeekData {
  index: number;
  year: number;
  weekInYear: number;
  status: 'past' | 'current' | 'future';
  date: Date;
  note?: string;
  category?: string;
  isLifeEvent?: boolean;
  eventName?: string;
}

export interface DayData {
  index: number;
  date: Date;
  status: 'past' | 'current' | 'future';
  dayOfWeek: number;
  weekOfYear: number;
  month: number;
  note?: string;
  isGoalComplete?: boolean;
}

export interface CalendarData {
  birthdate: string;
  lifeExpectancy: number;
  notes: Record<number, { text: string; category?: string; eventName?: string }>;
  goals?: Record<string, { name: string; color: string; completedDays: number[] }>;
  viewMode?: CalendarViewMode;
}

const MILLISECONDS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export function calculateWeeksLived(birthdate: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - birthdate.getTime();
  return Math.floor(diffMs / MILLISECONDS_PER_WEEK);
}

export function calculateDaysLivedThisYear(): number {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const diffMs = now.getTime() - startOfYear.getTime();
  return Math.floor(diffMs / MILLISECONDS_PER_DAY);
}

export function getDaysInYear(year: number): number {
  return ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 366 : 365;
}

export function getTotalWeeks(lifeExpectancy: number): number {
  return lifeExpectancy * 52;
}

export function getWeekStatus(
  weekIndex: number,
  weeksLived: number
): 'past' | 'current' | 'future' {
  if (weekIndex < weeksLived) return 'past';
  if (weekIndex === weeksLived) return 'current';
  return 'future';
}

export function getDayStatus(
  dayIndex: number,
  daysLived: number
): 'past' | 'current' | 'future' {
  if (dayIndex < daysLived) return 'past';
  if (dayIndex === daysLived) return 'current';
  return 'future';
}

export function weekIndexToDate(birthdate: Date, weekIndex: number): Date {
  const date = new Date(birthdate);
  date.setDate(date.getDate() + weekIndex * 7);
  return date;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function calculateAge(birthdate: Date): { years: number; months: number; weeks: number } {
  const now = new Date();

  let years = now.getFullYear() - birthdate.getFullYear();
  let months = now.getMonth() - birthdate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  const weeksLived = calculateWeeksLived(birthdate);
  const weeks = weeksLived % 52;

  return { years, months, weeks };
}

export function getWeekNumber(weekIndex: number): number {
  return (weekIndex % 52) + 1;
}

export function getYearFromWeekIndex(weekIndex: number): number {
  return Math.floor(weekIndex / 52);
}

export function generateCalendarWeeks(
  birthdate: Date,
  lifeExpectancy: number,
  notes: Record<number, { text: string; category?: string; eventName?: string }>
): WeekData[] {
  const totalWeeks = getTotalWeeks(lifeExpectancy);
  const weeksLived = calculateWeeksLived(birthdate);
  const weeks: WeekData[] = [];

  for (let i = 0; i < totalWeeks; i++) {
    const note = notes[i];
    weeks.push({
      index: i,
      year: getYearFromWeekIndex(i),
      weekInYear: getWeekNumber(i),
      status: getWeekStatus(i, weeksLived),
      date: weekIndexToDate(birthdate, i),
      note: note?.text,
      category: note?.category,
      isLifeEvent: !!note?.eventName,
      eventName: note?.eventName,
    });
  }

  return weeks;
}

export function generateYearDays(year: number): DayData[] {
  const days: DayData[] = [];
  const totalDays = getDaysInYear(year);
  const daysLived = year === new Date().getFullYear() ? calculateDaysLivedThisYear() :
    year < new Date().getFullYear() ? totalDays : 0;

  const startDate = new Date(year, 0, 1);

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    days.push({
      index: i,
      date,
      status: getDayStatus(i, daysLived),
      dayOfWeek: date.getDay(),
      weekOfYear: Math.floor(i / 7),
      month: date.getMonth(),
    });
  }

  return days;
}

export function getProgressPercentage(lived: number, total: number): number {
  return Math.min(100, (lived / total) * 100);
}

export function getQuarterLabel(month: number): string {
  if (month < 3) return 'Q1';
  if (month < 6) return 'Q2';
  if (month < 9) return 'Q3';
  return 'Q4';
}
