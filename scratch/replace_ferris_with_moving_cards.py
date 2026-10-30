import sys

with open('src/AppComplete.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

crlf = '\r\n' in text
content = text.replace('\r\n', '\n')

# 1. Replace import
old_import = "import { FerrisWheelGallery } from './components/ui/ferris-wheel-gallery'"
new_import = "import { InfiniteMovingCards } from './components/ui/infinite-moving-cards'"
assert old_import in content, "old_import not found"
content = content.replace(old_import, new_import, 1)

# 2. Replace TESTIMONIAL_ITEMS with rich Testimonials for Infinite Moving Cards
old_testimonials = """// DevCore Verified Client Testimonials for Ferris Wheel Gallery
const TESTIMONIAL_ITEMS = [
  {
    id: 'nexa',
    title: 'Marcus Vance — VP Product',
    discipline: 'OmniPulse Retail POS',
    year: '2026',
    alt: 'Marcus Vance VP Product Review',
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'synapse',
    title: 'Elena Rostova — CTO',
    discipline: 'Synapse AI Telephony',
    year: '2026',
    alt: 'Elena Rostova CTO Review',
    src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'aether',
    title: 'David Sterling — Head of Cloud',
    discipline: 'AWS Cloud Microservices',
    year: '2025',
    alt: 'David Sterling Head of Cloud Review',
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'quant',
    title: 'Sarah Lin — VP Engineering',
    discipline: 'Custom Enterprise Core',
    year: '2026',
    alt: 'Sarah Lin VP Engineering Review',
    src: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=1200&q=80',
  },
]"""

new_testimonials = """// DevCore Verified Client Testimonials for Infinite Moving Cards
const TESTIMONIAL_ITEMS = [
  {
    quote:
      "DevCore delivered our offline-first POS architecture ahead of schedule. Zero downtime across 140 retail outlets during peak Black Friday volume.",
    name: "Marcus Vance",
    title: "VP of Product, OmniPulse Retail",
    badge: "RETAIL COMMERCE",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "Their autonomous voice agents slashed our support backlog by 72% in week one. The audio latency is so fast it feels entirely indistinguishable from human operators.",
    name: "Elena Rostova",
    title: "CTO, Synapse AI Telephony",
    badge: "AI INTELLIGENCE",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "DevCore engineered our multi-region AWS cloud infrastructure with zero downtime and automated failover. The code craftsmanship and microservice architecture are world-class.",
    name: "David Sterling",
    title: "Head of Cloud Infrastructure, AetherCloud",
    badge: "CLOUD SYSTEMS",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "From high-throughput data processing to bespoke enterprise tooling, DevCore is our secret weapon for engineering velocity and bulletproof reliability.",
    name: "Sarah Lin",
    title: "VP of Engineering, QuantCore Labs",
    badge: "SOFTWARE ARCHITECTURE",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "The Next.js 15 full-stack platform they created exceeded every performance benchmark. Lighthouse score is solid 100 with instantaneous page transitions.",
    name: "Julian Thorne",
    title: "Founder & Lead Architect, Nexus Flow",
    badge: "WEB ARCHITECTURE",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
]"""

assert old_testimonials in content, "old_testimonials not found"
content = content.replace(old_testimonials, new_testimonials, 1)

# 3. Rename ref ferrisWrapRef -> testimonialsCardsWrapRef
content = content.replace("const ferrisWrapRef = useRef(null)", "const testimonialsCardsWrapRef = useRef(null)")

# 4. Update story id in TRANSITION_STORIES
content = content.replace("id: 'testimonials-ferris-stage',\n    type: 'ferris-stage',", "id: 'testimonials-infinite-stage',\n    type: 'infinite-stage',")

# 5. Update tick animation loop
old_tick_ferris = """      // Update Ferris Wheel Gallery (Clouds frames 24.5 to 56.0)
      if (ferrisWrapRef.current) {
        const fStart = cloudsFrameToProgress(24.5)
        const fAliveStart = cloudsFrameToProgress(26.0)
        const fAliveEnd = cloudsFrameToProgress(54.0)
        const fEnd = cloudsFrameToProgress(56.0)

        if (currentProgress < fStart || currentProgress > fEnd) {
          if (ferrisWrapRef.current.style.display !== 'none') {
            ferrisWrapRef.current.style.display = 'none'
            ferrisWrapRef.current.style.opacity = '0'
            ferrisWrapRef.current.style.pointerEvents = 'none'
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

          if (ferrisWrapRef.current.style.display !== 'flex') {
            ferrisWrapRef.current.style.display = 'flex'
          }
          ferrisWrapRef.current.style.opacity = fOpacity.toFixed(3)
          ferrisWrapRef.current.style.transform = `translate3d(0, ${fY.toFixed(1)}px, 0)`
          ferrisWrapRef.current.style.pointerEvents = fOpacity > 0.35 ? 'auto' : 'none'

          // Scroll-driven trigger: As the user scrolls through the testimonials range,
          // naturally rotate the Ferris Wheel to the active gondola/review (0 to 3)
          const testScrollRatio = clamp((currentProgress - fStart) / (fEnd - fStart), 0, 0.999)
          const targetTestIdx = Math.floor(testScrollRatio * 4)
          if (targetTestIdx !== lastActiveTestimonialIdx) {
            lastActiveTestimonialIdx = targetTestIdx
            window.dispatchEvent(new CustomEvent('devcore:select-testimonial', { detail: { index: targetTestIdx } }))
          }
        }
      }"""

new_tick_testimonials = """      // Update Infinite Moving Cards Testimonials (Clouds frames 24.5 to 56.0)
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

assert old_tick_ferris in content, "old_tick_ferris not found"
content = content.replace(old_tick_ferris, new_tick_testimonials, 1)

# 6. Update JSX stage
old_jsx_ferris = """            {/* Interactive Ferris Wheel Gallery (Mounted during clouds testimonials section) */}
            <div
              ref={ferrisWrapRef}
              className="ferris-testimonials-stage"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 40,
                opacity: 0,
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px 20px',
                pointerEvents: 'none',
              }}
            >
              <FerrisWheelGallery
                items={TESTIMONIAL_ITEMS}
                autoplay={false}
                aria-label="DevCore Client Testimonials Wheel"
              />
            </div>"""

new_jsx_testimonials = """            {/* Infinite Moving Cards Testimonials (Mounted during clouds testimonials section) */}
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

assert old_jsx_ferris in content, "old_jsx_ferris not found"
content = content.replace(old_jsx_ferris, new_jsx_testimonials, 1)

# 7. Update SNAP_CHECKPOINTS for testimonials
old_snap_test = """  { id: 'testimonials-cover', progress: cloudsFrameToProgress(21.0) },
  { id: 'testimonial-1', progress: 0.75839 },
  { id: 'testimonial-2', progress: 0.78089 },
  { id: 'testimonial-3', progress: 0.80339 },
  { id: 'testimonial-4', progress: 0.82589 },"""

new_snap_test = """  { id: 'testimonials-cover', progress: cloudsFrameToProgress(21.0) },
  { id: 'testimonials-showcase', progress: cloudsFrameToProgress(38.0) },"""

assert old_snap_test in content, "old_snap_test not found"
content = content.replace(old_snap_test, new_snap_test, 1)

# Remove unused lastActiveTestimonialIdx declaration
content = content.replace("let lastActiveTestimonialIdx = -1\n    ", "")

if crlf:
    content = content.replace('\n', '\r\n')

with open('src/AppComplete.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: Replaced Ferris Wheel Gallery with Infinite Moving Cards in AppComplete.jsx!")

