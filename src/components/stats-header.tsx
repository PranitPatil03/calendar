'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { calculateAge, calculateWeeksLived, getTotalWeeks, getProgressPercentage } from '@/lib/calendar-utils';
import { Download, RotateCcw, Calendar } from 'lucide-react';

interface StatsHeaderProps {
    birthdate: Date;
    lifeExpectancy: number;
    onReset: () => void;
    onExport: () => void;
}

export function StatsHeader({ birthdate, lifeExpectancy, onReset, onExport }: StatsHeaderProps) {
    const age = calculateAge(birthdate);
    const weeksLived = calculateWeeksLived(birthdate);
    const totalWeeks = getTotalWeeks(lifeExpectancy);
    const progress = getProgressPercentage(weeksLived, totalWeeks);
    const weeksRemaining = Math.max(0, totalWeeks - weeksLived);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 px-4 py-4 md:px-6"
        >
            <div className="max-w-7xl mx-auto">
                {/* Top row - Title and Actions */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Life Calendar</h1>
                            <p className="text-sm text-slate-400">Every box is one week</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onExport}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800 hidden sm:flex"
                        >
                            <Download className="w-4 h-4 mr-1" />
                            Export
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onReset}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                        >
                            <RotateCcw className="w-4 h-4 sm:mr-1" />
                            <span className="hidden sm:inline">Reset</span>
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
                        <p className="text-xs text-slate-400 mb-1">Current Age</p>
                        <p className="text-lg md:text-xl font-bold text-white">
                            {age.years} <span className="text-sm font-normal text-slate-400">years</span>
                        </p>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
                        <p className="text-xs text-slate-400 mb-1">Current Week</p>
                        <p className="text-lg md:text-xl font-bold text-rose-400">
                            Week {age.weeks + 1} <span className="text-sm font-normal text-slate-400">of 52</span>
                        </p>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
                        <p className="text-xs text-slate-400 mb-1">Weeks Lived</p>
                        <p className="text-lg md:text-xl font-bold text-violet-400">
                            {weeksLived.toLocaleString()} <span className="text-sm font-normal text-slate-400">of {totalWeeks.toLocaleString()}</span>
                        </p>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
                        <p className="text-xs text-slate-400 mb-1">Weeks Remaining</p>
                        <p className="text-lg md:text-xl font-bold text-emerald-400">
                            {weeksRemaining.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Life Progress</span>
                        <span className="text-white font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-violet-500 via-rose-500 to-amber-500 rounded-full"
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
