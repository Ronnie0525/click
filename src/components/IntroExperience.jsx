import { Suspense, lazy, useEffect, useRef, useState } from 'react'
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

export default function IntroExperience() {
  const containerRef = useRef(null)
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)        // 0..1 across the intro
  const [inView, setInView] = useState(true)         // true while intro occupies viewport

  // Track the user's position relative to the intro. The intro stays mounted
  // as the top section of the homepage, so we can't unmount on scroll-past —
  // instead we toggle a body class so the rest of the chrome (Navbar etc.)
  // can react.
  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = el.offsetHeight - window.innerHeight
      const scrolled = -rect.top
      const p = total > 0 ? Math.min(1, Math.max(0, scrolled / total)) : 0
      setProgress(p)
      const idx = Math.min(SCENES.length - 1, Math.floor(p * SCENES.length))
      setActive(idx)

      // The intro is "in view" while any of it sits in the upper part of the
      // viewport. Once the user has scrolled mostly past it, hand the chrome
      // back to the site.
      const stillInView = rect.bottom > window.innerHeight * 0.4
      setInView(stillInView)

      // Mark that this session has seen the intro the first time the user
      // scrolls deep enough. Used by ScrollToTop on subsequent / navigations.
      if (p >= 0.9) {
        try { sessionStorage.setItem(INTRO_FLAG, 'true') } catch { /* noop */ }
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // Reflect intro-in-view state on the body so global CSS (e.g. Navbar
  // visibility) can respond without prop-drilling.
  useEffect(() => {
    document.body.classList.toggle('is-in-intro', inView)
    return () => document.body.classList.remove('is-in-intro')
  }, [inView])

  const handleSkip = () => {
    const el = containerRef.current
    if (!el) return
    window.scrollTo({ top: el.offsetHeight, behavior: 'smooth' })
  }

  return (
    <div className="intro" ref={containerRef}>
      <div className="intro__sticky">
        <div className="intro__scene-3d" aria-hidden="true">
          <Suspense fallback={null}>
            <IntroScene progress={progress} />
          </Suspense>
        </div>

        <div className="intro__overlay" aria-hidden="true" />
        <div className="intro__glow intro__glow--a" aria-hidden="true" />
        <div className="intro__glow intro__glow--b" aria-hidden="true" />

        <div className="intro__brand" aria-hidden="true">
          <span className="intro__brand-mark"><span className="intro__brand-dot" /></span>
          <span className="intro__brand-text">Click</span>
        </div>

        <button
          type="button"
          className="intro__skip"
          onClick={handleSkip}
          aria-label="Skip intro and jump to the website"
        >
          Skip Intro
          <span className="btn-arrow" aria-hidden="true" />
        </button>

        <div className="intro__progress" aria-hidden="true">
          {SCENES.map((_, i) => {
            const sceneProgress = Math.min(1, Math.max(0, progress * SCENES.length - i))
            return (
              <div key={i} className="intro__dot">
                <div
                  className="intro__dot-fill"
                  style={{ transform: `scaleY(${sceneProgress})` }}
                />
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
          </div>
        ))}
      </div>
    </div>
  )
}

function renderHighlights(line) {
  const re = new RegExp(`(${HIGHLIGHTS.join('|')})`, 'gi')
  const parts = line.split(re)
  return parts.map((p, i) =>
    HIGHLIGHTS.some((h) => p.toLowerCase() === h.toLowerCase()) ? (
      <span key={i} className="intro__highlight">{p}</span>
    ) : (
      <span key={i}>{p}</span>
    )
  )
}
