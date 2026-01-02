"use client";

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { gsap } from 'gsap';
import './Shuffle.css';

export interface ShuffleProps {
    text: string;
    className?: string;
    style?: React.CSSProperties;
    shuffleDirection?: 'left' | 'right';
    duration?: number;
    maxDelay?: number;
    ease?: gsap.EaseString | gsap.EaseFunction;
    threshold?: number;
    rootMargin?: string;
    tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
    textAlign?: React.CSSProperties['textAlign'];
    onShuffleComplete?: () => void;
    shuffleTimes?: number;
    animationMode?: 'random' | 'evenodd';
    loop?: boolean;
    loopDelay?: number;
    stagger?: number;
    scrambleCharset?: string;
    colorFrom?: string;
    colorTo?: string;
    triggerOnce?: boolean;
    respectReducedMotion?: boolean;
    triggerOnHover?: boolean;
    autoPlay?: boolean;
}

const Shuffle: React.FC<ShuffleProps> = ({
    text,
    className = '',
    style = {},
    shuffleDirection = 'right',
    duration = 0.35,
    maxDelay = 0,
    ease = 'power3.out',
    threshold = 0.1,
    rootMargin = '-100px',
    tag = 'h1',
    textAlign = 'center',
    onShuffleComplete,
    shuffleTimes = 1,
    animationMode = 'evenodd',
    loop = false,
    loopDelay = 0,
    stagger = 0.03,
    scrambleCharset = '',
    colorFrom,
    colorTo,
    triggerOnce = true,
    respectReducedMotion = true,
    triggerOnHover = true,
    autoPlay = true
}) => {
    const ref = useRef<HTMLElement>(null);
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [ready, setReady] = useState(false);
    const wrappersRef = useRef<HTMLElement[]>([]);
    const tlRef = useRef<gsap.core.Timeline | null>(null);
    const playingRef = useRef(false);
    const hoverHandlerRef = useRef<((e: Event) => void) | null>(null);
    const initializedRef = useRef(false);

    useEffect(() => {
        if ('fonts' in document) {
            if (document.fonts.status === 'loaded') setFontsLoaded(true);
            else document.fonts.ready.then(() => setFontsLoaded(true));
        } else setFontsLoaded(true);
    }, []);

    const teardown = useCallback(() => {
        if (tlRef.current) {
            tlRef.current.kill();
            tlRef.current = null;
        }
        wrappersRef.current = [];
        playingRef.current = false;
    }, []);

    const build = useCallback(() => {
        if (!ref.current) return;
        teardown();

        const el = ref.current;
        const chars = text.split('');
        el.innerHTML = '';

        wrappersRef.current = [];
        const rolls = Math.max(1, Math.floor(shuffleTimes));
        const rand = (set: string) => set.charAt(Math.floor(Math.random() * set.length)) || '';

        chars.forEach((char) => {
            const wrap = document.createElement('span');
            wrap.className = 'shuffle-char-wrapper';
            wrap.style.display = 'inline-block';
            wrap.style.overflow = 'hidden';
            wrap.style.verticalAlign = 'baseline';

            const inner = document.createElement('span');
            inner.className = 'shuffle-char-inner';
            inner.style.display = 'inline-flex';
            inner.style.whiteSpace = 'nowrap';
            inner.style.willChange = 'transform';

            // Create character spans
            const createCharSpan = (c: string) => {
                const span = document.createElement('span');
                span.className = 'shuffle-char';
                span.textContent = c === ' ' ? '\u00A0' : c;
                span.style.display = 'inline-block';
                span.style.textAlign = 'center';
                return span;
            };

            // First copy
            inner.appendChild(createCharSpan(char));

            // Scramble characters
            for (let k = 0; k < rolls; k++) {
                const c = scrambleCharset ? rand(scrambleCharset) : char;
                inner.appendChild(createCharSpan(c));
            }

            // Original at end
            const orig = createCharSpan(char);
            orig.setAttribute('data-orig', '1');
            inner.appendChild(orig);

            wrap.appendChild(inner);
            el.appendChild(wrap);
            wrappersRef.current.push(wrap);
        });

        // Set initial positions after DOM update
        requestAnimationFrame(() => {
            wrappersRef.current.forEach((wrap) => {
                const inner = wrap.firstElementChild as HTMLElement;
                if (!inner) return;

                const firstChar = inner.firstElementChild as HTMLElement;
                if (!firstChar) return;

                const w = firstChar.getBoundingClientRect().width;
                wrap.style.width = `${w}px`;

                const steps = rolls + 1;
                let startX = 0;
                let finalX = -steps * w;

                if (shuffleDirection === 'right') {
                    // Reverse order for right direction
                    const children = Array.from(inner.children);
                    children.reverse().forEach(child => inner.appendChild(child));
                    startX = -steps * w;
                    finalX = 0;
                }

                gsap.set(inner, { x: startX, force3D: true });
                if (colorFrom) inner.style.color = colorFrom;

                inner.setAttribute('data-final-x', String(finalX));
                inner.setAttribute('data-start-x', String(startX));
            });
        });
    }, [text, shuffleTimes, scrambleCharset, shuffleDirection, colorFrom, teardown]);

    const play = useCallback(() => {
        const inners = wrappersRef.current.map(w => w.firstElementChild as HTMLElement).filter(Boolean);
        if (!inners.length) return;

        playingRef.current = true;

        const tl = gsap.timeline({
            smoothChildTiming: true,
            repeat: loop ? -1 : 0,
            repeatDelay: loop ? loopDelay : 0,
            onComplete: () => {
                playingRef.current = false;
                onShuffleComplete?.();
            }
        });

        const addTween = (targets: HTMLElement[], at: number) => {
            tl.to(
                targets,
                {
                    x: (i, t: HTMLElement) => parseFloat(t.getAttribute('data-final-x') || '0'),
                    duration,
                    ease,
                    force3D: true,
                    stagger: animationMode === 'evenodd' ? stagger : 0
                },
                at
            );
            if (colorFrom && colorTo) {
                tl.to(targets, { color: colorTo, duration, ease }, at);
            }
        };

        if (animationMode === 'evenodd') {
            const odd = inners.filter((_, i) => i % 2 === 1);
            const even = inners.filter((_, i) => i % 2 === 0);
            const oddTotal = duration + Math.max(0, odd.length - 1) * stagger;
            const evenStart = odd.length ? oddTotal * 0.7 : 0;
            if (odd.length) addTween(odd, 0);
            if (even.length) addTween(even, evenStart);
        } else {
            inners.forEach(strip => {
                const d = Math.random() * maxDelay;
                tl.to(
                    strip,
                    {
                        x: parseFloat(strip.getAttribute('data-final-x') || '0'),
                        duration,
                        ease,
                        force3D: true
                    },
                    d
                );
                if (colorFrom && colorTo) {
                    tl.fromTo(strip, { color: colorFrom }, { color: colorTo, duration, ease }, d);
                }
            });
        }

        tlRef.current = tl;
    }, [duration, ease, animationMode, stagger, maxDelay, colorFrom, colorTo, loop, loopDelay, onShuffleComplete]);

    const armHover = useCallback(() => {
        if (!triggerOnHover || !ref.current) return;

        if (hoverHandlerRef.current) {
            ref.current.removeEventListener('mouseenter', hoverHandlerRef.current);
        }

        const handler = () => {
            if (playingRef.current) return;
            build();
            requestAnimationFrame(() => {
                setTimeout(play, 50);
            });
        };
        hoverHandlerRef.current = handler;
        ref.current.addEventListener('mouseenter', handler);
    }, [triggerOnHover, build, play]);

    useEffect(() => {
        if (!ref.current || !text || !fontsLoaded || initializedRef.current) return;

        if (respectReducedMotion && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            onShuffleComplete?.();
            return;
        }

        initializedRef.current = true;

        if (autoPlay) {
            build();
            setTimeout(() => {
                play();
                setReady(true);
                armHover();
            }, 100);
        } else {
            setReady(true);
            armHover();
        }

        return () => {
            if (hoverHandlerRef.current && ref.current) {
                ref.current.removeEventListener('mouseenter', hoverHandlerRef.current);
            }
            teardown();
        };
    }, [text, fontsLoaded, respectReducedMotion, autoPlay, build, play, armHover, teardown, onShuffleComplete]);

    const commonStyle: React.CSSProperties = useMemo(() => ({ textAlign, ...style }), [textAlign, style]);
    const classes = useMemo(() => `shuffle-parent ${ready ? 'is-ready' : ''} ${className}`, [ready, className]);

    // Render based on tag
    const props = {
        ref: ref as React.RefObject<HTMLHeadingElement>,
        className: classes,
        style: commonStyle
    };

    switch (tag) {
        case 'h1': return <h1 {...props}>{text}</h1>;
        case 'h2': return <h2 {...props}>{text}</h2>;
        case 'h3': return <h3 {...props}>{text}</h3>;
        case 'h4': return <h4 {...props}>{text}</h4>;
        case 'h5': return <h5 {...props}>{text}</h5>;
        case 'h6': return <h6 {...props}>{text}</h6>;
        case 'p': return <p {...props}>{text}</p>;
        case 'span': return <span {...props}>{text}</span>;
        default: return <h1 {...props}>{text}</h1>;
    }
};

export default Shuffle;
