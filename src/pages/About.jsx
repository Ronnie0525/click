import { Link } from 'react-router-dom'
import Reveal, { Stagger, StaggerItem } from '../components/Reveal.jsx'
import './About.css'

const VALUES = [
  { title: 'Creativity', body: 'Original thinking applied to every brief, every campaign, every brand.' },
  { title: 'Strategy', body: 'Clear positioning, sharp messaging, and roadmaps that drive decisions.' },
  { title: 'Consistency', body: 'A unified brand voice across every channel, asset, and customer touchpoint.' },
  { title: 'Performance', body: 'Marketing measured against outcomes — not vanity metrics.' },
  { title: 'Partnership', body: 'A long-term relationship built around your business, not one-off projects.' },
  { title: 'Innovation', body: 'A digital-first approach that keeps brands ahead of the market.' },
]

export default function About() {
  return (
    <div className="about">
      <section className="page-hero">
        <div className="ambient" aria-hidden="true" />
        <div className="container">
          <Reveal as="span" className="section-tag">About Click</Reveal>
          <Reveal as="h1" delay={0.05}>
            We Are Click — A <span className="gradient-text">Creative Marketing Partner</span> for Modern UAE Brands.
          </Reveal>
          <Reveal as="p" delay={0.15} className="lead">
            We help businesses across the UAE turn ambition into market presence —
            through strategy, branding, advertising, social, and events that get
            attention and convert it into growth.
          </Reveal>
        </div>
      </section>

      <section className="section about-story">
        <div className="container about-story__grid">
          <Reveal className="about-story__text">
            <span className="eyebrow">Our Story</span>
            <h2>Built to help UAE brands look stronger, communicate better, and grow faster.</h2>
            <p>
              Click was built to help businesses communicate better, look stronger, and
              grow faster in a competitive digital-first market. We bring together
              strategists, creatives, and producers under one roof — a single team that
              treats every brand like the most important one in the room.
            </p>
            <p>
              From early-stage launches to established companies scaling across the
              region, our work spans F&amp;B, automotive, retail, lifestyle, corporate,
              real estate, and events — backed by a consistent commitment to brand
              quality and measurable performance.
            </p>
          </Reveal>

          <Reveal delay={0.15} className="about-story__panel">
            <div className="about-story__panel-glow" aria-hidden="true" />
            <div className="about-story__stat">
              <span>8</span>
              <p>Core services delivered under one creative roof</p>
            </div>
            <div className="about-story__stat">
              <span>7+</span>
              <p>Industries served across the UAE market</p>
            </div>
            <div className="about-story__stat">
              <span>UAE</span>
              <p>Locally-rooted, regionally-fluent creative team</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section about-mv">
        <div className="container">
          <div className="grid grid-2 about-mv__grid">
            <Reveal className="card about-mv__card">
              <span className="eyebrow">Our Mission</span>
              <h3>Help brands become more visible, more trusted, more memorable.</h3>
              <p>
                Through strategic marketing, advertising, branding, events, and social
                media — we give businesses the tools and presence to stand out and grow
                with clarity in a crowded UAE market.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="card about-mv__card">
              <span className="eyebrow">Our Vision</span>
              <h3>To be one of the UAE's most trusted creative marketing partners.</h3>
              <p>
                We're building Click to serve businesses that want to grow with clarity
                and confidence — a creative partner committed to long-term performance,
                not short-term tricks.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section about-values">
        <div className="container">
          <Reveal className="section-head">
            <span className="section-tag">Our Values</span>
            <h2>What we stand for — every brief, every campaign.</h2>
            <p>Six principles that shape how we think, work, and partner with brands.</p>
          </Reveal>

          <Stagger className="grid grid-3">
            {VALUES.map((v, i) => (
              <StaggerItem key={v.title}>
                <article className="card value-card">
                  <div className="value-card__num">{String(i + 1).padStart(2, '0')}</div>
                  <h3>{v.title}</h3>
                  <p>{v.body}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="section about-cta">
        <div className="container">
          <Reveal className="cta-final__card">
            <div className="cta-final__glow" aria-hidden="true" />
            <span className="section-tag">Work With Click</span>
            <h2>Let's build a brand the UAE remembers.</h2>
            <p>
              Whether you're launching, scaling, or repositioning — Click can help shape
              the right marketing direction for your next phase of growth.
            </p>
            <div className="cta-final__actions">
              <Link to="/contact" className="btn btn-primary">Start a Conversation <span className="btn-arrow" /></Link>
              <Link to="/services" className="btn btn-ghost">View Services</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
