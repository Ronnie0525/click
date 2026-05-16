import { Link } from 'react-router-dom'
import './Footer.css'

const SERVICES = [
  'Marketing', 'Advertising', 'Branding', 'Events',
  'Corporate Strategies', 'Business Development',
  'Social Media Strategies', 'Digital Campaigns',
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="ambient" aria-hidden="true" />
      <div className="container footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <span className="footer__logo-mark"><span /></span>
              <span>Click</span>
            </Link>
            <p>
              A UAE-based advertising and digital marketing company building
              brands that get clicked, remembered, and chosen.
            </p>
            <Link to="/contact" className="btn btn-primary footer__cta">
              Start a Project <span className="btn-arrow" />
            </Link>
          </div>

          <div className="footer__cols">
            <div className="footer__col">
              <h4>Navigate</h4>
              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
              <Link to="/profile">Profile</Link>
              <Link to="/services">Services</Link>
              <Link to="/contact">Contact</Link>
            </div>

            <div className="footer__col">
              <h4>Services</h4>
              {SERVICES.map((s) => (
                <Link key={s} to="/services">{s}</Link>
              ))}
            </div>

            <div className="footer__col">
              <h4>Contact</h4>
              <a href="mailto:hello@click.ae">hello@click.ae</a>
              <a href="tel:+971000000000">+971 00 000 0000</a>
              <span className="text-muted">United Arab Emirates</span>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span className="text-muted">&copy; {new Date().getFullYear()} Click. All rights reserved.</span>
          <div className="footer__legal">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Careers</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
