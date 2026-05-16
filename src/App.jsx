import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import IntroExperience from './components/IntroExperience.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Profile from './pages/Profile.jsx'
import Services from './pages/Services.jsx'
import Contact from './pages/Contact.jsx'

const INTRO_FLAG = 'clickIntroSeen'

/**
 * On route change:
 *  - Off the homepage: jump to top (no intro on those routes).
 *  - On the homepage: first session visit lands at the top of the intro;
 *    subsequent visits skip past it to the site (the user can still scroll
 *    back up to replay the intro).
 */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (pathname !== '/') {
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }
    const seen = (() => {
      try { return sessionStorage.getItem(INTRO_FLAG) === 'true' } catch { return false }
    })()
    // Defer one frame so the Intro container has measured its 500vh height.
    requestAnimationFrame(() => {
      if (seen) {
        const intro = document.querySelector('.intro')
        const top = intro ? intro.offsetHeight : 0
        window.scrollTo({ top, behavior: 'instant' })
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
    })
  }, [pathname])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  const showIntro = pathname === '/'

  return (
    <>
      <ScrollToTop />
      {showIntro && <IntroExperience />}
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
    </>
  )
}
