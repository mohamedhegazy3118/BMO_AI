"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Palette, Sun, Moon, User, ArrowRight, X } from "lucide-react";
import { useTheme } from "./theme-provider";
import { themes, themeNames } from "@/lib/themes";
import GradientText from "./GradientText";

export function Header() {
    const { theme, mode, setTheme, toggleMode } = useTheme();
    const [time, setTime] = useState("");
    const [showThemeMenu, setShowThemeMenu] = useState(false);

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            setTime(
                now.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                })
            );
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {/* Modern Floating Pill Navbar */}
            <motion.header
                className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.1 }}
            >
                <motion.nav
                    className="flex items-center gap-8 px-5 py-3 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)]"
                    style={{
                        boxShadow: mode === 'dark'
                            ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)'
                            : '0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)'
                    }}
                    whileHover={{
                        boxShadow: mode === 'dark'
                            ? '0 12px 48px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.4)'
                            : '0 12px 48px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08)',
                        y: -1
                    }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Theme Button */}
                    <motion.button
                        onClick={() => setShowThemeMenu(!showThemeMenu)}
                        className="flex items-center justify-center w-11 h-11 rounded-full transition-colors bg-[var(--bg-chat)]"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Theme"
                    >
                        <Palette className="w-5 h-5 text-[var(--accent)]" />
                    </motion.button>

                    {/* Time Display */}
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-[var(--text-secondary)]" />
                        <span
                            className="text-base text-[var(--text-secondary)] tracking-wide"
                            style={{ fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace" }}
                        >
                            {time}
                        </span>
                    </div>

                    {/* Profile Button */}
                    <motion.button
                        className="flex items-center justify-center w-11 h-11 rounded-full transition-colors bg-[var(--bg-chat)]"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Sign In"
                    >
                        <User className="w-5 h-5 text-[var(--text-secondary)]" />
                    </motion.button>

                    {/* Get Started - Gradient Text with Hover Effects */}
                    <motion.div
                        className="cursor-pointer"
                        whileHover={{
                            scale: 1.05,
                            filter: "drop-shadow(0 0 12px rgba(64, 255, 170, 0.5))"
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                        <GradientText
                            colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                            animationSpeed={3}
                            showBorder={false}
                            className="font-semibold text-base"
                        >
                            <motion.span
                                className="flex items-center gap-2"
                                whileHover={{ x: 0 }}
                            >
                                Get Started
                                <motion.span
                                    className="inline-block"
                                    whileHover={{ x: 4 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                >
                                    <ArrowRight className="w-5 h-5" />
                                </motion.span>
                            </motion.span>
                        </GradientText>
                    </motion.div>
                </motion.nav>
            </motion.header>

            {/* Premium Theme Selector */}
            <AnimatePresence>
                {showThemeMenu && (
                    <>
                        {/* Backdrop with blur */}
                        <motion.div
                            className="fixed inset-0 z-40 backdrop-blur-sm"
                            style={{ background: mode === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.3)' }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowThemeMenu(false)}
                        />

                        {/* Theme Panel */}
                        <motion.div
                            className="fixed top-20 left-1/2 z-50 w-[420px]"
                            initial={{ opacity: 0, y: -20, x: "-50%", scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        >
                            <div
                                className="rounded-2xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border)]"
                                style={{
                                    boxShadow: mode === 'dark'
                                        ? '0 25px 60px rgba(0, 0, 0, 0.6)'
                                        : '0 25px 60px rgba(0, 0, 0, 0.15)'
                                }}
                            >
                                {/* Header */}
                                <div
                                    className="px-6 py-5 flex items-center justify-between border-b border-[var(--border)]"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                                            style={{
                                                background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                                                boxShadow: '0 4px 12px rgba(var(--accent-rgb), 0.3)'
                                            }}
                                        >
                                            <Palette className="w-5 h-5 text-[var(--bg)]" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-[var(--text)]">
                                                Appearance
                                            </h3>
                                            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                                                Customize your interface
                                            </p>
                                        </div>
                                    </div>
                                    <motion.button
                                        onClick={() => setShowThemeMenu(false)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--bg-chat)]"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <X className="w-4 h-4 text-[var(--text-secondary)]" />
                                    </motion.button>
                                </div>

                                {/* Theme Grid */}
                                <div className="p-5">
                                    <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                                        Color Themes
                                    </p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {themeNames.map((t, index) => {
                                            const cfg = themes[t];
                                            const isActive = theme === t;
                                            const accentColor = cfg[mode].accent;

                                            return (
                                                <motion.button
                                                    key={t}
                                                    onClick={() => setTheme(t)}
                                                    className="relative group"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.03 }}
                                                >
                                                    <motion.div
                                                        className="flex flex-col items-center gap-3 p-4 rounded-xl transition-all"
                                                        style={{
                                                            background: isActive
                                                                ? `linear-gradient(135deg, ${accentColor}15, ${accentColor}08)`
                                                                : 'rgba(255, 255, 255, 0.02)',
                                                            border: isActive
                                                                ? `1px solid ${accentColor}50`
                                                                : '1px solid transparent'
                                                        }}
                                                        whileHover={{
                                                            background: isActive
                                                                ? `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`
                                                                : 'rgba(255, 255, 255, 0.05)',
                                                            y: -2
                                                        }}
                                                        whileTap={{ scale: 0.97 }}
                                                    >
                                                        {/* Color Orb */}
                                                        <div className="relative">
                                                            <motion.div
                                                                className="w-12 h-12 rounded-full"
                                                                style={{
                                                                    background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                                                                    boxShadow: isActive
                                                                        ? `0 4px 20px ${accentColor}60, 0 0 40px ${accentColor}30`
                                                                        : `0 2px 8px ${accentColor}30`
                                                                }}
                                                                animate={isActive ? {
                                                                    boxShadow: [
                                                                        `0 4px 20px ${accentColor}60, 0 0 40px ${accentColor}30`,
                                                                        `0 4px 30px ${accentColor}80, 0 0 60px ${accentColor}40`,
                                                                        `0 4px 20px ${accentColor}60, 0 0 40px ${accentColor}30`
                                                                    ]
                                                                } : {}}
                                                                transition={{ duration: 2, repeat: Infinity }}
                                                            />
                                                            {/* Active Check */}
                                                            {isActive && (
                                                                <motion.div
                                                                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                                                                    style={{
                                                                        background: 'var(--bg-secondary)',
                                                                        border: `2px solid ${accentColor}`
                                                                    }}
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    transition={{ type: "spring", stiffness: 500 }}
                                                                >
                                                                    <svg className="w-2.5 h-2.5" fill={accentColor} viewBox="0 0 24 24">
                                                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                                                    </svg>
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                        {/* Label */}
                                                        <span className={`text-xs font-medium ${isActive ? 'text-[var(--text)]' : 'text-[var(--text-secondary)]'}`}>
                                                            {cfg.label}
                                                        </span>
                                                    </motion.div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Dark Mode Section */}
                                <div
                                    className="px-5 pb-5 border-t border-[var(--border)]"
                                >
                                    <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-4 pt-5">
                                        Mode
                                    </p>
                                    <motion.button
                                        onClick={toggleMode}
                                        className="w-full flex items-center justify-between p-4 rounded-xl bg-[var(--bg-chat)]"
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <motion.div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--bg-secondary)]"
                                                animate={{ rotate: mode === "dark" ? 0 : 180 }}
                                                transition={{ type: "spring", stiffness: 200 }}
                                            >
                                                {mode === "dark" ? (
                                                    <Moon className="w-5 h-5 text-[var(--accent)]" />
                                                ) : (
                                                    <Sun className="w-5 h-5 text-amber-400" />
                                                )}
                                            </motion.div>
                                            <div className="text-left">
                                                <span className="text-sm font-medium text-[var(--text)] block">
                                                    {mode === "dark" ? "Dark Mode" : "Light Mode"}
                                                </span>
                                                <span className="text-xs text-[var(--text-secondary)]">
                                                    {mode === "dark" ? "Easier on the eyes at night" : "Best for bright environments"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Toggle Switch */}
                                        <div
                                            className="relative w-12 h-7 rounded-full transition-all duration-300"
                                            style={{
                                                background: mode === "dark"
                                                    ? 'linear-gradient(135deg, var(--accent), var(--accent-hover))'
                                                    : 'rgba(255, 255, 255, 0.1)',
                                                boxShadow: mode === "dark" ? '0 2px 8px rgba(var(--accent-rgb), 0.4)' : 'none'
                                            }}
                                        >
                                            <motion.div
                                                className="absolute top-1 w-5 h-5 rounded-full shadow-md"
                                                style={{ background: '#fff' }}
                                                animate={{ left: mode === "dark" ? "calc(100% - 22px)" : "3px" }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            />
                                        </div>
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence >
        </>
    );
}

export default Header;
