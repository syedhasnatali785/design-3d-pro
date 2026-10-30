"use client"

import * as React from "react"

export type LandPalette = "dawn" | "alpine" | "dusk" | "mist"

export type Slide = {
  image?: string
  title?: string
  caption?: string
  alt?: string
  badge?: string
  tags?: string[]
  cta?: string
  href?: string
  palette?: LandPalette
  seed?: number
}

export type PolaroidLineCarouselProps = {
  slides?: Slide[]
  /** Any CSS length. Default 100svh. */
  height?: number | string
  /** Width of a print in px (it shrinks on narrow screens). */
  cardWidth?: number
  /** How far the string sags in the middle, px. */
  sag?: number
  /** How much the prints swing; 0 holds them still. */
  swing?: number
  /** ms per print; 0 turns autoplay off. It waits while someone is interacting. */
  autoplay?: number
  /** Colour of the string and pegs. */
  string?: string
  background?: string
  ink?: string
  onChange?: (index: number) => void
  className?: string
  style?: React.CSSProperties
  ariaLabel?: string
}

// #region logic
export function wrap(i: number, n: number): number {
  return n ? ((i % n) + n) % n : 0
}

export function clamp(v: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, v))
}

/** Height of a string sagging by `sag` between (0, y0) and (w, y0), at x. */
export function stringY(x: number, w: number, y0: number, sag: number): number {
  const t = clamp(x / w, 0, 1)
  return y0 + 4 * sag * t * (1 - t)
}

/** One step of a critically damped spring toward target. */
export function springStep(x: number, v: number, target: number, dt: number, k = 70): [number, number] {
  const c = 2 * Math.sqrt(k)
  const nv = v + (k * (target - x) - c * v) * dt
  return [x + nv * dt, nv]
}

/** One step of a print's swing. */
export function swingStep(a: number, w: number, lineVel: number, dt: number, gain: number): [number, number] {
  const nw = w + (-38 * a - 4.2 * w + lineVel * 0.0034 * gain) * dt
  return [clamp(a + nw * dt, -0.6, 0.6), nw]
}

/** Index of the print nearest the centre for a line offset. */
export function nearestAt(off: number, spacing: number, n: number): number {
  return clamp(Math.round(off / spacing), 0, Math.max(0, n - 1))
}

export function pad2(n: number): string {
  return n < 10 ? "0" + n : String(n)
}
// #endregion logic

/* ------------------------------------------------------- painted images */

const PALETTES = {
  dawn: { top: "#0f172a", bottom: "#0284c7", sun: "#38bdf8", far: "#0c4a6e", near: "#082f49", mist: "14,165,233" },
  alpine: { top: "#0369a1", bottom: "#bae6fd", sun: "#ffffff", far: "#075985", near: "#0c4a6e", mist: "224,242,254" },
  dusk: { top: "#1e1b4b", bottom: "#38bdf8", sun: "#7dd3fc", far: "#312e81", near: "#0f172a", mist: "125,211,252" },
  mist: { top: "#111827", bottom: "#38bdf8", sun: "#ffffff", far: "#1e293b", near: "#0f172a", mist: "186,230,253" },
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function hexRgb(h: string): [number, number, number] {
  const v = parseInt(h.replace("#", ""), 16)
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
}
function mixRgb(a: string, b: string, t: number): string {
  const A = hexRgb(a)
  const B = hexRgb(b)
  return "rgb(" + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",") + ")"
}

