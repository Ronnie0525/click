import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import './IntroExperience.css'

const IntroScene = lazy(() => import('./IntroScene.jsx'))

const SCENES = [
  { text: 'Every brand wants attention.' },
  { text: 'But attention alone is not enough.' },
  { text: 'Strategy turns attention into growth.' },
  { text: 'Creativity makes brands unforgettable.' },
  {
    text: 'This is Click.',
    sub: 'Marketing. Advertising. Branding. Events. Digital Growth.',
  },
]

const HIGHLIGHTS = ['attention', 'growth', 'unforgettable', 'Click']
const INTRO_FLAG = 'clickIntroSeen'

// The reveal animation happens in the tail of the intro, between these two
// progress values. Outside this window the hero is either fully hidden
// (intro side) or fully shown (site side).
const REVEAL_START = 0.85
const REVEAL_END = 1.0

const seenInThisSession = () => {
  try { return sessionStorage.getItem(INTRO_FLAG) === 'true' } catch { return false }
}
const markSeen = () => {
  try { sessionStorage.setItem(INTRO_FLAG, 'true') } catch { /* noop */ }
}

/**
 * Cinematic intro overlay.
 *
 *  phase = 'intro'  → fixed overlay, body scroll locked, wheel/touch drives
 *                     a single `progress` value 0..1. At ~0.85 the hero
 *                     starts zooming in from the same orange-glow point that
 *                     scene 5 is showing, so the seam is invisible.
 *  phase = 'done'   → overlay dismissed, normal body scroll. We stay mounted
 *                     to listen for scroll-up-at-top, which re-opens the
 *                     intro at the reveal moment so the user can scroll back
 *                     into the story.
 */
