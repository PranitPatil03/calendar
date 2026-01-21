'use client';

import { motion } from 'framer-motion';
import { WeekData } from '@/lib/calendar-utils';

interface WeekCellProps {
    week: WeekData;
    onClick: () => void;
    index: number;
}

export function WeekCell({ week, onClick, index }: WeekCellProps) {
    const hasNote = !!week.note;
    const isLifeEvent = week.isLifeEvent;

    const bgColor =
        week.status === 'current' ? '#f97316' :
            week.status === 'past' ? '#e5e5e5' :
                '#404040';

    return (
        <button
            onClick={onClick}
            style={{ backgroundColor: bgColor }}
            className={`w-full h-full rounded-full transition-transform duration-100 hover:scale-150 hover:z-10
        ${isLifeEvent ? 'ring-1 ring-orange-400' : ''}
        ${hasNote && !isLifeEvent && week.status === 'future' ? 'opacity-70' : ''}
      `}
            aria-label={`Week ${week.weekInYear} of year ${week.year + 1}`}
        />
    );
}
