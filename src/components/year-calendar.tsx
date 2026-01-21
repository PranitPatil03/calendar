'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { generateYearDays, DayData, calculateDaysLivedThisYear, getDaysInYear, getProgressPercentage } from '@/lib/calendar-utils';

type YearViewMode = 'months' | 'weeks' | 'quarters';

interface YearCalendarProps {
    year?: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function YearCalendar({ year = new Date().getFullYear() }: YearCalendarProps) {
    const [viewMode, setViewMode] = useState<YearViewMode>('months');
    const [cellSize, setCellSize] = useState(10);
    const [cellGap, setCellGap] = useState(3);

    const days = useMemo(() => generateYearDays(year), [year]);
    const daysLived = calculateDaysLivedThisYear();
    const totalDays = getDaysInYear(year);
    const progress = getProgressPercentage(daysLived, totalDays);
    const daysRemaining = totalDays - daysLived;

    // Group by view mode
    const groupedDays = useMemo(() => {
        if (viewMode === 'months') {
            // 12 months, each with its days
            const months: DayData[][] = Array.from({ length: 12 }, () => []);
            days.forEach(day => {
                months[day.month].push(day);
            });
            return months;
        } else if (viewMode === 'quarters') {
            // 4 quarters
            const quarters: DayData[][] = [[], [], [], []];
            days.forEach(day => {
                const q = Math.floor(day.month / 3);
                quarters[q].push(day);
            });
            return quarters;
        } else {
            // weeks view - show 52 weeks as individual cells in a 13x4 grid
            // Each week is represented by its first day
            const weeks: DayData[][] = [];
            const weeksPerRow = 13; // 13 weeks per row = 4 rows for 52 weeks
            let currentRow: DayData[] = [];

            for (let i = 0; i < days.length; i += 7) {
                // Take the first day of each week to represent the week
                const weekDay = days[i];
                currentRow.push(weekDay);

                if (currentRow.length === weeksPerRow) {
                    weeks.push(currentRow);
                    currentRow = [];
                }
            }
            // Push remaining weeks
            if (currentRow.length > 0) {
                weeks.push(currentRow);
            }
            return weeks;
        }
    }, [days, viewMode]);

    // Calculate size based on view
    useEffect(() => {
        const calculateSize = () => {
            const headerHeight = 140;
            const footerHeight = 60;
            const padding = 64;

            const availableHeight = window.innerHeight - headerHeight - footerHeight - padding;
            const availableWidth = window.innerWidth - padding;

            if (viewMode === 'months') {
                // 4 columns x 3 rows of months
                const monthWidth = (availableWidth - 48) / 4;
                const monthHeight = (availableHeight - 32) / 3;
                const daysPerMonth = 31;
                const daysPerRow = 7;
                const rows = 5;
                const size = Math.min(
                    (monthWidth - 24) / daysPerRow,
                    (monthHeight - 24) / rows,
                    14
                );
                setCellSize(Math.max(6, Math.floor(size)));
                setCellGap(size > 8 ? 3 : 2);
            } else if (viewMode === 'quarters') {
                // 2 columns x 2 rows of quarters
                const qWidth = (availableWidth - 32) / 2;
                const qHeight = (availableHeight - 24) / 2;
                const daysPerRow = 13;
                const rows = 7;
                const size = Math.min(
                    (qWidth - 36) / daysPerRow,
                    (qHeight - 36) / rows,
                    12
                );
                setCellSize(Math.max(5, Math.floor(size)));
                setCellGap(size > 7 ? 3 : 2);
            } else {
                // Weeks view - 13 columns x 4 rows grid
                const cols = 13;
                const rows = 4;
                const size = Math.min(
                    (availableWidth - 60) / cols,
                    (availableHeight - 40) / rows,
                    24
                );
                setCellSize(Math.max(10, Math.floor(size)));
                setCellGap(Math.max(4, Math.floor(size * 0.3)));
            }
        };

        calculateSize();
        window.addEventListener('resize', calculateSize);
        return () => window.removeEventListener('resize', calculateSize);
    }, [viewMode]);

    const getDayColor = (day: DayData) => {
        if (day.status === 'current') return '#f97316';
        if (day.status === 'past') return '#e5e5e5';
        return '#404040';
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* View Mode Tabs */}
            <div className="flex-shrink-0 flex items-center justify-center gap-1 py-2">
                {(['months', 'weeks', 'quarters'] as YearViewMode[]).map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${viewMode === mode
                            ? 'bg-neutral-700 text-white'
                            : 'text-neutral-500 hover:text-neutral-300'
                            }`}
                    >
                        {mode}
                    </button>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
                {viewMode === 'months' && (
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
                                <div className="grid grid-cols-7" style={{ gap: `${cellGap}px` }}>
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
                )}

                {viewMode === 'quarters' && (
                    <div className="grid grid-cols-2 gap-6">
                        {groupedDays.map((quarterDays, qIndex) => (
                            <motion.div
                                key={qIndex}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: qIndex * 0.05 }}
                                className="flex flex-col items-center"
                            >
                                <span className="text-xs text-neutral-500 mb-3">Q{qIndex + 1}</span>
                                <div className="grid grid-cols-13" style={{ gap: `${cellGap}px` }}>
                                    {quarterDays.map((day) => (
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
                )}

                {viewMode === 'weeks' && (
                    <div style={{ gap: `${cellGap}px` }} className="flex flex-col">
                        {groupedDays.map((week, weekIndex) => (
                            <motion.div
                                key={weekIndex}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: Math.min(weekIndex * 0.003, 0.15) }}
                                style={{ gap: `${cellGap}px` }}
                                className="flex"
                            >
                                {week.map((day) => (
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
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Stats - View Specific */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-shrink-0 text-center py-4"
            >
                {viewMode === 'months' && (
                    <p className="text-sm text-neutral-400">
                        <span className="text-orange-500 font-medium">{daysRemaining}d left</span>
                        <span className="mx-2 text-neutral-600">·</span>
                        <span>{progress.toFixed(0)}% of year complete</span>
                    </p>
                )}
                {viewMode === 'weeks' && (() => {
                    const currentWeek = Math.ceil((daysLived + 1) / 7);
                    const weeksLeft = 52 - currentWeek;
                    return (
                        <p className="text-sm text-neutral-400">
                            <span className="text-orange-500 font-medium">Week {currentWeek}</span>
                            <span className="mx-2 text-neutral-600">·</span>
                            <span>{weeksLeft} weeks left this year</span>
                        </p>
                    );
                })()}
                {viewMode === 'quarters' && (() => {
                    const today = new Date();
                    const currentQuarter = Math.floor(today.getMonth() / 3) + 1;
                    const quarterStartMonth = (currentQuarter - 1) * 3;
                    const quarterStart = new Date(year, quarterStartMonth, 1);
                    const quarterEnd = new Date(year, quarterStartMonth + 3, 0);
                    const quarterDays = Math.floor((quarterEnd.getTime() - quarterStart.getTime()) / (24 * 60 * 60 * 1000)) + 1;
                    const daysIntoQuarter = Math.floor((today.getTime() - quarterStart.getTime()) / (24 * 60 * 60 * 1000)) + 1;
                    const quarterProgress = Math.min(100, (daysIntoQuarter / quarterDays) * 100);
                    const quarterDaysLeft = quarterDays - daysIntoQuarter;
                    return (
                        <p className="text-sm text-neutral-400">
                            <span className="text-orange-500 font-medium">Q{currentQuarter}: {quarterProgress.toFixed(0)}%</span>
                            <span className="mx-2 text-neutral-600">·</span>
                            <span>{quarterDaysLeft}d left in Q{currentQuarter}</span>
                        </p>
                    );
                })()}
            </motion.div>
        </div>
    );
}
