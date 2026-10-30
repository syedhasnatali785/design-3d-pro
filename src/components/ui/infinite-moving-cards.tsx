"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState, useRef } from "react";

export interface TestimonialItem {
  quote: string;
  name: string;
  title: string;
  badge?: string;
  avatar?: string;
}

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: TestimonialItem[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      // Only duplicate once
      if (scrollerRef.current.children.length === items.length) {
        scrollerContent.forEach((item) => {
          const duplicatedItem = item.cloneNode(true);
          scrollerRef.current?.appendChild(duplicatedItem);
        });
      }

      if (direction === "left") {
        containerRef.current.style.setProperty("--animation-direction", "forwards");
      } else {
        containerRef.current.style.setProperty("--animation-direction", "reverse");
      }

      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "25s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "65s");
      }

      setStart(true);
    }
  }, [direction, speed, items]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 w-full max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full shrink-0 gap-6 py-4 w-max flex-nowrap",
          start && "animate-infinite-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item, idx) => (
          <li
            key={`${item.name}-${idx}`}
            className="w-[380px] max-w-[85vw] relative rounded-2xl border border-sky-400/25 px-8 py-7 md:w-[460px] shrink-0"
            style={{
              background: "linear-gradient(155deg, rgba(10, 22, 38, 0.92) 0%, rgba(4, 12, 22, 0.96) 100%)",
              boxShadow: "0 20px 48px rgba(0, 0, 0, 0.65), 0 0 24px rgba(56, 189, 248, 0.15)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
          >
            <blockquote>
              <div
                aria-hidden="true"
                className="user-select-none -z-1 pointer-events-none absolute -left-0.5 -top-0.5 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)]"
              />
              {item.badge && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
                  <span className="text-[0.68rem] font-extrabold uppercase tracking-widest text-sky-400">
                    {item.badge}
                  </span>
                </div>
              )}
              <span className="relative z-20 text-[0.94rem] leading-relaxed text-slate-100 font-medium block min-h-[72px]">
                {item.quote}
              </span>
              <div className="relative z-20 mt-6 pt-4 border-t border-sky-400/15 flex items-center gap-3.5">
                {item.avatar && (
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover border border-sky-400/40 shadow-[0_0_10px_rgba(56,189,248,0.3)] shrink-0"
                  />
                )}
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.92rem] font-bold text-white tracking-tight">
                    {item.name}
                  </span>
                  <span className="text-[0.78rem] text-slate-400 font-medium">
                    {item.title}
                  </span>
                </div>
              </div>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InfiniteMovingCards;

