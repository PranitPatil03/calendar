'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QUOTES = [
    { text: "The days are long, but the years are short.", author: null },
    { text: "Time is the most valuable thing a man can spend.", author: "Theophrastus" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "Every second counts. Make it matter.", author: null },
    { text: "The two most powerful warriors are patience and time.", author: "Leo Tolstoy" },
    { text: "How we spend our days is how we spend our lives.", author: "Annie Dillard" },
    { text: "Lost time is never found again.", author: "Benjamin Franklin" },
    { text: "Time flies over us, but leaves its shadow behind.", author: "Nathaniel Hawthorne" },
    { text: "The key is not spending time, but investing it.", author: "Stephen Covey" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { text: "It's not the years in your life, but the life in your years.", author: "Abraham Lincoln" },
    { text: "The purpose of life is to live it, to taste it.", author: "Eleanor Roosevelt" },
    { text: "Time is free, but it's priceless.", author: null },
    { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
    { text: "Yesterday is gone. Tomorrow has not come. We have only today.", author: "Mother Teresa" },
    { text: "The best time to plant a tree was 20 years ago. The second best is now.", author: "Chinese Proverb" },
    { text: "You only live once, but if you do it right, once is enough.", author: "Mae West" },
    { text: "Life is short, and it's up to you to make it sweet.", author: "Sarah Louise Delany" },
    { text: "Time is what we want most, but what we use worst.", author: "William Penn" },
    { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
    { text: "The future starts today, not tomorrow.", author: "Pope John Paul II" },
    { text: "In the end, it's not the years in your life that count. It's the life in your years.", author: "Abraham Lincoln" },
];

export function QuoteDisplay() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Start with a random quote
        setCurrentIndex(Math.floor(Math.random() * QUOTES.length));

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % QUOTES.length);
        }, 1800000); // Change every 30 minutes

        return () => clearInterval(timer);
    }, []);

    const quote = QUOTES[currentIndex];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center"
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                >
                    <p className="text-sm text-neutral-500 italic leading-relaxed">
                        "{quote.text}"
                    </p>
                    {quote.author && (
                        <p className="text-xs text-neutral-600 mt-1 not-italic">
                            — {quote.author}
                        </p>
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
}
