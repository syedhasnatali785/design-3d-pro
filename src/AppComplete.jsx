import { useEffect, useRef, useState } from 'react'
import './App.css'

// Desktop Hero Sequence (Widescreen 16:9)
const HERO_DESKTOP_FRAMES = Object.entries(
  import.meta.glob('../Rocket_launches_from_icy_land_20261027031051_frames/**/*.png', {
    eager: true,
    import: 'default',
  }),
)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, src]) => src)

// Mobile Hero Sequence (Portrait 9:16 - 720x1280)
const HERO_MOBILE_FRAMES = Object.entries(
  import.meta.glob('../Rocket_launching_from_icy_land_3b8ce17c_frames/**/*.png', {
    eager: true,
    import: 'default',
  }),
)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, src]) => src)

const TUNNEL_FRAMES = Object.entries(
  import.meta.glob('../Camera_moves_through_icy_tunnel_20261027032841_frames/**/*.png', {
    eager: true,
    import: 'default',
  }),
)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, src]) => src)

const CLOUDS_FRAMES = Object.entries(
  import.meta.glob('../Camera_moves_up_to_clouds_20261027224013_frames/**/*.png', {
    eager: true,
    import: 'default',
  }),
)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, src]) => src)

const HERO_END = 0.30
const TRANSITION_1_END = 0.38
const TUNNEL_END = 0.68
const TRANSITION_2_END = 0.76

// Story & Tagline content for every transition & stage (connected with menu navigation)
const TRANSITION_STORIES = [
  {
    id: 'pos-web-app',
    start: 0.28,
    end: 0.44,
    badge: 'SERVICES',
    title: 'CLOUD POS WEB APP',
    tagline:
      'we provide services like POS Web app and different software systems with offline-first billing, fast inventory sync, and multi-terminal control.',
    cta: 'Explore',
    target: 0.56,
  },
  {
    id: 'software-systems',
    start: 0.48,
    end: 0.64,
    badge: 'ENGINEERING',
    title: 'CUSTOM SOFTWARE SYSTEMS',
    tagline:
      'we provide services like POS Web app and different software systems designed for high-concurrency databases, scalable APIs, and automated workflows.',
    cta: 'Discover',
    target: 0.74,
  },
  {
    id: 'modern-studio',
    start: 0.68,
    end: 0.84,
    badge: 'PERFORMANCE',
    title: 'NEXT-GEN WEB ARCHITECTURE',
    tagline:
      'we provide services like POS Web app and different software systems powered by 60FPS WebGL graphics and modern enterprise infrastructure.',
    cta: 'Contact',
    target: 0.95,
  },
  {
    id: 'contact-climax',
    start: 0.88,
    end: 1.00,
    badge: 'CONNECT',
    title: 'LET’S BUILD YOUR NEXT SYSTEM',
    tagline:
      'we provide services like POS Web app and different software systems. Get in touch with DevCore to architect and launch your digital solution.',
    cta: 'Book a call',
    href: 'mailto:hello@devcore.tech?subject=Project%20Inquiry%20-%20POS%20%26%20Software%20Systems',
  },
]

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function getLoadedFrame(imageArray, targetIndex) {
  if (!imageArray || imageArray.length === 0) return null
  const clamped = clamp(Math.round(targetIndex), 0, imageArray.length - 1)

  if (imageArray[clamped]?.complete && imageArray[clamped]?.naturalWidth > 0) {
    return imageArray[clamped]
  }

  // Fallback to nearest loaded backward
  for (let i = clamped - 1; i >= 0; i--) {
    if (imageArray[i]?.complete && imageArray[i]?.naturalWidth > 0) {
      return imageArray[i]
    }
  }

  // Fallback to nearest loaded forward
  for (let i = clamped + 1; i < imageArray.length; i++) {
    if (imageArray[i]?.complete && imageArray[i]?.naturalWidth > 0) {
      return imageArray[i]
    }
  }

  return imageArray[0] || null
}

