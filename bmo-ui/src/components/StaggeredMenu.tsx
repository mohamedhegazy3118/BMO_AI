"use client";

import React, { useCallback, useLayoutEffect, useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { useTheme } from './theme-provider';
import { Clock, Menu, X, Palette, Sun, Moon, User, LogIn, Settings } from "lucide-react";
import Link from "next/link";
import { themes } from '@/lib/themes';
import { motion, AnimatePresence } from 'framer-motion';
import './StaggeredMenu.css';

export interface StaggeredMenuItem {
    label: string;
    ariaLabel: string;
    link: string;
}

export interface StaggeredMenuProps {
    items?: StaggeredMenuItem[];
    className?: string;
    onMenuOpen?: () => void;
    onMenuClose?: () => void;
}

export const StaggeredMenu: React.FC<StaggeredMenuProps> = ({
    items = [
        { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
        { label: 'Campus Map', ariaLabel: 'View campus map', link: '/map' },
        { label: 'BMO Robot', ariaLabel: 'Meet BMO Robot', link: '/robot' },
        { label: 'Contact', ariaLabel: 'Get in touch', link: '/contact' }
    ],
    className,
    onMenuOpen,
    onMenuClose
}: StaggeredMenuProps) => {
    const { mode, theme, setTheme, toggleMode } = useTheme();
    const [open, setOpen] = useState(false);
    const [time, setTime] = useState("");
    const [showThemePicker, setShowThemePicker] = useState(false);
    const openRef = useRef(false);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const preLayersRef = useRef<HTMLDivElement | null>(null);
    const preLayerElsRef = useRef<HTMLElement[]>([]);
    const plusHRef = useRef<HTMLSpanElement | null>(null);
    const plusVRef = useRef<HTMLSpanElement | null>(null);
    const iconRef = useRef<HTMLSpanElement | null>(null);
    const textInnerRef = useRef<HTMLSpanElement | null>(null);
    const textWrapRef = useRef<HTMLSpanElement | null>(null);
    const [textLines, setTextLines] = useState<string[]>(['Menu', 'Close']);

    const openTlRef = useRef<gsap.core.Timeline | null>(null);
    const closeTweenRef = useRef<gsap.core.Tween | null>(null);
    const spinTweenRef = useRef<gsap.core.Tween | null>(null);
    const textCycleAnimRef = useRef<gsap.core.Tween | null>(null);
    const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
    const busyRef = useRef(false);
    const itemEntranceTweenRef = useRef<gsap.core.Tween | null>(null);

    // Theme-aware colors
    const menuButtonColor = mode === 'dark' ? '#fff' : '#1a1a1a';
    const panelBg = mode === 'dark' ? 'var(--bg-secondary)' : '#ffffff';
    const textColor = mode === 'dark' ? '#fff' : '#1a1a1a';
    const accentColor = 'var(--accent)';

    // Clock effect
    useEffect(() => {
        const updateTime = () => {
            setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const panel = panelRef.current;
            const preContainer = preLayersRef.current;
            const plusH = plusHRef.current;
            const plusV = plusVRef.current;
            const icon = iconRef.current;
            const textInner = textInnerRef.current;
            if (!panel || !plusH || !plusV || !icon || !textInner) return;

            let preLayers: HTMLElement[] = [];
            if (preContainer) {
                preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer')) as HTMLElement[];
            }
            preLayerElsRef.current = preLayers;

            gsap.set([panel, ...preLayers], { xPercent: 100 });
            gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 });
            gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 });
            gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
            gsap.set(textInner, { yPercent: 0 });
            if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: menuButtonColor });
        });
        return () => ctx.revert();
    }, [menuButtonColor]);

    const buildOpenTimeline = useCallback(() => {
        const panel = panelRef.current;
        const layers = preLayerElsRef.current;
        if (!panel) return null;

        openTlRef.current?.kill();
        if (closeTweenRef.current) {
            closeTweenRef.current.kill();
            closeTweenRef.current = null;
        }
        itemEntranceTweenRef.current?.kill();

        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[];
        const numberEls = Array.from(
            panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item')
        ) as HTMLElement[];
        const actionBtns = Array.from(panel.querySelectorAll('.sm-action-btn')) as HTMLElement[];

        const layerStates = layers.map(el => ({ el, start: Number(gsap.getProperty(el, 'xPercent')) }));
        const panelStart = Number(gsap.getProperty(panel, 'xPercent'));

        if (itemEls.length) {
            gsap.set(itemEls, { yPercent: 140, rotate: 10 });
        }
        if (numberEls.length) {
            gsap.set(numberEls, { '--sm-num-opacity': 0 });
        }
        if (actionBtns.length) {
            gsap.set(actionBtns, { y: 25, opacity: 0 });
        }

        const tl = gsap.timeline({ paused: true });

        // Animate overlay
        if (overlayRef.current) {
            tl.to(overlayRef.current, {
                autoAlpha: 1,
                duration: 0.5,
                ease: 'power2.out'
            }, 0);
        }

        layerStates.forEach((ls, i) => {
            tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
        });
        const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
        const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
        const panelDuration = 0.65;
        tl.fromTo(
            panel,
            { xPercent: panelStart },
            { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
            panelInsertTime
        );

        if (itemEls.length) {
            const itemsStartRatio = 0.15;
            const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;
            tl.to(
                itemEls,
                {
                    yPercent: 0,
                    rotate: 0,
                    duration: 1,
                    ease: 'power4.out',
                    stagger: { each: 0.1, from: 'start' }
                },
                itemsStart
            );
            if (numberEls.length) {
                tl.to(
                    numberEls,
                    {
                        duration: 0.6,
                        ease: 'power2.out',
                        '--sm-num-opacity': 1,
                        stagger: { each: 0.08, from: 'start' }
                    },
                    itemsStart + 0.1
                );
            }
        }

        if (actionBtns.length) {
            const actionsStart = panelInsertTime + panelDuration * 0.5;
            tl.to(
                actionBtns,
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.55,
                    ease: 'power3.out',
                    stagger: { each: 0.08, from: 'start' }
                },
                actionsStart
            );
        }

        openTlRef.current = tl;
        return tl;
    }, []);

    const playOpen = useCallback(() => {
        if (busyRef.current) return;
        busyRef.current = true;
        const tl = buildOpenTimeline();
        if (tl) {
            tl.eventCallback('onComplete', () => {
                busyRef.current = false;
            });
            tl.play(0);
        } else {
            busyRef.current = false;
        }
    }, [buildOpenTimeline]);

    const playClose = useCallback(() => {
        openTlRef.current?.kill();
        openTlRef.current = null;
        itemEntranceTweenRef.current?.kill();

        const panel = panelRef.current;
        const layers = preLayerElsRef.current;
        if (!panel) return;

        const all: HTMLElement[] = [...layers, panel];
        closeTweenRef.current?.kill();

        // Hide overlay
        if (overlayRef.current) {
            gsap.to(overlayRef.current, { autoAlpha: 0, duration: 0.3, ease: 'power2.in' });
        }

        closeTweenRef.current = gsap.to(all, {
            xPercent: 100,
            duration: 0.32,
            ease: 'power3.in',
            overwrite: 'auto',
            onComplete: () => {
                const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[];
                if (itemEls.length) {
                    gsap.set(itemEls, { yPercent: 140, rotate: 10 });
                }
                const numberEls = Array.from(
                    panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item')
                ) as HTMLElement[];
                if (numberEls.length) {
                    gsap.set(numberEls, { '--sm-num-opacity': 0 });
                }
                const actionBtns = Array.from(panel.querySelectorAll('.sm-action-btn')) as HTMLElement[];
                if (actionBtns.length) gsap.set(actionBtns, { y: 25, opacity: 0 });
                busyRef.current = false;
            }
        });
    }, []);

    const animateIcon = useCallback((opening: boolean) => {
        const icon = iconRef.current;
        if (!icon) return;
        spinTweenRef.current?.kill();
        if (opening) {
            spinTweenRef.current = gsap.to(icon, { rotate: 225, duration: 0.8, ease: 'power4.out', overwrite: 'auto' });
        } else {
            spinTweenRef.current = gsap.to(icon, { rotate: 0, duration: 0.35, ease: 'power3.inOut', overwrite: 'auto' });
        }
    }, []);

    const animateText = useCallback((opening: boolean) => {
        const inner = textInnerRef.current;
        if (!inner) return;
        textCycleAnimRef.current?.kill();

        const currentLabel = opening ? 'Menu' : 'Close';
        const targetLabel = opening ? 'Close' : 'Menu';
        const cycles = 3;
        const seq: string[] = [currentLabel];
        let last = currentLabel;
        for (let i = 0; i < cycles; i++) {
            last = last === 'Menu' ? 'Close' : 'Menu';
            seq.push(last);
        }
        if (last !== targetLabel) seq.push(targetLabel);
        seq.push(targetLabel);
        setTextLines(seq);

        gsap.set(inner, { yPercent: 0 });
        const lineCount = seq.length;
        const finalShift = ((lineCount - 1) / lineCount) * 100;
        textCycleAnimRef.current = gsap.to(inner, {
            yPercent: -finalShift,
            duration: 0.5 + lineCount * 0.07,
            ease: 'power4.out'
        });
    }, []);

    const toggleMenu = useCallback(() => {
        const target = !openRef.current;
        openRef.current = target;
        setOpen(target);
        if (target) {
            onMenuOpen?.();
            playOpen();
        } else {
            onMenuClose?.();
            playClose();
        }
        animateIcon(target);
        animateText(target);
    }, [playOpen, playClose, animateIcon, animateText, onMenuOpen, onMenuClose]);

    const closeMenu = useCallback(() => {
        if (openRef.current) {
            openRef.current = false;
            setOpen(false);
            onMenuClose?.();
            playClose();
            animateIcon(false);
            animateText(false);
        }
    }, [playClose, animateIcon, animateText, onMenuClose]);

    React.useEffect(() => {
        if (!open) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(event.target as Node) &&
                toggleBtnRef.current &&
                !toggleBtnRef.current.contains(event.target as Node)
            ) {
                closeMenu();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open, closeMenu]);

    return (
        <div
            className={`staggered-menu-wrapper fixed-wrapper ${className || ''}`}
            style={{ '--sm-accent': accentColor } as React.CSSProperties}
            data-position="right"
            data-open={open || undefined}
            data-mode={mode}
        >
            {/* Backdrop Blur */}
            <div
                ref={overlayRef}
                className="course-menu-overlay"
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    zIndex: 51,
                    opacity: 0,
                    pointerEvents: open ? 'auto' : 'none',
                    visibility: 'hidden'
                }}
            />

            {/* Pre-layers for stagger effect */}
            <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
                <div className="sm-prelayer" style={{ background: 'var(--accent)', opacity: 0.3 }} />
                <div className="sm-prelayer" style={{ background: 'var(--accent)', opacity: 0.6 }} />
            </div>

            {/* Header with menu button */}
            <header className="staggered-menu-header">
                {/* Logo/Brand */}
                <div className="sm-logo">
                    <Link href="/" className="sm-logo-text block" style={{ color: menuButtonColor }}>BMO</Link>
                </div>


                {/* Center - Clock and Theme Picker */}
                <div className="sm-center-controls">
                    {/* Clock */}
                    <div className="sm-clock" style={{ color: menuButtonColor }}>
                        <Clock size={16} />
                        <span>{time}</span>
                    </div>

                    {/* Theme Picker Button */}
                    <button
                        className="sm-theme-btn"
                        onClick={() => setShowThemePicker(!showThemePicker)}
                        aria-label="Toggle theme picker"
                        style={{ color: menuButtonColor }}
                    >
                        <Palette size={18} />
                    </button>

                    {/* Mode Toggle */}
                    <button
                        className="sm-mode-btn"
                        onClick={toggleMode}
                        aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        style={{ color: menuButtonColor }}
                    >
                        {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>

                {/* Theme Picker Dropdown */}
                <AnimatePresence>
                    {showThemePicker && (
                        <motion.div
                            className="sm-theme-dropdown"
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="sm-theme-dropdown-inner">
                                {(Object.keys(themes) as Array<keyof typeof themes>).map((t) => (
                                    <button
                                        key={t}
                                        className={`sm-theme-option ${theme === t ? 'active' : ''}`}
                                        onClick={() => {
                                            setTheme(t);
                                            setShowThemePicker(false);
                                        }}
                                    >
                                        <span
                                            className="sm-theme-swatch"
                                            style={{ background: themes[t][mode].accent }}
                                        />
                                        <span>{themes[t].label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Menu Toggle Button */}
                <button
                    ref={toggleBtnRef}
                    className="sm-toggle"
                    aria-label={open ? 'Close menu' : 'Open menu'}
                    aria-expanded={open}
                    onClick={toggleMenu}
                    type="button"
                    style={{ color: menuButtonColor }}
                >
                    <span ref={textWrapRef} className="sm-toggle-textWrap">
                        <span ref={textInnerRef} className="sm-toggle-textInner">
                            {textLines.map((l, i) => (
                                <span className="sm-toggle-line" key={i}>{l}</span>
                            ))}
                        </span>
                    </span>
                    <span ref={iconRef} className="sm-icon">
                        <span ref={plusHRef} className="sm-icon-line" />
                        <span ref={plusVRef} className="sm-icon-line sm-icon-line-v" />
                    </span>
                </button>
            </header>

            {/* Menu Panel */}
            <aside
                ref={panelRef}
                className="staggered-menu-panel"
                style={{ background: panelBg, color: textColor }}
                aria-hidden={!open}
            >
                <div className="sm-panel-inner">
                    {/* Navigation Links */}
                    <ul className="sm-panel-list" role="list" data-numbering>
                        {items.map((it, idx) => (
                            <li className="sm-panel-itemWrap" key={it.label + idx}>
                                <a
                                    className="sm-panel-item"
                                    href={it.link}
                                    aria-label={it.ariaLabel}
                                    data-index={idx + 1}
                                    onClick={closeMenu}
                                >
                                    <span className="sm-panel-itemLabel">{it.label}</span>
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* User Actions Section */}
                    <div className="sm-actions">
                        <h3 className="sm-actions-title">Account</h3>
                        <div className="sm-actions-list">
                            <button className="sm-action-btn sm-action-btn--primary">
                                <LogIn size={18} />
                                <span>Sign In</span>
                            </button>
                            <button className="sm-action-btn sm-action-btn--secondary">
                                <User size={18} />
                                <span>Sign Up</span>
                            </button>
                            <button className="sm-action-btn sm-action-btn--ghost">
                                <Settings size={18} />
                                <span>Settings</span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default StaggeredMenu;
