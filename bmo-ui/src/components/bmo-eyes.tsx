"use client";

import { motion, AnimatePresence } from "framer-motion";

type BMOStatus = "idle" | "listening" | "thinking" | "speaking";

interface BMOEyesProps {
    status: BMOStatus;
    size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
    sm: { eye: 32, gap: 16, highlight: 8 },
    md: { eye: 48, gap: 24, highlight: 12 },
    lg: { eye: 72, gap: 32, highlight: 16 },
    xl: { eye: 96, gap: 40, highlight: 20 },
};

// Thinking cloud bubble component
function ThinkingCloud({ delay = 0 }: { delay?: number }) {
    return (
        <motion.div
            className="absolute -top-8 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, scale: 0, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 10 }}
            transition={{ delay, duration: 0.3, type: "spring" }}
        >
            <div className="flex gap-1.5 items-end">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="rounded-full bg-[var(--accent)]"
                        style={{
                            width: 8 + i * 3,
                            height: 8 + i * 3,
                            opacity: 0.4 + i * 0.2,
                        }}
                        animate={{
                            y: [0, -4, 0],
                            opacity: [0.4 + i * 0.2, 0.8, 0.4 + i * 0.2]
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.15,
                        }}
                    />
                ))}
            </div>
        </motion.div>
    );
}

// Sound wave visualization for speaking
function SoundWaves() {
    return (
        <motion.div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1 items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                    key={i}
                    className="w-1 rounded-full bg-[var(--accent)]"
                    animate={{
                        height: [8, 16 + Math.random() * 8, 8],
                    }}
                    transition={{
                        duration: 0.3,
                        repeat: Infinity,
                        delay: i * 0.05,
                    }}
                    style={{ opacity: 0.6 }}
                />
            ))}
        </motion.div>
    );
}

// Listening pulse ring
function ListeningRing({ size }: { size: number }) {
    return (
        <motion.div
            className="absolute inset-0 rounded-full border-2 border-[var(--accent)]"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut",
            }}
            style={{
                width: size,
                height: size,
            }}
        />
    );
}

export function BMOEyes({ status, size = "lg" }: BMOEyesProps) {
    const s = sizeMap[size];
    const isActive = status !== "idle";

    // Eye animation variants based on status
    const getEyeAnimation = (index: number) => {
        switch (status) {
            case "listening":
                return {
                    scale: [1, 1.12, 1],
                    boxShadow: [
                        `0 0 20px var(--accent)`,
                        `0 0 40px var(--accent)`,
                        `0 0 20px var(--accent)`,
                    ],
                };
            case "thinking":
                return {
                    y: [0, -6, 0],
                    rotate: index === 0 ? [0, -5, 0] : [0, 5, 0],
                };
            case "speaking":
                return {
                    scaleY: [1, 0.7, 1],
                    scaleX: [1, 1.05, 1],
                };
            default:
                return {};
        }
    };

    const getTransition = (index: number) => {
        switch (status) {
            case "listening":
                return {
                    duration: 1.2,
                    repeat: Infinity,
                    delay: index * 0.1,
                    ease: "easeInOut" as const,
                };
            case "thinking":
                return {
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeInOut" as const,
                };
            case "speaking":
                return {
                    duration: 0.25,
                    repeat: Infinity,
                    delay: index * 0.05,
                };
            default:
                return {
                    duration: 4,
                    repeat: Infinity,
                };
        }
    };

    return (
        <div className="relative flex items-center justify-center" style={{ gap: s.gap }}>
            {/* Background glow effect */}
            <motion.div
                className="absolute inset-0 rounded-full blur-3xl"
                style={{
                    background: `radial-gradient(circle, var(--accent) 0%, transparent 70%)`,
                    opacity: isActive ? 0.3 : 0.15,
                    transform: 'scale(2)',
                }}
                animate={isActive ? { opacity: [0.2, 0.4, 0.2] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Thinking clouds */}
            <AnimatePresence>
                {status === "thinking" && <ThinkingCloud />}
            </AnimatePresence>

            {/* Eyes */}
            {[0, 1].map((i) => (
                <motion.div
                    key={i}
                    className="relative rounded-full bg-[var(--accent)]"
                    style={{
                        width: s.eye,
                        height: s.eye,
                        boxShadow: isActive
                            ? `0 0 ${s.eye / 2}px var(--accent), 0 4px 20px rgba(0,0,0,0.2)`
                            : `0 0 ${s.eye / 4}px var(--accent), 0 4px 12px rgba(0,0,0,0.15)`,
                    }}
                    animate={getEyeAnimation(i)}
                    transition={getTransition(i)}
                    // Idle blink animation via CSS
                    {...(status === "idle" && {
                        animate: { scaleY: [1, 1, 0.1, 1, 1] },
                        transition: {
                            duration: 4,
                            repeat: Infinity,
                            times: [0, 0.45, 0.5, 0.55, 1],
                            delay: i * 0.05
                        }
                    })}
                >
                    {/* Listening pulse rings */}
                    <AnimatePresence>
                        {status === "listening" && <ListeningRing size={s.eye} />}
                    </AnimatePresence>

                    {/* Primary highlight (top-left) */}
                    <motion.div
                        className="absolute rounded-full bg-white"
                        style={{
                            width: s.highlight,
                            height: s.highlight,
                            top: s.eye * 0.15,
                            left: s.eye * 0.15,
                            opacity: 0.7,
                        }}
                        animate={status === "thinking" ? { opacity: [0.7, 0.4, 0.7] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />

                    {/* Secondary highlight (smaller) */}
                    <motion.div
                        className="absolute rounded-full bg-white"
                        style={{
                            width: s.highlight * 0.5,
                            height: s.highlight * 0.5,
                            top: s.eye * 0.35,
                            left: s.eye * 0.35,
                            opacity: 0.4,
                        }}
                    />

                    {/* Inner glow */}
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 60%)',
                        }}
                    />
                </motion.div>
            ))}

            {/* Sound waves when speaking */}
            <AnimatePresence>
                {status === "speaking" && <SoundWaves />}
            </AnimatePresence>
        </div>
    );
}

export default BMOEyes;
