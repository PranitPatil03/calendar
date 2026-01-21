'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateYearDays, DayData, getDaysInYear, getProgressPercentage } from '@/lib/calendar-utils';
import { QuoteDisplay } from './quote-display';

// Animated number for time display
function AnimatedNumber({ value }: { value: string }) {
    return (
        <span className="relative inline-block overflow-hidden tabular-nums" style={{ height: '1.15em' }}>
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    key={value}
                    initial={{ y: '100%' }}
                    animate={{ y: '0%' }}
                    exit={{ y: '-100%' }}
                    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                    className="block"
                >
                    {value}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}

// Calculate correct day of year (1-based)
function getDayOfYear(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

// Calculate current week of year
function getWeekOfYear(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
}

// Inline Clock Component
function InlineClock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const dayName = time.toLocaleDateString('en-US', { weekday: 'long' });
    const monthDay = time.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const year = time.getFullYear();

    const hours = time.getHours();
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const seconds = time.getSeconds().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = (hours % 12 || 12).toString().padStart(2, '0');

    return (
        <div className="flex flex-col items-center py-6 align-baseline">
            {/* Time - Aligned to baseline manually */}
            <div className="flex items-end gap-1 align-baseline">
                <span className="text-5xl font-extralight text-white tracking-tight leading-none">
                    <AnimatedNumber value={displayHours} />
                </span>
                <span className="text-5xl font-extralight text-white leading-none mb-4">:</span>
                <span className="text-5xl font-extralight text-white tracking-tight leading-none">
                    <AnimatedNumber value={minutes} />
                </span>
                <span className="text-3xl font-light text-neutral-500 leading-none mb-4">
                    :
                </span>
                <span className="text-3xl font-light text-neutral-500 tracking-tight leading-none mb-2">
                    <AnimatedNumber value={seconds} />
                </span>
                <span className="text-lg text-neutral-500 leading-none mb-4">{period}</span>
            </div>
            {/* Date - Bold and smaller below */}
            <div className="flex items-center gap-2 text-base mt-2">
                <span className="text-orange-500 font-semibold">{dayName}</span>
                <span className="text-neutral-600">·</span>
                <span className="text-white font-semibold">{monthDay}, {year}</span>
            </div>
            {/* Quote Display - Below date */}
            <div className="mt-3 max-w-lg">
                <QuoteDisplay />
            </div>
        </div>
    );
}

interface YearCalendarProps {
    year?: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function YearCalendar({ year = new Date().getFullYear() }: YearCalendarProps) {
    const [cellSize, setCellSize] = useState(10);
    const [cellGap, setCellGap] = useState(3);

    const days = generateYearDays(year);
    const daysLived = getDayOfYear();
    const currentWeek = getWeekOfYear();
    const totalDays = getDaysInYear(year);
    const progress = getProgressPercentage(daysLived, totalDays);
    const daysRemaining = totalDays - daysLived;

    // Group by months
    const groupedDays = (() => {
        const months: DayData[][] = Array.from({ length: 12 }, () => []);
        days.forEach(day => months[day.month].push(day));
        return months;
    })();

    useEffect(() => {
        const calculateSize = () => {
            const headerHeight = 220; // Increased to account for quote
            const footerHeight = 60;
            const padding = 64;
            const availableHeight = window.innerHeight - headerHeight - footerHeight - padding;
            const availableWidth = window.innerWidth - padding;

            const size = Math.min((availableWidth - 48) / 4 / 7 - 3, (availableHeight - 32) / 3 / 6 - 3, 14);
            setCellSize(Math.max(6, Math.floor(size)));
            setCellGap(size > 8 ? 3 : 2);
        };

        calculateSize();
        window.addEventListener('resize', calculateSize);
        return () => window.removeEventListener('resize', calculateSize);
    }, []);

    const getDayColor = (day: DayData) => {
        if (day.status === 'current') return '#f97316';
        if (day.status === 'past') return '#e5e5e5';
        return '#404040';
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Spacer */}
            <div className="h-2"></div>

            {/* Time and Date and Quote - Centered */}
            <InlineClock />

            {/* Calendar Grid - Months Only */}
            <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
                <div className="grid grid-cols-4 gap-4">
                    {groupedDays.map((monthDays, monthIndex) => (
                        <motion.div
                            key={monthIndex}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: monthIndex * 0.02 }}
                            className="flex flex-col items-center"
                        >
                            <span className="text-[10px] text-neutral-500 mb-2">{MONTHS[monthIndex]}</span>
                            <div
                                className="grid grid-cols-7"
                                style={{ gap: `${cellGap}px` }}
                            >
                                {monthDays.map((day) => (
                                    <div
                                        key={day.index}
                                        style={{
                                            width: `${cellSize}px`,
                                            height: `${cellSize}px`,
                                            backgroundColor: getDayColor(day),
                                        }}
                                        className="rounded-full"
                                    />
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Footer Stats with Week Info */}
            <div className="flex-shrink-0 text-center py-3">
                <p className="text-sm text-neutral-400">
                    <span className="text-orange-500 font-medium">{progress.toFixed(1)}% complete</span>
                    <span className="mx-2 text-neutral-600">·</span>
                    <span>Week {currentWeek}</span>
                    <span className="mx-2 text-neutral-600">·</span>
                    <span>Day {daysLived} of {totalDays}</span>
                    <span className="mx-2 text-neutral-600">·</span>
                    <span>{daysRemaining} days left</span>
                </p>
            </div>
        </div>
    );
}
