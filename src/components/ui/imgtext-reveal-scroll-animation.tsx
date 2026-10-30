'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface RevealLine {
  id?: string;
  prefix?: string;
  image?: string;
  alt?: string;
  suffix?: string;
  fullText?: string;
}

export interface ImageTextRevealProps {
  lines?: RevealLine[];
  revealWidthDesktop?: number;
  revealWidthMobile?: number;
  floatingWidth?: number;
  floatingHeight?: number;
  className?: string;
  textClassName?: string;
}

// DevCore "Core of Engineering" High-Tech Curated Unsplash Assets
const DEFAULT_LINES: RevealLine[] = [
  {
    prefix: 'DEVCORE IS',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    alt: 'Microchip & Architecture',
    suffix: 'THE CORE',
  },
  {
    prefix: 'ARCHITECTING',
    image:
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    alt: 'High Performance Infrastructure',
    suffix: 'FUTURE WEB',
  },
  {
    prefix: 'AUTONOMOUS',
    image:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    alt: 'AI Neural Networks',
    suffix: 'AI MESHES',
  },
  {
    fullText: 'MISSION CRITICAL RESILIENCE',
  },
  {
    prefix: 'ENGINEERED',
    image:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    alt: 'Global Scale Cloud Network',
    suffix: 'AT SCALE.',
  },
];

export const ImageTextReveal: React.FC<ImageTextRevealProps> = ({
  lines = DEFAULT_LINES,
  revealWidthDesktop = 260,
  revealWidthMobile = 85,
  className = '',
  textClassName = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseImgRef = useRef<HTMLDivElement>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [progressVal, setProgressVal] = useState<number>(0.5);

  // 1. Direct Scroll-driven reveal inside single-page WebGL canvas loop
  useEffect(() => {
    const handleScrollProgress = (e: any) => {
      if (typeof e.detail?.progress === 'number') {
        setProgressVal(e.detail.progress);
      }
    };
    window.addEventListener('devcore:core-reveal-progress', handleScrollProgress);
    return () => window.removeEventListener('devcore:core-reveal-progress', handleScrollProgress);
  }, []);

  // 2. Mouse follow interaction for hover preview
  useEffect(() => {
    const moveMouse = (e: MouseEvent) => {
      if (mouseImgRef.current) {
        gsap.to(mouseImgRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.35,
          ease: 'power3.out',
        });
      }
    };

    window.addEventListener('mousemove', moveMouse);
    return () => {
      window.removeEventListener('mousemove', moveMouse);
    };
  }, []);

  // Responsive dynamic image expansion width based on progress & screen
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const targetRevealWidth = isMobile ? revealWidthMobile : revealWidthDesktop;

  // Parallax expansion based on scroll progress (0.0 -> 1.0)
  const currentImgWidth = Math.max(15, Math.min(targetRevealWidth, progressVal * targetRevealWidth * 1.3));

  const defaultTextClass =
    'text-[clamp(1.2rem,4.4vw,4.6rem)] font-black tracking-tight leading-none uppercase select-none text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.85)]';

  const combinedTextClass = textClassName
    ? `${defaultTextClass} ${textClassName}`
    : defaultTextClass;

  const fallbackFirstImage = lines.find((l) => l.image)?.image || '';

  return (
    <div
      className={`relative w-full max-w-6xl mx-auto overflow-x-hidden selection:bg-cyan-400 selection:text-slate-950 cursor-default py-6 md:py-10 px-3 md:px-6 ${className}`}
    >
      {/* FLOATING MOUSE IMAGE FOLLOWER */}
      <div
        ref={mouseImgRef}
        className={`fixed top-0 left-0 
          w-[240px] h-[160px]          
          md:w-[440px] md:h-[280px]    
          pointer-events-none z-[9999] overflow-hidden rounded-2xl 
          transition-all duration-300 -translate-x-1/2 -translate-y-1/2 
          shadow-[0_30px_70px_rgba(0,0,0,0.7),0_0_35px_rgba(56,189,248,0.35)] 
          border border-cyan-200/50 backdrop-blur-xl bg-slate-950/80
          ${activeImage ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
      >
        <img
          src={activeImage || fallbackFirstImage}
          className="w-full h-full object-cover"
          alt="Engineering highlight preview"
          loading="lazy"
        />
      </div>

      {/* TOP PILL BADGE */}
      <div className="flex justify-center mb-6 md:mb-8 pointer-events-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-400/15 border border-cyan-200/40 text-cyan-200 text-[0.68rem] md:text-xs font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(56,189,248,0.3)] backdrop-blur-xl">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9] animate-pulse" />
          <span>Core Engineering Philosophy</span>
        </div>
      </div>

      {/* TEXT LINES CONTAINER */}
      <div
        ref={containerRef}
        className="w-full flex flex-col justify-center items-center space-y-3.5 md:space-y-6 px-0"
      >
        {lines.map((line, idx) => {
          if (line.fullText) {
            return (
              <div
                key={line.id || `line-${idx}`}
                className="reveal-line flex justify-center items-center text-center px-2"
              >
                <span className={`${combinedTextClass} text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-white to-cyan-200`}>
                  {line.fullText}
                </span>
              </div>
            );
          }

          return (
            <div
              key={line.id || `line-${idx}`}
              className="reveal-line flex justify-center items-center gap-2 md:gap-5 flex-wrap sm:flex-nowrap text-center"
            >
              {line.prefix && (
                <span className={combinedTextClass}>{line.prefix}</span>
              )}

              {line.image && (
                <span
                  onMouseEnter={() => setActiveImage(line.image!)}
                  onMouseLeave={() => setActiveImage(null)}
                  style={{ width: `${currentImgWidth}px` }}
                  className="img-reveal-span h-8 sm:h-12 md:h-20 rounded-lg md:rounded-2xl overflow-hidden relative border border-cyan-200/50 cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(56,189,248,0.25)] shrink-0 transition-all duration-300 ease-out hover:scale-105 hover:border-cyan-300"
                >
                  <img
                    src={line.image}
                    alt={line.alt || 'engineering asset visual'}
                    className="h-full w-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                </span>
              )}

              {line.suffix && (
                <span className={combinedTextClass}>{line.suffix}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* SUBTITLE FOOTER */}
      <p className="mt-8 md:mt-10 text-center text-xs md:text-sm text-sky-100/75 max-w-xl mx-auto drop-shadow-md font-medium tracking-wide">
        Scroll to expand inline visual engines. Hover over images to inspect architectural blueprints.
      </p>
    </div>
  );
};

export default ImageTextReveal;

