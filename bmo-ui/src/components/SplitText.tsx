"use client";

import React, { useRef, useEffect, useState, createElement } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export interface SplitTextProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
    ease?: string;
    splitType?: 'chars' | 'words';
    from?: gsap.TweenVars;
    to?: gsap.TweenVars;
    tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
    textAlign?: React.CSSProperties['textAlign'];
    onAnimationComplete?: () => void;
}

const SplitText: React.FC<SplitTextProps> = ({
    text,
    className = '',
    delay = 50,
    duration = 0.8,
    ease = 'power3.out',
    splitType = 'chars',
    from = { opacity: 0, y: 40 },
    to = { opacity: 1, y: 0 },
    textAlign = 'center',
    tag = 'p',
    onAnimationComplete
}) => {
    const containerRef = useRef<HTMLElement>(null);
    const [elements, setElements] = useState<string[]>([]);
    const animatedRef = useRef(false);

    // Split text into chars or words
    useEffect(() => {
        if (splitType === 'chars') {
            setElements(text.split(''));
        } else {
            setElements(text.split(' '));
        }
        animatedRef.current = false;
    }, [text, splitType]);

    useGSAP(() => {
        if (!containerRef.current || elements.length === 0 || animatedRef.current) return;

        const chars = containerRef.current.querySelectorAll('.split-char');
        if (chars.length === 0) return;

        gsap.fromTo(
            chars,
            { ...from },
            {
                ...to,
                duration,
                ease,
                stagger: delay / 1000,
                onComplete: () => {
                    animatedRef.current = true;
                    onAnimationComplete?.();
                }
            }
        );
    }, { dependencies: [elements, delay, duration, ease], scope: containerRef });

    const style: React.CSSProperties = {
        textAlign,
        display: 'inline-block',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word'
    };

    const content = elements.map((char, i) => (
        <span
            key={`${char}-${i}`}
            className="split-char"
            style={{
                display: 'inline-block',
                willChange: 'transform, opacity',
                whiteSpace: char === ' ' ? 'pre' : 'normal'
            }}
        >
            {char === ' ' ? '\u00A0' : char}
            {splitType === 'words' && i < elements.length - 1 ? '\u00A0' : ''}
        </span>
    ));

    return createElement(
        tag,
        {
            ref: containerRef,
            style,
            className: `split-parent ${className}`
        },
        content
    );
};

export default SplitText;
