"use client";

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import './MagicBento.css';

export interface BentoCardData {
    emoji: string;
    title: string;
    description: string;
    action: string;
}

export interface MagicBentoProps {
    cards: BentoCardData[];
    onCardClick?: (action: string) => void;
    enableSpotlight?: boolean;
    enableBorderGlow?: boolean;
    enableTilt?: boolean;
    enableMagnetism?: boolean;
    clickEffect?: boolean;
    enableParticles?: boolean;
    spotlightRadius?: number;
    particleCount?: number;
    glowColor?: string;
}

const MOBILE_BREAKPOINT = 768;

const createParticleElement = (x: number, y: number, color: string): HTMLDivElement => {
    const el = document.createElement('div');
    el.className = 'bmo-particle';
    el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: ${color};
    box-shadow: 0 0 6px ${color};
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
    return el;
};

const ParticleCard: React.FC<{
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
    particleCount?: number;
    glowColor?: string;
    enableTilt?: boolean;
    clickEffect?: boolean;
    enableMagnetism?: boolean;
}> = ({
    children,
    className = '',
    style,
    onClick,
    particleCount = 8,
    glowColor = 'var(--accent)',
    enableTilt = true,
    clickEffect = true,
    enableMagnetism = false
}) => {
        const cardRef = useRef<HTMLDivElement>(null);
        const particlesRef = useRef<HTMLDivElement[]>([]);
        const timeoutsRef = useRef<number[]>([]);
        const isHoveredRef = useRef(false);

        const clearAllParticles = useCallback(() => {
            timeoutsRef.current.forEach(clearTimeout);
            timeoutsRef.current = [];

            particlesRef.current.forEach(particle => {
                gsap.to(particle, {
                    scale: 0,
                    opacity: 0,
                    duration: 0.3,
                    ease: 'back.in(1.7)',
                    onComplete: () => particle.remove()
                });
            });
            particlesRef.current = [];
        }, []);

        const animateParticles = useCallback(() => {
            if (!cardRef.current || !isHoveredRef.current) return;

            const { width, height } = cardRef.current.getBoundingClientRect();

            for (let i = 0; i < particleCount; i++) {
                const timeoutId = window.setTimeout(() => {
                    if (!isHoveredRef.current || !cardRef.current) return;

                    const particle = createParticleElement(
                        Math.random() * width,
                        Math.random() * height,
                        glowColor
                    );
                    cardRef.current.appendChild(particle);
                    particlesRef.current.push(particle);

                    gsap.fromTo(particle,
                        { scale: 0, opacity: 0 },
                        { scale: 1, opacity: 0.8, duration: 0.3, ease: 'back.out(1.7)' }
                    );

                    gsap.to(particle, {
                        x: (Math.random() - 0.5) * 60,
                        y: (Math.random() - 0.5) * 60,
                        duration: 1.5 + Math.random(),
                        ease: 'none',
                        repeat: -1,
                        yoyo: true
                    });

                    gsap.to(particle, {
                        opacity: 0.3,
                        duration: 1,
                        ease: 'power2.inOut',
                        repeat: -1,
                        yoyo: true
                    });
                }, i * 80);

                timeoutsRef.current.push(timeoutId);
            }
        }, [particleCount, glowColor]);

        useEffect(() => {
            if (!cardRef.current) return;
            const element = cardRef.current;

            const handleMouseEnter = () => {
                isHoveredRef.current = true;
                animateParticles();

                if (enableTilt) {
                    gsap.to(element, {
                        rotateX: 5,
                        rotateY: 5,
                        scale: 1.02,
                        duration: 0.3,
                        ease: 'power2.out',
                        transformPerspective: 1000
                    });
                }
            };

            const handleMouseLeave = () => {
                isHoveredRef.current = false;
                clearAllParticles();

                gsap.to(element, {
                    rotateX: 0,
                    rotateY: 0,
                    scale: 1,
                    x: 0,
                    y: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            };

            const handleMouseMove = (e: MouseEvent) => {
                if (!enableTilt && !enableMagnetism) return;

                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                if (enableTilt) {
                    const rotateX = ((y - centerY) / centerY) * -8;
                    const rotateY = ((x - centerX) / centerX) * 8;

                    gsap.to(element, {
                        rotateX,
                        rotateY,
                        duration: 0.1,
                        ease: 'power2.out',
                        transformPerspective: 1000
                    });
                }

                if (enableMagnetism) {
                    const magnetX = (x - centerX) * 0.03;
                    const magnetY = (y - centerY) * 0.03;

                    gsap.to(element, {
                        x: magnetX,
                        y: magnetY,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }
            };

            const handleClick = (e: MouseEvent) => {
                if (!clickEffect) return;

                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const maxDistance = Math.max(
                    Math.hypot(x, y),
                    Math.hypot(x - rect.width, y),
                    Math.hypot(x, y - rect.height),
                    Math.hypot(x - rect.width, y - rect.height)
                );

                const ripple = document.createElement('div');
                ripple.className = 'bmo-ripple';
                ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
        opacity: 0.3;
      `;

                element.appendChild(ripple);

                gsap.fromTo(
                    ripple,
                    { scale: 0, opacity: 0.3 },
                    {
                        scale: 1,
                        opacity: 0,
                        duration: 0.6,
                        ease: 'power2.out',
                        onComplete: () => ripple.remove()
                    }
                );

                onClick?.();
            };

            element.addEventListener('mouseenter', handleMouseEnter);
            element.addEventListener('mouseleave', handleMouseLeave);
            element.addEventListener('mousemove', handleMouseMove);
            element.addEventListener('click', handleClick);

            return () => {
                isHoveredRef.current = false;
                element.removeEventListener('mouseenter', handleMouseEnter);
                element.removeEventListener('mouseleave', handleMouseLeave);
                element.removeEventListener('mousemove', handleMouseMove);
                element.removeEventListener('click', handleClick);
                clearAllParticles();
            };
        }, [animateParticles, clearAllParticles, enableTilt, enableMagnetism, clickEffect, onClick]);

        return (
            <div
                ref={cardRef}
                className={className}
                style={{ ...style, position: 'relative', overflow: 'hidden' }}
            >
                {children}
            </div>
        );
    };

const MagicBento: React.FC<MagicBentoProps> = ({
    cards,
    onCardClick,
    enableSpotlight = true,
    enableBorderGlow = true,
    enableTilt = true,
    enableMagnetism = false,
    clickEffect = true,
    enableParticles = true,
    spotlightRadius = 200,
    particleCount = 8,
    glowColor = 'var(--accent)'
}) => {
    const gridRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isMobile || !enableSpotlight || !gridRef.current) return;

        const handleMouseMove = (e: MouseEvent) => {
            const cards = gridRef.current?.querySelectorAll('.bmo-bento-card');
            if (!cards) return;

            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const distance = Math.hypot(
                    e.clientX - (rect.left + rect.width / 2),
                    e.clientY - (rect.top + rect.height / 2)
                );

                const intensity = Math.max(0, 1 - distance / spotlightRadius);

                (card as HTMLElement).style.setProperty('--glow-x', `${(x / rect.width) * 100}%`);
                (card as HTMLElement).style.setProperty('--glow-y', `${(y / rect.height) * 100}%`);
                (card as HTMLElement).style.setProperty('--glow-intensity', intensity.toString());
            });
        };

        document.addEventListener('mousemove', handleMouseMove);
        return () => document.removeEventListener('mousemove', handleMouseMove);
    }, [isMobile, enableSpotlight, spotlightRadius]);

    return (
        <div className="bmo-bento-grid" ref={gridRef}>
            {cards.map((card, index) => (
                <ParticleCard
                    key={index}
                    className={`bmo-bento-card ${enableBorderGlow ? 'bmo-bento-card--glow' : ''}`}
                    onClick={() => onCardClick?.(card.action)}
                    particleCount={enableParticles ? particleCount : 0}
                    glowColor={glowColor}
                    enableTilt={!isMobile && enableTilt}
                    clickEffect={clickEffect}
                    enableMagnetism={!isMobile && enableMagnetism}
                >
                    <div className="bmo-bento-card__emoji">{card.emoji}</div>
                    <div className="bmo-bento-card__content">
                        <h3 className="bmo-bento-card__title">{card.title}</h3>
                        <p className="bmo-bento-card__description">{card.description}</p>
                    </div>
                </ParticleCard>
            ))}
        </div>
    );
};

export default MagicBento;
