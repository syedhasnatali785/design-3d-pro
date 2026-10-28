import { useEffect, useRef, useState } from 'react'
import './App.css'

// Animated single-line loader phrases
const LOADER_MESSAGES = [
  'Welcome to DevCore',
  'We are loading DevCore...',
  'What services we provide?',
  'Cloud POS Web Apps & Custom Systems',
  'Architecting Next-Gen Web Architecture...',
]

// Unified Hero Sequence for both Desktop & Mobile
const HERO_FRAMES = Object.entries(
  import.meta.glob('../Rocket_launches_from_icy_land_20261027031051_frames/**/*.png', {
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

const HERO_END = 0.32
const TUNNEL_END = 0.68

// Story & Tagline content for every transition & stage (connected with menu navigation)
const TRANSITION_STORIES = [
  {
    id: 'pos-web-app',
    start: 0.28,
    end: 0.44,
    badge: 'SERVICES',
    title: 'CLOUD POS WEB APP',
    tagline:
      'We provide services like POS Web apps and custom software systems with offline-first billing, real-time inventory sync, and multi-terminal command.',
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
      'We build high-concurrency software systems, resilient backend architectures, and automated business workflows tailored for fast-growing companies.',
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
      'We engineer ultra-fluid 60FPS WebGL digital experiences, high-performance web applications, and enterprise-grade cloud ecosystems.',
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
      'We provide complete engineering for POS Web apps and bespoke software systems. Connect with DevCore to architect and launch your digital future.',
    cta: 'Book a call',
    href: 'mailto:hello@devcore.tech?subject=Project%20Inquiry%20-%20POS%20%26%20Software%20Systems',
  },
]

const SECTION_TARGETS = [0.22, 0.36, 0.56, 0.74, 0.95]

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

// Ultra-subtle, organic atmospheric mist / cloud puff generator
function createAtmosphericMists(count, width, height) {
  const mists = []
  for (let i = 0; i < count; i++) {
    mists.push({
      x: Math.random() * width * 1.4 - width * 0.2,
      y: Math.random() * height * 0.95,
      radiusX: (Math.random() * 0.35 + 0.35) * Math.max(width, height), // Wide soft volumetric ellipse
      radiusY: (Math.random() * 0.18 + 0.14) * Math.min(width, height),
      speedX: (Math.random() * 0.2 + 0.12), // Very slow majestic horizontal drift
      sway: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.003 + 0.0015,
      maxOpacity: Math.random() * 0.055 + 0.045, // Incredibly faint (4.5% to 10% opacity) - feels alive without blocking view
    })
  }
  return mists
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
  const [loaderMsgIndex, setLoaderMsgIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')

  // Realistic character typing effect for loader lines
  useEffect(() => {
    if (!isLoading) return
    const currentFullText = LOADER_MESSAGES[loaderMsgIndex] || ''
    let charIndex = 0
    setDisplayedText('')

    const typeInterval = setInterval(() => {
      charIndex++
      setDisplayedText(currentFullText.slice(0, charIndex))
      if (charIndex >= currentFullText.length) {
        clearInterval(typeInterval)
      }
    }, 42)

    return () => clearInterval(typeInterval)
  }, [loaderMsgIndex, isLoading])

  // Cycle to next loader phrase every 2.4s
  useEffect(() => {
    if (!isLoading) return
    const timer = setInterval(() => {
      setLoaderMsgIndex((prev) => (prev + 1) % LOADER_MESSAGES.length)
    }, 2400)
    return () => clearInterval(timer)
  }, [isLoading])
  const [activeSection, setActiveSection] = useState('home')
  const activeSectionRef = useRef('home')
  const [servicesOpen, setServicesOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Launch button countdown state: null | 3 | 2 | 1 | 'IGNITION'
  const [countdown, setCountdown] = useState(null)
  const countdownTimerRef = useRef(null)
  const shakeIntensityRef = useRef(0)

  const headerRef = useRef(null)
  const footerRef = useRef(null)
  const canvasRef = useRef(null)
  const snowCanvasRef = useRef(null)
  const snowflakesRef = useRef([])
  const cloudsRef = useRef([])
  const whiteRef = useRef(null)
  const heroCopyRef = useRef(null)
  const launchBtnRef = useRef(null)
  const nextSectionBtnRef = useRef(null)
  const currentProgressRef = useRef(0)
  const scrollCueRef = useRef(null)
  const servicesRef = useRef(null)
  const servicesHeadingRef = useRef(null)
  const servicesTaglineRef = useRef(null)
  const storyRefs = useRef([])
  const storyTitleRefs = useRef([])
  const storyTaglineRefs = useRef([])
  const activeTypedSectionRef = useRef({})
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })

  const heroImagesRef = useRef([])
  const tunnelImagesRef = useRef([])
  const cloudsImagesRef = useRef([])

  // Close tiny services menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setServicesOpen(false)
      }
    }
    const handleMouseMove = (e) => {
      const halfW = window.innerWidth / 2
      const halfH = window.innerHeight / 2
      mouseRef.current.targetX = (e.clientX - halfW) / halfW
      mouseRef.current.targetY = (e.clientY - halfH) / halfH
    }
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('mousemove', handleMouseMove)
    }
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

  // Handle mini circle down-arrow: advance to next section milestone
  const handleNextSectionClick = () => {
    const cur = currentProgressRef.current || 0
    const nextTarget = SECTION_TARGETS.find((target) => target > cur + 0.05)
    if (nextTarget !== undefined) {
      scrollToProgress(nextTarget)
    } else {
      scrollToProgress(0.95)
    }
  }

  // Trigger Countdown 3 -> 2 -> 1 -> Launch with Minor Screen Shake
  const handleLaunchClick = (e) => {
    e?.stopPropagation()
    if (countdown !== null) return
    setCountdown(3)

    countdownTimerRef.current = setTimeout(() => {
      setCountdown(2)
      countdownTimerRef.current = setTimeout(() => {
        setCountdown(1)
        countdownTimerRef.current = setTimeout(() => {
          setCountdown('IGNITION')
          // Trigger slight minor launch rocket shake
          shakeIntensityRef.current = 1.2

          // Smoothly scroll to services section
          scrollToProgress(0.22)

          countdownTimerRef.current = setTimeout(() => {
            setCountdown(null)
          }, 2400)
        }, 900)
      }, 900)
    }, 900)
  }

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current)
    }
  }, [])

  // Preload frames with fast initial readiness (unified hero sequence)
  useEffect(() => {
    let isCancelled = false
    // Preload & Decode frames with complete verification before revealing homepage
    const totalRequiredFrames = HERO_FRAMES.length + TUNNEL_FRAMES.length + CLOUDS_FRAMES.length
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

    const loadAndVerifySequence = (urls) => {
      return urls.map((url) => {
        const img = new Image()
        img.src = url

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
        return img
      })
    }

    heroImagesRef.current = loadAndVerifySequence(HERO_FRAMES)
    tunnelImagesRef.current = loadAndVerifySequence(TUNNEL_FRAMES)
    cloudsImagesRef.current = loadAndVerifySequence(CLOUDS_FRAMES)

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
          cloudsRef.current = createAtmosphericMists(isMobileNow ? 3 : 5, targetW, targetH)
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

      // Cinematic, balanced pacing (gracefully slowed down):
      const lerpFactor = isMobile ? 0.032 : 0.026

      currentProgress += delta * lerpFactor

      if (absDelta < 0.000008) {
        currentProgress = targetProgress
      }

      currentProgressRef.current = currentProgress

      // Smooth mouse lerp for 3D tilts & micro camera sway
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05

      // Cinema-Grade Smooth Handheld Camera Motion:
      // Multi-frequency organic sine harmonics simulate natural human operator breathing & walking/holding camera
      const now = Date.now()
      // Dynamic shake boost while scrolling through sections (chalte huwe thora handheld feel)
      const walkFactor = Math.min(absDelta * 280, 1.8) // dynamically amplifies when moving

      const handheldX = (Math.sin(now * 0.0011) * 3.2 + Math.sin(now * 0.0028) * 2.1 + Math.sin(now * 0.0065) * 1.2) * (1 + walkFactor * 0.6)
      const handheldY = (Math.cos(now * 0.0009) * 2.8 + Math.cos(now * 0.0023) * 1.8 + Math.sin(now * 0.0055) * 0.9) * (1 + walkFactor * 0.6)
      const handheldRot = (Math.sin(now * 0.0008) * 0.28 + Math.sin(now * 0.0021) * 0.16) * (1 + walkFactor * 0.5)

      // Minor screen shake on rocket launch ignition (smoothly decays)
      let shakeX = 0
      let shakeY = 0
      if (shakeIntensityRef.current > 0.002) {
        shakeX = (Math.random() - 0.5) * 6.5 * shakeIntensityRef.current
        shakeY = (Math.random() - 0.5) * 6.5 * shakeIntensityRef.current
        shakeIntensityRef.current *= 0.93 // exponential damping
      } else {
        shakeIntensityRef.current = 0
      }

      // Living Atmospheric Reaction on Frames (Camera Breathing, Handheld Sway & Launch Shake)
      const canvas = canvasRef.current
      if (canvas) {
        const camTiltX = mouseRef.current.x * 0.8 + handheldX + shakeX
        const camTiltY = mouseRef.current.y * 0.6 + handheldY + shakeY
        const breathe = Math.sin(now * 0.0014) * 0.45
        // scale 1.04 provides comfortable margin so edges never show black border during shake
        canvas.style.transform = `scale(1.042) translate3d(${camTiltX.toFixed(2)}px, ${(camTiltY + breathe).toFixed(2)}px, 0) rotate(${handheldRot.toFixed(3)}deg)`

        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'

          // Unified Hero Sequence for both Desktop & Mobile
          const activeHero = heroImagesRef.current

          // Seamless direct playback across 3 continuous sequence stages
          // No freeze/dead-zone pauses: sequence 1 -> sequence 2 -> sequence 3 flow smoothly
          const crossBlendRange = 0.04 // Soft cinematic cross-dissolve overlap

          if (currentProgress < HERO_END - crossBlendRange) {
            // Sequence 1: Rocket Launch
            const seqP = clamp(currentProgress / (HERO_END - crossBlendRange), 0, 1)
            renderBlendedSequence(ctx, activeHero, seqP, canvas.width, canvas.height)
          } else if (currentProgress <= HERO_END) {
            // Seamless Overlap: Rocket Launch ending gently cross-fades into Tunnel starting
            const blendRatio = (currentProgress - (HERO_END - crossBlendRange)) / crossBlendRange
            renderBlendedSequence(ctx, activeHero, 1, canvas.width, canvas.height)
            const firstTunnel = getLoadedFrame(tunnelImagesRef.current, 0)
            if (firstTunnel) {
              drawCover(ctx, firstTunnel, canvas.width, canvas.height, blendRatio)
            }
          } else if (currentProgress < TUNNEL_END - crossBlendRange) {
            // Sequence 2: Ice Tunnel continuous forward motion
            const seqP = clamp(
              (currentProgress - HERO_END) / (TUNNEL_END - crossBlendRange - HERO_END),
              0,
              1,
            )
            renderBlendedSequence(ctx, tunnelImagesRef.current, seqP, canvas.width, canvas.height)
          } else if (currentProgress <= TUNNEL_END) {
            // Seamless Overlap: Tunnel ending seamlessly cross-fades into Clouds starting
            // (Eliminated the dead-zone pause at Next-Gen Web Architecture)
            const blendRatio = (currentProgress - (TUNNEL_END - crossBlendRange)) / crossBlendRange
            renderBlendedSequence(ctx, tunnelImagesRef.current, 1, canvas.width, canvas.height)
            const firstClouds = getLoadedFrame(cloudsImagesRef.current, 0)
            if (firstClouds) {
              drawCover(ctx, firstClouds, canvas.width, canvas.height, blendRatio)
            }
          } else {
            // Sequence 3: Clouds continuous upward flight to climax
            const seqP = clamp((currentProgress - TUNNEL_END) / (1 - TUNNEL_END), 0, 1)
            renderBlendedSequence(ctx, cloudsImagesRef.current, seqP, canvas.width, canvas.height)
          }
        }
      }

      // Render Atmospheric Soft Clouds & Snowfall Particle System (alive icy atmospheric loop)
      const snowCanvas = snowCanvasRef.current
      if (snowCanvas) {
        const snowCtx = snowCanvas.getContext('2d')
        if (snowCtx) {
          snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height)

          if (snowflakesRef.current.length === 0) {
            const count = isMobile ? 38 : 72
            snowflakesRef.current = createSnowflakes(count, snowCanvas.width, snowCanvas.height)
          }

          if (cloudsRef.current.length === 0) {
            cloudsRef.current = createAtmosphericMists(isMobile ? 3 : 5, snowCanvas.width, snowCanvas.height)
          }

          // 1. Subtle, living atmospheric cloud/mist layers (barely visible, soft moving volume)
          const mists = cloudsRef.current
          for (let m = 0; m < mists.length; m++) {
            const mist = mists[m]
            mist.sway += mist.swaySpeed
            mist.x += mist.speedX

            // Seamless toroidal wrap across screen
            if (mist.x - mist.radiusX > snowCanvas.width) {
              mist.x = -mist.radiusX
              mist.y = Math.random() * snowCanvas.height * 0.9
            }

            const currentMistOpacity = mist.maxOpacity * (0.85 + Math.sin(mist.sway) * 0.15)
            const mistY = mist.y + Math.sin(mist.sway * 0.8) * 12

            const grad = snowCtx.createRadialGradient(
              mist.x,
              mistY,
              0,
              mist.x,
              mistY,
              mist.radiusX,
            )
            grad.addColorStop(0, `rgba(235, 248, 255, ${currentMistOpacity.toFixed(4)})`)
            grad.addColorStop(0.45, `rgba(215, 240, 255, ${(currentMistOpacity * 0.6).toFixed(4)})`)
            grad.addColorStop(0.8, `rgba(195, 230, 255, ${(currentMistOpacity * 0.2).toFixed(4)})`)
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)')

            snowCtx.save()
            snowCtx.beginPath()
            // Scale transform to draw an organic wide ellipse
            snowCtx.translate(mist.x, mistY)
            snowCtx.scale(1, mist.radiusY / mist.radiusX)
            snowCtx.arc(0, 0, mist.radiusX, 0, Math.PI * 2)
            snowCtx.fillStyle = grad
            snowCtx.fill()
            snowCtx.restore()
          }

          // 2. Snowflakes
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

      // Update Barfani Sliding White Transition
      // Glides up dynamically during stage shifts (Rocket -> Tunnel, Tunnel -> Clouds)
      if (whiteRef.current) {
        let whiteOpacity = 0
        let whiteY = 110 // start off-screen below (+110%)

        const sweepRange = 0.055

        // Transition 1 sweep (around HERO_END 0.32)
        if (Math.abs(currentProgress - HERO_END) <= sweepRange) {
          const progressInSweep = (currentProgress - (HERO_END - sweepRange)) / (sweepRange * 2)
          // Progress from 0 to 1 -> sweep from translateY(110%) to translateY(-110%)
          whiteY = 110 - progressInSweep * 220
          whiteOpacity = Math.sin(progressInSweep * Math.PI) * 0.92
        }
        // Transition 2 sweep (around TUNNEL_END 0.68)
        else if (Math.abs(currentProgress - TUNNEL_END) <= sweepRange) {
          const progressInSweep = (currentProgress - (TUNNEL_END - sweepRange)) / (sweepRange * 2)
          whiteY = 110 - progressInSweep * 220
          whiteOpacity = Math.sin(progressInSweep * Math.PI) * 0.92
        }

        whiteRef.current.style.opacity = whiteOpacity.toFixed(3)
        whiteRef.current.style.transform = `translateY(${whiteY.toFixed(1)}%)`
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

      // Update Hero Text Copy (remains fully readable, then fades gently with 3D tilt)
      if (heroCopyRef.current) {
        const tp = clamp((currentProgress - 0.05) / 0.14, 0, 1)
        const tiltX = -mouseRef.current.y * 12
        const tiltY = mouseRef.current.x * 14
        heroCopyRef.current.style.opacity = (1 - tp).toFixed(3)
        heroCopyRef.current.style.transform = `translateY(${-24 * tp}px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`
      }

      // Update Icy Red Launch Button (visible at hero, smoothly fades on scroll)
      if (launchBtnRef.current) {
        const lbp = clamp((currentProgress - 0.04) / 0.12, 0, 1)
        const tiltX = -mouseRef.current.y * 8
        const tiltY = mouseRef.current.x * 10
        launchBtnRef.current.style.opacity = (1 - lbp).toFixed(3)
        launchBtnRef.current.style.transform = `translateX(-50%) translateY(${lbp * 20}px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`
        launchBtnRef.current.style.pointerEvents = lbp < 0.8 ? 'auto' : 'none'
      }

      // Update Services Text Block (strictly visible from frame_035.png to frame_058.png with 3D depth)
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

        const tiltX = -mouseRef.current.y * 10
        const tiltY = mouseRef.current.x * 12
        servicesRef.current.style.opacity = servOpacity.toFixed(3)
        servicesRef.current.style.transform = `translateX(-50%) translateY(${servY.toFixed(1)}px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`
        servicesRef.current.style.display = servOpacity > 0.005 ? 'flex' : 'none'

        // Typing effect for Services Heading & Left-to-Right Tagline Fade
        if (servOpacity > 0.15) {
          if (!activeTypedSectionRef.current['services']) {
            activeTypedSectionRef.current['services'] = true
            const fullHeading = 'POS & SOFTWARE SYSTEMS'
            if (servicesHeadingRef.current) {
              let charIdx = 0
              servicesHeadingRef.current.textContent = ''
              const iv = setInterval(() => {
                charIdx++
                if (servicesHeadingRef.current) {
                  servicesHeadingRef.current.textContent = fullHeading.slice(0, charIdx)
                }
                if (charIdx >= fullHeading.length) clearInterval(iv)
              }, 38)
            }
          }
          if (servicesTaglineRef.current) {
            servicesTaglineRef.current.classList.add('is-revealed')
          }
        } else if (servOpacity <= 0.01) {
          activeTypedSectionRef.current['services'] = false
          if (servicesTaglineRef.current) {
            servicesTaglineRef.current.classList.remove('is-revealed')
          }
        }
      }

      // Update Transition Stories Cards (data-driven with icy 3D tilts and atmospheric depth)
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

        const tiltX = -mouseRef.current.y * 11
        const tiltY = mouseRef.current.x * 13

        el.style.opacity = op.toFixed(3)
        el.style.transform = `translate(-50%, -50%) translateY(${y.toFixed(1)}px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`
        el.style.display = op > 0.005 ? 'flex' : 'none'

        // Typing effect for Section Title & Left-to-Right Tagline Fade
        const storyKey = `story_${idx}`
        if (op > 0.2) {
          if (!activeTypedSectionRef.current[storyKey]) {
            activeTypedSectionRef.current[storyKey] = true
            const titleEl = storyTitleRefs.current[idx]
            if (titleEl) {
              const fullTitle = story.title
              let c = 0
              titleEl.textContent = ''
              const iv = setInterval(() => {
                c++
                if (titleEl) {
                  titleEl.textContent = fullTitle.slice(0, c)
                }
                if (c >= fullTitle.length) clearInterval(iv)
              }, 34)
            }
          }
          const taglineEl = storyTaglineRefs.current[idx]
          if (taglineEl) {
            taglineEl.classList.add('is-revealed')
          }
        } else if (op <= 0.01) {
          activeTypedSectionRef.current[storyKey] = false
          const taglineEl = storyTaglineRefs.current[idx]
          if (taglineEl) {
            taglineEl.classList.remove('is-revealed')
          }
        }
      })

      // Update Footer
      if (footerRef.current) {
        const fp = clamp((currentProgress - 0.85) / 0.13, 0, 1)
        footerRef.current.style.opacity = fp.toFixed(3)
        footerRef.current.style.transform = `translateY(${(1 - fp) * 80}px)`
      }

      // Update Mini Next Section Arrow Button (Strictly HIDDEN in Hero Section < 0.16)
      if (nextSectionBtnRef.current) {
        if (currentProgress >= 0.16 && currentProgress < 0.94) {
          const fadeIn = clamp((currentProgress - 0.16) / 0.05, 0, 1)
          nextSectionBtnRef.current.style.opacity = fadeIn.toFixed(3)
          nextSectionBtnRef.current.style.pointerEvents = fadeIn > 0.5 ? 'auto' : 'none'
          nextSectionBtnRef.current.style.transform = `translateX(-50%) translateY(${(1 - fadeIn) * 14}px)`
        } else {
          nextSectionBtnRef.current.style.opacity = '0'
          nextSectionBtnRef.current.style.pointerEvents = 'none'
          nextSectionBtnRef.current.style.transform = 'translateX(-50%) translateY(14px)'
        }
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
        <div className="loader-single-line-wrapper">
          <p className="loader-shimmer-single-line">
            <span>{displayedText}</span>
            <span className="typing-cursor" aria-hidden="true" />
          </p>
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

            <div className="hero-launch-wrapper" ref={launchBtnRef}>
              <button
                type="button"
                className={`icy-launch-btn icy-launch-btn--circle ${countdown !== null ? 'is-counting' : ''}`}
                onClick={handleLaunchClick}
                disabled={countdown !== null}
                aria-label="Power launch to services"
                title={countdown === null ? 'Power Launch' : `Countdown: ${countdown}`}
              >
                {countdown === null ? (
                  /* Clean, Dead-Centered Power Icon */
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="power-svg"
                  >
                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                    <line x1="12" y1="2" x2="12" y2="12" />
                  </svg>
                ) : countdown === 'IGNITION' ? (
                  <span className="countdown-ignition-dot" />
                ) : (
                  <span key={countdown} className="countdown-number countdown-pop">
                    {countdown}
                  </span>
                )}
                <span className="sr-only">
                  {countdown === null
                    ? 'Power Launch'
                    : countdown === 'IGNITION'
                      ? 'Ignition'
                      : `Countdown ${countdown}`}
                </span>
              </button>
            </div>

            <div className="hero-services-block" ref={servicesRef} aria-hidden={true} style={{ opacity: 0, display: 'none' }}>
              <div className="hero-services-eyebrow">OUR SERVICES</div>
              <h2 className="hero-services-heading">
                <span ref={servicesHeadingRef}>POS & SOFTWARE SYSTEMS</span>
                <span className="section-typing-cursor" aria-hidden="true" />
              </h2>
              <p className="hero-services-tagline" ref={servicesTaglineRef}>
                We provide services like POS Web apps and custom software systems tailored for enterprise growth.
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
                <h2 className="story-title">
                  <span
                    ref={(el) => {
                      storyTitleRefs.current[index] = el
                    }}
                  >
                    {story.title}
                  </span>
                  <span className="section-typing-cursor" aria-hidden="true" />
                </h2>
                <p
                  className="story-tagline"
                  ref={(el) => {
                    storyTaglineRefs.current[index] = el
                  }}
                >
                  {story.tagline}
                </p>
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
          </div>
        </div>

        {/* Floating Mini Circle Next Section Arrow Button (Strictly Hidden in Hero) */}
        <button
          ref={nextSectionBtnRef}
          type="button"
          className="mini-next-section-btn"
          onClick={handleNextSectionClick}
          aria-label="Scroll to next section"
          title="Next Section"
          style={{ opacity: 0, pointerEvents: 'none' }}
        >
          <svg
            className="mini-arrow-svg"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

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