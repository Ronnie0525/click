import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import IntroExperience from './components/IntroExperience.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Profile from './pages/Profile.jsx'
import Services from './pages/Services.jsx'
import Contact from './pages/Contact.jsx'

const INTRO_FLAG = 'clickIntroSeen'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function readIntroSeen() {
  if (typeof window === 'undefined') return true
  try {
    return sessionStorage.getItem(INTRO_FLAG) === 'true'
  } catch {
    return true
  }
}

export default function App() {
  const { pathname } = useLocation()
  // Only run the intro on the homepage. Deep links (/about, /services, etc.)
  // skip it so shared URLs land where the visitor expected.
  const introEligible = pathname === '/'
  const [introSeen, setIntroSeen] = useState(() => readIntroSeen())

  const showIntro = introEligible && !introSeen

  // While intro is mounted, hide the main shell from the a11y tree.
  useEffect(() => {
    if (showIntro) {
      document.body.classList.add('intro-active')
    } else {
      document.body.classList.remove('intro-active')
    }
    return () => document.body.classList.remove('intro-active')
  }, [showIntro])

  const completeIntro = () => {
    try { sessionStorage.setItem(INTRO_FLAG, 'true') } catch { /* noop */ }
    setIntroSeen(true)
    // Reset scroll so the homepage starts at the top, not 5 screens deep.
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return (
    <>
      <ScrollToTop />
      {showIntro && <IntroExperience onComplete={completeIntro} />}
      <div className="site-shell" aria-hidden={showIntro ? 'true' : 'false'}>
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
    </>
  )
}
