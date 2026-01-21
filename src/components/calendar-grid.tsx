'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WeekCell } from './week-cell';
import { NoteModal } from './note-modal';
import { YearCalendar } from './year-calendar';
import { GoalCalendar } from './goal-calendar';
import { generateCalendarWeeks, WeekData, calculateWeeksLived, getTotalWeeks, getProgressPercentage, CalendarViewMode } from '@/lib/calendar-utils';
import { saveCalendarData, loadCalendarData, clearCalendarData } from '@/lib/storage';
import html2canvas from 'html2canvas';
import { RotateCcw, Download, Calendar, CalendarDays, Target } from 'lucide-react';

interface CalendarGridProps {
    birthdate: Date;
    lifeExpectancy: number;
    notes: Record<number, { text: string; category?: string; eventName?: string }>;
    onReset: () => void;
}

const VIEW_MODES = [
    { id: 'life' as CalendarViewMode, label: 'Life', icon: Calendar },
    { id: 'year' as CalendarViewMode, label: 'Year', icon: CalendarDays },
    { id: 'goal' as CalendarViewMode, label: 'Goals', icon: Target },
];

export function CalendarGrid({ birthdate, lifeExpectancy, notes: initialNotes, onReset }: CalendarGridProps) {
    const [notes, setNotes] = useState(initialNotes);
    const [selectedWeek, setSelectedWeek] = useState<WeekData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cellSize, setCellSize] = useState(10);
    const [cellGap, setCellGap] = useState(2);
    const [decadeGap, setDecadeGap] = useState(8);
    const [viewMode, setViewMode] = useState<CalendarViewMode>('life');
    const calendarRef = useRef<HTMLDivElement>(null);

    const weeks = useMemo(
        () => generateCalendarWeeks(birthdate, lifeExpectancy, notes),
        [birthdate, lifeExpectancy, notes]
    );

    const weeksLived = calculateWeeksLived(birthdate);
    const totalWeeks = getTotalWeeks(lifeExpectancy);
    const progress = getProgressPercentage(weeksLived, totalWeeks);
    const weeksRemaining = Math.max(0, totalWeeks - weeksLived);

    // Group weeks by year
    const weeksByYear = useMemo(() => {
        const grouped: WeekData[][] = [];
        for (let i = 0; i < lifeExpectancy; i++) {
            grouped.push(weeks.filter((w) => w.year === i));
        }
        return grouped;
    }, [weeks, lifeExpectancy]);

    // Calculate optimal cell size - MUCH larger on laptop/desktop
    useEffect(() => {
        const calculateSize = () => {
            const headerHeight = 56;
            const footerHeight = 56;
            const verticalPadding = 32;
            const horizontalPadding = 100;
            const labelWidth = 40;

            const availableHeight = window.innerHeight - headerHeight - footerHeight - verticalPadding;
            const availableWidth = window.innerWidth - labelWidth - horizontalPadding;

            // Count decade gaps (every 10 years)
            const numDecadeGaps = Math.floor((lifeExpectancy - 1) / 10);
            const extraDecadeSpace = numDecadeGaps * 6; // Extra pixels for decade gaps

            // Available height for actual rows
            const heightForRows = availableHeight - extraDecadeSpace;

            // Calculate cell size
            const rowsWithGaps = lifeExpectancy + (lifeExpectancy - 1) * 0.2; // 20% gap ratio
            const colsWithGaps = 52 + 51 * 0.2;

            const sizeFromHeight = heightForRows / rowsWithGaps;
            const sizeFromWidth = availableWidth / colsWithGaps;

            // Use larger of width-based sizing on big screens
            let optimalSize;
            if (window.innerWidth > 1200) {
                // Prefer larger cells on big screens
                optimalSize = Math.min(sizeFromHeight, sizeFromWidth);
            } else {
                optimalSize = Math.min(sizeFromHeight, sizeFromWidth);
            }

            const finalSize = Math.max(5, Math.min(Math.floor(optimalSize), 16));
            const finalGap = Math.max(1, Math.round(finalSize * 0.2));
            const finalDecadeGap = Math.max(4, Math.round(finalSize * 0.6));

            setCellSize(finalSize);
            setCellGap(finalGap);
            setDecadeGap(finalDecadeGap);
        };

        calculateSize();
        window.addEventListener('resize', calculateSize);
        return () => window.removeEventListener('resize', calculateSize);
    }, [lifeExpectancy]);

    const handleWeekClick = (week: WeekData) => {
        setSelectedWeek(week);
        setIsModalOpen(true);
    };

    const handleSaveNote = (weekIndex: number, text: string, category?: string, eventName?: string) => {
        const newNotes = { ...notes };
        if (text.trim() === '' && !eventName) {
            delete newNotes[weekIndex];
        } else {
            newNotes[weekIndex] = { text, category, eventName };
        }
        setNotes(newNotes);

        const data = loadCalendarData();
        if (data) {
            data.notes = newNotes;
            saveCalendarData(data);
        }
    };

    const handleDeleteNote = (weekIndex: number) => {
        const newNotes = { ...notes };
        delete newNotes[weekIndex];
        setNotes(newNotes);

        const data = loadCalendarData();
        if (data) {
            data.notes = newNotes;
            saveCalendarData(data);
        }
    };

    const handleExport = async () => {
        if (!calendarRef.current) return;

        try {
            const canvas = await html2canvas(calendarRef.current, {
                backgroundColor: '#171717',
                scale: 2,
            });

            const link = document.createElement('a');
            link.download = 'life-calendar.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const handleReset = () => {
        clearCalendarData();
        onReset();
    };

    return (
        <div className="h-screen bg-neutral-900 flex flex-col overflow-hidden">
            {/* Minimal Header - Only tabs and actions */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-3">
                {/* View Mode Tabs */}
                <div className="flex items-center gap-1">
                    {VIEW_MODES.map((mode) => {
                        const Icon = mode.icon;
                        return (
                            <button
                                key={mode.id}
                                onClick={() => setViewMode(mode.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${viewMode === mode.id ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {mode.label}
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={handleExport} className="p-2 text-neutral-500 hover:text-white transition-colors">
                        <Download className="w-4 h-4" />
                    </button>
                    <button onClick={handleReset} className="p-2 text-neutral-500 hover:text-white transition-colors">
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Calendar Views */}
            <AnimatePresence mode="wait">
                {viewMode === 'life' && (
                    <motion.div
                        key="life"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col overflow-hidden"
                    >
                        {/* Life Calendar Grid */}
                        <div className="flex-1 flex items-center justify-center px-8">
                            <div ref={calendarRef} className="flex">
                                {/* Age Labels - aligned to each decade start */}
                                <div className="flex flex-col mr-3">
                                    {weeksByYear.map((_, yearIndex) => (
                                        <div
                                            key={yearIndex}
                                            style={{
                                                height: `${cellSize}px`,
                                                marginBottom: yearIndex < lifeExpectancy - 1
                                                    ? (yearIndex + 1) % 10 === 0
                                                        ? `${cellGap + decadeGap}px`
                                                        : `${cellGap}px`
                                                    : 0,
                                            }}
                                            className="flex items-center justify-end"
                                        >
                                            {yearIndex % 10 === 0 && (
                                                <span className="text-[11px] text-neutral-500 tabular-nums">{yearIndex}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Grid */}
                                <div className="flex flex-col">
                                    {weeksByYear.map((yearWeeks, yearIndex) => (
                                        <div
                                            key={yearIndex}
                                            className="flex"
                                            style={{
                                                gap: `${cellGap}px`,
                                                marginBottom: yearIndex < lifeExpectancy - 1
                                                    ? (yearIndex + 1) % 10 === 0
                                                        ? `${cellGap + decadeGap}px`
                                                        : `${cellGap}px`
                                                    : 0,
                                            }}
                                        >
                                            {yearWeeks.map((week) => (
                                                <div
                                                    key={week.index}
                                                    style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                                                >
                                                    <WeekCell
                                                        week={week}
                                                        onClick={() => handleWeekClick(week)}
                                                        index={week.index}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Life Calendar Footer - Only percentage and weeks */}
                        <div className="flex-shrink-0 text-center py-4">
                            <p className="text-sm text-neutral-400">
                                <span className="text-orange-500 font-medium">{progress.toFixed(1)}%</span>
                                <span className="mx-2 text-neutral-600">·</span>
                                <span>{weeksRemaining.toLocaleString()} weeks left</span>
                            </p>
                        </div>
                    </motion.div>
                )}

                {viewMode === 'year' && (
                    <motion.div
                        key="year"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col overflow-hidden"
                    >
                        <YearCalendar />
                    </motion.div>
                )}

                {viewMode === 'goal' && (
                    <motion.div
                        key="goal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col overflow-hidden"
                    >
                        <GoalCalendar />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Note Modal */}
            <NoteModal
                week={selectedWeek}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveNote}
                onDelete={handleDeleteNote}
            />
        </div>
    );
}
