'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { generateYearDays, DayData, getDaysInYear } from '@/lib/calendar-utils';
import { Plus, X } from 'lucide-react';

type GoalViewMode = 'months' | 'weeks' | 'quarters';

interface Goal {
    id: string;
    name: string;
    color: string;
    completedDays: Set<number>;
}

const GOAL_COLORS = ['#f97316', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function GoalCalendar() {
    const [viewMode, setViewMode] = useState<GoalViewMode>('months');
    const [cellSize, setCellSize] = useState(10);
    const [cellGap, setCellGap] = useState(3);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
    const [showAddGoal, setShowAddGoal] = useState(false);
    const [newGoalName, setNewGoalName] = useState('');

    const year = new Date().getFullYear();
    const days = useMemo(() => generateYearDays(year), [year]);
    const totalDays = getDaysInYear(year);
    const today = new Date();
    const currentDayIndex = Math.floor((today.getTime() - new Date(year, 0, 1).getTime()) / (24 * 60 * 60 * 1000));

    // Group by view mode
    const groupedDays = useMemo(() => {
        if (viewMode === 'months') {
            const months: DayData[][] = Array.from({ length: 12 }, () => []);
            days.forEach(day => months[day.month].push(day));
            return months;
        } else if (viewMode === 'quarters') {
            const quarters: DayData[][] = [[], [], [], []];
            days.forEach(day => quarters[Math.floor(day.month / 3)].push(day));
            return quarters;
        } else {
            const weeks: DayData[][] = [];
            for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
            return weeks;
        }
    }, [days, viewMode]);

    // Calculate size based on view
    useEffect(() => {
        const calculateSize = () => {
            const headerHeight = 160;
            const footerHeight = 60;
            const padding = 64;

            const availableHeight = window.innerHeight - headerHeight - footerHeight - padding;
            const availableWidth = window.innerWidth - padding;

            if (viewMode === 'months') {
                const size = Math.min((availableWidth - 48) / 4 / 7 - 3, (availableHeight - 32) / 3 / 5 - 3, 14);
                setCellSize(Math.max(6, Math.floor(size)));
                setCellGap(size > 8 ? 3 : 2);
            } else if (viewMode === 'quarters') {
                const size = Math.min((availableWidth - 32) / 2 / 13 - 2, (availableHeight - 24) / 2 / 7 - 2, 12);
                setCellSize(Math.max(5, Math.floor(size)));
                setCellGap(size > 7 ? 3 : 2);
            } else {
                const size = Math.min((availableWidth - 40) / 7, (availableHeight - 20) / 53, 14);
                setCellSize(Math.max(5, Math.floor(size)));
                setCellGap(size > 8 ? 3 : 2);
            }
        };

        calculateSize();
        window.addEventListener('resize', calculateSize);
        return () => window.removeEventListener('resize', calculateSize);
    }, [viewMode]);

    const addGoal = () => {
        if (!newGoalName.trim()) return;
        const newGoal: Goal = {
            id: Date.now().toString(),
            name: newGoalName.trim(),
            color: GOAL_COLORS[goals.length % GOAL_COLORS.length],
            completedDays: new Set(),
        };
        setGoals([...goals, newGoal]);
        setNewGoalName('');
        setShowAddGoal(false);
        setSelectedGoal(newGoal.id);
    };

    const toggleDay = (dayIndex: number) => {
        if (!selectedGoal) return;
        setGoals(goals.map(goal => {
            if (goal.id === selectedGoal) {
                const newCompleted = new Set(goal.completedDays);
                newCompleted.has(dayIndex) ? newCompleted.delete(dayIndex) : newCompleted.add(dayIndex);
                return { ...goal, completedDays: newCompleted };
            }
            return goal;
        }));
    };

    const getDayColor = (dayIndex: number) => {
        if (dayIndex === currentDayIndex) return '#f97316';
        for (const goal of goals) {
            if (goal.completedDays.has(dayIndex)) return goal.color;
        }
        return dayIndex < currentDayIndex ? '#e5e5e5' : '#404040';
    };

    const currentGoal = goals.find(g => g.id === selectedGoal);
    const completedCount = currentGoal?.completedDays.size || 0;

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Goal Pills */}
            <div className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 flex-wrap">
                {goals.map(goal => (
                    <button
                        key={goal.id}
                        onClick={() => setSelectedGoal(goal.id === selectedGoal ? null : goal.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all ${selectedGoal === goal.id ? 'bg-neutral-700 text-white' : 'bg-neutral-800 text-neutral-400'
                            }`}
                    >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: goal.color }} />
                        {goal.name}
                    </button>
                ))}
                {showAddGoal ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newGoalName}
                            onChange={(e) => setNewGoalName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                            placeholder="Goal name"
                            className="px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-full text-xs text-white placeholder:text-neutral-500 focus:outline-none w-24"
                            autoFocus
                        />
                        <button onClick={addGoal} className="p-1 bg-orange-500 rounded-full text-white"><Plus className="w-3 h-3" /></button>
                        <button onClick={() => setShowAddGoal(false)} className="p-1 bg-neutral-700 rounded-full text-neutral-400"><X className="w-3 h-3" /></button>
                    </div>
                ) : (
                    <button onClick={() => setShowAddGoal(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-neutral-800 text-neutral-400">
                        <Plus className="w-3 h-3" />Add
                    </button>
                )}
            </div>

            {/* View Mode Tabs */}
            <div className="flex-shrink-0 flex items-center justify-center gap-1 py-1">
                {(['months', 'weeks', 'quarters'] as GoalViewMode[]).map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`px-3 py-1 rounded-full text-[10px] font-medium capitalize transition-all ${viewMode === mode ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-neutral-300'
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
                            <motion.div key={monthIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: monthIndex * 0.02 }} className="flex flex-col items-center">
                                <span className="text-[10px] text-neutral-500 mb-2">{MONTHS[monthIndex]}</span>
                                <div className="grid grid-cols-7" style={{ gap: `${cellGap}px` }}>
                                    {monthDays.map((day) => (
                                        <button
                                            key={day.index}
                                            onClick={() => toggleDay(day.index)}
                                            disabled={!selectedGoal}
                                            style={{ width: `${cellSize}px`, height: `${cellSize}px`, backgroundColor: getDayColor(day.index) }}
                                            className={`rounded-full transition-transform ${selectedGoal ? 'hover:scale-125 cursor-pointer' : ''}`}
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
                            <motion.div key={qIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: qIndex * 0.05 }} className="flex flex-col items-center">
                                <span className="text-xs text-neutral-500 mb-3">Q{qIndex + 1}</span>
                                <div className="grid grid-cols-13" style={{ gap: `${cellGap}px` }}>
                                    {quarterDays.map((day) => (
                                        <button
                                            key={day.index}
                                            onClick={() => toggleDay(day.index)}
                                            disabled={!selectedGoal}
                                            style={{ width: `${cellSize}px`, height: `${cellSize}px`, backgroundColor: getDayColor(day.index) }}
                                            className={`rounded-full transition-transform ${selectedGoal ? 'hover:scale-125 cursor-pointer' : ''}`}
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
                            <motion.div key={weekIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(weekIndex * 0.003, 0.15) }} style={{ gap: `${cellGap}px` }} className="flex">
                                {week.map((day) => (
                                    <button
                                        key={day.index}
                                        onClick={() => toggleDay(day.index)}
                                        disabled={!selectedGoal}
                                        style={{ width: `${cellSize}px`, height: `${cellSize}px`, backgroundColor: getDayColor(day.index) }}
                                        className={`rounded-full transition-transform ${selectedGoal ? 'hover:scale-125 cursor-pointer' : ''}`}
                                    />
                                ))}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Stats Footer */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-shrink-0 text-center py-3">
                {currentGoal ? (
                    <p className="text-sm text-neutral-400">
                        <span className="text-orange-500 font-medium">{completedCount} days</span>
                        <span className="mx-2 text-neutral-600">·</span>
                        <span>{((completedCount / currentDayIndex) * 100).toFixed(0)}% completion</span>
                    </p>
                ) : (
                    <p className="text-sm text-neutral-500">Select or add a goal</p>
                )}
            </motion.div>
        </div>
    );
}
