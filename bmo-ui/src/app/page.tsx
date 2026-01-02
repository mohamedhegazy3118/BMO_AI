"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MicOff, Sparkles, Bot } from "lucide-react";
import ChatInput from "@/components/ChatInput";
import StaggeredMenu from "@/components/StaggeredMenu";
import BMOEyes from "@/components/bmo-eyes";

import SplitText from "@/components/SplitText";
import MagicBento from "@/components/MagicBento";
import { sendTranscript, wakeSession } from "@/lib/api";
import { generateGreeting, estimateWeather } from "@/lib/greetings";

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

const DynamicGreeting = () => {
    const [greetingData, setGreetingData] = useState({ greeting: '', emoji: '' });

    useEffect(() => {
        const now = new Date();
        const weather = estimateWeather(now.getHours(), now.getMonth());
        const { greeting, emoji } = generateGreeting(now, weather);
        setGreetingData({ greeting, emoji });
    }, []);

    if (!greetingData.greeting) return null;

    return (
        <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">{greetingData.emoji}</span>
            <SplitText
                text={greetingData.greeting}
                tag="h1"
                className="text-4xl md:text-5xl font-bold text-[var(--text)] text-center"
                delay={40}
                duration={0.6}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 40, rotateX: 90 }}
                to={{ opacity: 1, y: 0, rotateX: 0 }}
            />
        </div>
    );
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
                    content: res.narration || "I'm here to help!",
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
            {/* Navigation Menu */}
            <StaggeredMenu />

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col pt-28 pb-36">
                {/* Messages or Welcome */}
                <div className="flex-1 w-full px-8 flex flex-col items-center justify-center">
                    {messages.length === 0 ? (
                        // Welcome State - Full Desktop Layout
                        <div className="flex flex-col items-center justify-center w-full max-w-5xl">

                            {/* BMO Face Screen - Large container for eyes */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                className="mb-16"
                            >
                                {/* The Screen */}
                                <div
                                    className="relative flex items-center justify-center rounded-3xl overflow-hidden"
                                    style={{
                                        width: '320px',
                                        height: '220px',
                                        background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-chat) 100%)',
                                        border: '3px solid var(--border)',
                                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25), inset 0 2px 20px rgba(0, 0, 0, 0.1)'
                                    }}
                                >
                                    {/* Screen glow */}
                                    <div
                                        className="absolute inset-0 pointer-events-none"
                                        style={{
                                            background: 'radial-gradient(ellipse at center, rgba(var(--accent-rgb), 0.08) 0%, transparent 70%)'
                                        }}
                                    />

                                    {/* Scan lines */}
                                    <div
                                        className="absolute inset-0 pointer-events-none opacity-[0.03]"
                                        style={{
                                            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
                                        }}
                                    />

                                    {/* Top highlight */}
                                    <div
                                        className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
                                        style={{
                                            background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)'
                                        }}
                                    />

                                    {/* Eyes centered */}
                                    <BMOEyes status={status} size="xl" />
                                </div>
                            </motion.div>

                            {/* Dynamic Greeting - Changes based on time/season/weather */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.15, type: "spring" }}
                                className="mb-3"
                            >
                                <DynamicGreeting />
                            </motion.div>

                            {/* Description */}
                            <motion.p
                                className="text-xl text-[var(--text-secondary)] mb-16 max-w-xl leading-relaxed text-center"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.25, type: "spring" }}
                            >
                                Your AI campus assistant. Ask me about classes, navigation,
                                professors, or anything else!
                            </motion.p>

                            {/* Large Bento Cards Grid - Full Width */}
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4, type: "spring" }}
                                className="w-full"
                            >
                                <MagicBento
                                    cards={[
                                        {
                                            emoji: "🗺️",
                                            title: "Navigate",
                                            description: "Find my class",
                                            action: "Navigate to my class"
                                        },
                                        {
                                            emoji: "📚",
                                            title: "Canvas",
                                            description: "Check assignments",
                                            action: "Check Canvas"
                                        },
                                        {
                                            emoji: "👨‍🏫",
                                            title: "Professor",
                                            description: "Find contact info",
                                            action: "Find a professor"
                                        },
                                        {
                                            emoji: "❓",
                                            title: "Help",
                                            description: "What can you do?",
                                            action: "What can you do?"
                                        }
                                    ]}
                                    onCardClick={(action) => sendMessage(action)}
                                    enableSpotlight={true}
                                    enableBorderGlow={true}
                                    enableTilt={true}
                                    enableParticles={true}
                                    clickEffect={true}
                                    particleCount={8}
                                />
                            </motion.div>
                        </div>
                    ) : (
                        // Chat Messages
                        <div className="py-8 space-y-6 max-w-3xl w-full">
                            <AnimatePresence mode="popLayout">
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"
                                            }`}
                                    >
                                        {/* Assistant Avatar */}
                                        {msg.role === "assistant" && (
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-sm mt-1">
                                                <Bot className="w-5 h-5 text-[var(--bg)]" />
                                            </div>
                                        )}

                                        {/* Message Bubble */}
                                        <div
                                            className={`max-w-[85%] px-6 py-4 shadow-md text-base leading-relaxed ${msg.role === "user"
                                                ? "bg-[var(--accent)] text-[var(--bg)] rounded-[2rem] rounded-tr-sm"
                                                : "bg-[var(--bg-chat)] text-[var(--text)] rounded-[2rem] rounded-tl-sm border border-[var(--border)]"
                                                }`}
                                        >
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </div>
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
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-sm mt-1">
                                        <Bot className="w-5 h-5 text-[var(--bg)]" />
                                    </div>
                                    <div className="bg-[var(--bg-chat)] px-6 py-5 rounded-[2rem] rounded-tl-sm border border-[var(--border)] shadow-md">
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

            {/* Input Area */}
            <ChatInput
                input={input}
                setInput={setInput}
                onSubmit={handleSubmit}
                status={status}
                onMicClick={() => status === "listening" ? stopListening() : startListening()}
            />
        </div>
    );
}
