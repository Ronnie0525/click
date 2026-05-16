import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import './Navbar.css'

function readInitialTheme() {
  if (typeof window === 'undefined') return 'dark'
  return localStorage.getItem('click-theme') || 'dark'
}

const SERVICES = [
  { name: 'Marketing', to: '/services#marketing' },
  { name: 'Advertising', to: '/services#advertising' },
  { name: 'Branding', to: '/services#branding' },
  { name: 'Events', to: '/services#events' },
  { name: 'Corporate Strategies', to: '/services#corporate' },
  { name: 'Business Development', to: '/services#development' },
  { name: 'Social Media Strategies', to: '/services#social' },
  { name: 'Digital Campaigns', to: '/services#digital' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [dropdown, setDropdown] = useState(false)
  const [theme, setTheme] = useState(readInitialTheme)
  const dropdownRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('click-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
    setDropdown(false)
  }, [location.pathname])

  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdown(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="nav__inner container">
        <Link to="/" className="nav__logo" aria-label="Click home">
          <span className="nav__logo-mark">
            <span className="nav__logo-dot" />
          </span>
          <span className="nav__logo-text">Click</span>
        </Link>

        <nav className={`nav__links ${open ? 'nav__links--open' : ''}`}>
          <NavLink to="/" end className="nav__link">Home</NavLink>
          <NavLink to="/about" className="nav__link">About</NavLink>
          <NavLink to="/profile" className="nav__link">Profile</NavLink>

          <div
            className="nav__dropdown"
            ref={dropdownRef}
            onMouseEnter={() => setDropdown(true)}
            onMouseLeave={() => setDropdown(false)}
          >
            <button
              type="button"
              className={`nav__link nav__dropdown-trigger ${dropdown ? 'is-active' : ''}`}
              onClick={() => setDropdown((v) => !v)}
              aria-expanded={dropdown}
              aria-haspopup="true"
            >
              Services
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className={`nav__menu ${dropdown ? 'nav__menu--open' : ''}`}>
              <div className="nav__menu-head">
                <span className="eyebrow">What we do</span>
                <p>Eight specialised practices, one creative team.</p>
              </div>
              <div className="nav__menu-grid">
                {SERVICES.map((s) => (
                  <Link key={s.name} to={s.to} className="nav__menu-item">
                    <span className="nav__menu-dot" />
                    <span>{s.name}</span>
                  </Link>
                ))}
              </div>
              <Link to="/services" className="nav__menu-cta">
                See all services
                <span className="btn-arrow" />
              </Link>
            </div>
          </div>

        </nav>

        <div className="nav__actions">
          <button
            type="button"
            className="nav__theme"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          <Link to="/contact" className="btn btn-primary nav__cta">
            Let&rsquo;s Talk
          </Link>
          <button
            className={`nav__burger ${open ? 'is-open' : ''}`}
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  )
}
