'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Animated number component - animates the entire number as one unit
function AnimatedNumber({ value, size = 'large' }: { value: string; size?: 'large' | 'small' }) {
    const sizeClass = size === 'large'
        ? 'text-5xl font-extralight text-white tracking-tighter'
        : 'text-2xl font-light text-neutral-400';

    return (
        <span className={`relative inline-block overflow-hidden tabular-nums ${sizeClass}`} style={{ height: '1.15em' }}>
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    key={value}
                    initial={{ y: '100%' }}
                    animate={{ y: '0%' }}
                    exit={{ y: '-100%' }}
                    transition={{
                        duration: 0.6,
                        ease: [0.25, 0.1, 0.25, 1]
                    }}
                    className="block"
                >
                    {value}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}

export function LiveClock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

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
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-5 border border-neutral-700/50"
        >
            {/* Time - Animate complete numbers */}
            <div className="flex items-baseline mb-3">
                {/* Hours - complete number */}
                <AnimatedNumber value={displayHours} size="large" />
                <span className="text-5xl font-extralight text-white">:</span>
                {/* Minutes - complete number */}
                <AnimatedNumber value={minutes} size="large" />
                <span className="text-2xl text-neutral-500 mx-0.5">:</span>
                {/* Seconds - complete number */}
                <AnimatedNumber value={seconds} size="small" />
                <span className="text-sm text-neutral-500 ml-2 font-medium">
                    {period}
                </span>
            </div>

            {/* Date and Day */}
            <div className="space-y-0.5">
                <p className="text-orange-500 font-medium text-sm">{dayName}</p>
                <p className="text-neutral-400 text-sm">{monthDay}, {year}</p>
            </div>
        </motion.div>
    );
}
