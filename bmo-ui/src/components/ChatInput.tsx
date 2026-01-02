"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MicOff, Menu, Upload, FileUp } from "lucide-react";

export type ChatStatus = "idle" | "listening" | "thinking" | "speaking";

interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    onSubmit: () => void;
    status: ChatStatus;
    onMicClick: () => void;
    placeholder?: string;
}

export default function ChatInput({
    input,
    setInput,
    onSubmit,
    status,
    onMicClick,
    placeholder = "Ask BMO anything..."
}: ChatInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [showTools, setShowTools] = useState(false);
    const toolsRef = useRef<HTMLDivElement>(null);

    // Smart Ring Logic
    const showGradientRing = !hasInteracted && !input;
    const showWhiteRing = isFocused;

    const handleFocus = () => {
        setIsFocused(true);
        setHasInteracted(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            onSubmit();
        }
    };

    // Close tools menu on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
                setShowTools(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 pt-12 flex flex-col items-center z-40">
            {/* Gradient Mask for content behind */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background: 'linear-gradient(to top, var(--bg) 60%, transparent 100%)',
                    backdropFilter: 'blur(1px)'
                }}
            />

            {/* Width increased by ~10% (max-w-3xl is 48rem, we use max-w-[54rem]) */}
            <div className="w-full max-w-[54rem] relative z-10">
                <div className="relative group">
                    {/* 1. Gradient Ring Effect */}
                    <AnimatePresence>
                        {showGradientRing && (
                            <motion.div
                                className="absolute -inset-[3px] rounded-[2rem] opacity-100 blur-[3px]"
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: 1,
                                    background: [
                                        'linear-gradient(45deg, var(--accent), var(--text), var(--accent))',
                                        'linear-gradient(225deg, var(--accent), var(--text), var(--accent))'
                                    ]
                                }}
                                exit={{ opacity: 0, duration: 0.5 }}
                                transition={{
                                    opacity: { duration: 0.5 },
                                    background: { duration: 4, repeat: Infinity, repeatType: "reverse" }
                                }}
                                style={{
                                    backgroundSize: '200% 200%'
                                }}
                            />
                        )}
                    </AnimatePresence>

                    {/* 2. Faint White Ring */}
                    <motion.div
                        className="absolute -inset-[1px] rounded-[2rem] border border-white/40"
                        initial={false}
                        animate={{ opacity: showWhiteRing ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                    />

                    {/* Main Container - Pill Shape - NO Entrance Animation */}
                    <div
                        className={`
                            rounded-[2rem] p-2 pl-2 flex items-center gap-3 bg-[var(--bg-secondary)] border border-[var(--border)]
                            transition-all duration-300 relative
                            ${isFocused ? 'shadow-2xl' : 'shadow-lg'}
                        `}
                    >
                        {/* Tools Button (Left) - Replaces previous Icon */}
                        <div className="relative" ref={toolsRef}>
                            <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: "var(--bg-chat)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowTools(!showTools)}
                                className="w-12 h-12 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors bg-transparent/5"
                                style={{ backgroundColor: showTools ? "var(--bg-chat)" : undefined }}
                            >
                                <Menu className="w-6 h-6" />
                            </motion.button>

                            {/* Tools Dropdown */}
                            <AnimatePresence>
                                {showTools && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute bottom-full left-0 mb-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden min-w-[160px]"
                                    >
                                        <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-chat)] text-left text-sm transition-colors text-[var(--text)]">
                                            <FileUp className="w-4 h-4" />
                                            <span>Upload File</span>
                                        </button>
                                        {/* Add more tools here if needed */}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Input */}
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            placeholder={status === "listening" ? "Listening..." : placeholder}
                            disabled={status !== "idle" && status !== "listening"}
                            className="flex-1 bg-transparent border-none outline-none text-[var(--text)] placeholder:text-[var(--text-secondary)] py-4 text-base min-w-0"
                            autoComplete="off"
                        />

                        {/* Actions (Right) */}
                        <div className="flex items-center gap-2 pr-1">
                            <AnimatePresence mode="wait">
                                {input.trim() ? (
                                    <motion.button
                                        key="send"
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.5, opacity: 0 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onSubmit}
                                        disabled={status !== "idle" && status !== "listening"}
                                        className="w-12 h-12 rounded-full bg-[var(--accent)] text-[var(--bg)] flex items-center justify-center hover:opacity-90 transition-opacity shadow-lg"
                                    >
                                        <Send className="w-6 h-6 ml-0.5" />
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        key="mic"
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{
                                            scale: 1,
                                            opacity: 1,
                                            backgroundColor: status === "listening" ? "var(--error)" : "var(--bg-chat)", // Polished circular container
                                            color: status === "listening" ? "#fff" : "var(--text)"
                                        }}
                                        exit={{ scale: 0.5, opacity: 0 }}
                                        whileHover={{ scale: 1.05, backgroundColor: status === "listening" ? "var(--error)" : "var(--accent)", color: status === "listening" ? "#fff" : "var(--bg)" }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onMicClick}
                                        disabled={status === "thinking" || status === "speaking"}
                                        className="w-12 h-12 rounded-full flex items-center justify-center transition-all relative overflow-hidden"
                                    >
                                        {status === "listening" ? (
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                            >
                                                <MicOff className="w-6 h-6" />
                                            </motion.div>
                                        ) : (
                                            <Mic className="w-6 h-6" />
                                        )}
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Footer Text */}
                <p className="text-center text-xs text-[var(--text-secondary)] mt-4 font-medium opacity-60">
                    BMO may make mistakes. Always verify important information.
                </p>
            </div>
        </div>
    );
}
