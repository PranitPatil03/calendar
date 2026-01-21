'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WeekCell } from './week-cell';
import { NoteModal } from './note-modal';
import { YearCalendar } from './year-calendar';
import { LiveClock } from './live-clock';
import { QuoteDisplay } from './quote-display';
import { BirthdayModal } from './birthday-modal';
import { generateCalendarWeeks, WeekData, calculateWeeksLived, getTotalWeeks, getProgressPercentage, CalendarViewMode } from '@/lib/calendar-utils';
import { saveCalendarData, loadCalendarData, clearCalendarData } from '@/lib/storage';
import { Calendar, CalendarDays, Settings } from 'lucide-react';

interface CalendarGridProps {
    birthdate: Date;
    lifeExpectancy: number;
    notes: Record<number, { text: string; category?: string; eventName?: string }>;
    onUpdateBirthdate: (birthdate: Date, lifeExpectancy: number) => void;
    onNotesUpdate: (notes: Record<number, { text: string; category?: string; eventName?: string }>) => void;
}

const VIEW_MODES = [
    { id: 'life' as CalendarViewMode, label: 'Life', icon: Calendar },
    { id: 'year' as CalendarViewMode, label: 'Year', icon: CalendarDays },
];

export function CalendarGrid({ birthdate, lifeExpectancy, notes: initialNotes, onUpdateBirthdate, onNotesUpdate }: CalendarGridProps) {
    const [notes, setNotes] = useState(initialNotes);
    const [selectedWeek, setSelectedWeek] = useState<WeekData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [cellSize, setCellSize] = useState(10);
    const [cellGap, setCellGap] = useState(2);
    const [decadeGap, setDecadeGap] = useState(8);
    const [viewMode, setViewMode] = useState<CalendarViewMode>('year');
    const calendarRef = useRef<HTMLDivElement>(null);

    const weeks = useMemo(
        () => generateCalendarWeeks(birthdate, lifeExpectancy, notes),
        [birthdate, lifeExpectancy, notes]
    );

    const weeksLived = calculateWeeksLived(birthdate);
    const totalWeeks = getTotalWeeks(lifeExpectancy);
    const progress = getProgressPercentage(weeksLived, totalWeeks);
    const weeksRemaining = Math.max(0, totalWeeks - weeksLived);

    // Group weeks by year - exactly 52 weeks per row
    const weeksByYear = useMemo(() => {
        const grouped: WeekData[][] = [];
        for (let i = 0; i < lifeExpectancy; i++) {
            // Slice exactly 52 weeks for each year
            const startIndex = i * 52;
            const endIndex = startIndex + 52;
            grouped.push(weeks.slice(startIndex, endIndex));
        }
        return grouped;
    }, [weeks, lifeExpectancy]);

    // Calculate optimal cell size - fit entire calendar on screen
    useEffect(() => {
        const calculateSize = () => {
            const headerHeight = 44;
            const footerHeight = 40;
            const verticalPadding = 8;
            const horizontalPadding = 16;
            const labelWidth = 20;

            const availableHeight = window.innerHeight - headerHeight - footerHeight - verticalPadding;
            const availableWidth = window.innerWidth - labelWidth - horizontalPadding;

            // Calculate for 100 years (rows) and 52 weeks (columns)
            const numDecadeGaps = Math.floor((lifeExpectancy - 1) / 10);

            // Use visible gaps between dots
            const gapRatio = 0.25; // gap = 25% of cell size - clearly visible
            const decadeGapRatio = 0.4; // decade gap = 40% of cell size

            // Total units = cells + gaps between cells + decade gaps
            const totalRowUnits = lifeExpectancy + (lifeExpectancy - 1) * gapRatio + numDecadeGaps * decadeGapRatio;
            const totalColUnits = 52 + 51 * gapRatio;

            const sizeFromHeight = availableHeight / totalRowUnits;
            const sizeFromWidth = availableWidth / totalColUnits;

            // Use the smaller size to ensure everything fits on screen
            const optimalSize = Math.min(sizeFromHeight, sizeFromWidth);
            // Allow minimum 2px cells for very small screens
            const finalSize = Math.max(2, Math.floor(optimalSize));
            const finalGap = Math.max(1, Math.ceil(finalSize * gapRatio));
            const finalDecadeGap = Math.max(2, Math.ceil(finalSize * decadeGapRatio));

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
        onNotesUpdate(newNotes);
    };

    const handleDeleteNote = (weekIndex: number) => {
        const newNotes = { ...notes };
        delete newNotes[weekIndex];
        setNotes(newNotes);
        onNotesUpdate(newNotes);
    };

    const handleSettingsSave = (newBirthdate: Date, newLifeExpectancy: number) => {
        onUpdateBirthdate(newBirthdate, newLifeExpectancy);
    };

    return (
        <div className="h-screen bg-neutral-900 flex flex-col overflow-hidden relative">
            {/* Fixed Time Card - Top Left */}
            <div className="fixed top-4 left-4 z-40">
                <LiveClock />
            </div>

            {/* Fixed Quote - Bottom Right */}
            <div className="fixed bottom-6 right-6 z-40 max-w-xs">
                <QuoteDisplay />
            </div>

            {/* Minimal Header with tabs and actions - Centered */}
            <div className="flex-shrink-0 flex items-center justify-center px-4 py-3 relative z-30">
                {/* View Mode Tabs - Centered */}
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

                {/* Actions - Top Right */}
                <div className="absolute right-4 top-3 flex items-center gap-2">
                    <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-neutral-500 hover:text-white transition-colors">
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Calendar Views - Always Centered */}
            <AnimatePresence mode="wait">
                {viewMode === 'life' && (
                    <motion.div
                        key="life"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col overflow-hidden"
                    >
                        {/* Life Calendar Grid - Centered */}
                        <div className="flex-1 flex items-center justify-center p-2">
                            <div ref={calendarRef} className="flex">
                                {/* Age Labels */}
                                <div className="flex flex-col mr-2">
                                    {weeksByYear.map((_, yearIndex) => (
                                        <div
                                            key={yearIndex}
                                            style={{
                                                height: `${cellSize}px`,
                                                lineHeight: `${cellSize}px`,
                                                marginBottom: yearIndex < lifeExpectancy - 1
                                                    ? (yearIndex + 1) % 10 === 0
                                                        ? `${cellGap + decadeGap}px`
                                                        : `${cellGap}px`
                                                    : 0,
                                            }}
                                            className="text-right pr-1"
                                        >
                                            {yearIndex % 10 === 0 && (
                                                <span className="text-[9px] text-neutral-500 tabular-nums">{yearIndex}</span>
                                            )}
                                        </div>
                                    ))}
                                    {/* Add 100 label at the bottom */}
                                    <div
                                        style={{ height: `${cellSize}px`, lineHeight: `${cellSize}px`, marginTop: `${cellGap}px` }}
                                        className="text-right pr-1"
                                    >
                                        <span className="text-[9px] text-neutral-500 tabular-nums">{lifeExpectancy}</span>
                                    </div>
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
            </AnimatePresence>

            {/* Note Modal */}
            <NoteModal
                week={selectedWeek}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveNote}
                onDelete={handleDeleteNote}
            />

            {/* Birthday Settings Modal */}
            <BirthdayModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                currentBirthdate={birthdate}
                currentLifeExpectancy={lifeExpectancy}
                onSave={handleSettingsSave}
            />
        </div >
    );
}
