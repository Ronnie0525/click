import { useEffect, useRef, useState } from 'react'
import './IntroExperience.css'

const SCENES = [
  { text: 'Every brand wants attention.' },
  { text: 'But attention alone is not enough.' },
  { text: 'Strategy turns attention into growth.' },
  { text: 'Creativity makes brands unforgettable.' },
  {
    text: 'This is Click.',
    sub: 'Marketing. Advertising. Branding. Events. Digital Growth.',
    cta: true,
  },
]

const SPLINE_URL = 'https://prod.spline.design/FMcrcJ3RFG369YBa/scene.splinecode'
const HIGHLIGHTS = ['attention', 'growth', 'unforgettable', 'Click']

export default function IntroExperience({ onComplete }) {
  const containerRef = useRef(null)
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)        // 0..1 across whole intro
  const [splineDefined, setSplineDefined] = useState(false)

  // Reset scroll once on mount so the intro always starts at scene 1.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  // Wait until the spline-viewer custom element is registered before mounting it.
  // The unpkg script is a module — it may load slightly after React renders.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.customElements && window.customElements.get('spline-viewer')) {
      setSplineDefined(true)
      return
    }
    let cancelled = false
    window.customElements?.whenDefined('spline-viewer').then(() => {
      if (!cancelled) setSplineDefined(true)
    }).catch(() => { /* ignore */ })
    return () => { cancelled = true }
  }, [])

  // Scroll listener computes which scene is active + overall progress.
  // We compute against the container's top + height so the math is identical
  // in dev and prod regardless of router base.
  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = el.offsetHeight - window.innerHeight
      const scrolled = -rect.top
      const p = total > 0 ? Math.min(1, Math.max(0, scrolled / total)) : 0
      setProgress(p)
      // Active scene index — last 5% locks onto the final scene for the CTA.
      const idx = Math.min(SCENES.length - 1, Math.floor(p * SCENES.length))
      setActive(idx)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div className="intro" ref={containerRef}>
      <div className="intro__sticky">
        {/* 3D background — only mount once the custom element exists, so it
            never causes a render error during the brief script-load window. */}
        <div className="intro__spline" aria-hidden="true">
          {splineDefined && (
            <spline-viewer url={SPLINE_URL} loading-anim-type="none" />
          )}
        </div>

        {/* Always-visible decorative layers so we never render a black box. */}
        <div className="intro__overlay" aria-hidden="true" />
        <div className="intro__glow intro__glow--a" aria-hidden="true" />
        <div className="intro__glow intro__glow--b" aria-hidden="true" />

        {/* Top chrome */}
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

        {/* Vertical scene-progress bars */}
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

        {/* Scroll hint, only at the very start */}
        <div
          className="intro__hint"
          aria-hidden="true"
          style={{ opacity: progress < 0.04 ? 1 - progress * 25 : 0 }}
        >
          <span>Scroll</span>
          <span className="intro__hint-arrow" />
        </div>

        {/* Scene texts — only the active one is fully visible. Plain CSS
            transitions on opacity/transform handle the cross-fade. */}
        {SCENES.map((scene, i) => (
          <div
            key={i}
            className={`intro__scene ${i === active ? 'is-active' : ''} ${
              i < active ? 'is-past' : ''
            } ${i > active ? 'is-future' : ''}`}
          >
            <h2 className="intro__text">{renderHighlights(scene.text)}</h2>
            {scene.sub && <p className="intro__sub">{scene.sub}</p>}
            {scene.cta && (
              <button
                type="button"
                className="btn btn-primary intro__enter"
                onClick={onComplete}
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