function drawCover(ctx, img, canvasWidth, canvasHeight, opacity = 1) {
  if (!img || !img.complete || img.naturalWidth === 0) return

  const imgW = img.naturalWidth
  const imgH = img.naturalHeight
  const scale = Math.max(canvasWidth / imgW, canvasHeight / imgH)
  const drawW = imgW * scale
  const drawH = imgH * scale
  const offsetX = (canvasWidth - drawW) * 0.5
  const offsetY = (canvasHeight - drawH) * 0.5

  if (opacity < 0.999) {
    ctx.save()
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity))
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH)
    ctx.restore()
  } else {
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH)
  }
}

// Optical frame blending: smoothly crossfades between adjacent frames
function renderBlendedSequence(ctx, images, seqProgress, canvasWidth, canvasHeight) {
  if (!images || images.length === 0) return
  const total = images.length
  const floatIndex = clamp(seqProgress * (total - 1), 0, total - 1)
  const baseIndex = Math.floor(floatIndex)
  const nextIndex = Math.min(baseIndex + 1, total - 1)
  const fraction = floatIndex - baseIndex

  const imgA = getLoadedFrame(images, baseIndex)
  const imgB = getLoadedFrame(images, nextIndex)

  if (imgA) {
    drawCover(ctx, imgA, canvasWidth, canvasHeight, 1)
  }

  if (imgB && imgB !== imgA && fraction > 0.005) {
    drawCover(ctx, imgB, canvasWidth, canvasHeight, fraction)
  }
}

// Lightweight procedural snowfall generator (halki halki baraf bari)
function createSnowflakes(count, width, height) {
  const flakes = []
  for (let i = 0; i < count; i++) {
    flakes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.1 + 0.8, // 0.8px to 2.9px fine ice crystals
      speedY: Math.random() * 0.85 + 0.45, // Gentle fluttering fall
      speedX: (Math.random() - 0.5) * 0.35, // Subtle wind drift
      sway: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.02 + 0.012,
      swayAmp: Math.random() * 1.4 + 0.4,
      opacity: Math.random() * 0.45 + 0.35, // Translucent crystalline glow
    })
  }
  return flakes
}

