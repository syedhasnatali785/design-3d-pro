import sys

with open('src/AppComplete.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Normalize CRLF to LF for consistent replacement, then we can save back
crlf = '\r\n' in text
content = text.replace('\r\n', '\n')

# 1. Add import
old_import = "import { useEffect, useRef, useState } from 'react'\nimport './App.css'"
new_import = "import { useEffect, useRef, useState } from 'react'\nimport './App.css'\nimport { PolaroidLineCarousel } from './components/ui/polaroid-line-carousel'"
assert old_import in content, "old_import not found"
content = content.replace(old_import, new_import, 1)

# 2. Add SERVICES_SLIDES before TRANSITION_STORIES and replace 6 service cards with a single stage entry
old_stories_intro = """const TRANSITION_STORIES = [
  // --- 1. SERVICES (Tunnel entrance frame 1 to frame 78) ---
  {
    id: 'services-cover',
    type: 'cover',
    badge: 'SERVICES',
    title: 'SERVICES',
    tagline:
      'We provide complete engineering for POS Web apps, autonomous AI voice agents, cloud infrastructure, and bespoke enterprise software systems.',
    start: 0.320,
    end: tunnelFrameToProgress(20.5),
  },
  {
    id: 'full-stack-web',
    type: 'card',
    category: 'service',
    index: '01',
    totalCount: '06',
    badge: 'ARCHITECTURE',
    title: 'Full-Stack Web Development',
    tagline:
      'High-performance Next.js & React architectures with distributed microservices, ultra-responsive interfaces, and real-time backend synchronization.',
    tags: ['Next.js 15', 'React Server Comp.', 'TypeScript', 'Node.js & Go', 'PostgreSQL / Prisma', 'Tailwind CSS'],
    icon: 'web',
    start: tunnelFrameToProgress(21.0),
    aliveStart: tunnelFrameToProgress(22.0),
    aliveEnd: tunnelFrameToProgress(27.0),
    end: tunnelFrameToProgress(28.5),
    cta: 'Inquire Service',
    href: 'mailto:hello@devcore.studio?subject=Inquiry%20-%20Full-Stack%20Web%20Development',
  },
  {
    id: 'voice-chat-agent',
    type: 'card',
    category: 'service',
    index: '02',
    totalCount: '06',
    badge: 'AI INTELLIGENCE',
    title: 'Voice & Chat Agent Integrations',
    tagline:
      'Autonomous AI phone and chat agents with ultra-low latency streaming, LLM tool calling, live CRM syncing, and multi-turn conversational intelligence.',
    tags: ['WebRTC Audio Stream', 'Whisper & ElevenLabs', 'LLM Tool Calling', 'LangChain / LangGraph', 'Real-Time Telephony', 'Vector Memory'],
    icon: 'voice',
    start: tunnelFrameToProgress(31.0),
    aliveStart: tunnelFrameToProgress(32.0),
    aliveEnd: tunnelFrameToProgress(37.0),
    end: tunnelFrameToProgress(38.5),
    cta: 'Inquire Service',
    href: 'mailto:hello@devcore.studio?subject=Inquiry%20-%20Voice%20%26%20Chat%20Agent%20Integrations',
  },
  {
    id: 'aws-cloud-services',
    type: 'card',
    category: 'service',
    index: '03',
    totalCount: '06',
    badge: 'INFRASTRUCTURE',
    title: 'AWS Cloud Services',
    tagline:
      'Zero-downtime AWS cloud infrastructure, serverless Lambda microservices, auto-scaling ECS / EKS clusters, and enterprise-grade security compliance.',
    tags: ['AWS ECS / EKS', 'Serverless Lambda', 'Terraform / IaC', 'CloudFront & S3', 'DynamoDB / RDS Multi-AZ', '99.99% SLA'],
    icon: 'cloud',
    start: tunnelFrameToProgress(41.0),
    aliveStart: tunnelFrameToProgress(42.0),
    aliveEnd: tunnelFrameToProgress(47.0),
    end: tunnelFrameToProgress(48.5),
    cta: 'Inquire Service',
    href: 'mailto:hello@devcore.studio?subject=Inquiry%20-%20AWS%20Cloud%20Services',
  },
  {
    id: 'pos-systems',
    type: 'card',
    category: 'service',
    index: '04',
    totalCount: '06',
    badge: 'COMMERCE',
    title: 'POS Systems',
    tagline:
      'Enterprise-grade point-of-sale platforms featuring offline-first local billing, instant hardware printer & barcode sync, and multi-store inventory commands.',
    tags: ['Offline-First SQLite', 'Thermal Printer ESC/POS', 'Barcode & Scale Sync', 'Multi-Terminal Hub', 'Live Cloud Sync', 'Stock Analytics'],
    icon: 'pos',
    start: tunnelFrameToProgress(51.0),
    aliveStart: tunnelFrameToProgress(52.0),
    aliveEnd: tunnelFrameToProgress(57.0),
    end: tunnelFrameToProgress(58.5),
    cta: 'Inquire Service',
    href: 'mailto:hello@devcore.studio?subject=Inquiry%20-%20POS%20Systems',
  },
  {
    id: 'custom-software',
    type: 'card',
    category: 'service',
    index: '05',
    totalCount: '06',
    badge: 'ENGINEERING',
    title: 'Custom Software',
    tagline:
      'Bespoke enterprise software architectures, automated internal tooling, high-throughput data processing pipelines, and resilient microservices.',
    tags: ['Custom ERP / CRM', 'High-Throughput APIs', 'Event-Driven Systems', 'Automated Workflows', 'Legacy Modernization', 'Docker / K8s'],
    icon: 'software',
    start: tunnelFrameToProgress(61.0),
    aliveStart: tunnelFrameToProgress(62.0),
    aliveEnd: tunnelFrameToProgress(67.0),
    end: tunnelFrameToProgress(68.5),
    cta: 'Inquire Service',
    href: 'mailto:hello@devcore.studio?subject=Inquiry%20-%20Custom%20Software',
  },
  {
    id: 'ai-development',
    type: 'card',
    category: 'service',
    index: '06',
    totalCount: '06',
    badge: 'NEURAL SYSTEMS',
    title: 'AI Development',
    tagline:
      'Full-cycle machine learning and generative AI engineering: fine-tuned open-weights models, RAG vector pipelines, and production multimodal agents.',
    tags: ['Fine-Tuned LLMs', 'Multimodal Models', 'Vector Search / RAG', 'CUDA Acceleration', 'Autonomous Pipelines', 'Evaluation Suites'],
    icon: 'ai',
    start: tunnelFrameToProgress(71.0),
    aliveStart: tunnelFrameToProgress(72.0),
    aliveEnd: tunnelFrameToProgress(77.0),
    end: tunnelFrameToProgress(78.0),
    cta: 'Inquire Service',
    href: 'mailto:hello@devcore.studio?subject=Inquiry%20-%20AI%20Development',
  },"""

new_stories_intro = """// DevCore Studio Services for Polaroid Line Carousel
const SERVICES_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    title: 'Full-Stack Web Development',
    caption: 'High-performance Next.js architectures with distributed microservices, ultra-responsive interfaces, and real-time backend synchronization.',
    badge: 'ARCHITECTURE',
    tags: ['Next.js 15', 'React Server Comp.', 'TypeScript', 'PostgreSQL'],
    cta: 'Inquire Service',
    href: 'mailto:hello@devcore.studio?subject=Inquiry%20-%20Full-Stack%20Web%20Development',
  },
  {
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    title: 'Voice & Chat Agent Integrations',
    caption: 'Autonomous AI phone and chat agents with ultra-low latency streaming, LLM tool calling, live CRM syncing, and multi-turn conversational intelligence.',
    badge: 'AI INTELLIGENCE',
    tags: ['WebRTC Audio', 'ElevenLabs', 'LLM Tool Calling', 'LangGraph'],
    cta: 'Inquire Service',
    href: 'mailto:hello@devcore.studio?subject=Inquiry%20-%20Voice%20%26%20Chat%20Agent%20Integrations',
  },
  {
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    title: 'AWS Cloud Services',
    caption: 'Zero-downtime AWS cloud infrastructure, serverless Lambda microservices, auto-scaling ECS / EKS clusters, and enterprise-grade security compliance.',
    badge: 'INFRASTRUCTURE',
    tags: ['AWS ECS / EKS', 'Serverless Lambda', 'Terraform / IaC', '99.99% SLA'],
    cta: 'Inquire Service',
    href: 'mailto:hello@devcore.studio?subject=Inquiry%20-%20AWS%20Cloud%20Services',
  },
  {
    image: 'https://images.unsplash.com/photo-1556742049-0a67e557224f?auto=format&fit=crop&w=1200&q=80',
    title: 'POS Systems',
    caption: 'Enterprise-grade point-of-sale platforms featuring offline-first local billing, instant hardware printer & barcode sync, and multi-store inventory commands.',
    badge: 'COMMERCE',
    tags: ['Offline-First SQLite', 'Thermal ESC/POS', 'Barcode Sync', 'Multi-Terminal'],
    cta: 'Inquire Service',
    href: 'mailto:hello@devcore.studio?subject=Inquiry%20-%20POS%20Systems',
  },
  {
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    title: 'Custom Software',
    caption: 'Bespoke enterprise software architectures, automated internal tooling, high-throughput data processing pipelines, and resilient microservices.',
    badge: 'ENGINEERING',
    tags: ['Custom ERP / CRM', 'High-Throughput APIs', 'Event-Driven', 'Docker / K8s'],
    cta: 'Inquire Service',
    href: 'mailto:hello@devcore.studio?subject=Inquiry%20-%20Custom%20Software',
  },
  {
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
    title: 'AI Development',
    caption: 'Full-cycle machine learning and generative AI engineering: fine-tuned open-weights models, RAG vector pipelines, and production multimodal agents.',
    badge: 'NEURAL SYSTEMS',
    tags: ['Fine-Tuned LLMs', 'Multimodal', 'Vector Search / RAG', 'CUDA Engine'],
    cta: 'Inquire Service',
    href: 'mailto:hello@devcore.studio?subject=Inquiry%20-%20AI%20Development',
  },
]

const TRANSITION_STORIES = [
  // --- 1. SERVICES (Tunnel entrance frame 1 to frame 78) ---
  {
    id: 'services-cover',
    type: 'cover',
    badge: 'SERVICES',
    title: 'SERVICES',
    tagline:
      'We provide complete engineering for POS Web apps, autonomous AI voice agents, cloud infrastructure, and bespoke enterprise software systems.',
    start: 0.320,
    end: tunnelFrameToProgress(20.5),
  },
  {
    id: 'services-polaroid-stage',
    type: 'polaroid-stage',
    badge: 'SERVICES CAROUSEL',
    start: tunnelFrameToProgress(21.0),
    aliveStart: tunnelFrameToProgress(23.0),
    aliveEnd: tunnelFrameToProgress(76.0),
    end: tunnelFrameToProgress(78.0),
  },"""

assert old_stories_intro in content, "old_stories_intro not found"
content = content.replace(old_stories_intro, new_stories_intro, 1)

# 3. Update getFrozenFrameProgress and SNAP_CHECKPOINTS
old_frozen = """// Card-Freeze Timing: Freezes the background 3D camera frame completely while any card is active
// so the card completes its full animation lifecycle (Enter -> Stand/Read -> Exit)
// BEFORE the camera frame moves forward to the next scene.
function getFrozenFrameProgress(progress) {
  for (let i = 0; i < TRANSITION_STORIES.length; i++) {
    const s = TRANSITION_STORIES[i]
    if (s.aliveStart && s.end && progress >= s.start && progress <= s.end) {
      // Freeze the background camera at the card's entry frame!
      return s.start
    }
  }
  return progress
}

const SECTION_TARGETS = [0.22, 0.36, tunnelFrameToProgress(103), cloudsFrameToProgress(20), cloudsFrameToProgress(78)]

// Checkpoints for 3rd Scroll Fast-Jump to Next/Prev Card
const SNAP_CHECKPOINTS = [
  { id: 'hero', progress: 0.0 },
  { id: 'services-cover', progress: 0.325 },
  { id: 'full-stack-web', progress: tunnelFrameToProgress(24.5) },
  { id: 'voice-chat-agent', progress: tunnelFrameToProgress(34.5) },
  { id: 'aws-cloud-services', progress: tunnelFrameToProgress(44.5) },
  { id: 'pos-systems', progress: tunnelFrameToProgress(54.5) },
  { id: 'custom-software', progress: tunnelFrameToProgress(64.5) },
  { id: 'ai-development', progress: tunnelFrameToProgress(74.5) },
  { id: 'projects-cover', progress: tunnelFrameToProgress(86.0) },"""

new_frozen = """// Card-Freeze Timing: Freezes the background 3D camera frame completely while any card or services carousel is active
// so the content remains rock-solid and smooth BEFORE the camera moves forward to the next scene.
function getFrozenFrameProgress(progress) {
  // During Polaroid services carousel window, freeze camera cleanly at frame 21
  const servStart = tunnelFrameToProgress(21.0)
  const servEnd = tunnelFrameToProgress(78.0)
  if (progress >= servStart && progress <= servEnd) {
    return servStart
  }

  for (let i = 0; i < TRANSITION_STORIES.length; i++) {
    const s = TRANSITION_STORIES[i]
    if (s.type === 'card' && s.aliveStart && s.end && progress >= s.start && progress <= s.end) {
      // Freeze the background camera at the card's entry frame!
      return s.start
    }
  }
  return progress
}

const SECTION_TARGETS = [0.22, 0.36, tunnelFrameToProgress(103), cloudsFrameToProgress(20), cloudsFrameToProgress(78)]

// Checkpoints for 3rd Scroll Fast-Jump to Next/Prev Card
const SNAP_CHECKPOINTS = [
  { id: 'hero', progress: 0.0 },
  { id: 'services-cover', progress: 0.325 },
  { id: 'services-carousel', progress: tunnelFrameToProgress(24.5) },
  { id: 'projects-cover', progress: tunnelFrameToProgress(86.0) },"""

assert old_frozen in content, "old_frozen not found"
content = content.replace(old_frozen, new_frozen, 1)

# 4. Add polaroidWrapRef declaration
old_refs = "  const servicesTaglineRef = useRef(null)\n  const storyRefs = useRef([])"
new_refs = "  const servicesTaglineRef = useRef(null)\n  const polaroidWrapRef = useRef(null)\n  const storyRefs = useRef([])"
assert old_refs in content, "old_refs not found"
content = content.replace(old_refs, new_refs, 1)

# 5. Add polaroid wrap animation in tick() right after TRANSITION_STORIES loop
old_tick_footer = """      // Update Footer
      if (footerRef.current) {
        const fp = clamp((currentProgress - 0.85) / 0.13, 0, 1)
        footerRef.current.style.opacity = fp.toFixed(3)
        footerRef.current.style.transform = `translateY(${(1 - fp) * 80}px)`
      }"""

new_tick_footer = """      // Update Polaroid Line Carousel (Smooth fade in/out in services section frame 21.0 - 78.0)
      if (polaroidWrapRef.current) {
        const pStart = tunnelFrameToProgress(21.0)
        const pAliveStart = tunnelFrameToProgress(23.0)
        const pAliveEnd = tunnelFrameToProgress(76.0)
        const pEnd = tunnelFrameToProgress(78.0)

        if (currentProgress < pStart || currentProgress > pEnd) {
          if (polaroidWrapRef.current.style.display !== 'none') {
            polaroidWrapRef.current.style.display = 'none'
            polaroidWrapRef.current.style.opacity = '0'
            polaroidWrapRef.current.style.pointerEvents = 'none'
          }
        } else {
          let pOpacity = 1
          let pY = 0

          if (currentProgress < pAliveStart) {
            const enterR = clamp((currentProgress - pStart) / (pAliveStart - pStart), 0, 1)
            pOpacity = enterR
            pY = (1 - enterR) * 24
          } else if (currentProgress > pAliveEnd) {
            const exitR = clamp((currentProgress - pAliveEnd) / (pEnd - pAliveEnd), 0, 1)
            pOpacity = 1 - exitR
            pY = -exitR * 24
          }

          if (polaroidWrapRef.current.style.display !== 'block') {
            polaroidWrapRef.current.style.display = 'block'
          }
          polaroidWrapRef.current.style.opacity = pOpacity.toFixed(3)
          polaroidWrapRef.current.style.transform = `translate3d(0, ${pY.toFixed(1)}px, 0)`
          polaroidWrapRef.current.style.pointerEvents = pOpacity > 0.35 ? 'auto' : 'none'
        }
      }

      // Update Footer
      if (footerRef.current) {
        const fp = clamp((currentProgress - 0.85) / 0.13, 0, 1)
        footerRef.current.style.opacity = fp.toFixed(3)
        footerRef.current.style.transform = `translateY(${(1 - fp) * 80}px)`
      }"""

assert old_tick_footer in content, "old_tick_footer not found"
content = content.replace(old_tick_footer, new_tick_footer, 1)

# 6. Mount PolaroidLineCarousel in hero-video-stage JSX right before TRANSITION_STORIES map
old_jsx_stage = """              <p className="hero-services-tagline" ref={servicesTaglineRef}>
                We provide services like POS Web apps and custom software systems tailored for enterprise growth.
              </p>
            </div>

            {TRANSITION_STORIES.map((story, index) => ("""

new_jsx_stage = """              <p className="hero-services-tagline" ref={servicesTaglineRef}>
                We provide services like POS Web apps and custom software systems tailored for enterprise growth.
              </p>
            </div>

            {/* Interactive Polaroid Line Carousel (Mounted during tunnel services section) */}
            <div
              ref={polaroidWrapRef}
              className="polaroid-carousel-stage"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 40,
                opacity: 0,
                display: 'none',
                pointerEvents: 'none',
              }}
            >
              <PolaroidLineCarousel
                slides={SERVICES_SLIDES}
                cardWidth={280}
                sag={85}
                swing={1}
                autoplay={4200}
                string="#38bdf8"
                ariaLabel="DevCore Studio Services Carousel"
              />
            </div>

            {TRANSITION_STORIES.map((story, index) => ("""

assert old_jsx_stage in content, "old_jsx_stage not found"
content = content.replace(old_jsx_stage, new_jsx_stage, 1)

# 7. Update Desktop dropdown service buttons
old_desktop_services = """                <button
                  type="button"
                  role="menuitem"
                  className="tiny-menu-item"
                  onClick={() => {
                    scrollToProgress(tunnelFrameToProgress(24.5))
                    setServicesOpen(false)
                  }}
                >
                  <span className="tiny-menu-dot" aria-hidden="true" />
                  <span>Full-Stack Web</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="tiny-menu-item"
                  onClick={() => {
                    scrollToProgress(tunnelFrameToProgress(34.5))
                    setServicesOpen(false)
                  }}
                >
                  <span className="tiny-menu-dot" aria-hidden="true" />
                  <span>Voice & Chat Agents</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="tiny-menu-item"
                  onClick={() => {
                    scrollToProgress(tunnelFrameToProgress(44.5))
                    setServicesOpen(false)
                  }}
                >
                  <span className="tiny-menu-dot" aria-hidden="true" />
                  <span>AWS Cloud</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="tiny-menu-item"
                  onClick={() => {
                    scrollToProgress(tunnelFrameToProgress(54.5))
                    setServicesOpen(false)
                  }}
                >
                  <span className="tiny-menu-dot" aria-hidden="true" />
                  <span>POS Systems</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="tiny-menu-item"
                  onClick={() => {
                    scrollToProgress(tunnelFrameToProgress(64.5))
                    setServicesOpen(false)
                  }}
                >
                  <span className="tiny-menu-dot" aria-hidden="true" />
                  <span>Custom Software</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="tiny-menu-item"
                  onClick={() => {
                    scrollToProgress(tunnelFrameToProgress(74.5))
                    setServicesOpen(false)
                  }}
                >
                  <span className="tiny-menu-dot" aria-hidden="true" />
                  <span>AI Development</span>
                </button>"""

new_desktop_services = """                <button
                  type="button"
                  role="menuitem"
                  className="tiny-menu-item"
                  onClick={() => {
                    scrollToProgress(tunnelFrameToProgress(24.5))
                    window.dispatchEvent(new CustomEvent('devcore:select-service', { detail: { index: 0 } }))
                    setServicesOpen(false)
                  }}
                >
                  <span className="tiny-menu-dot" aria-hidden="true" />
                  <span>Full-Stack Web</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="tiny-menu-item"
                  onClick={() => {
                    scrollToProgress(tunnelFrameToProgress(24.5))
                    window.dispatchEvent(new CustomEvent('devcore:select-service', { detail: { index: 1 } }))
                    setServicesOpen(false)
                  }}
                >
                  <span className="tiny-menu-dot" aria-hidden="true" />
                  <span>Voice & Chat Agents</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="tiny-menu-item"
                  onClick={() => {
                    scrollToProgress(tunnelFrameToProgress(24.5))
                    window.dispatchEvent(new CustomEvent('devcore:select-service', { detail: { index: 2 } }))
                    setServicesOpen(false)
                  }}
                >
                  <span className="tiny-menu-dot" aria-hidden="true" />
                  <span>AWS Cloud</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="tiny-menu-item"
                  onClick={() => {
                    scrollToProgress(tunnelFrameToProgress(24.5))
                    window.dispatchEvent(new CustomEvent('devcore:select-service', { detail: { index: 3 } }))
                    setServicesOpen(false)
                  }}
                >
                  <span className="tiny-menu-dot" aria-hidden="true" />
                  <span>POS Systems</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="tiny-menu-item"
                  onClick={() => {
                    scrollToProgress(tunnelFrameToProgress(24.5))
                    window.dispatchEvent(new CustomEvent('devcore:select-service', { detail: { index: 4 } }))
                    setServicesOpen(false)
                  }}
                >
                  <span className="tiny-menu-dot" aria-hidden="true" />
                  <span>Custom Software</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="tiny-menu-item"
                  onClick={() => {
                    scrollToProgress(tunnelFrameToProgress(24.5))
                    window.dispatchEvent(new CustomEvent('devcore:select-service', { detail: { index: 5 } }))
                    setServicesOpen(false)
                  }}
                >
                  <span className="tiny-menu-dot" aria-hidden="true" />
                  <span>AI Development</span>
                </button>"""

assert old_desktop_services in content, "old_desktop_services not found"
content = content.replace(old_desktop_services, new_desktop_services, 1)

# 8. Update Mobile menu service chips
old_mobile_services = """                <div className="menu-subservices-grid">
                  <button
                    type="button"
                    className="menu-sub-chip"
                    onClick={() => {
                      scrollToProgress(tunnelFrameToProgress(24.5))
                      setMenuOpen(false)
                    }}
                  >
                    Full-Stack Web
                  </button>
                  <button
                    type="button"
                    className="menu-sub-chip"
                    onClick={() => {
                      scrollToProgress(tunnelFrameToProgress(34.5))
                      setMenuOpen(false)
                    }}
                  >
                    Voice & Chat AI
                  </button>
                  <button
                    type="button"
                    className="menu-sub-chip"
                    onClick={() => {
                      scrollToProgress(tunnelFrameToProgress(44.5))
                      setMenuOpen(false)
                    }}
                  >
                    AWS Cloud
                  </button>
                  <button
                    type="button"
                    className="menu-sub-chip"
                    onClick={() => {
                      scrollToProgress(tunnelFrameToProgress(54.5))
                      setMenuOpen(false)
                    }}
                  >
                    POS Systems
                  </button>
                  <button
                    type="button"
                    className="menu-sub-chip"
                    onClick={() => {
                      scrollToProgress(tunnelFrameToProgress(64.5))
                      setMenuOpen(false)
                    }}
                  >
                    Custom Software
                  </button>
                  <button
                    type="button"
                    className="menu-sub-chip"
                    onClick={() => {
                      scrollToProgress(tunnelFrameToProgress(74.5))
                      setMenuOpen(false)
                    }}
                  >
                    AI Development
                  </button>
                </div>"""

new_mobile_services = """                <div className="menu-subservices-grid">
                  <button
                    type="button"
                    className="menu-sub-chip"
                    onClick={() => {
                      scrollToProgress(tunnelFrameToProgress(24.5))
                      window.dispatchEvent(new CustomEvent('devcore:select-service', { detail: { index: 0 } }))
                      setMenuOpen(false)
                    }}
                  >
                    Full-Stack Web
                  </button>
                  <button
                    type="button"
                    className="menu-sub-chip"
                    onClick={() => {
                      scrollToProgress(tunnelFrameToProgress(24.5))
                      window.dispatchEvent(new CustomEvent('devcore:select-service', { detail: { index: 1 } }))
                      setMenuOpen(false)
                    }}
                  >
                    Voice & Chat AI
                  </button>
                  <button
                    type="button"
                    className="menu-sub-chip"
                    onClick={() => {
                      scrollToProgress(tunnelFrameToProgress(24.5))
                      window.dispatchEvent(new CustomEvent('devcore:select-service', { detail: { index: 2 } }))
                      setMenuOpen(false)
                    }}
                  >
                    AWS Cloud
                  </button>
                  <button
                    type="button"
                    className="menu-sub-chip"
                    onClick={() => {
                      scrollToProgress(tunnelFrameToProgress(24.5))
                      window.dispatchEvent(new CustomEvent('devcore:select-service', { detail: { index: 3 } }))
                      setMenuOpen(false)
                    }}
                  >
                    POS Systems
                  </button>
                  <button
                    type="button"
                    className="menu-sub-chip"
                    onClick={() => {
                      scrollToProgress(tunnelFrameToProgress(24.5))
                      window.dispatchEvent(new CustomEvent('devcore:select-service', { detail: { index: 4 } }))
                      setMenuOpen(false)
                    }}
                  >
                    Custom Software
                  </button>
                  <button
                    type="button"
                    className="menu-sub-chip"
                    onClick={() => {
                      scrollToProgress(tunnelFrameToProgress(24.5))
                      window.dispatchEvent(new CustomEvent('devcore:select-service', { detail: { index: 5 } }))
                      setMenuOpen(false)
                    }}
                  >
                    AI Development
                  </button>
                </div>"""

assert old_mobile_services in content, "old_mobile_services not found"
content = content.replace(old_mobile_services, new_mobile_services, 1)

# Write back
if crlf:
    content = content.replace('\n', '\r\n')

with open('src/AppComplete.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: AppComplete.jsx updated with Polaroid Line Carousel integration!")

