import { Link } from 'react-router-dom'
import Reveal, { Stagger, StaggerItem } from '../components/Reveal.jsx'
import './Profile.css'

const INDUSTRIES = [
  { name: 'F&B', body: 'Restaurants, cafés, cloud kitchens, dining concepts, and food retail.' },
  { name: 'Automotive', body: 'Dealers, garages, automotive retailers, and mobility brands.' },
  { name: 'Retail & Lifestyle', body: 'Fashion, beauty, wellness, and consumer lifestyle products.' },
  { name: 'Corporate', body: 'B2B services, professional firms, and large business operations.' },
  { name: 'Real Estate', body: 'Developers, brokerages, and high-ticket property campaigns.' },
  { name: 'Events & Activations', body: 'Launches, festivals, brand activations, and experiential events.' },
  { name: 'Startups', body: 'Emerging digital-first brands ready to scale in the UAE market.' },
  { name: 'Hospitality', body: 'Hotels, lounges, leisure experiences, and lifestyle venues.' },
]

const CAPABILITIES = [
  { title: 'Marketing Planning', body: 'Audience research, positioning, channel mix, and full campaign roadmaps.' },
  { title: 'Brand Identity', body: 'Logo systems, tone of voice, visual languages, and brand storytelling.' },
  { title: 'Creative Production', body: 'Photo, video, graphics, motion, and on-brand campaign assets.' },
  { title: 'Performance Marketing', body: 'Paid social, paid search, retargeting, and conversion-focused funnels.' },
  { title: 'Social Media', body: 'Content calendars, community management, influencer ideas, and growth strategy.' },
  { title: 'Events & Activations', body: 'Launches, brand events, activations, and on-ground marketing campaigns.' },
  { title: 'Corporate Communications', body: 'Reputation building, business comms, and long-term corporate narratives.' },
  { title: 'Business Development', body: 'Market expansion plans, growth systems, and brand improvement strategy.' },
]

const PROCESS = [
  { step: '01', title: 'Listen', body: 'We learn your business, brand, audience, and ambitions in depth.' },
  { step: '02', title: 'Plan', body: 'We build a clear strategic roadmap with creative direction and channels.' },
  { step: '03', title: 'Produce', body: 'We craft brand assets, content, ads, and campaign materials.' },
  { step: '04', title: 'Perform', body: 'We launch, measure, optimise, and scale based on real market signal.' },
]

const DIFFERENTIATORS = [
  { title: 'One creative team', body: 'Strategy, design, and growth in a single, accountable team.' },
  { title: 'UAE-first thinking', body: 'Work built around regional audiences, behaviours, and culture.' },
  { title: 'Brand + performance', body: 'We refuse the trade-off — strong brand work that also performs.' },
  { title: 'Senior-led', body: 'Senior strategists and creatives stay involved at every stage of the work.' },
]

export default function Profile() {
  return (
    <div className="profile">
      <section className="page-hero">
        <div className="ambient" aria-hidden="true" />
        <div className="container">
          <Reveal as="span" className="section-tag">Company Profile</Reveal>
          <Reveal as="h1" delay={0.05}>
            A <span className="gradient-text">Complete Marketing Profile</span> Built Around Growth.
          </Reveal>
          <Reveal as="p" delay={0.15} className="lead">
            A snapshot of how Click works, who we work with, and what we bring to ambitious
            brands across the UAE — a creative marketing partner built for scale.
          </Reveal>
        </div>
      </section>

      <section className="section profile-overview">
        <div className="container">
          <div className="profile-overview__grid">
            <Reveal className="profile-overview__text">
              <span className="eyebrow">Company Overview</span>
              <h2>Click is a UAE-based advertising and digital marketing company.</h2>
              <p>
                We help businesses build presence, communicate clearly, and grow in a
                competitive digital-first market. Our work spans full-service marketing,
                advertising, branding, events, corporate strategy, business development,
                social media, and digital campaigns.
              </p>
              <p>
                We work with multiple clients across sectors such as F&amp;B, automotive,
                lifestyle, corporate businesses, real estate, events, and other digitally
                active brands — adapting our creative process to fit the realities of each
                category.
              </p>
            </Reveal>

            <Reveal delay={0.1} className="profile-overview__stats">
              <article className="card profile-stat">
                <span>8</span>
                <p>Core service lines under one team</p>
              </article>
              <article className="card profile-stat">
                <span>UAE</span>
                <p>Locally rooted, regionally fluent</p>
              </article>
              <article className="card profile-stat">
                <span>7+</span>
                <p>Industries served across the market</p>
              </article>
              <article className="card profile-stat">
                <span>1</span>
                <p>Creative team, fully integrated</p>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section profile-industries">
        <div className="container">
          <Reveal className="section-head">
            <span className="section-tag">Industries We Serve</span>
            <h2>Built around the categories driving the UAE economy.</h2>
            <p>From dining and lifestyle to corporate and real estate, our team understands the audience dynamics that matter.</p>
          </Reveal>

          <Stagger className="grid grid-4">
            {INDUSTRIES.map((ind) => (
              <StaggerItem key={ind.name}>
                <article className="card industry-pill">
                  <div className="industry-pill__title">{ind.name}</div>
                  <p>{ind.body}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="section profile-capabilities">
        <div className="container">
          <Reveal className="section-head">
            <span className="section-tag">Core Capabilities</span>
            <h2>Eight specialised practices, one creative team.</h2>
            <p>A capability set built to support brands at every stage — from launch to scale.</p>
          </Reveal>

          <Stagger className="grid grid-2 capability-grid">
            {CAPABILITIES.map((c, i) => (
              <StaggerItem key={c.title}>
                <article className="card capability">
                  <div className="capability__num">{String(i + 1).padStart(2, '0')}</div>
                  <div>
                    <h3>{c.title}</h3>
                    <p>{c.body}</p>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="section profile-process">
        <div className="container">
          <Reveal className="section-head">
            <span className="section-tag">How We Work</span>
            <h2>A clear, repeatable approach to growth.</h2>
          </Reveal>

          <Stagger className="grid grid-4">
            {PROCESS.map((p) => (
              <StaggerItem key={p.step}>
                <article className="card process-card">
                  <div className="process-card__step">{p.step}</div>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="section profile-diff">
        <div className="container">
          <Reveal className="section-head">
            <span className="section-tag">Why We Are Different</span>
            <h2>A creative partner built around outcomes — not output.</h2>
          </Reveal>

          <Stagger className="grid grid-2 diff-grid">
            {DIFFERENTIATORS.map((d, i) => (
              <StaggerItem key={d.title}>
                <article className="card diff-card">
                  <div className="diff-card__icon">{String(i + 1).padStart(2, '0')}</div>
                  <div>
                    <h3>{d.title}</h3>
                    <p>{d.body}</p>
                  </div>
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
            <h2>Let's discuss your next move.</h2>
            <p>Share your business goals — we'll help shape the marketing direction that gets you there.</p>
            <div className="cta-final__actions">
              <Link to="/contact" className="btn btn-primary">Contact Click <span className="btn-arrow" /></Link>
              <Link to="/services" className="btn btn-ghost">View Services</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
