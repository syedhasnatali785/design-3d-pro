import sys

with open('src/AppComplete.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update cardWidth and sag in PolaroidLineCarousel props
old_polaroid_jsx = """              <PolaroidLineCarousel
                slides={SERVICES_SLIDES}
                cardWidth={280}
                sag={85}
                swing={1}
                autoplay={4200}
                string="#38bdf8"
                ariaLabel="DevCore Studio Services Carousel"
              />"""

new_polaroid_jsx = """              <PolaroidLineCarousel
                slides={SERVICES_SLIDES}
                cardWidth={420}
                sag={65}
                swing={1}
                autoplay={0}
                string="#38bdf8"
                ariaLabel="DevCore Studio Services Carousel"
              />"""

assert old_polaroid_jsx in code, "old_polaroid_jsx not found"
code = code.replace(old_polaroid_jsx, new_polaroid_jsx, 1)

# 2. Add lastServiceIndexRef right before tick()
old_tick_start = """    const tick = () => {
      const isMobile = isMobileRef.current"""

new_tick_start = """    let lastActiveServiceIdx = -1
    const tick = () => {
      const isMobile = isMobileRef.current"""

assert old_tick_start in code, "old_tick_start not found"
code = code.replace(old_tick_start, new_tick_start, 1)

# 3. In polaroidWrapRef animation block in tick, calculate service index from scroll progress and dispatch event
old_polaroid_tick = """      // Update Polaroid Line Carousel (Smooth fade in/out in services section frame 21.0 - 78.0)
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
      }"""

new_polaroid_tick = """      // Update Polaroid Line Carousel (Smooth fade in/out in services section frame 21.0 - 78.0)
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

          // Scroll-driven trigger: As the user scrolls through the services range,
          // naturally swing and snap to each corresponding polaroid card (0 to 5)
          const serviceScrollRatio = clamp((currentProgress - pStart) / (pEnd - pStart), 0, 0.999)
          const targetCardIdx = Math.floor(serviceScrollRatio * 6)
          if (targetCardIdx !== lastActiveServiceIdx) {
            lastActiveServiceIdx = targetCardIdx
            window.dispatchEvent(new CustomEvent('devcore:scroll-service-index', { detail: { index: targetCardIdx } }))
          }
        }
      }"""

assert old_polaroid_tick in code, "old_polaroid_tick not found"
code = code.replace(old_polaroid_tick, new_polaroid_tick, 1)

# 4. Update SNAP_CHECKPOINTS to provide individual checkpoints for all 6 service cards
old_checkpoints = """const SNAP_CHECKPOINTS = [
  { id: 'hero', progress: 0.0 },
  { id: 'services-cover', progress: 0.325 },
  { id: 'services-carousel', progress: tunnelFrameToProgress(24.5) },
  { id: 'projects-cover', progress: tunnelFrameToProgress(86.0) },"""

new_checkpoints = """const SNAP_CHECKPOINTS = [
  { id: 'hero', progress: 0.0 },
  { id: 'services-cover', progress: 0.325 },
  { id: 'full-stack-web', progress: 0.38387 },
  { id: 'voice-chat-agent', progress: 0.40839 },
  { id: 'aws-cloud-services', progress: 0.4329 },
  { id: 'pos-systems', progress: 0.45742 },
  { id: 'custom-software', progress: 0.48194 },
  { id: 'ai-development', progress: 0.50645 },
  { id: 'projects-cover', progress: tunnelFrameToProgress(86.0) },"""

assert old_checkpoints in code, "old_checkpoints not found"
code = code.replace(old_checkpoints, new_checkpoints, 1)

# 5. Update topnav desktop buttons with their exact checkpoint progress
old_nav_web = """                <button
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

new_nav_web = """                <button
                  type="button"
                  role="menuitem"
                  className="tiny-menu-item"
                  onClick={() => {
                    scrollToProgress(0.38387)
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
                    scrollToProgress(0.40839)
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
                    scrollToProgress(0.4329)
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
                    scrollToProgress(0.45742)
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
                    scrollToProgress(0.48194)
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
                    scrollToProgress(0.50645)
                    window.dispatchEvent(new CustomEvent('devcore:select-service', { detail: { index: 5 } }))
                    setServicesOpen(false)
                  }}
                >
                  <span className="tiny-menu-dot" aria-hidden="true" />
                  <span>AI Development</span>
                </button>"""

assert old_nav_web in code, "old_nav_web not found"
code = code.replace(old_nav_web, new_nav_web, 1)

# 6. Update mobile chips with exact checkpoint progress
old_mob_chips = """                <div className="menu-subservices-grid">
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

new_mob_chips = """                <div className="menu-subservices-grid">
                  <button
                    type="button"
                    className="menu-sub-chip"
                    onClick={() => {
                      scrollToProgress(0.38387)
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
                      scrollToProgress(0.40839)
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
                      scrollToProgress(0.4329)
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
                      scrollToProgress(0.45742)
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
                      scrollToProgress(0.48194)
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
                      scrollToProgress(0.50645)
                      window.dispatchEvent(new CustomEvent('devcore:select-service', { detail: { index: 5 } }))
                      setMenuOpen(false)
                    }}
                  >
                    AI Development
                  </button>
                </div>"""

assert old_mob_chips in code, "old_mob_chips not found"
code = code.replace(old_mob_chips, new_mob_chips, 1)

with open('src/AppComplete.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated AppComplete.jsx with scroll triggers and bigger cards successfully!")