function paintLandscape(seed: number, palette: LandPalette, w = 1600, h = 1000): string {
  if (typeof document === "undefined") return ""
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  const g = c.getContext("2d")
  if (!g) return ""
  const P = PALETTES[palette] ?? PALETTES.alpine
  const r = mulberry32(seed * 104729 + 7)

  const sky = g.createLinearGradient(0, 0, 0, h * 0.72)
  sky.addColorStop(0, P.top)
  sky.addColorStop(1, P.bottom)
  g.fillStyle = sky
  g.fillRect(0, 0, w, h)
  const sx = w * (0.22 + r() * 0.56)
  const sy = h * (0.26 + r() * 0.16)
  const halo = g.createRadialGradient(sx, sy, 0, sx, sy, w * 0.45)
  halo.addColorStop(0, "rgba(" + hexRgb(P.sun).join(",") + ",.85)")
  halo.addColorStop(0.08, "rgba(" + hexRgb(P.sun).join(",") + ",.55)")
  halo.addColorStop(1, "rgba(" + hexRgb(P.sun).join(",") + ",0)")
  g.fillStyle = halo
  g.fillRect(0, 0, w, h)
  g.fillStyle = P.sun
  g.beginPath()
  g.arc(sx, sy, h * 0.045, 0, Math.PI * 2)
  g.fill()

  const layers = 5
  for (let L = 0; L < layers; L++) {
    const k = L / (layers - 1)
    const base = h * (0.42 + k * 0.4)
    const amp = h * (0.07 + k * 0.1)
    const ph = [r(), r(), r(), r()].map((v) => v * Math.PI * 2)
    const fr = [1.3 + r(), 3.1 + r() * 2, 7 + r() * 4, 17 + r() * 8]
    const ridge = (x: number) => {
      const u = x / w
      return (
        base -
        amp *
          (0.55 * Math.sin(u * fr[0] + ph[0]) +
            0.28 * Math.sin(u * fr[1] + ph[1]) +
            0.12 * Math.abs(Math.sin(u * fr[2] + ph[2])) +
            0.05 * Math.sin(u * fr[3] + ph[3]))
      )
    }
    const mist = g.createLinearGradient(0, base - amp * 1.4, 0, base + amp * 0.4)
    mist.addColorStop(0, "rgba(" + P.mist + ",0)")
    mist.addColorStop(1, "rgba(" + P.mist + "," + (0.55 - k * 0.35).toFixed(2) + ")")
    g.fillStyle = mist
    g.fillRect(0, base - amp * 1.4, w, amp * 1.8)
    const body = g.createLinearGradient(0, base - amp, 0, h)
    body.addColorStop(0, mixRgb(P.far, P.near, Math.pow(k, 1.3)))
    body.addColorStop(1, mixRgb(P.far, P.near, Math.min(1, Math.pow(k, 1.3) + 0.18)))
    g.fillStyle = body
    g.beginPath()
    g.moveTo(0, h)
    for (let x = 0; x <= w; x += 6) g.lineTo(x, ridge(x))
    g.lineTo(w, h)
    g.closePath()
    g.fill()
  }

  return c.toDataURL("image/jpeg", 0.88)
}

function useSlideImages(slides: Slide[]): string[] {
  const key = slides.map((s) => s.image || (s.palette || "alpine") + ":" + (s.seed ?? 1)).join("|")
  const [painted, setPainted] = React.useState(() => slides.map(() => ""))
  React.useEffect(() => {
    setPainted(slides.map((s, i) => (s.image ? "" : paintLandscape(s.seed ?? i + 1, s.palette || "alpine"))))
  }, [key])
  return slides.map((s, i) => s.image || painted[i] || "")
}

