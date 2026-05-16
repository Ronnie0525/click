import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import './IntroExperience.css'

const IntroScene = lazy(() => import('./IntroScene.jsx'))

const SCENES = [
  { text: 'Every brand begins as a signal.' },
  { text: 'Click connects the signal to the right audience.' },
  { text: 'Strategy shapes attention into growth.' },
  { text: 'Creativity breaks through the noise.' },
  {
    text: 'Welcome to Click.',
    sub: 'Marketing. Advertising. Branding. Events. Digital Growth.',
    cta: true,
  },
]

const HIGHLIGHTS = ['signal', 'audience', 'growth', 'Creativity', 'Click']

/**
 * IntroMorphExperience — full-screen cinematic intro layer that plays
 * before the homepage. The visitor scrolls (wheel / touch / arrow keys)
 * to advance a single `progress` value 0..1; the underlying 3D scene
 * morphs through five distinct visual states (particles → network →
 * sphere → broken sphere → background glow). When progress reaches the
 * final beat the "Enter Website" button appears; clicking it (or the
 * "Skip Intro" button at any time) calls `onComplete`, which the parent
 * App uses to fade the intro out and reveal the homepage.
 *
 * `exiting` is a boolean from the parent — while true the overlay
 * smoothly fades to opacity 0 over 0.6s before being unmounted.
 */
export default function IntroMorphExperience({ onComplete, exiting = false }) {
  const progressRef = useRef(0)
  const [, force] = useState(0)
  const rerender = useCallback(() => force((n) => n + 1), [])

  const setProgress = useCallback((updater) => {
    const next = typeof updater === 'function' ? updater(progressRef.current) : updater
    progressRef.current = Math.min(1, Math.max(0, next))
    rerender()
  }, [rerender])

  const progress = progressRef.current
  const active = Math.min(SCENES.length - 1, Math.floor(progress * SCENES.length))
  const enterReady = progress >= 0.95

  // Cursor tracking — the stage-4 background glow follows the cursor.
  useEffect(() => {
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100
      document.documentElement.style.setProperty('--intro-mx', `${x}%`)
      document.documentElement.style.setProperty('--intro-my', `${y}%`)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  // Lock body scroll while the intro is mounted.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prevOverflow }
  }, [])

  // Scroll input: wheel / touch / keyboard all funnel into setProgress.
  // Disabled once `exiting` so a stray wheel tick during the fade-out
  // doesn't bounce the user back into the story.
  useEffect(() => {
    if (exiting) return
    const lastTouch = { y: null }
    const onWheel = (e) => {
      e.preventDefault()
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
      setProgress((p) => p + dy * 0.00065)
    }
    const onTouchStart = (e) => { lastTouch.y = e.touches[0].clientY }
    const onTouchMove = (e) => {
      if (lastTouch.y == null) return
      e.preventDefault()
      const y = e.touches[0].clientY
      const dy = lastTouch.y - y
      lastTouch.y = y
      setProgress((p) => p + dy * 0.0011)
    }
    const onTouchEnd = () => { lastTouch.y = null }
    const onKey = (e) => {
      if (e.key === 'Escape') onComplete?.()
      else if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault(); setProgress((p) => p + 0.055)
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault(); setProgress((p) => p - 0.055)
      } else if (e.key === 'Enter' && progressRef.current >= 0.95) {
        onComplete?.()
      }
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: false })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('keydown', onKey)
    }
  }, [exiting, onComplete, setProgress])

  return (
    <div className={`intro ${exiting ? 'intro--exiting' : ''}`} aria-hidden={exiting}>
      <div className="intro__stage">
        <div className="intro__scene-3d" aria-hidden="true">
          <Suspense fallback={null}>
            <IntroScene progress={progress} />
          </Suspense>
        </div>

        <div className="intro__overlay" aria-hidden="true" />
        <div className="intro__glow intro__glow--a" aria-hidden="true" />
        <div className="intro__glow intro__glow--b" aria-hidden="true" />

        {/* Cursor-tracked orange wash that ramps in for stage 5's
            "subtle animated background" beat. */}
        <div
          className="intro__seam-glow"
          aria-hidden="true"
          style={{ opacity: Math.min(1, Math.max(0, (progress - 0.78) / 0.22)) * 0.7 }}
        />

        <div className="intro__brand" aria-hidden="true">
          <span className="intro__brand-mark"><span className="intro__brand-dot" /></span>
          <span className="intro__brand-text">Click</span>
        </div>

        <button
          type="button"
          className="intro__skip"
          onClick={onComplete}
          aria-label="Skip intro and enter the website"
        >
          Skip Intro
          <span className="btn-arrow" aria-hidden="true" />
        </button>

        <div className="intro__progress" aria-hidden="true">
          {SCENES.map((_, i) => {
            const sceneProgress = Math.min(1, Math.max(0, progress * SCENES.length - i))
            return (
              <div key={i} className="intro__dot">
                <div className="intro__dot-fill" style={{ transform: `scaleY(${sceneProgress})` }} />
              </div>
            )
          })}
        </div>

        <div
          className="intro__hint"
          aria-hidden="true"
          style={{ opacity: progress < 0.04 ? 1 - progress * 25 : 0 }}
        >
          <span>Scroll</span>
          <span className="intro__hint-arrow" />
        </div>

        {SCENES.map((scene, i) => (
          <div
            key={i}
            className={`intro__scene ${i === active ? 'is-active' : ''}`}
          >
            <h2 className="intro__text">{renderHighlights(scene.text)}</h2>
            {scene.sub && <p className="intro__sub">{scene.sub}</p>}
            {scene.cta && (
              <button
                type="button"
                className={`btn btn-primary intro__enter ${enterReady ? 'is-ready' : ''}`}
                onClick={onComplete}
                disabled={!enterReady}
                aria-hidden={!enterReady}
              >
                Enter Website
                <span className="btn-arrow" aria-hidden="true" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function renderHighlights(line) {
  const words = line.split(/(\s+)/)
  let wordIndex = 0
  return words.map((token, i) => {
    if (/^\s+$/.test(token) || token === '') return <span key={i}>{token}</span>
    const stripped = token.toLowerCase().replace(/[.,]$/, '')
    const isHighlight = HIGHLIGHTS.some((h) => stripped === h.toLowerCase())
    const idx = wordIndex++
    return (
      <span
        key={i}
        className={`intro__word ${isHighlight ? 'intro__highlight' : ''}`}
        style={{ '--word-i': idx }}
      >
        {token}
      </span>
    )
  })
}
