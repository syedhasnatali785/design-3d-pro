import sys

with open('src/AppComplete.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

crlf = '\r\n' in text
content = text.replace('\r\n', '\n')

# 1. Imports
target_import = "import { InfiniteMovingCards } from './components/ui/infinite-moving-cards'"
new_import = "import { FannedCardStack } from './components/ui/fanned-card-stack'"
assert target_import in content, "target_import not found"
content = content.replace(target_import, new_import, 1)

# 2. JSX Stage
old_jsx = """            {/* Infinite Moving Cards Testimonials (Mounted during clouds testimonials section) */}
            <div
              ref={testimonialsCardsWrapRef}
              className="infinite-testimonials-stage"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 40,
                opacity: 0,
                display: 'none',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px 20px',
                pointerEvents: 'none',
              }}
            >
              <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
                <InfiniteMovingCards
                  items={TESTIMONIAL_ITEMS}
                  direction="left"
                  speed="normal"
                  pauseOnHover={true}
                />
              </div>
            </div>"""

new_jsx = """            {/* 3D Fanned Card Stack Testimonials (Transparent cards that fan out in sequence) */}
            <div
              ref={testimonialsCardsWrapRef}
              className="fanned-testimonials-stage"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 40,
                opacity: 0,
                display: 'none',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px 16px',
                pointerEvents: 'none',
              }}
            >
              <FannedCardStack
                items={TESTIMONIAL_ITEMS}
              />
            </div>"""

assert old_jsx in content, "old_jsx not found"
content = content.replace(old_jsx, new_jsx, 1)

# 3. Add scroll-driven fan-out sequential trigger in tick()
old_tick_test = """      // Update Infinite Moving Cards Testimonials (Clouds frames 24.5 to 56.0)
      if (testimonialsCardsWrapRef.current) {
        const fStart = cloudsFrameToProgress(24.5)
        const fAliveStart = cloudsFrameToProgress(26.0)
        const fAliveEnd = cloudsFrameToProgress(54.0)
        const fEnd = cloudsFrameToProgress(56.0)

        if (currentProgress < fStart || currentProgress > fEnd) {
          if (testimonialsCardsWrapRef.current.style.display !== 'none') {
            testimonialsCardsWrapRef.current.style.display = 'none'
            testimonialsCardsWrapRef.current.style.opacity = '0'
            testimonialsCardsWrapRef.current.style.pointerEvents = 'none'
          }
        } else {
          let fOpacity = 1
          let fY = 0

          if (currentProgress < fAliveStart) {
            const enterR = clamp((currentProgress - fStart) / (fAliveStart - fStart), 0, 1)
            fOpacity = enterR
            fY = (1 - enterR) * 28
          } else if (currentProgress > fAliveEnd) {
            const exitR = clamp((currentProgress - fAliveEnd) / (fEnd - fAliveEnd), 0, 1)
            fOpacity = 1 - exitR
            fY = -exitR * 28
          }

          if (testimonialsCardsWrapRef.current.style.display !== 'flex') {
            testimonialsCardsWrapRef.current.style.display = 'flex'
          }
          testimonialsCardsWrapRef.current.style.opacity = fOpacity.toFixed(3)
          testimonialsCardsWrapRef.current.style.transform = `translate3d(0, ${fY.toFixed(1)}px, 0)`
          testimonialsCardsWrapRef.current.style.pointerEvents = fOpacity > 0.35 ? 'auto' : 'none'
        }
      }"""

new_tick_test = """      // Update 3D Fanned Card Stack Testimonials (Clouds frames 24.5 to 56.0)
      if (testimonialsCardsWrapRef.current) {
        const fStart = cloudsFrameToProgress(24.5)
        const fAliveStart = cloudsFrameToProgress(26.0)
        const fAliveEnd = cloudsFrameToProgress(54.0)
        const fEnd = cloudsFrameToProgress(56.0)

        if (currentProgress < fStart || currentProgress > fEnd) {
          if (testimonialsCardsWrapRef.current.style.display !== 'none') {
            testimonialsCardsWrapRef.current.style.display = 'none'
            testimonialsCardsWrapRef.current.style.opacity = '0'
            testimonialsCardsWrapRef.current.style.pointerEvents = 'none'
          }
        } else {
          let fOpacity = 1
          let fY = 0

          if (currentProgress < fAliveStart) {
            const enterR = clamp((currentProgress - fStart) / (fAliveStart - fStart), 0, 1)
            fOpacity = enterR
            fY = (1 - enterR) * 28
          } else if (currentProgress > fAliveEnd) {
            const exitR = clamp((currentProgress - fAliveEnd) / (fEnd - fAliveEnd), 0, 1)
            fOpacity = 1 - exitR
            fY = -exitR * 28
          }

          if (testimonialsCardsWrapRef.current.style.display !== 'flex') {
            testimonialsCardsWrapRef.current.style.display = 'flex'
          }
          testimonialsCardsWrapRef.current.style.opacity = fOpacity.toFixed(3)
          testimonialsCardsWrapRef.current.style.transform = `translate3d(0, ${fY.toFixed(1)}px, 0)`
          testimonialsCardsWrapRef.current.style.pointerEvents = fOpacity > 0.35 ? 'auto' : 'none'

          // Scroll-driven sequential card reveal:
          // As the user scrolls across the testimonials window (frame 24.5 to 56.0),
          // fan out and sequentially highlight cards 0, 1, 2, 3, 4 one-at-a-time!
          const testRatio = clamp((currentProgress - fStart) / (fEnd - fStart), 0, 0.999)
          const targetCardIdx = Math.floor(testRatio * TESTIMONIAL_ITEMS.length)
          if (targetCardIdx !== lastActiveTestimonialIdx) {
            lastActiveTestimonialIdx = targetCardIdx
            window.dispatchEvent(new CustomEvent('devcore:select-testimonial', { detail: { index: targetCardIdx } }))
          }
        }
      }"""

assert old_tick_test in content, "old_tick_test not found"
content = content.replace(old_tick_test, new_tick_test, 1)

# Ensure lastActiveTestimonialIdx is declared alongside lastActiveServiceIdx
if "let lastActiveTestimonialIdx = -1" not in content:
    content = content.replace("let lastActiveServiceIdx = -1", "let lastActiveServiceIdx = -1\n    let lastActiveTestimonialIdx = -1")

if crlf:
    content = content.replace('\n', '\r\n')

with open('src/AppComplete.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: AppComplete.jsx updated with Fanned Card Stack Testimonials!")

