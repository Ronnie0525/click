import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import IntroMorphExperience from './components/IntroExperience.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Profile from './pages/Profile.jsx'
import Services from './pages/Services.jsx'
import Contact from './pages/Contact.jsx'

const INTRO_FLAG = 'clickIntroSeen'

function readInitialIntroSeen() {
  if (typeof window === 'undefined') return true
  try {
    if (sessionStorage.getItem(INTRO_FLAG) === 'true') return true
    // Visitors who've asked the OS for reduced motion get the homepage
    // directly. Stash the flag so they don't get prompted again this session.
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

export default function App() {
  const { pathname } = useLocation()
  const [introSeen, setIntroSeen] = useState(() => readInitialIntroSeen())
  const [introExiting, setIntroExiting] = useState(false)

  // Intro only fires when landing on the homepage of a fresh session.
  const showIntro = pathname === '/' && !introSeen

  const completeIntro = () => {
    if (introExiting) return
    try { sessionStorage.setItem(INTRO_FLAG, 'true') } catch { /* noop */ }
    setIntroExiting(true)
    // Fade-out lasts 0.6s; after that we unmount the intro and let the
    // site shell fade in (its own CSS animation handles that).
    window.setTimeout(() => {
      setIntroSeen(true)
      setIntroExiting(false)
      window.scrollTo({ top: 0, behavior: 'instant' })
    }, 600)
  }

  return (
    <>
      <ScrollToTop />
      <div className="site-shell" data-intro-active={showIntro ? 'true' : 'false'}>
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
      {showIntro && <IntroMorphExperience onComplete={completeIntro} exiting={introExiting} />}
    </>
  )
}
