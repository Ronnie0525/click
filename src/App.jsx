import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import IntroMorphExperience from './components/IntroExperience.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Profile from './pages/Profile.jsx'
import Services from './pages/Services.jsx'
import Contact from './pages/Contact.jsx'

gsap.registerPlugin(ScrollTrigger)

const INTRO_FLAG = 'clickIntroSeen'

function readInitialIntroSeen() {
  if (typeof window === 'undefined') return true
  try {
    if (sessionStorage.getItem(INTRO_FLAG) === 'true') return true
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sessionStorage.setItem(INTRO_FLAG, 'true')
      return true
    }
    return false
  } catch {
    return true
  }
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

// Lenis owns the body scroll: every wheel/touch event animates scrollTop
// smoothly. We hand the RAF loop to gsap.ticker and forward each scroll
// update to ScrollTrigger so any pinned/scrubbed timelines stay in sync.
function useLenisSmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
    })

    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])
}

export default function App() {
  const { pathname } = useLocation()
  const [introSeen, setIntroSeen] = useState(() => readInitialIntroSeen())
  const [introExiting, setIntroExiting] = useState(false)

  useLenisSmoothScroll()

  const showIntro = pathname === '/' && !introSeen

  const completeIntro = () => {
    if (introExiting) return
    try { sessionStorage.setItem(INTRO_FLAG, 'true') } catch { /* noop */ }
    setIntroExiting(true)
    window.setTimeout(() => {
      setIntroSeen(true)
      setIntroExiting(false)
      window.scrollTo({ top: 0, behavior: 'instant' })
    }, 600)
  }

  // The intro IS the body scroll while it's mounted (500vh container
  // pinned by ScrollTrigger). Rendering the site shell in parallel would
  // give the body double the height, so we swap between them.
  return (
    <>
      <ScrollToTop />
      {showIntro ? (
        <IntroMorphExperience onComplete={completeIntro} exiting={introExiting} />
      ) : (
        <div className="site-shell">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </div>
      )}
    </>
  )
}