export default function IntroExperience() {
  const [phase, setPhase] = useState(() => (seenInThisSession() ? 'done' : 'intro'))
  const progressRef = useRef(phase === 'done' ? 1 : 0)
  const [, force] = useState(0)
  const rerender = useCallback(() => force((n) => n + 1), [])

  const setProgress = useCallback((updater) => {
    const next = typeof updater === 'function' ? updater(progressRef.current) : updater
    progressRef.current = Math.min(1, Math.max(0, next))
    rerender()
  }, [rerender])

  const progress = progressRef.current
  const active = Math.min(SCENES.length - 1, Math.floor(progress * SCENES.length))
  const revealAmount = Math.min(1, Math.max(0, (progress - REVEAL_START) / (REVEAL_END - REVEAL_START)))

  // Reflect reveal state on the document root so the site shell can react
  // via CSS variables (no prop-drilling into Home/Navbar).
  //   --intro-reveal:  raw 0..1 — drives the hero's scale (smooth throughout)
  //   --hero-opacity:  delayed 0..1 — hero content stays hidden until the
  //                    intro text has fully faded out, preventing the two
  //                    titles from overlapping mid-reveal
  const heroOpacity = Math.max(0, Math.min(1, (revealAmount - 0.45) / 0.5))
  useEffect(() => {
    document.documentElement.style.setProperty('--intro-reveal', String(revealAmount))
    document.documentElement.style.setProperty('--hero-opacity', String(heroOpacity))
    document.documentElement.style.setProperty('--intro-active', phase === 'intro' ? '1' : '0')
    return () => {
      document.documentElement.style.removeProperty('--intro-reveal')
      document.documentElement.style.removeProperty('--hero-opacity')
      document.documentElement.style.removeProperty('--intro-active')
    }
  }, [revealAmount, heroOpacity, phase])

  // Cursor tracking — the seam glow follows the cursor with the same formula
  // the hero uses, so when the overlay fades to reveal the hero, the orange
  // light visually doesn't move.
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

  // Body scroll lock while the intro overlay is up.
  useEffect(() => {
    if (phase === 'intro') {
      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      document.body.classList.add('is-in-intro')
      return () => {
        document.body.style.overflow = prevOverflow
        document.body.classList.remove('is-in-intro')
      }
    }
    document.body.classList.remove('is-in-intro')
    return undefined
  }, [phase])

  // Wheel + touch listeners drive progress while the overlay is up. When
  // dismissed we keep a passive wheel listener so an upward scroll at the
  // top of the homepage re-opens the intro.
  useEffect(() => {
    if (phase === 'intro') {
      const lastTouch = { y: null }
      // Calibration: 5 scenes × ~3 wheel ticks per scene = ~15 ticks to clear
      // the intro. With a typical wheel delta of ~100px, that means each tick
      // should move progress by ~1/15 = ~0.066, so the multiplier is ~0.00066.
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
        if (e.key === 'Escape') dismiss()
        else if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
          e.preventDefault(); setProgress((p) => p + 0.055)
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
          e.preventDefault(); setProgress((p) => p - 0.055)
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
    }

    // phase === 'done' — require a sustained pull-up before re-opening, so a
    // single trackpad flick at the top of the page doesn't snap the intro
    // back on accidentally. We accumulate upward-scroll distance while the
    // user is at the very top of the page and only trigger when it crosses a
    // threshold. Any downward gesture or idle gap resets the accumulator.
    const PULL_THRESHOLD = 260                      // px of accumulated up-pull
    const IDLE_RESET_MS = 350
    let accumulated = 0
    let idleTimer = null
    const resetSoon = () => {
      if (idleTimer) clearTimeout(idleTimer)
      idleTimer = setTimeout(() => { accumulated = 0 }, IDLE_RESET_MS)
    }
    const tryReopen = () => {
      if (accumulated >= PULL_THRESHOLD) {
        accumulated = 0
        reopen()
      }
    }

    const reopenIfPulledDown = (e) => {
      if (window.scrollY > 2) { accumulated = 0; return }
      if (e.deltaY < 0) {
        e.preventDefault()
        accumulated += Math.min(120, -e.deltaY)   // clamp per-event spikes
        resetSoon()
        tryReopen()
      } else if (e.deltaY > 0) {
        accumulated = 0
      }
    }
    const lastTouch = { y: null }
    const onTouchStart = (e) => { lastTouch.y = e.touches[0].clientY; accumulated = 0 }
    const onTouchMove = (e) => {
      if (window.scrollY > 2 || lastTouch.y == null) return
      const y = e.touches[0].clientY
      const dy = y - lastTouch.y
      lastTouch.y = y
      if (dy > 0) {
        e.preventDefault()
        accumulated += Math.min(60, dy)
        resetSoon()
        tryReopen()
      } else if (dy < -4) {
        accumulated = 0
      }
    }
    window.addEventListener('wheel', reopenIfPulledDown, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      window.removeEventListener('wheel', reopenIfPulledDown)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      if (idleTimer) clearTimeout(idleTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Auto-dismiss once the reveal is complete, with a tiny pause so the user
  // sees the hero at full scale for a beat before the overlay vanishes.
  useEffect(() => {
    if (phase !== 'intro' || progress < REVEAL_END - 0.001) return
    const t = setTimeout(() => dismiss(), 180)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, phase])

  const dismiss = useCallback(() => {
    markSeen()
    setPhase('done')
    progressRef.current = 1
    rerender()
  }, [rerender])

  const reopen = useCallback(() => {
    setPhase('intro')
    // Start at the cusp of the reveal so a small wheel-up reverses into the
    // story scenes naturally.
    progressRef.current = REVEAL_START - 0.01
    rerender()
  }, [rerender])

  return (
    <div
      className={`intro intro--${phase}`}
      aria-hidden={phase === 'done'}
      style={{ '--intro-overlay-opacity': phase === 'done' ? 0 : 1 - revealAmount }}
    >
      <div className="intro__stage">
        {/* The 3D canvas fades out as we approach scene 5 so it doesn't fight
            the hero-matching backdrop layered above. */}
        <div
          className="intro__scene-3d"
          aria-hidden="true"
          style={{ opacity: Math.max(0, 1 - Math.max(0, (progress - 0.74) / 0.18)) }}
        >
          <Suspense fallback={null}>
            <IntroScene progress={progress} />
          </Suspense>
        </div>

        <div className="intro__overlay" aria-hidden="true" />
        <div className="intro__glow intro__glow--a" aria-hidden="true" />
        <div className="intro__glow intro__glow--b" aria-hidden="true" />

        {/* Cursor-tracked orange glow — same formula as the hero's backlight,
            so by the time the overlay fades the glow on screen IS the glow
            the hero is drawing behind. Ramps in for scene 5. */}
        <div
          className="intro__seam-glow"
          aria-hidden="true"
          style={{ opacity: Math.min(1, Math.max(0, (progress - 0.74) / 0.22)) }}
        />

        <div className="intro__brand" aria-hidden="true">
          <span className="intro__brand-mark"><span className="intro__brand-dot" /></span>
          <span className="intro__brand-text">Click</span>
        </div>

        <button
          type="button"
          className="intro__skip"
          onClick={dismiss}
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
            // Fast fade: intro text is fully gone by the time the hero begins
            // to appear (revealAmount ~0.45), so the two titles never overlap.
            style={{ opacity: i === active ? Math.max(0, 1 - revealAmount * 2.4) : 0 }}
          >
            <h2 className="intro__text">{renderHighlights(scene.text)}</h2>
            {scene.sub && <p className="intro__sub">{scene.sub}</p>}
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
