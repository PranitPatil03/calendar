'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WeekData, formatDate } from '@/lib/calendar-utils';
import { Trash2, Star } from 'lucide-react';

interface NoteModalProps {
    week: WeekData | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (weekIndex: number, text: string, category?: string, eventName?: string) => void;
    onDelete: (weekIndex: number) => void;
}

export function NoteModal({ week, isOpen, onClose, onSave, onDelete }: NoteModalProps) {
    const [noteText, setNoteText] = useState('');
    const [eventName, setEventName] = useState('');
    const [isLifeEvent, setIsLifeEvent] = useState(false);

    // Reset state when week changes
    useEffect(() => {
        if (week) {
            setNoteText(week.note || '');
            setEventName(week.eventName || '');
            setIsLifeEvent(!!week.eventName);
        }
    }, [week]);

    const handleSave = () => {
        if (week) {
            onSave(
                week.index,
                noteText,
                undefined,
                isLifeEvent ? eventName : undefined
            );
        }
        onClose();
    };

    const handleDelete = () => {
        if (week) {
            onDelete(week.index);
        }
        onClose();
    };

    if (!week) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-lg font-medium text-white">
                        Week {week.weekInYear}, Year {week.year + 1}
                    </DialogTitle>
                    <DialogDescription className="text-neutral-500 text-sm">
                        {formatDate(week.date)}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Life Event Toggle */}
                    <button
                        type="button"
                        onClick={() => setIsLifeEvent(!isLifeEvent)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isLifeEvent
                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-750'
                            }`}
                    >
                        <Star className={`w-4 h-4 ${isLifeEvent ? 'fill-current' : ''}`} />
                        Mark as life event
                    </button>

                    {isLifeEvent && (
                        <Input
                            placeholder="Event name"
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                            className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                        />
                    )}

                    {/* Note Text */}
                    <div className="space-y-2">
                        <label className="text-sm text-neutral-400">
                            Note
                        </label>
                        <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="What happened this week?"
                            className="w-full h-24 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-orange-500/50 resize-none text-sm"
                        />
                    </div>
                </div>

                <DialogFooter className="flex gap-2 sm:gap-2">
                    {(week.note || week.eventName) && (
                        <Button
                            variant="ghost"
                            onClick={handleDelete}
                            className="mr-auto text-neutral-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-neutral-400 hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-white text-neutral-900 hover:bg-neutral-200"
                    >
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