const PL_CSS = `
.pl-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--pl-bg, transparent);
  color: var(--pl-ink, #ffffff);
  user-select: none;
  -webkit-user-select: none;
  touch-action: pan-y;
  outline: none;
  cursor: grab;
}
.pl-root[data-drag='1'] {
  cursor: grabbing;
}
.pl-string {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
  filter: drop-shadow(0 2px 8px rgba(56, 189, 248, 0.4));
}
.pl-card {
  position: absolute;
  left: 0;
  top: 0;
  width: var(--pl-cw);
  transform-origin: 50% 0;
  will-change: transform;
  cursor: inherit;
}
.pl-print {
  margin-top: 14px;
  background: linear-gradient(155deg, rgba(10, 22, 38, 0.94) 0%, rgba(4, 12, 22, 0.98) 100%);
  padding: 16px 16px 18px;
  border-radius: 22px;
  border: 1px solid rgba(186, 230, 253, 0.38);
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.65), 0 0 28px rgba(56, 189, 248, 0.2);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition: transform 0.45s cubic-bezier(0.2, 0.7, 0.2, 1), filter 0.45s ease, border-color 0.45s ease, box-shadow 0.45s ease;
}
.pl-card[data-on='1'] .pl-print {
  border-color: rgba(56, 189, 248, 0.95);
  box-shadow: 0 28px 60px rgba(0, 0, 0, 0.75), 0 0 42px rgba(56, 189, 248, 0.45);
  transform: scale(1.05);
}
.pl-card[data-on='0'] .pl-print {
  transform: scale(0.88);
  filter: saturate(0.7) brightness(0.78);
  opacity: 0.85;
}
.pl-shot {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: 14px;
  background: #091322;
  box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.4);
}
.pl-shot img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}
.pl-note {
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 4px 4px;
  font-family: inherit;
  font-size: 1.05rem;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.01em;
  text-align: center;
  line-height: 1.3;
}
.pl-tags-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
}
.pl-tag-pill {
  font-size: 0.72rem;
  font-weight: 600;
  color: #93c5fd;
  background: rgba(30, 58, 95, 0.55);
  border: 1px solid rgba(147, 197, 253, 0.28);
  padding: 3px 9px;
  border-radius: 999px;
  white-space: nowrap;
}
.pl-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #38bdf8;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.pl-badge-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 8px #38bdf8;
}
.pl-peg {
  position: absolute;
  left: 50%;
  top: 0;
  width: 12px;
  height: 28px;
  margin-left: -6px;
  border-radius: 3px;
  background: linear-gradient(90deg, #38bdf8, #bae6fd 45%, #0284c7);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4), 0 0 10px rgba(56, 189, 248, 0.5);
  z-index: 10;
}
.pl-peg::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 9px;
  width: 2px;
  height: 8px;
  background: rgba(15, 23, 42, 0.85);
  border-radius: 1px;
}
.pl-bar {
  position: absolute;
  left: clamp(16px, 4vw, 56px);
  right: clamp(16px, 4vw, 56px);
  bottom: clamp(16px, 3vh, 32px);
  display: flex;
  align-items: center;
  gap: clamp(12px, 2vw, 24px);
  cursor: default;
  z-index: 20;
  background: rgba(4, 14, 28, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 12px 20px;
  border-radius: 16px;
  border: 1px solid rgba(186, 230, 253, 0.25);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}
.pl-cap {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
.pl-cap > * {
  display: block;
  animation: pl-in 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
.pl-title {
  font-size: clamp(16px, 2vw, 22px);
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}
.pl-sub {
  margin-top: 3px;
  font-size: 0.82rem;
  line-height: 1.4;
  color: #94a3b8;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.pl-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.pl-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 999px;
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
  border: 1px solid rgba(186, 230, 253, 0.4);
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.35);
  transition: transform 0.2s, box-shadow 0.2s;
  white-space: nowrap;
}
.pl-cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 24px rgba(56, 189, 248, 0.6);
}

.pl-scroll-indicator {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(30, 58, 95, 0.45);
  border: 1px solid rgba(56, 189, 248, 0.3);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #7dd3fc;
  text-transform: uppercase;
}
.pl-scroll-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 8px #38bdf8;
  animation: pl-pulse 1.8s ease-in-out infinite;
}
@keyframes pl-pulse {
  0%, 100% { opacity: 0.4; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1.2); }
}

.pl-count {
  font-size: 0.78rem;
  font-family: monospace;
  letter-spacing: 0.12em;
  color: #64748b;
  white-space: nowrap;
}
.pl-count b {
  color: #38bdf8;
  font-weight: 700;
}
.pl-btn {
  appearance: none;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid rgba(186, 230, 253, 0.3);
  background: rgba(15, 23, 42, 0.6);
  color: #f0f9ff;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.pl-btn:hover {
  background: #38bdf8;
  color: #031322;
  border-color: #38bdf8;
}
@keyframes pl-in {
  from {
    transform: translateY(12px);
    opacity: 0;
  }
  to {
    transform: none;
    opacity: 1;
  }
}
@media (max-width: 640px) {
  .pl-bar {
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px 14px;
    bottom: 12px;
  }
  .pl-cap {
    width: 100%;
    flex: none;
  }
  .pl-sub {
    -webkit-line-clamp: 1;
  }
  .pl-actions {
    width: 100%;
    justify-content: space-between;
  }
}
`

