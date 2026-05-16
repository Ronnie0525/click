import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react'
import './IntroExperience.css'

const SCENES = [
  {
    text: 'Every brand wants attention.',
  },
  {
    text: 'But attention alone is not enough.',
  },
  {
    text: 'Strategy turns attention into growth.',
  },
  {
    text: 'Creativity makes brands unforgettable.',
  },
  {
    text: 'This is Click.',
    sub: 'Marketing. Advertising. Branding. Events. Digital Growth.',
    cta: true,
  },
]

const SPLINE_URL = 'https://prod.spline.design/FMcrcJ3RFG369YBa/scene.splinecode'

export default function IntroExperience({ onComplete }) {
  const containerRef = useRef(null)
  const [splineReady, setSplineReady] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
  }, [])

  // Hide the body's scrollbar nub from spilling under the intro by not adding
  // anything special — the intro IS the scrollable surface. Just make sure when
  // we mount, scroll starts at top.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  // Mark the final scene reached so we can softly hint the CTA even without
  // animation timing edge cases.
  const [atEnd, setAtEnd] = useState(false)
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setAtEnd(v > 0.94)
  })

  const handleEnter = () => {
    onComplete()
  }

  return (
    <div className="intro" ref={containerRef}>
      <div className="intro__sticky">
        {/* 3D background */}
        <div className="intro__spline" aria-hidden="true">
          <spline-viewer
            url={SPLINE_URL}
            events-target="global"
            loading-anim-type="spinner-small-light"
            onLoad={() => setSplineReady(true)}
          />
        </div>

        {/* Darken Spline so the text remains readable */}
        <div className="intro__overlay" aria-hidden="true" />
        {/* Brand glow accents */}
        <div className="intro__glow intro__glow--a" aria-hidden="true" />
        <div className="intro__glow intro__glow--b" aria-hidden="true" />

        {/* Skip */}
        <button
          type="button"
          className="intro__skip"
          onClick={onComplete}
          aria-label="Skip intro and enter the website"
        >
          Skip Intro
          <span className="btn-arrow" aria-hidden="true" />
        </button>

        {/* Brand mark in corner so users know whose site this is during the intro */}
        <div className="intro__brand" aria-hidden="true">
          <span className="intro__brand-mark"><span className="intro__brand-dot" /></span>
          <span className="intro__brand-text">Click</span>
        </div>

        {/* Progress dots */}
        <div className="intro__progress" aria-hidden="true">
          {SCENES.map((_, i) => (
            <ProgressDot key={i} index={i} total={SCENES.length} scroll={scrollYProgress} />
          ))}
        </div>

        {/* Scroll hint, only at the very start */}
        <ScrollHint scroll={scrollYProgress} />

        {/* The scene texts, layered. Each fades in/out within its scroll window. */}
        {SCENES.map((scene, i) => (
          <SceneText
            key={i}
            scene={scene}
            index={i}
            total={SCENES.length}
            scroll={scrollYProgress}
            onEnter={handleEnter}
            atEnd={atEnd}
          />
        ))}
      </div>
    </div>
  )
}

function SceneText({ scene, index, total, scroll, onEnter, atEnd }) {
  const start = index / total
  const end = (index + 1) / total
  const isLast = index === total - 1

  const opacity = useTransform(
    scroll,
    [start - 0.06, start + 0.05, end - 0.05, end + 0.02],
    isLast ? [0, 1, 1, 1] : [0, 1, 1, 0]
  )
  const y = useTransform(
    scroll,
    [start - 0.06, start + 0.05, end - 0.05, end + 0.02],
    isLast ? [50, 0, 0, 0] : [50, 0, 0, -50]
  )

  return (
    <motion.div className="intro__scene" style={{ opacity, y }} aria-hidden={!atEnd && isLast}>
      <h2 className="intro__text">{renderHighlights(scene.text)}</h2>
      {scene.sub && <p className="intro__sub">{scene.sub}</p>}
      {scene.cta && (
        <button
          type="button"
          className="btn btn-primary intro__enter"
          onClick={onEnter}
        >
          Enter Website
          <span className="btn-arrow" aria-hidden="true" />
        </button>
      )}
    </motion.div>
  )
}

/**
 * Highlight key brand words in orange so the lines have visual rhythm
 * instead of a flat block of white text.
 */
function renderHighlights(line) {
  const targets = ['attention', 'growth', 'unforgettable', 'Click']
  const parts = line.split(new RegExp(`(${targets.join('|')})`, 'i'))
  return parts.map((p, i) =>
    targets.some((t) => p.toLowerCase() === t.toLowerCase()) ? (
      <span key={i} className="intro__highlight">{p}</span>
    ) : (
      <span key={i}>{p}</span>
    )
  )
}

function ProgressDot({ index, total, scroll }) {
  const start = index / total
  const end = (index + 1) / total
  const fill = useTransform(scroll, [start, end - 0.02], [0, 1])
  const opacity = useTransform(scroll, [start - 0.05, start + 0.02], [0.35, 1])
  return (
    <div className="intro__dot">
      <motion.div className="intro__dot-fill" style={{ scaleY: fill, opacity }} />
    </div>
  )
}

function ScrollHint({ scroll }) {
  const opacity = useTransform(scroll, [0, 0.04], [1, 0])
  return (
    <motion.div className="intro__hint" style={{ opacity }} aria-hidden="true">
      <span>Scroll</span>
      <span className="intro__hint-arrow" />
    </motion.div>
  )
}
