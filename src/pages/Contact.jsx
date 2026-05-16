import { useState } from 'react'
import Reveal from '../components/Reveal.jsx'
import './Contact.css'

const SERVICES = [
  'Marketing',
  'Advertising',
  'Branding',
  'Events',
  'Corporate Strategies',
  'Business Development',
  'Social Media Strategies',
  'Digital Campaigns',
  'Not sure yet',
]

export default function Contact() {
  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '', service: '', message: '',
  })
  const [status, setStatus] = useState('idle')

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const onSubmit = (e) => {
    e.preventDefault()
    setStatus('sending')
    // Placeholder submit — wire up to API or service later.
    setTimeout(() => {
      setStatus('sent')
      setForm({ name: '', company: '', email: '', phone: '', service: '', message: '' })
    }, 900)
  }

  return (
    <div className="contact">
      <section className="page-hero">
        <div className="ambient" aria-hidden="true" />
        <div className="container">
          <Reveal as="span" className="section-tag">Contact</Reveal>
          <Reveal as="h1" delay={0.05}>
            Let's Build Your Next <span className="gradient-text">Marketing Move.</span>
          </Reveal>
          <Reveal as="p" delay={0.15} className="lead">
            Tell us about your brand, campaign, or business goals. The Click team will help
            you shape the right strategy for growth.
          </Reveal>
        </div>
      </section>

      <section className="section contact-main">
        <div className="container contact-main__grid">
          <Reveal className="contact-info">
            <span className="eyebrow">Direct Contact</span>
            <h2>A team that responds quickly.</h2>
            <p>Send a message, drop us an email, or call — we'll get back to you within one business day.</p>

            <div className="contact-info__list">
              <a className="contact-info__item card" href="mailto:hello@click.ae">
                <div className="contact-info__icon">@</div>
                <div>
                  <span className="eyebrow">Email</span>
                  <strong>hello@click.ae</strong>
                </div>
              </a>
              <a className="contact-info__item card" href="tel:+971000000000">
                <div className="contact-info__icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.86.31 1.7.57 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.58a2 2 0 0 1 2.11-.45c.8.26 1.64.45 2.5.57A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <span className="eyebrow">Phone</span>
                  <strong>+971 00 000 0000</strong>
                </div>
              </a>
              <div className="contact-info__item card">
                <div className="contact-info__icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <span className="eyebrow">Location</span>
                  <strong>United Arab Emirates</strong>
                </div>
              </div>
            </div>

            <div className="contact-info__note">
              <span className="hero__dot" />
              Currently accepting new projects across the UAE.
            </div>
          </Reveal>

          <Reveal delay={0.15} className="contact-form">
            <form onSubmit={onSubmit} className="contact-form__form">
              <div className="contact-form__grid">
                <Field label="Full Name" name="name" value={form.name} onChange={onChange} required />
                <Field label="Company Name" name="company" value={form.company} onChange={onChange} />
                <Field label="Email Address" name="email" type="email" value={form.email} onChange={onChange} required />
                <Field label="Phone Number" name="phone" type="tel" value={form.phone} onChange={onChange} />
              </div>

              <div className="contact-form__field">
                <label htmlFor="service">Service Interested In</label>
                <div className="contact-form__select">
                  <select id="service" name="service" value={form.service} onChange={onChange}>
                    <option value="">Select a service</option>
                    {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              <div className="contact-form__field">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={form.message}
                  onChange={onChange}
                  placeholder="Tell us about your brand, goals, or campaign idea..."
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary contact-form__submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending...' : status === 'sent' ? 'Message Sent ✓' : 'Send Message'}
                {status === 'idle' && <span className="btn-arrow" />}
              </button>

              {status === 'sent' && (
                <div className="contact-form__success">
                  Thanks — we've received your message and will reply within one business day.
                </div>
              )}
            </form>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

function Field({ label, name, type = 'text', value, onChange, required }) {
  return (
    <div className="contact-form__field">
      <label htmlFor={name}>{label}{required && <span className="contact-form__req">*</span>}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete="off"
      />
    </div>
  )
}
