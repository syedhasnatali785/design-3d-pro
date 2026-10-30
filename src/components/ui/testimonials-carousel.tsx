"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

export interface TestimonialItem {
  quote: string;
  name: string;
  title: string;
  badge?: string;
  avatar?: string;
  src?: string;
}

export interface TestimonialsCarouselProps {
  items: TestimonialItem[];
  className?: string;
}

// Inline-styled star row — never depends on Tailwind scanning this file
function StarRow() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: 14,
            height: 14,
            fill: "#67e8f9",
            flexShrink: 0,
            filter: "drop-shadow(0 0 4px rgba(103,232,249,0.85))",
          }}
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
      <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#e0f2fe", marginLeft: 4 }}>
        5.0
      </span>
    </div>
  );
}

let slideStamp = 0;

export function TestimonialsCarousel({
  items = [],
  className = "",
}: TestimonialsCarouselProps) {
  const [active, setActive] = useState(0);
  const [slideDir, setSlideDir] = useState<"right" | "left">("right");
  const [stamp, setStamp] = useState(0);
  const activeRef = useRef(0);
  const total = items.length;

  const goTo = useCallback(
    (nextIdx: number, dir: "left" | "right") => {
      const clamped = Math.max(0, Math.min(total - 1, nextIdx));
      if (clamped === activeRef.current) return;
      activeRef.current = clamped;
      slideStamp++;
      setSlideDir(dir);
      setActive(clamped);
      setStamp(slideStamp);
    },
    [total]
  );

  const goNext = useCallback(() => {
    goTo((activeRef.current + 1) % total, "right");
  }, [total, goTo]);

  const goPrev = useCallback(() => {
    goTo((activeRef.current - 1 + total) % total, "left");
  }, [total, goTo]);

  // Scroll-driven: listens to AppComplete's RAF dispatch
  useEffect(() => {
    const handler = (e: any) => {
      if (typeof e.detail?.index === "number") {
        const next = Math.max(0, Math.min(total - 1, e.detail.index));
        const dir = next > activeRef.current ? "right" : "left";
        goTo(next, dir);
      }
    };
    window.addEventListener("devcore:select-testimonial", handler);
    return () => window.removeEventListener("devcore:select-testimonial", handler);
  }, [total, goTo]);

  if (!items.length) return null;

  const current = items[active];
  const enterFrom = slideDir === "right" ? "translateX(48px)" : "translateX(-48px)";

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 720,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        userSelect: "none",
      }}
    >
      {/* ── Section Header ── */}
      <div style={{ textAlign: "center", marginBottom: 24, position: "relative", zIndex: 20 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 12px",
            borderRadius: 999,
            background: "rgba(34,211,238,0.08)",
            border: "1px solid rgba(186,230,253,0.38)",
            color: "#bae6fd",
            fontSize: "0.68rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 8,
            backdropFilter: "blur(12px)",
            boxShadow: "0 0 14px rgba(186,230,253,0.3)",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#67e8f9",
              boxShadow: "0 0 8px #67e8f9",
              display: "inline-block",
              animation: "pulse 2s infinite",
            }}
          />
          Client Testimonials
        </div>
        <h3
          style={{
            fontSize: "clamp(1.15rem, 3vw, 1.75rem)",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            margin: 0,
            textShadow: "0 2px 12px rgba(0,0,0,0.85)",
          }}
        >
          Proven Engineering at Global Scale
        </h3>
      </div>

      {/* ── Card Stage ── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          padding: "0 8px",
          minHeight: 200,
        }}
      >
        {/* key=stamp forces remount → CSS animation restarts each navigation */}
        <div
          key={stamp}
          style={{
            // @ts-ignore
            "--tc-enter": enterFrom,
            animation: "tc-slide-in 0.40s cubic-bezier(0.16,1,0.3,1) forwards",
          }}
        >
          {/* ── Glassmorphic Card ── */}
          <div
            style={{
              position: "relative",
              borderRadius: 18,
              overflow: "hidden",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(186,230,253,0.38)",
              boxShadow:
                "0 16px 48px rgba(2,10,22,0.55), 0 0 28px rgba(186,230,253,0.18), inset 0 1.5px 2px rgba(255,255,255,0.55)",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(186,230,253,0.06) 50%, rgba(8,28,52,0.42) 100%)",
            }}
          >
            {/* Ice shimmer top edge */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 1.5,
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                padding: "20px 24px",
                display: "flex",
                flexDirection: "row",
                gap: 20,
                alignItems: "flex-start",
              }}
            >
              {/* ── Left: Avatar + Stars ── */}
              <div
                style={{
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {current.avatar ? (
                  <img
                    src={current.avatar}
                    alt={current.name}
                    loading="lazy"
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 14,
                      objectFit: "cover",
                      objectPosition: "top",
                      border: "2px solid rgba(103,232,249,0.55)",
                      boxShadow: "0 0 20px rgba(103,232,249,0.3)",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 14,
                      background: "rgba(34,211,238,0.15)",
                      border: "2px solid rgba(103,232,249,0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      style={{ fill: "rgba(103,232,249,0.65)", width: 32, height: 32 }}
                    >
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                  </div>
                )}
                <StarRow />
              </div>

              {/* ── Right: Content ── */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Badge + counter */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  {current.badge ? (
                    <span
                      style={{
                        fontSize: "0.58rem",
                        fontWeight: 800,
                        color: "#e0f2fe",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        padding: "2px 10px",
                        borderRadius: 999,
                        background: "rgba(34,211,238,0.15)",
                        border: "1px solid rgba(186,230,253,0.38)",
                        boxShadow: "0 0 8px rgba(103,232,249,0.2)",
                      }}
                    >
                      {current.badge}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span
                    style={{
                      fontSize: "0.62rem",
                      fontFamily: "monospace",
                      color: "rgba(186,230,253,0.55)",
                      flexShrink: 0,
                    }}
                  >
                    {String(active + 1).padStart(2, "0")}&nbsp;/&nbsp;
                    {String(total).padStart(2, "0")}
                  </span>
                </div>

                {/* Quote */}
                <p
                  style={{
                    fontSize: "0.92rem",
                    lineHeight: 1.65,
                    color: "#f1f5f9",
                    fontStyle: "italic",
                    fontWeight: 500,
                    margin: "0 0 14px 0",
                    textShadow: "0 1px 4px rgba(0,0,0,0.7)",
                  }}
                >
                  &ldquo;{current.quote}&rdquo;
                </p>

                {/* Name & title */}
                <div
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.14)",
                    paddingTop: 10,
                  }}
                >
                  <h4
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: "#ffffff",
                      margin: 0,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {current.name}
                  </h4>
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "rgba(186,230,253,0.8)",
                      fontWeight: 500,
                      margin: "3px 0 0 0",
                    }}
                  >
                    {current.title}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation: Prev + Dots + Next ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginTop: 20,
          position: "relative",
          zIndex: 20,
          pointerEvents: "auto",
        }}
      >
        {/* Prev */}
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous testimonial"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(2,10,22,0.6)",
            border: "1px solid rgba(186,230,253,0.38)",
            color: "#bae6fd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(12px)",
            boxShadow: "0 0 12px rgba(56,189,248,0.18)",
            transition: "transform 0.15s, background 0.15s",
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {items.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              aria-label={`Testimonial ${dotIdx + 1}`}
              onClick={() => goTo(dotIdx, dotIdx > active ? "right" : "left")}
              style={{
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.3s",
                width: dotIdx === active ? 28 : 8,
                height: 8,
                background:
                  dotIdx === active
                    ? "#67e8f9"
                    : "rgba(255,255,255,0.28)",
                boxShadow: dotIdx === active ? "0 0 10px #67e8f9" : "none",
              }}
            />
          ))}
        </div>

        {/* Next */}
        <button
          type="button"
          onClick={goNext}
          aria-label="Next testimonial"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(2,10,22,0.6)",
            border: "1px solid rgba(186,230,253,0.38)",
            color: "#bae6fd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(12px)",
            boxShadow: "0 0 12px rgba(56,189,248,0.18)",
            transition: "transform 0.15s, background 0.15s",
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Keyframe: CSS var --tc-enter drives enter direction */}
      <style>{`
        @keyframes tc-slide-in {
          from {
            opacity: 0;
            transform: var(--tc-enter, translateX(48px));
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

export default TestimonialsCarousel;
