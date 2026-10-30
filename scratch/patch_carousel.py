import sys

# 1. Update src/components/ui/polaroid-line-carousel.tsx
with open('src/components/ui/polaroid-line-carousel.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Let's replace card size calculations and styles
# A. Increase default cardWidth and sag
code = code.replace(
    'cardWidth = 280,\n  sag = 42,',
    'cardWidth = 420,\n  sag = 56,'
)

# B. Enhance ResizeObserver card width calculation to allow bigger cards
old_ro = """    const ro = new ResizeObserver(() => {
      const r = root.getBoundingClientRect()
      const cw = Math.round(Math.max(160, Math.min(cardWidth, r.width * 0.45, r.height * 0.45)))
      setSize({ w: r.width, h: r.height, cw })
    })"""

new_ro = """    const ro = new ResizeObserver(() => {
      const r = root.getBoundingClientRect()
      // Responsive bigger cards (up to 440px on desktop, proportional on mobile)
      const maxW = Math.min(cardWidth, r.width * 0.72, r.height * 0.62)
      const cw = Math.round(Math.max(220, maxW))
      setSize({ w: r.width, h: r.height, cw })
    })"""
assert old_ro in code, "old_ro not found"
code = code.replace(old_ro, new_ro, 1)

# C. Add devcore:scroll-service-index event listener inside useEffect
old_listener = """    const handleSelectService = (e: any) => {
      if (typeof e.detail?.index === "number") {
        lastTouch.current = performance.now()
        goTo(e.detail.index)
      }
    }
    window.addEventListener("devcore:select-service", handleSelectService)
    return () => window.removeEventListener("devcore:select-service", handleSelectService)"""

new_listener = """    const handleSelectService = (e: any) => {
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
    }"""
assert old_listener in code, "old_listener not found"
code = code.replace(old_listener, new_listener, 1)

# D. Adjust y0 calculation in frame() so the line sits perfectly in upper-third
old_y0 = "const y0 = Math.max(40, h * 0.18)"
new_y0 = "const y0 = Math.max(50, Math.min(140, h * 0.14))"
assert old_y0 in code, "old_y0 not found"
code = code.replace(old_y0, new_y0, 1)

# E. Update card CSS to make cards feel bigger, premium, and display tags
old_css_part = """.pl-print {
  margin-top: 14px;
  background: linear-gradient(155deg, rgba(15, 27, 45, 0.92) 0%, rgba(6, 16, 28, 0.96) 100%);
  padding: 12px 12px 14px;
  border-radius: 18px;
  border: 1px solid rgba(186, 230, 253, 0.35);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.55), 0 0 20px rgba(56, 189, 248, 0.15);
  transition: transform 0.45s cubic-bezier(0.2, 0.7, 0.2, 1), filter 0.45s ease, border-color 0.45s ease;
}
.pl-card[data-on='1'] .pl-print {
  border-color: rgba(56, 189, 248, 0.85);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.7), 0 0 35px rgba(56, 189, 248, 0.35);
  transform: scale(1.04);
}
.pl-card[data-on='0'] .pl-print {
  transform: scale(0.9);
  filter: saturate(0.75) brightness(0.85);
}
.pl-shot {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: 12px;
  background: #0f172a;
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
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 4px 0;
  font-family: inherit;
  font-size: 0.92rem;
  font-weight: 700;
  color: #f0f9ff;
  letter-spacing: 0.02em;
  text-align: center;
  line-height: 1.25;
}"""

new_css_part = """.pl-print {
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
}"""
assert old_css_part in code, "old_css_part not found"
code = code.replace(old_css_part, new_css_part, 1)

# F. Add tags row inside card JSX
old_card_jsx = """            <div className="pl-shot">{srcs[i] ? <img src={srcs[i]} alt={sl.alt || sl.title || ""} draggable={false} /> : null}</div>
            <div className="pl-note">{sl.title || ""}</div>
          </div>"""

new_card_jsx = """            <div className="pl-shot">{srcs[i] ? <img src={srcs[i]} alt={sl.alt || sl.title || ""} draggable={false} /> : null}</div>
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
          </div>"""
assert old_card_jsx in code, "old_card_jsx not found"
code = code.replace(old_card_jsx, new_card_jsx, 1)

# G. In pl-bar, make bottom bar cleaner and remove manual arrow buttons (or keep count + CTA + scroll cue)
old_bar_actions = """          <span className="pl-count" aria-hidden="true">
            <b>{pad2(active + 1)}</b> / {pad2(n)}
          </span>
          <button type="button" className="pl-btn" aria-label="Previous" onClick={() => step(-1)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
          <button type="button" className="pl-btn" aria-label="Next" onClick={() => step(1)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>"""

new_bar_actions = """          <div className="pl-scroll-indicator" title="Scroll mouse wheel or swipe up/down to explore each service">
            <span className="pl-scroll-dot" />
            <span className="pl-scroll-text">SCROLL TO SWITCH</span>
          </div>
          <span className="pl-count" aria-hidden="true">
            <b>{pad2(active + 1)}</b> / {pad2(n)}
          </span>"""
assert old_bar_actions in code, "old_bar_actions not found"
code = code.replace(old_bar_actions, new_bar_actions, 1)

# Add CSS for scroll indicator
scroll_ind_css = """
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
"""
code = code.replace(".pl-count {", scroll_ind_css + "\n.pl-count {", 1)

with open('src/components/ui/polaroid-line-carousel.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated polaroid-line-carousel.tsx successfully!")