export function PolaroidLineCarousel({
  slides = [],
  height = "100%",
  cardWidth = 420,
  sag = 56,
  swing = 1,
  autoplay = 4000,
  string = "#38bdf8",
  background = "transparent",
  ink = "#ffffff",
  onChange,
  className,
  style,
  ariaLabel = "Services carousel",
}: PolaroidLineCarouselProps) {
  const n = slides.length
  const srcs = useSlideImages(slides)
  const [active, setActive] = React.useState(0)
  const [dragging, setDragging] = React.useState(false)
  const [size, setSize] = React.useState({ w: 1200, h: 800, cw: cardWidth })
  const rootRef = React.useRef(null as HTMLDivElement | null)
  const pathRef = React.useRef(null as SVGPathElement | null)
  const cards = React.useRef([] as (HTMLDivElement | null)[])
  const sim = React.useRef({ off: 0, vel: 0, target: 0, a: [] as number[], w: [] as number[] })
  const drag = React.useRef(null as null | { x: number; off: number; lx: number; lt: number; v: number; moved: boolean })
  const lastTouch = React.useRef(0)
  const activeRef = React.useRef(0)
  const opts = React.useRef({ sag, swing })
  opts.current = { sag, swing }

  const spacing = size.cw * 1.08
  const goTo = React.useCallback(
    (i: number) => {
      sim.current.target = clamp(i, 0, n - 1) * spacing
    },
    [n, spacing],
  )

  // External listener for topnav jumps
  React.useEffect(() => {
    const handleSelectService = (e: any) => {
      if (typeof e.detail?.index === "number") {
        lastTouch.current = performance.now()
        goTo(e.detail.index)
      }
    }
    const handleScrollServiceIndex = (e: any) => {
      if (typeof e.detail?.index === "number") {
        lastTouch.current = performance.now()
        goTo(e.detail.index)
      }
    }
    window.addEventListener("devcore:select-service", handleSelectService)
    window.addEventListener("devcore:scroll-service-index", handleScrollServiceIndex)
    return () => {
      window.removeEventListener("devcore:select-service", handleSelectService)
      window.removeEventListener("devcore:scroll-service-index", handleScrollServiceIndex)
    }
  }, [goTo])

  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ro = new ResizeObserver(() => {
      const r = root.getBoundingClientRect()
      // Responsive bigger cards (up to 440px on desktop, proportional on mobile)
      const maxW = Math.min(cardWidth, r.width * 0.72, r.height * 0.62)
      const cw = Math.round(Math.max(220, maxW))
      setSize({ w: r.width, h: r.height, cw })
    })
    ro.observe(root)
    return () => ro.disconnect()
  }, [cardWidth])

  React.useEffect(() => {
    sim.current.target = activeRef.current * spacing
    sim.current.off = activeRef.current * spacing
  }, [spacing])

  React.useEffect(() => {
    onChange?.(active)
  }, [active, onChange])

  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let visible = true
    let raf = 0
    let prev = performance.now()
    const S = sim.current
    const frame = (now: number) => {
      raf = 0
      if (!visible) return
      const dt = Math.min(0.033, (now - prev) / 1000)
      prev = now
      const { w, h, cw } = size
      const y0 = Math.max(50, Math.min(140, h * 0.14))
      const d = drag.current
      let lineVel: number
      if (d && d.moved) {
        lineVel = d.v * 1000
      } else {
        const before = S.off
        ;[S.off, S.vel] = springStep(S.off, S.vel, S.target, dt)
        lineVel = -(S.off - before) / Math.max(dt, 1e-3)
      }
      const o = opts.current
      const g = reduce ? 0 : o.swing
      const near = nearestAt(S.off, spacing, n)
      for (let i = 0; i < n; i++) {
        const el = cards.current[i]
        if (!el) continue
        const x = w / 2 + i * spacing - S.off
        if (x < -cw * 1.5 || x > w + cw * 1.5) {
          el.style.visibility = "hidden"
          continue
        }
        el.style.visibility = "visible"
        let a = S.a[i] || 0
        let av = S.w[i] || 0
        ;[a, av] = swingStep(a, av, lineVel, dt, g)
        if (g) a += Math.sin(now / 1300 + i * 1.7) * 0.0009 * g
        S.a[i] = a
        S.w[i] = av
        const y = stringY(x, w, y0, o.sag) - 6
        el.style.transform = "translate(" + (x - cw / 2).toFixed(1) + "px," + y.toFixed(1) + "px) rotate(" + a.toFixed(4) + "rad)"
        el.style.zIndex = String(i === near ? n + 1 : n - Math.abs(i - near))
      }
      pathRef.current?.setAttribute("d", "M0 " + y0 + " Q" + w / 2 + " " + (y0 + 2 * o.sag) + " " + w + " " + y0)
      if (near !== activeRef.current) {
        activeRef.current = near
        setActive(near)
      }
      raf = requestAnimationFrame(frame)
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !raf) {
        prev = performance.now()
        raf = requestAnimationFrame(frame)
      }
    })
    io.observe(root)
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [size, spacing, n])

  React.useEffect(() => {
    if (!autoplay || n < 2) return
    const t = window.setInterval(() => {
      if (document.hidden || drag.current || performance.now() - lastTouch.current < autoplay) return
      goTo(activeRef.current >= n - 1 ? 0 : activeRef.current + 1)
    }, autoplay)
    return () => window.clearInterval(t)
  }, [autoplay, n, goTo])

  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest(".pl-bar") || (e.target as HTMLElement).closest("a") || (e.target as HTMLElement).closest("button")) return
    lastTouch.current = performance.now()
    drag.current = { x: e.clientX, off: sim.current.off, lx: e.clientX, lt: e.timeStamp, v: 0, moved: false }
  }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true
      setDragging(true)
      rootRef.current?.setPointerCapture(e.pointerId)
    }
    if (!d.moved) return
    const dt = Math.max(1, e.timeStamp - d.lt)
    d.v = 0.7 * ((e.clientX - d.lx) / dt) + 0.3 * d.v
    d.lx = e.clientX
    d.lt = e.timeStamp
    const max = (n - 1) * spacing
    let off = d.off - dx
    if (off < 0) off *= 0.35
    if (off > max) off = max + (off - max) * 0.35
    sim.current.off = off
  }
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current
    drag.current = null
    lastTouch.current = performance.now()
    if (!d) return
    if (d.moved) {
      setDragging(false)
      sim.current.vel = -d.v * 1000
      goTo(nearestAt(sim.current.off - d.v * 180, spacing, n))
      return
    }
    const card = (e.target as HTMLElement).closest("[data-i]")
    if (card) goTo(Number(card.getAttribute("data-i")))
  }
  const step = (dir: number) => {
    lastTouch.current = performance.now()
    goTo(clamp(activeRef.current + dir, 0, n - 1))
  }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") step(1)
    else if (e.key === "ArrowLeft") step(-1)
    else return
    e.preventDefault()
  }

  const s = slides[active] || {}

  return (
    <div
      ref={rootRef}
      className={["pl-root", className].filter(Boolean).join(" ")}
      style={{
        height,
        ["--pl-bg" as string]: background,
        ["--pl-ink" as string]: ink,
        ["--pl-cw" as string]: size.cw + "px",
        ...style,
      }}
      data-drag={dragging ? "1" : "0"}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKey}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <style>{PL_CSS}</style>
      <svg className="pl-string" aria-hidden="true">
        <path ref={pathRef} fill="none" stroke={string} strokeWidth="2" strokeLinecap="round" />
      </svg>
      {slides.map((sl, i) => (
        <div key={i} className="pl-card" data-i={i} data-on={i === active ? "1" : "0"} ref={(el) => void (cards.current[i] = el)} aria-hidden={i === active ? undefined : true}>
          <div className="pl-print">
            {sl.badge && (
              <div className="pl-badge">
                <span className="pl-badge-dot" />
                <span>{sl.badge}</span>
              </div>
            )}
            <div className="pl-shot">{srcs[i] ? <img src={srcs[i]} alt={sl.alt || sl.title || ""} draggable={false} /> : null}</div>
            <div className="pl-note">{sl.title || ""}</div>
            {sl.tags && sl.tags.length > 0 && (
              <div className="pl-tags-row">
                {sl.tags.slice(0, 3).map((tag, tIdx) => (
                  <span key={tIdx} className="pl-tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="pl-peg" />
        </div>
      ))}
      <div className="pl-bar">
        <div className="pl-cap" key={active} aria-hidden="true">
          {s.title ? <span className="pl-title">{s.title}</span> : null}
          {s.caption ? <span className="pl-sub">{s.caption}</span> : null}
        </div>
        <div className="pl-actions">
          {s.cta && s.href && (
            <a href={s.href} className="pl-cta-btn">
              <span>{s.cta}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
          )}
          <div className="pl-scroll-indicator" title="Scroll mouse wheel or swipe up/down to explore each service">
            <span className="pl-scroll-dot" />
            <span className="pl-scroll-text">SCROLL TO SWITCH</span>
          </div>
          <span className="pl-count" aria-hidden="true">
            <b>{pad2(active + 1)}</b> / {pad2(n)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default PolaroidLineCarousel
