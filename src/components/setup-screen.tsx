'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SetupScreenProps {
    onComplete: (birthdate: Date, lifeExpectancy: number) => void;
}

export function SetupScreen({ onComplete }: SetupScreenProps) {
    const [birthdate, setBirthdate] = useState<Date | undefined>(undefined);
    const [lifeExpectancy, setLifeExpectancy] = useState([90]);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const handleSubmit = () => {
        if (birthdate) {
            onComplete(birthdate, lifeExpectancy[0]);
        }
    };

    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 1);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-900">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-sm"
            >
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    className="flex justify-center mb-8"
                >
                    <div className="grid grid-cols-4 gap-1">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    'w-3 h-3 rounded-full',
                                    i < 3 ? 'bg-white' : i === 3 ? 'bg-orange-500' : 'bg-neutral-600'
                                )}
                            />
                        ))}
                    </div>
                </motion.div>

                {/* Title */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-2xl font-semibold text-white mb-2">
                        Life Calendar
                    </h1>
                    <p className="text-neutral-500 text-sm">
                        See your life in weeks
                    </p>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-8"
                >
                    {/* Birthdate Picker */}
                    <div className="space-y-3">
                        <label className="text-sm text-neutral-400">
                            Birthdate
                        </label>
                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal h-12 bg-neutral-800 border-neutral-700 hover:bg-neutral-750 hover:border-neutral-600',
                                        !birthdate && 'text-neutral-500'
                                    )}
                                >
                                    <CalendarIcon className="mr-3 h-4 w-4 text-neutral-500" />
                                    {birthdate ? (
                                        <span className="text-white">{format(birthdate, 'MMMM d, yyyy')}</span>
                                    ) : (
                                        <span>Select date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-neutral-800 border-neutral-700" align="start">
                                <Calendar
                                    mode="single"
                                    selected={birthdate}
                                    onSelect={(date) => {
                                        setBirthdate(date);
                                        setIsCalendarOpen(false);
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
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm text-neutral-400">
                                Life expectancy
                            </label>
                            <span className="text-lg font-medium text-white">
                                {lifeExpectancy[0]}
                            </span>
                        </div>
                        <Slider
                            value={lifeExpectancy}
                            onValueChange={setLifeExpectancy}
                            min={60}
                            max={100}
                            step={1}
                            className="py-2"
                        />
                        <div className="flex justify-between text-xs text-neutral-500">
                            <span>60</span>
                            <span>100</span>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={!birthdate}
                        className="w-full h-12 text-base font-medium bg-white text-neutral-900 hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        View Calendar
                    </Button>
                </motion.div>

                {/* Footer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center text-xs text-neutral-600 mt-8"
                >
                    Your data stays on your device
                </motion.p>
            </motion.div>
        </div>
    );
}
