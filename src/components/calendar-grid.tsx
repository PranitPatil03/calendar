'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { YearCalendar } from './year-calendar';


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
