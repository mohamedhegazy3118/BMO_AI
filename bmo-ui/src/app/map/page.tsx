"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ZoomIn,
    ZoomOut,
    Maximize2,
    Minimize2,
    Home,
    RotateCcw,
    Move,
    MapPin
} from "lucide-react";
import Link from "next/link";

export default function CampusMapPage() {
    const [scale, setScale] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);

    const MIN_SCALE = 0.5;
    const MAX_SCALE = 3;
    const ZOOM_STEP = 0.25;

    // Zoom controls
    const handleZoomIn = () => {
        setScale((prev) => Math.min(prev + ZOOM_STEP, MAX_SCALE));
    };

    const handleZoomOut = () => {
        setScale((prev) => Math.max(prev - ZOOM_STEP, MIN_SCALE));
    };

    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    // Fullscreen toggle
    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            await containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            await document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Listen for fullscreen changes (e.g., user presses Escape)
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    // Mouse wheel zoom
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        setScale((prev) => Math.min(Math.max(prev + delta, MIN_SCALE), MAX_SCALE));
    };

    // Drag to pan
    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale > 1) {
            setIsDragging(true);
            e.preventDefault();
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && scale > 1) {
            setPosition((prev) => ({
                x: prev.x + e.movementX,
                y: prev.y + e.movementY,
            }));
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "+" || e.key === "=") handleZoomIn();
            if (e.key === "-") handleZoomOut();
            if (e.key === "0") handleReset();
            if (e.key === "f" || e.key === "F") toggleFullscreen();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div
            ref={containerRef}
            className={`min-h-screen flex flex-col ${isFullscreen ? 'bg-[var(--bg)]' : ''}`}
        >
            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border)]"
            >
                {/* Back to Home */}
                <Link
                    href="/"
                    className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
                >
                    <Home size={20} />
                    <span className="hidden sm:inline font-medium">Back to BMO</span>
                </Link>

                {/* Title */}
                <div className="flex items-center gap-3">
                    <MapPin className="text-[var(--accent)]" size={24} />
                    <div className="text-center">
                        <h1 className="text-lg md:text-xl font-bold text-[var(--text)]">
                            Campus Map
                        </h1>
                        <p className="text-xs text-[var(--text-secondary)] hidden sm:block">
                            Alamein International University
                        </p>
                    </div>
                </div>

                {/* Zoom Level Indicator */}
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="hidden sm:inline">{Math.round(scale * 100)}%</span>
                </div>
            </motion.header>

            {/* Map Container */}
            <main className="flex-1 relative overflow-hidden bg-[var(--bg-secondary)]">
                {/* Map Image */}
                <motion.div
                    ref={imageRef}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{
                        scale: 1,
                        opacity: 1,
                    }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center p-4 md:p-8"
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
                >
                    <motion.div
                        animate={{
                            scale: scale,
                            x: position.x,
                            y: position.y,
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-[var(--border)]"
                        style={{
                            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.3), 0 0 40px rgba(var(--accent-rgb), 0.1)',
                        }}
                    >
                        {/* Map Image */}
                        <img
                            src="/bmo-campus-map.png"
                            alt="AIU Campus Map"
                            className="max-w-full max-h-[70vh] object-contain select-none"
                            draggable={false}
                        />

                        {/* Overlay gradient for style */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: 'linear-gradient(180deg, rgba(0,0,0,0) 80%, rgba(0,0,0,0.1) 100%)',
                            }}
                        />
                    </motion.div>
                </motion.div>

                {/* Controls Panel */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="absolute bottom-6 right-6 flex flex-col gap-2"
                >
                    {/* Zoom Controls */}
                    <div className="flex flex-col gap-1 p-2 rounded-xl bg-[var(--bg)]/90 backdrop-blur-xl border border-[var(--border)] shadow-lg">
                        <ControlButton
                            onClick={handleZoomIn}
                            icon={<ZoomIn size={20} />}
                            label="Zoom In (+)"
                            disabled={scale >= MAX_SCALE}
                        />
                        <ControlButton
                            onClick={handleZoomOut}
                            icon={<ZoomOut size={20} />}
                            label="Zoom Out (-)"
                            disabled={scale <= MIN_SCALE}
                        />
                        <div className="h-px bg-[var(--border)] my-1" />
                        <ControlButton
                            onClick={handleReset}
                            icon={<RotateCcw size={20} />}
                            label="Reset (0)"
                        />
                        <ControlButton
                            onClick={toggleFullscreen}
                            icon={isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                            label="Fullscreen (F)"
                        />
                    </div>
                </motion.div>

                {/* Drag hint (shown when zoomed) */}
                <AnimatePresence>
                    {scale > 1 && !isDragging && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg)]/90 backdrop-blur-xl border border-[var(--border)] text-sm text-[var(--text-secondary)]"
                        >
                            <Move size={16} />
                            <span>Drag to pan</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Coming Soon Banner */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 backdrop-blur-sm"
                >
                    <p className="text-sm text-[var(--accent)] font-medium">
                        ✨ Interactive map coming soon
                    </p>
                </motion.div>
            </main>
        </div>
    );
}

// Control Button Component
interface ControlButtonProps {
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    disabled?: boolean;
}

function ControlButton({ onClick, icon, label, disabled }: ControlButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            onClick={onClick}
            disabled={disabled}
            title={label}
            className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                transition-colors
                ${disabled
                    ? 'text-[var(--text-secondary)]/40 cursor-not-allowed'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-chat)]'
                }
            `}
        >
            {icon}
        </motion.button>
    );
}
