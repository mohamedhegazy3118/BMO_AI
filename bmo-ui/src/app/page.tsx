"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MicOff, Sparkles } from "lucide-react";
import Header from "@/components/header";
import BMOEyes from "@/components/bmo-eyes";
import { sendTranscript, wakeSession } from "@/lib/api";

type Status = "idle" | "listening" | "thinking" | "speaking";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

const getSpeechRecognition = (): SpeechRecognitionConstructor | null => {
    if (typeof window === "undefined") return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

export default function Home() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [status, setStatus] = useState<Status>("idle");
    const [sessionId, setSessionId] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const ensureSession = useCallback(async () => {
        if (sessionId) return sessionId;
        try {
            const res = await wakeSession();
            setSessionId(res.session_id);
            return res.session_id;
        } catch {
            return null;
        }
    }, [sessionId]);

    const sendMessage = useCallback(
        async (content: string) => {
            if (!content.trim()) return;

            // Add user message
            const userMsg: Message = {
                id: Date.now().toString(),
                role: "user",
                content: content.trim(),
            };
            setMessages((prev) => [...prev, userMsg]);
            setInput("");
            setStatus("thinking");

            try {
                const id = await ensureSession();
                if (!id) throw new Error("No session");

                const res = await sendTranscript(id, content);

                // Add assistant message
                const assistantMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: res.reply || res.caption || "I'm here to help!",
                };
                setMessages((prev) => [...prev, assistantMsg]);

                // Play speech if available
                if (res.speech?.base64) {
                    setStatus("speaking");
                    const audio = new Audio(
                        `data:${res.speech.mime_type};base64,${res.speech.base64}`
                    );
                    audioRef.current = audio;
                    audio.onended = () => setStatus("idle");
                    audio.play().catch(() => setStatus("idle"));
                } else {
                    setStatus("idle");
                }
            } catch {
                const errorMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "Sorry, I couldn't process that. Please try again.",
                };
                setMessages((prev) => [...prev, errorMsg]);
                setStatus("idle");
            }
        },
        [ensureSession]
    );

    const handleSubmit = () => {
        if (input.trim() && status === "idle") {
            sendMessage(input);
        }
    };

    const startListening = () => {
        const SR = getSpeechRecognition();
        if (!SR) return;

        const recognition = new SR();
        recognition.lang = "en-US";
        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            sendMessage(transcript);
        };
        recognition.onerror = () => setStatus("idle");
        recognition.onend = () => {
            recognitionRef.current = null;
            if (status === "listening") setStatus("idle");
        };

        recognitionRef.current = recognition;
        setStatus("listening");
        recognition.start();
    };

    const stopListening = () => {
        recognitionRef.current?.stop();
        setStatus("idle");
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <Header />

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col pt-20 pb-32">
                {/* Messages or Welcome */}
                <div className="flex-1 w-full px-4 flex flex-col items-center">
                    {messages.length === 0 ? (
                        // Welcome State - Centered
                        <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center w-full max-w-3xl">
                            {/* BMO Eyes - Larger with more presence */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                className="mb-12"
                            >
                                <BMOEyes status={status} size="xl" />
                            </motion.div>

                            {/* Title with proper spacing */}
                            <motion.h1
                                className="text-4xl font-bold text-[var(--text)] mb-4"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.15, type: "spring" }}
                            >
                                Hi! I'm BMO 👋
                            </motion.h1>

                            {/* Description with better spacing */}
                            <motion.p
                                className="text-lg text-[var(--text-secondary)] mb-10 max-w-md leading-relaxed"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.25, type: "spring" }}
                            >
                                Your AI campus assistant. Ask me about classes, navigation,
                                professors, or anything else!
                            </motion.p>

                            {/* Quick Prompts */}
                            <motion.div
                                className="flex flex-wrap gap-2 justify-center"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                {[
                                    "🗺️ Navigate to my class",
                                    "📚 Check Canvas",
                                    "👨‍🏫 Find a professor",
                                    "❓ What can you do?",
                                ].map((prompt) => (
                                    <button
                                        key={prompt}
                                        onClick={() => sendMessage(prompt)}
                                        className="btn-secondary px-4 py-2 rounded-full text-sm"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </motion.div>
                        </div>
                    ) : (
                        // Chat Messages
                        <div className="py-8 space-y-6 max-w-3xl w-full">
                            <AnimatePresence mode="popLayout">
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"
                                            }`}
                                    >
                                        {msg.role === "assistant" && (
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--bg-chat)] flex items-center justify-center border border-[var(--border)]">
                                                <BMOEyes status="idle" size="sm" />
                                            </div>
                                        )}

                                        <div
                                            className={`max-w-[75%] px-4 py-3 rounded-2xl ${msg.role === "user"
                                                ? "bg-[var(--accent)] text-[var(--bg)]"
                                                : "bg-[var(--bg-chat)] text-[var(--text)]"
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        </div>

                                        {msg.role === "user" && (
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center">
                                                <span className="text-[var(--bg)] text-sm font-semibold">
                                                    You
                                                </span>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Thinking indicator */}
                            {status === "thinking" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-4 justify-start"
                                >
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--bg-chat)] flex items-center justify-center border border-[var(--border)]">
                                        <BMOEyes status="thinking" size="sm" />
                                    </div>
                                    <div className="bg-[var(--bg-chat)] px-4 py-3 rounded-2xl">
                                        <div className="flex gap-1">
                                            {[0, 1, 2].map((i) => (
                                                <motion.div
                                                    key={i}
                                                    className="w-2 h-2 rounded-full bg-[var(--text-secondary)]"
                                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                                    transition={{
                                                        duration: 1,
                                                        repeat: Infinity,
                                                        delay: i * 0.2,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>
            </main>

            {/* Input Area - Fixed Bottom, Centered */}
            <div className="fixed bottom-0 left-0 right-0 p-4 flex flex-col items-center bg-gradient-to-t from-[var(--bg)] via-[var(--bg)] to-transparent">
                <div className="w-full max-w-3xl">
                    <div
                        className="rounded-2xl p-2 flex items-center gap-3 bg-[var(--bg-secondary)] border border-[var(--border)]"
                        style={{
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <div className="pl-4">
                            <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                        </div>

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                            placeholder={
                                status === "listening" ? "Listening..." : "Ask BMO anything..."
                            }
                            disabled={status !== "idle"}
                            className="flex-1 bg-transparent border-none outline-none text-[var(--text)] placeholder:text-[var(--text-secondary)] py-3 text-base"
                        />

                        {input.trim() ? (
                            <button
                                onClick={handleSubmit}
                                disabled={status !== "idle"}
                                className="btn-primary w-11 h-11 rounded-xl flex items-center justify-center mr-1"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={status === "listening" ? stopListening : startListening}
                                disabled={status === "thinking" || status === "speaking"}
                                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all mr-1 ${status === "listening"
                                    ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                                    : "btn-primary"
                                    }`}
                            >
                                {status === "listening" ? (
                                    <MicOff className="w-5 h-5" />
                                ) : (
                                    <Mic className="w-5 h-5" />
                                )}
                            </button>
                        )}
                    </div>

                    <p className="text-center text-xs text-[var(--text-secondary)] mt-3 opacity-70">
                        BMO may make mistakes. Always verify important information.
                    </p>
                </div>
            </div>
        </div>
    );
}