function AppComplete() {
  const [isLoading, setIsLoading] = useState(true)
  const [loadPercent, setLoadPercent] = useState(0)
  const [activeSection, setActiveSection] = useState('home')
  const activeSectionRef = useRef('home')
  const [servicesOpen, setServicesOpen] = useState(false)
  const dropdownRef = useRef(null)

  const headerRef = useRef(null)
  const footerRef = useRef(null)
  const canvasRef = useRef(null)
  const snowCanvasRef = useRef(null)
  const snowflakesRef = useRef([])
  const whiteRef = useRef(null)
  const heroCopyRef = useRef(null)
  const scrollCueRef = useRef(null)
  const servicesRef = useRef(null)
  const storyRefs = useRef([])

  const heroDesktopImagesRef = useRef([])
  const heroMobileImagesRef = useRef([])
  const tunnelImagesRef = useRef([])
  const cloudsImagesRef = useRef([])

  // Close tiny services menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setServicesOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Smooth scroll directly to frame section
  const scrollToProgress = (progress) => {
    const maxScroll = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1,
    )
    window.scrollTo({
      top: progress * maxScroll,
      behavior: 'smooth',
    })
  }

  // Preload frames with fast initial readiness (prioritizes active device)
  useEffect(() => {
    let isCancelled = false
    const isMobile = window.innerWidth <= 768 || window.innerHeight > window.innerWidth
    // Preload & Decode frames with complete verification before revealing homepage
    const primaryHero = isMobile ? HERO_MOBILE_FRAMES : HERO_DESKTOP_FRAMES
    const totalRequiredFrames = primaryHero.length + TUNNEL_FRAMES.length + CLOUDS_FRAMES.length
    let loadedCount = 0

    const updateProgress = () => {
      if (isCancelled) return
      loadedCount++
      const percent = Math.min(Math.round((loadedCount / totalRequiredFrames) * 100), 100)
      setLoadPercent(percent)

      // Only enter homepage when 100% of required sequence frames are fully loaded & verified in GPU memory
      if (loadedCount >= totalRequiredFrames) {
        setTimeout(() => {
          if (!isCancelled) {
            setIsLoading(false)
          }
        }, 250) // subtle smooth transition delay
      }
    }

    const loadAndVerifySequence = (urls, isPriority = true) => {
      return urls.map((url) => {
        const img = new Image()
        img.src = url

        if (isPriority) {
          const handleComplete = () => {
            // img.decode() forces GPU to decompress image immediately, eliminating first-scroll stutter/lag
            if (typeof img.decode === 'function') {
              img.decode().then(updateProgress).catch(updateProgress)
            } else {
              updateProgress()
            }
          }

          if (img.complete && img.naturalWidth > 0) {
            handleComplete()
          } else {
            img.onload = handleComplete
            img.onerror = updateProgress
          }
        }
        return img
      })
    }

    if (isMobile) {
      heroMobileImagesRef.current = loadAndVerifySequence(HERO_MOBILE_FRAMES, true)
      tunnelImagesRef.current = loadAndVerifySequence(TUNNEL_FRAMES, true)
      cloudsImagesRef.current = loadAndVerifySequence(CLOUDS_FRAMES, true)
      // Background idle load for non-active screen mode
      heroDesktopImagesRef.current = loadAndVerifySequence(HERO_DESKTOP_FRAMES, false)
    } else {
      heroDesktopImagesRef.current = loadAndVerifySequence(HERO_DESKTOP_FRAMES, true)
      tunnelImagesRef.current = loadAndVerifySequence(TUNNEL_FRAMES, true)
      cloudsImagesRef.current = loadAndVerifySequence(CLOUDS_FRAMES, true)
      // Background idle load for non-active screen mode
      heroMobileImagesRef.current = loadAndVerifySequence(HERO_MOBILE_FRAMES, false)
    }

    // High ceiling fallback safety timeout (e.g. if a single asset network hangs)
    const fallbackTimeout = setTimeout(() => {
      if (!isCancelled) {
        setIsLoading(false)
      }
    }, 7000)

    return () => {
      isCancelled = true
      clearTimeout(fallbackTimeout)
    }
  }, [])

  // Render & Responsive Lerp Loop
  useEffect(() => {
    let targetProgress = 0
    let currentProgress = 0
    let animationFrameId = null

    const handleScroll = () => {
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      )
      targetProgress = clamp(window.scrollY / maxScroll, 0, 1)
    }

    const handleResize = () => {
      handleScroll()
      resizeCanvas()
    }

    const resizeCanvas = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const targetW = Math.round(width * dpr)
      const targetH = Math.round(height * dpr)

      const canvas = canvasRef.current
      if (canvas) {
        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW
          canvas.height = targetH
        }
      }

      const snowCanvas = snowCanvasRef.current
      if (snowCanvas) {
        if (snowCanvas.width !== targetW || snowCanvas.height !== targetH) {
          snowCanvas.width = targetW
          snowCanvas.height = targetH
          const isMobileNow = width <= 768 || height > width
          const count = isMobileNow ? 38 : 72
          snowflakesRef.current = createSnowflakes(count, targetW, targetH)
        }
      }
    }

    resizeCanvas()
    handleScroll()
    currentProgress = targetProgress

    const tick = () => {
      const isMobile = window.innerWidth <= 768 || window.innerHeight > window.innerWidth
      const delta = targetProgress - currentProgress
      const absDelta = Math.abs(delta)

      // Buttery smooth glide (~1 second gradual momentum flow):
      // Moves slowly and gracefully without rushing, allowing time to read text and see animations
      const lerpFactor = isMobile ? 0.052 : 0.044

      currentProgress += delta * lerpFactor

      if (absDelta < 0.000008) {
        currentProgress = targetProgress
      }

      // Draw canvas with optical frame blending
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'

          // Select appropriate hero sequence (portrait 720x1280 mobile vs widescreen desktop)
          const activeHero = isMobile
            ? (heroMobileImagesRef.current.length > 0 ? heroMobileImagesRef.current : heroDesktopImagesRef.current)
            : (heroDesktopImagesRef.current.length > 0 ? heroDesktopImagesRef.current : heroMobileImagesRef.current)

          if (currentProgress <= HERO_END) {
            // Sequence 1: Rocket Launch with smooth inter-frame blending
            const seqP = clamp(currentProgress / HERO_END, 0, 1)
            renderBlendedSequence(
              ctx,
              activeHero,
              seqP,
              canvas.width,
              canvas.height,
            )
          } else if (currentProgress < TRANSITION_1_END) {
            // Transition 1: Rocket to Tunnel (cross-blend + white wipe)
            const transP = clamp(
              (currentProgress - HERO_END) / (TRANSITION_1_END - HERO_END),
              0,
              1,
            )
            const lastHero = getLoadedFrame(
              activeHero,
              activeHero.length - 1,
            )
            const firstTunnel = getLoadedFrame(tunnelImagesRef.current, 0)

            if (lastHero) {
              drawCover(ctx, lastHero, canvas.width, canvas.height, 1)
            }
            if (firstTunnel && transP > 0.01) {
              drawCover(ctx, firstTunnel, canvas.width, canvas.height, transP)
            }
          } else if (currentProgress <= TUNNEL_END) {
            // Sequence 2: Ice Tunnel with smooth inter-frame blending
            const seqP = clamp(
              (currentProgress - TRANSITION_1_END) / (TUNNEL_END - TRANSITION_1_END),
              0,
              1,
            )
            renderBlendedSequence(
              ctx,
              tunnelImagesRef.current,
              seqP,
              canvas.width,
              canvas.height,
            )
          } else if (currentProgress < TRANSITION_2_END) {
            // Transition 2: Tunnel to Clouds (cross-blend + white wipe)
            const transP = clamp(
              (currentProgress - TUNNEL_END) / (TRANSITION_2_END - TUNNEL_END),
              0,
              1,
            )
            const lastTunnel = getLoadedFrame(
              tunnelImagesRef.current,
              tunnelImagesRef.current.length - 1,
            )
            const firstClouds = getLoadedFrame(cloudsImagesRef.current, 0)

            if (lastTunnel) {
              drawCover(ctx, lastTunnel, canvas.width, canvas.height, 1)
            }
            if (firstClouds && transP > 0.01) {
              drawCover(ctx, firstClouds, canvas.width, canvas.height, transP)
            }
          } else {
            // Sequence 3: Clouds with smooth inter-frame blending
            const seqP = clamp(
              (currentProgress - TRANSITION_2_END) / (1 - TRANSITION_2_END),
              0,
              1,
            )
            renderBlendedSequence(
              ctx,
              cloudsImagesRef.current,
              seqP,
              canvas.width,
              canvas.height,
            )
          }
        }
      }

      // Render Snowfall Particle System (gentle looping snow)
      const snowCanvas = snowCanvasRef.current
      if (snowCanvas) {
        const snowCtx = snowCanvas.getContext('2d')
        if (snowCtx) {
          snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height)

          if (snowflakesRef.current.length === 0) {
            const count = isMobile ? 38 : 72
            snowflakesRef.current = createSnowflakes(count, snowCanvas.width, snowCanvas.height)
          }

          const flakes = snowflakesRef.current
          // Soft dynamic drift boost on scroll
          const scrollBoost = Math.min(Math.abs(delta) * 14, 2.2)

          for (let i = 0; i < flakes.length; i++) {
            const flake = flakes[i]
            flake.sway += flake.swaySpeed
            flake.x += flake.speedX + Math.sin(flake.sway) * (flake.swayAmp * 0.35)
            flake.y += flake.speedY + scrollBoost

            // Seamless loop
            if (flake.y > snowCanvas.height) {
              flake.y = -6
              flake.x = Math.random() * snowCanvas.width
            }
            if (flake.x < -10) flake.x = snowCanvas.width + 6
            if (flake.x > snowCanvas.width + 10) flake.x = -6

            snowCtx.beginPath()
            snowCtx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2)
            snowCtx.fillStyle = `rgba(240, 250, 255, ${flake.opacity})`
            snowCtx.shadowColor = 'rgba(215, 240, 255, 0.7)'
            snowCtx.shadowBlur = flake.radius > 2 ? 4 : 1
            snowCtx.fill()
          }
        }
      }

      // Update White Transition Overlay directly on DOM
      if (whiteRef.current) {
        let whiteOpacity = 0
        let whiteY = '100%'

        if (currentProgress > HERO_END && currentProgress < TRANSITION_1_END) {
          const transP = (currentProgress - HERO_END) / (TRANSITION_1_END - HERO_END)
          if (transP <= 0.5) {
            const wipeIn = transP / 0.5
            whiteOpacity = wipeIn * 0.95
            whiteY = `${(1 - wipeIn) * 100}%`
          } else {
            const wipeOut = (transP - 0.5) / 0.5
            whiteOpacity = (1 - wipeOut) * 0.95
            whiteY = '0%'
          }
        } else if (currentProgress > TUNNEL_END && currentProgress < TRANSITION_2_END) {
          const transP = (currentProgress - TUNNEL_END) / (TRANSITION_2_END - TUNNEL_END)
          if (transP <= 0.5) {
            const wipeIn = transP / 0.5
            whiteOpacity = wipeIn * 0.95
            whiteY = `${(1 - wipeIn) * 100}%`
          } else {
            const wipeOut = (transP - 0.5) / 0.5
            whiteOpacity = (1 - wipeOut) * 0.95
            whiteY = '0%'
          }
        }

        whiteRef.current.style.opacity = whiteOpacity.toFixed(3)
        whiteRef.current.style.transform = `translateY(${whiteY})`
      }

      // Update Header: Remains permanently visible and interactive for full frame navigation
      if (headerRef.current) {
        headerRef.current.style.opacity = '1'
        headerRef.current.style.transform = 'translateY(0)'
      }

      // Track active section for topnav menu pills
      let currentSec
      if (currentProgress < 0.16) {
        currentSec = 'home'
      } else if (currentProgress < 0.28) {
        currentSec = 'services'
      } else if (currentProgress < 0.46) {
        currentSec = 'pos'
      } else if (currentProgress < 0.66) {
        currentSec = 'software'
      } else if (currentProgress < 0.86) {
        currentSec = 'studio'
      } else {
        currentSec = 'contact'
      }

      if (currentSec !== activeSectionRef.current) {
        activeSectionRef.current = currentSec
        setActiveSection(currentSec)
      }

      // Update Hero Text Copy (remains fully readable, then fades gently)
      if (heroCopyRef.current) {
        const tp = clamp((currentProgress - 0.05) / 0.14, 0, 1)
        heroCopyRef.current.style.opacity = (1 - tp).toFixed(3)
        heroCopyRef.current.style.transform = `translateY(${-24 * tp}px)`
      }

      // Update Scroll Cue
      if (scrollCueRef.current) {
        const scp = clamp((currentProgress - 0.02) / 0.06, 0, 1)
        scrollCueRef.current.style.opacity = (1 - scp).toFixed(3)
        scrollCueRef.current.style.transform = `translateX(-50%) translateY(${scp * 12}px)`
      }

      // Update Services Text Block (strictly visible from frame_035.png to frame_058.png with icy styling)
      if (servicesRef.current) {
        // frame_035 = index 34/59 * 0.30 = 0.1729
        // frame_058 = index 57/59 * 0.30 = 0.2898
        const frame35Progress = 0.1729
        const frame58Progress = 0.2898
        const enterRange = 0.015
        const exitRange = 0.015

        const enterStart = frame35Progress - enterRange // ~0.158
        const enterEnd = frame35Progress // ~0.173
        const exitStart = frame58Progress // ~0.290
        const exitEnd = frame58Progress + exitRange // ~0.305

        let servOpacity = 0
        let servY = 20

        if (currentProgress >= enterStart && currentProgress <= exitEnd) {
          if (currentProgress < enterEnd) {
            const p = (currentProgress - enterStart) / (enterEnd - enterStart)
            servOpacity = p
            servY = (1 - p) * 20
          } else if (currentProgress > exitStart) {
            const p = (currentProgress - exitStart) / (exitEnd - exitStart)
            servOpacity = 1 - p
            servY = -16 * p
          } else {
            servOpacity = 1
            servY = 0
          }
        }

        servicesRef.current.style.opacity = servOpacity.toFixed(3)
        servicesRef.current.style.transform = `translateX(-50%) translateY(${servY.toFixed(1)}px)`
        servicesRef.current.style.display = servOpacity > 0.005 ? 'flex' : 'none'
      }

      // Update Transition Stories Cards (data-driven with icy atmospheric animation)
      TRANSITION_STORIES.forEach((story, idx) => {
        const el = storyRefs.current[idx]
        if (!el) return

        const { start, end } = story
        const enterRange = 0.03
        const exitRange = 0.03
        let op = 0
        let y = 24

        if (currentProgress >= start && currentProgress <= end) {
          if (currentProgress < start + enterRange) {
            const p = (currentProgress - start) / enterRange
            op = p
            y = (1 - p) * 24
          } else if (currentProgress > end - exitRange) {
            const p = (currentProgress - (end - exitRange)) / exitRange
            op = 1 - p
            y = -20 * p
          } else {
            op = 1
            y = 0
          }
        }

        el.style.opacity = op.toFixed(3)
        el.style.transform = `translate(-50%, -50%) translateY(${y.toFixed(1)}px)`
        el.style.display = op > 0.005 ? 'flex' : 'none'
      })

      // Update Footer
      if (footerRef.current) {
        const fp = clamp((currentProgress - 0.85) / 0.13, 0, 1)
        footerRef.current.style.opacity = fp.toFixed(3)
        footerRef.current.style.transform = `translateY(${(1 - fp) * 80}px)`
      }

      animationFrameId = window.requestAnimationFrame(tick)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)

    animationFrameId = window.requestAnimationFrame(tick)

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId)
      }
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <>
      <div
        className={`global-loader ${isLoading ? 'is-visible' : 'is-hidden'}`}
        aria-live="polite"
        aria-busy={isLoading}
      >
        <div className="loader-card">
          <div className="loader-ring" aria-hidden="true" />
          <div className="loader-text-group">
            <span className="loader-label">INITIALIZING SYSTEM</span>
            <span className="loader-progress">
              {isLoading ? `DECODING FRAMES • ${loadPercent}%` : 'READY'}
            </span>
          </div>
          <div className="loader-bar-track" aria-hidden="true">
            <div className="loader-bar-fill" style={{ width: `${loadPercent}%` }} />
          </div>
        </div>
      </div>

      <div className={`story-shell ${isLoading ? 'is-loading' : 'is-ready'}`}>
        <header className="topbar" ref={headerRef}>
          <button
            type="button"
            className="brand-pill"
            onClick={() => scrollToProgress(0)}
            aria-label="DevCore Home - Scroll to top"
          >
            <span className="brand-mark">D</span>
            <span className="brand-name">DevCore</span>
          </button>

          <nav className="topnav" aria-label="Main navigation">
            <div
              className="topnav-dropdown"
              ref={dropdownRef}
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                type="button"
                className={`topnav-btn topnav-btn--dropdown ${activeSection === 'services' || activeSection === 'pos' || activeSection === 'software'
                  ? 'is-active'
                  : ''
                  }`}
                onClick={() => {
                  setServicesOpen((prev) => !prev)
                  scrollToProgress(0.22)
                }}
                aria-expanded={servicesOpen}
                aria-haspopup="true"
              >
                <span>Services</span>
                <svg
                  className={`dropdown-chevron ${servicesOpen ? 'is-open' : ''}`}
                  width="8"
                  height="5"
                  viewBox="0 0 8 5"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M1 1L4 4L7 1"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div className={`tiny-transparent-menu ${servicesOpen ? 'is-visible' : ''}`} role="menu">
                <button
                  type="button"
                  role="menuitem"
                  className={`tiny-menu-item ${activeSection === 'services' ? 'is-active' : ''}`}
                  onClick={() => {
                    scrollToProgress(0.22)
                    setServicesOpen(false)
                  }}
                >
                  <span className="tiny-menu-dot" aria-hidden="true" />
                  <span>Overview</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className={`tiny-menu-item ${activeSection === 'pos' ? 'is-active' : ''}`}
                  onClick={() => {
                    scrollToProgress(0.36)
                    setServicesOpen(false)
                  }}
                >
                  <span className="tiny-menu-dot" aria-hidden="true" />
                  <span>POS Web App</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className={`tiny-menu-item ${activeSection === 'software' ? 'is-active' : ''}`}
                  onClick={() => {
                    scrollToProgress(0.56)
                    setServicesOpen(false)
                  }}
                >
                  <span className="tiny-menu-dot" aria-hidden="true" />
                  <span>Software Systems</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              className={`topnav-btn ${activeSection === 'studio' ? 'is-active' : ''}`}
              onClick={() => scrollToProgress(0.74)}
            >
              Studio
            </button>
            <button
              type="button"
              className={`topnav-btn ${activeSection === 'contact' ? 'is-active' : ''}`}
              onClick={() => scrollToProgress(0.95)}
            >
              Contact
            </button>
          </nav>
        </header>

        <div className="hero-video-stage">
          <canvas ref={canvasRef} className="hero-video-canvas" />

          <div
            ref={whiteRef}
            className="white-transition"
            style={{ opacity: 0, transform: 'translateY(100%)' }}
            aria-hidden="true"
          />

          <canvas ref={snowCanvasRef} className="snow-overlay-canvas" aria-hidden="true" />

          <div className="scene-overlay">
            <div className="hero-copy" ref={heroCopyRef}>
              <span className="hero-word hero-word-we">We Ship</span>
              <span className="hero-word hero-word-products">Products</span>
              <span className="hero-word hero-word-this-way">This Way</span>
            </div>

            <div className="hero-services-block" ref={servicesRef} aria-hidden={true} style={{ opacity: 0, display: 'none' }}>
              <div className="hero-services-eyebrow">OUR SERVICES</div>
              <h2 className="hero-services-heading">POS & SOFTWARE SYSTEMS</h2>
              <p className="hero-services-tagline">
                we provide services like POS Web app and different software systems
              </p>
            </div>

            {TRANSITION_STORIES.map((story, index) => (
              <div
                key={story.id}
                ref={(el) => {
                  storyRefs.current[index] = el
                }}
                className="transition-story-card"
                style={{ opacity: 0, display: 'none' }}
              >
                <div className="story-badge">
                  <span className="story-badge-dot" aria-hidden="true" />
                  <span>{story.badge}</span>
                </div>
                <h2 className="story-title">{story.title}</h2>
                <p className="story-tagline">{story.tagline}</p>
                {story.cta && (
                  story.href ? (
                    <a
                      href={story.href}
                      className="story-cta-btn"
                    >
                      <span>{story.cta}</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="story-cta-btn"
                      onClick={() => story.target !== undefined && scrollToProgress(story.target)}
                    >
                      <span>{story.cta}</span>
                    </button>
                  )
                )}
              </div>
            ))}

            <div className="scroll-cue" ref={scrollCueRef} aria-label="Scroll down">
              <span className="scroll-cue-dot" aria-hidden="true" />
              <span>Scroll Down</span>
            </div>
          </div>
        </div>

        <footer className="bottombar" ref={footerRef} style={{ opacity: 0, transform: 'translateY(80px)' }}>
          <div className="footer-shell">
            <span>DevCore — POS Web Apps & Custom Software Systems</span>
            <button
              type="button"
              className="footer-shell-btn"
              onClick={() => scrollToProgress(0.95)}
            >
              Contact DevCore
            </button>
          </div>
        </footer>

        <div className="story-spacer" aria-hidden="true" />
      </div>
    </>
  )
}

export default AppComplete