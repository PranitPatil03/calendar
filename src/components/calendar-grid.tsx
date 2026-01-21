'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { YearCalendar } from './year-calendar';
import { LiveClock } from './live-clock';
import { QuoteDisplay } from './quote-display';

interface CalendarGridProps {
    birthdate: Date;
    lifeExpectancy: number;
    notes: Record<number, { text: string; category?: string; eventName?: string }>;
    onUpdateBirthdate: (birthdate: Date, lifeExpectancy: number) => void;
    onNotesUpdate: (notes: Record<number, { text: string; category?: string; eventName?: string }>) => void;
}

export function CalendarGrid({ birthdate, lifeExpectancy, notes: initialNotes, onUpdateBirthdate, onNotesUpdate }: CalendarGridProps) {
    const [notes, setNotes] = useState(initialNotes);

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

            {/* Year Calendar - Full Screen */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col overflow-hidden"
            >
                <YearCalendar />
            </motion.div>
        </div>
    );
}
