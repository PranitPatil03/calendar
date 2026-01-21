'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface BirthdayModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBirthdate: Date;
    currentLifeExpectancy: number;
    onSave: (birthdate: Date, lifeExpectancy: number) => void;
}

export function BirthdayModal({
    isOpen,
    onClose,
    currentBirthdate,
    currentLifeExpectancy,
    onSave,
}: BirthdayModalProps) {
    const [birthdate, setBirthdate] = useState<Date>(currentBirthdate);
    const [lifeExpectancy, setLifeExpectancy] = useState([currentLifeExpectancy]);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const handleSave = () => {
        onSave(birthdate, lifeExpectancy[0]);
        onClose();
    };

    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 1);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm"
                    >
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-white">Settings</h2>
                                <button
                                    onClick={onClose}
                                    className="p-1 text-neutral-500 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Birthdate Picker */}
                            <div className="space-y-3 mb-6">
                                <label className="text-sm text-neutral-400">Birthdate</label>
                                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                'w-full justify-start text-left font-normal h-12 bg-neutral-800 border-neutral-700 hover:bg-neutral-750 hover:border-neutral-600 text-white'
                                            )}
                                        >
                                            <CalendarIcon className="mr-3 h-4 w-4 text-neutral-500" />
                                            {format(birthdate, 'MMMM d, yyyy')}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-neutral-800 border-neutral-700" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={birthdate}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setBirthdate(date);
                                                    setIsCalendarOpen(false);
                                                }
                                            }}
                                            disabled={(date) => date > maxDate || date < new Date('1900-01-01')}
                                            initialFocus
                                            captionLayout="dropdown"
                                            fromYear={1920}
                                            toYear={new Date().getFullYear()}
                                            classNames={{
                                                day_selected: 'bg-orange-500 text-white hover:bg-orange-600',
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Life Expectancy Slider */}
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm text-neutral-400">Life expectancy</label>
                                    <span className="text-lg font-medium text-white">{lifeExpectancy[0]}</span>
                                </div>
                                <Slider
                                    value={lifeExpectancy}
                                    onValueChange={setLifeExpectancy}
                                    min={60}
                                    max={120}
                                    step={1}
                                    className="py-2"
                                />
                                <div className="flex justify-between text-xs text-neutral-500">
                                    <span>60</span>
                                    <span>120</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    className="flex-1 h-11 border-neutral-700 text-neutral-400 hover:bg-neutral-800"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    className="flex-1 h-11 bg-orange-500 text-white hover:bg-orange-600"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
