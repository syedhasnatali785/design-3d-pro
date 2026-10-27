import { useEffect, useRef, useState } from 'react'
import './App.css'

const VIDEO_URLS = [
  '/Rocket_launches_from_icy_land_20261027031051.mp4',
  '/Camera_moves_through_icy_tunnel_20261027032841.mp4',
]

const FIRST_VIDEO_END = 0.5
const WHITE_TRANSITION_END = 0.62

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function getScrollProgress() {
  const maxScroll = Math.max(
    document.documentElement.scrollHeight - window.innerHeight,
    1,
  )
  const rawProgress = clamp(window.scrollY / maxScroll, 0, 1)
  const curvePower = window.innerWidth <= 768 ? 4.2 : 5.4
  const easedProgress = Math.pow(rawProgress, curvePower)

  return clamp(easedProgress, 0, 1)
}

function App() {
  const [headerStyle, setHeaderStyle] = useState({
    opacity: 1,
    transform: 'translateY(0px)',
  })

  const [footerStyle, setFooterStyle] = useState({
    opacity: 0,
    transform: 'translateY(90px)',
  })

  const [isLoading, setIsLoading] = useState(true)
  const [mediaReady, setMediaReady] = useState(false)

  useEffect(() => {
    const finishLoading = () => {
      if (mediaReady || document.readyState === 'complete') {
        setIsLoading(false)
      }
    }

    finishLoading()
    window.addEventListener('load', finishLoading)

    return () => {
      window.removeEventListener('load', finishLoading)
    }
  }, [mediaReady])

  useEffect(() => {
    const handleScroll = () => {
      const progress = getScrollProgress()

      const headerFadeStart = 0.04
      const headerFadeEnd = 0.26
      const headerProgress = clamp(
        (progress - headerFadeStart) / (headerFadeEnd - headerFadeStart),
        0,
        1,
      )

      const headerOpacity = 1 - headerProgress
      const headerLift = headerProgress * -72

      const footerShowStart = 0.72
      const footerShowEnd = 0.96
      const footerProgress = clamp(
        (progress - footerShowStart) / (footerShowEnd - footerShowStart),
        0,
        1,
      )

      setHeaderStyle({
        opacity: headerOpacity,
        transform: `translateY(${headerLift}px)`,
      })

      setFooterStyle({
        opacity: footerProgress,
        transform: `translateY(${90 - footerProgress * 90}px)`,
      })
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <>
      <div className={`global-loader ${isLoading ? 'is-visible' : 'is-hidden'}`} aria-live="polite" aria-busy={isLoading}>
        <div className="loader-card">
          <div className="loader-ring" aria-hidden="true" />
          <div className="loader-text-group">
            <span className="loader-label">Loading experience</span>
            <span className="loader-progress">Preparing cinematic launch</span>
          </div>
        </div>
      </div>

      <div className={`story-shell ${isLoading ? 'is-loading' : 'is-ready'}`}>
        <header className="topbar" style={headerStyle}>
          <div className="brand-pill">
            <span className="brand-mark">D</span>
            <span className="brand-name">DevCore</span>
          </div>

          <nav className="topnav" aria-label="Main navigation">
            <a href="#work">Work</a>
            <a href="#studio">Studio</a>
            <a href="#contact">Contact</a>
          </nav>
        </header>

        <HeroVideoBackground onMediaReady={() => setMediaReady(true)} />

        <footer className="bottombar" style={footerStyle}>
          <div className="footer-shell">
            <span>Built for service</span>
            <a href="#contact">Book a project</a>
          </div>
        </footer>

        <div className="story-spacer" aria-hidden="true" />
      </div>
    </>
  )
}

function HeroVideoBackground({ onMediaReady }) {
  const firstVideoRef = useRef(null)
  const secondVideoRef = useRef(null)
  const firstTargetRef = useRef(0)
  const secondTargetRef = useRef(0)
  const firstReadyRef = useRef(false)
  const secondReadyRef = useRef(false)
  const rafRef = useRef(0)

  const [firstOpacity, setFirstOpacity] = useState(1)
  const [secondOpacity, setSecondOpacity] = useState(0)
  const [whiteOpacity, setWhiteOpacity] = useState(0)
  const [whiteY, setWhiteY] = useState('100%')
  const [heroTextStyle, setHeroTextStyle] = useState({
    opacity: 1,
    transform: 'translateY(0px)',
  })

  useEffect(() => {
    const firstVideo = firstVideoRef.current
    const secondVideo = secondVideoRef.current
    if (!firstVideo || !secondVideo) return undefined

    const safeSetCurrentTime = (video, value) => {
      if (!video || !Number.isFinite(value)) return
      const safeValue = clamp(
        value,
        0,
        Number.isFinite(video.duration) ? video.duration : value,
      )
      if (Number.isFinite(safeValue)) {
        video.currentTime = safeValue
      }
    }

    const syncScrollToVideos = () => {
      const progress = getScrollProgress()

      const heroFadeStart = 0.0
      const heroFadeEnd = 0.12
      const heroFadeProgress = clamp(
        (progress - heroFadeStart) / (heroFadeEnd - heroFadeStart),
        0,
        1,
      )

      setHeroTextStyle({
        opacity: 1 - heroFadeProgress,
        transform: `translateY(${-12 * heroFadeProgress}px)`,
      })

      const firstDuration = Number.isFinite(firstVideo.duration) ? firstVideo.duration : 0
      const secondDuration = Number.isFinite(secondVideo.duration) ? secondVideo.duration : 0

      if (progress <= FIRST_VIDEO_END) {
        firstTargetRef.current = firstDuration > 0
          ? clamp(firstDuration * (progress / FIRST_VIDEO_END), 0, firstDuration)
          : 0
        secondTargetRef.current = 0
        setFirstOpacity(1)
        setSecondOpacity(0)
        setWhiteOpacity(0)
        setWhiteY('100%')
        return
      }

      if (progress < WHITE_TRANSITION_END) {
        const transitionProgress =
          (progress - FIRST_VIDEO_END) / (WHITE_TRANSITION_END - FIRST_VIDEO_END)
        const wipeProgress = clamp(1 - transitionProgress, 0, 1)

        firstTargetRef.current = firstDuration > 0 ? firstDuration : 0
        secondTargetRef.current = 0

        setFirstOpacity(clamp(1 - transitionProgress, 0, 1))
        setSecondOpacity(0)
        setWhiteOpacity(0.9 * (1 - wipeProgress))
        setWhiteY(`${(1 - wipeProgress) * 100}%`)
        return
      }

      const secondProgress =
        (progress - WHITE_TRANSITION_END) / (1 - WHITE_TRANSITION_END)

      firstTargetRef.current = firstDuration > 0 ? firstDuration : 0
      secondTargetRef.current =
        secondDuration > 0
          ? clamp(secondDuration * secondProgress, 0, secondDuration)
          : 0

      setFirstOpacity(0)
      setSecondOpacity(1)
      setWhiteOpacity(0)
      setWhiteY('0%')
    }

    const updateVideo = (video, targetRef, readyRef) => {
      if (!readyRef.current || !video || !Number.isFinite(video.duration) || video.duration <= 0) {
        return
      }

      if (video.seeking) return

      const currentTime = Number.isFinite(video.currentTime) ? video.currentTime : 0
      const target = Number.isFinite(targetRef.current)
        ? targetRef.current
        : currentTime
      const delta = Number.isFinite(target) && Number.isFinite(currentTime)
        ? target - currentTime
        : 0

      if (Math.abs(delta) < 0.04) {
        if (Math.abs(currentTime - target) > 0.0001 && Number.isFinite(target)) {
          safeSetCurrentTime(video, target)
        }
        return
      }

      const smoothing = window.innerWidth <= 768 ? 0.035 : 0.05
      const nextValue = currentTime + delta * smoothing
      if (Number.isFinite(nextValue)) {
        safeSetCurrentTime(video, nextValue)
      }
    }

    const renderLoop = () => {
      updateVideo(firstVideo, firstTargetRef, firstReadyRef)
      updateVideo(secondVideo, secondTargetRef, secondReadyRef)
      rafRef.current = window.requestAnimationFrame(renderLoop)
    }

    const handleLoadedMetadata = (video, readyRef) => {
      readyRef.current = true
      if (firstReadyRef.current && secondReadyRef.current) {
        onMediaReady?.()
      }
      video.pause()
      video.currentTime = 0
    }

    const attachVideo = (video, readyRef) => {
      video.muted = true
      video.playsInline = true
      video.preload = 'auto'
      video.defaultMuted = true
      video.loop = false
      video.pause()
      video.addEventListener('loadedmetadata', () => handleLoadedMetadata(video, readyRef))
    }

    attachVideo(firstVideo, firstReadyRef)
    attachVideo(secondVideo, secondReadyRef)
    syncScrollToVideos()

    window.addEventListener('scroll', syncScrollToVideos, { passive: true })
    window.addEventListener('resize', syncScrollToVideos)
    rafRef.current = window.requestAnimationFrame(renderLoop)

    return () => {
      window.cancelAnimationFrame(rafRef.current)
      window.removeEventListener('scroll', syncScrollToVideos)
      window.removeEventListener('resize', syncScrollToVideos)
    }
  }, [onMediaReady])

  return (
    <div className="hero-video-stage">
      <video
        ref={firstVideoRef}
        className="hero-video hero-video--first"
        src={VIDEO_URLS[0]}
        muted
        playsInline
        preload="auto"
        autoPlay={false}
        style={{ opacity: firstOpacity }}
      />

      <video
        ref={secondVideoRef}
        className="hero-video hero-video--second"
        src={VIDEO_URLS[1]}
        muted
        playsInline
        preload="auto"
        autoPlay={false}
        style={{ opacity: secondOpacity }}
      />

      <div
        className="white-transition"
        style={{ opacity: whiteOpacity, transform: `translateY(${whiteY})` }}
        aria-hidden="true"
      />

      <div className="scene-overlay">
        <div className="hero-copy" style={heroTextStyle}>
          <span className="hero-word hero-word-we">We Ship</span>
          <span className="hero-word hero-word-products">Products</span>
          <span className="hero-word hero-word-this-way">This Way</span>
        </div>

        <div className="scroll-cue" aria-label="Scroll down">
          <span>Scroll Down</span>
        </div>
      </div>
    </div>
  )
}

export default App
