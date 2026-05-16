import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './IntroExperience.css'

gsap.registerPlugin(ScrollTrigger)

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
 * IntroMorphExperience — pre-homepage cinematic intro. Driven by real
 * page scroll via GSAP ScrollTrigger:
 *
 *   <div.intro>                500vh tall, in normal document flow
 *     <div.intro__stage>       100vh, pinned by ScrollTrigger while the
 *                              user scrolls through the container above
 *
 * `progress` is updated continuously by ScrollTrigger.onUpdate as the
 * user scrolls. Everything visual (3D morph, text fades, button reveal,
 * progress dots, scroll hint) reads off that single value.
 *
 *   onComplete: callback the parent fires when the user clicks Skip
 *               Intro or Enter Website. Sets sessionStorage, fades the
 *               overlay out, unmounts the intro.
 *   exiting:    boolean from the parent — while true the container
 *               opacity transitions to 0 and we stop responding to
 *               scroll.
 */
export default function IntroMorphExperience({ onComplete, exiting = false }) {
  const containerRef = useRef(null)
  const stageRef = useRef(null)
  const progressRef = useRef(0)
  const [, force] = useState(0)
  const rerender = useCallback(() => force((n) => n + 1), [])

  const progress = progressRef.current
  const active = Math.min(SCENES.length - 1, Math.floor(progress * SCENES.length))
  const enterReady = progress >= 0.95

  // ScrollTrigger: pin the stage to the viewport while the user scrolls
  // through the 500vh container, and stream progress 0..1 into a ref so
  // the rest of the component (and the 3D scene) can drive off it.
  useLayoutEffect(() => {
    if (exiting) return undefined
    const container = containerRef.current
    const stage = stageRef.current
    if (!container || !stage) return undefined

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      pin: stage,
      pinSpacing: false,
      // Mild scrub smooths the progress out so a fast wheel flick doesn't
      // snap straight through a stage; the morph eases toward the target.
      scrub: 0.35,
      onUpdate: (self) => {
        progressRef.current = self.progress
        rerender()
      },
    })

    return () => {
      trigger.kill()
      // Refresh other triggers so the page layout the intro leaves behind
      // is recalculated cleanly when this one is gone.
      ScrollTrigger.refresh()
    }
  }, [exiting, rerender])

  // Make sure the page is at the top of the intro on mount so the user
  // experiences the story from scene 1, not mid-way.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  // Cursor tracking — the final-stage background glow follows the cursor.
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

  // Allow Enter / Escape from the keyboard too so the buttons aren't
  // the only way out.
  useEffect(() => {
    const onKey = (e) => {
      if (exiting) return
      if (e.key === 'Escape') onComplete?.()
      else if (e.key === 'Enter' && progressRef.current >= 0.95) onComplete?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [exiting, onComplete])

  return (
    <div
      className={`intro ${exiting ? 'intro--exiting' : ''}`}
      ref={containerRef}
      aria-hidden={exiting}
    >
      <div className="intro__stage" ref={stageRef}>
        <div className="intro__scene-3d" aria-hidden="true">
          <Suspense fallback={null}>
            <IntroScene progress={progress} />
          </Suspense>
        </div>

        <div className="intro__overlay" aria-hidden="true" />
        <div className="intro__glow intro__glow--a" aria-hidden="true" />
        <div className="intro__glow intro__glow--b" aria-hidden="true" />

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
