import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import Reveal, { Stagger, StaggerItem } from '../components/Reveal.jsx'
import './Home.css'

const HIGHLIGHTS = [
  {
    title: 'Strategy First',
    body: 'We study your audience, competitors, positioning, and market opportunities before creating campaigns.',
  },
  {
    title: 'Creative Execution',
    body: 'We design brand visuals, content, ads, and experiences that feel premium, clear, and memorable.',
  },
  {
    title: 'Growth Focused',
    body: 'We measure performance, optimize campaigns, and help brands scale across digital and offline channels.',
  },
]

const INDUSTRIES_STRIP = ['F&B', 'Automotive', 'Real Estate', 'Retail', 'Lifestyle', 'Corporate', 'Events', 'Startups']

const SERVICES = [
  { num: '01', title: 'Marketing', body: 'Full-service marketing planning, campaign development, audience targeting, and market positioning.', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1920&q=70' },
  { num: '02', title: 'Advertising', body: 'Creative ad concepts, paid media direction, digital campaign planning, and performance-focused messaging.', image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1920&q=70' },
  { num: '03', title: 'Branding', body: 'Logo direction, brand identity, tone of voice, visual systems, and complete brand storytelling.', image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1920&q=70' },
  { num: '04', title: 'Events', body: 'Event concepts, launch campaigns, promotional materials, brand activations, and audience engagement.', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1920&q=70' },
  { num: '05', title: 'Corporate Strategies', body: 'Clear business communication, corporate campaigns, reputation building, and long-term growth planning.', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=70' },
  { num: '06', title: 'Development', body: 'Digital growth systems, campaign funnels, market expansion strategies, and brand improvement plans.', image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1920&q=70' },
  { num: '07', title: 'Social Strategies', body: 'Social media content planning, platform direction, community growth, influencer ideas, and engagement strategy.', image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1920&q=70' },
  { num: '08', title: 'Digital Campaigns', body: 'End-to-end digital campaigns — strategy, creative, paid media, and performance — built around clear goals and measurable outcomes.', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1920&q=70' },
]

const WHY = [
  { title: 'Built for the UAE market', body: 'Local insight, regional fluency, and creative output tuned to UAE audiences and industries.' },
  { title: 'Creative and strategic team', body: 'Strategists, designers, and producers working as one — from idea to launch.' },
  { title: 'Experience across industries', body: 'F&B, automotive, retail, lifestyle, real estate, corporate, and emerging brands.' },
  { title: 'Strong focus on brand image', body: 'Every touchpoint built to elevate how your brand looks, sounds, and is remembered.' },
  { title: 'Digital-first marketing', body: 'Modern campaigns built for digital channels, social platforms, and measurable performance.' },
  { title: 'Clean reporting & direction', body: 'Clear numbers, clear next steps. Performance you can read at a glance.' },
]

const METRICS = [
  { value: '150K+', label: 'Monthly impressions generated', sub: 'across active brand campaigns' },
  { value: '500K+', label: 'Campaign reach potential', sub: 'across multi-channel rollouts' },
  { value: '45M+', label: 'Audience exposure', sub: 'through multi-channel strategies' },
  { value: '20K+', label: 'Engaged users', sub: 'across campaign activations' },
]

const PROCESS = [
  { step: '01', title: 'Discover', body: 'We understand your business, audience, competitors, and goals.' },
  { step: '02', title: 'Strategize', body: 'We create a clear marketing roadmap with campaigns, channels, and creative direction.' },
  { step: '03', title: 'Create', body: 'We produce brand visuals, content ideas, ad messaging, and campaign assets.' },
  { step: '04', title: 'Scale', body: 'We launch, monitor, optimize, and improve based on market response.' },
]

const INDUSTRIES = [
  { title: 'F&B Brands', body: 'Restaurants, cafés, cloud kitchens, and lifestyle dining concepts.' },
  { title: 'Automotive Companies', body: 'Dealers, garages, automotive retailers, and mobility brands.' },
  { title: 'Retail & Lifestyle', body: 'Fashion, beauty, wellness, and consumer lifestyle products.' },
  { title: 'Corporate Businesses', body: 'B2B services, professional firms, and corporate communications.' },
  { title: 'Real Estate', body: 'Developers, brokerages, and property marketing campaigns.' },
  { title: 'Events & Activations', body: 'Launches, festivals, brand activations, and experiential events.' },
]

export default function Home() {
  const heroRef = useRef(null)

  useEffect(() => {
    const el = heroRef.current
    if (!el) return

    // Target & current positions (in %) for smooth easing.
    let tx = 50, ty = 60
    let cx = 50, cy = 60
    let rafId = null
    let active = false

    const tick = () => {
      cx += (tx - cx) * 0.12
      cy += (ty - cy) * 0.12
      el.style.setProperty('--mx', `${cx}%`)
      el.style.setProperty('--my', `${cy}%`)
      if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) {
        rafId = requestAnimationFrame(tick)
      } else {
        rafId = null
      }
    }
    const schedule = () => { if (rafId == null) rafId = requestAnimationFrame(tick) }

    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      tx = ((e.clientX - r.left) / r.width) * 100
      ty = ((e.clientY - r.top) / r.height) * 100
      if (!active) { active = true; el.classList.add('hero--lit') }
      schedule()
    }
    const onLeave = () => {
      // Keep the glow where the cursor last was — don't drift back to center.
      active = false
      el.classList.remove('hero--lit')
    }
    const onTouch = (e) => {
      const t = e.touches[0]
      if (!t) return
      const r = el.getBoundingClientRect()
      tx = ((t.clientX - r.left) / r.width) * 100
      ty = ((t.clientY - r.top) / r.height) * 100
      if (!active) { active = true; el.classList.add('hero--lit') }
      schedule()
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    el.addEventListener('touchmove', onTouch, { passive: true })
    el.addEventListener('touchend', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      el.removeEventListener('touchmove', onTouch)
      el.removeEventListener('touchend', onLeave)
      if (rafId != null) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero" ref={heroRef}>
        <div className="hero__bg" aria-hidden="true">
          <div className="hero__bg-glow" />
          <div className="hero__bg-cells" />
          <div className="hero__bg-vignette" />
        </div>

        <div className="hero__inner container">
          <div className="hero__content">
            <Reveal as="span" className="section-tag" y={16}>
              UAE Advertising & Digital Marketing
            </Reveal>
            <Reveal as="h1" delay={0.05} className="hero__title">
              We Build Brands That Get <span className="gradient-text">Clicked</span>,
              Remembered, and Chosen.
            </Reveal>
            <Reveal as="p" delay={0.15} className="hero__lead">
              Click is a UAE-based advertising and marketing company helping ambitious
              brands grow through strategy, digital campaigns, branding, social media,
              events, and creative market execution.
            </Reveal>
            <Reveal delay={0.25} className="hero__ctas">
              <Link to="/contact" className="btn btn-primary">
                Start a Project <span className="btn-arrow" />
              </Link>
              <Link to="/services" className="btn btn-ghost">
                Explore Services
              </Link>
            </Reveal>
          </div>
        </div>

        <div className="hero__marquee">
          <div className="hero__marquee-track">
            {[...INDUSTRIES_STRIP, ...INDUSTRIES_STRIP, ...INDUSTRIES_STRIP].map((x, i) => (
              <span key={i} className="hero__marquee-item">{x}<span className="hero__marquee-dot" /></span>
            ))}
          </div>
        </div>
      </section>

      {/* SUB HERO */}
      <section className="section sub-hero">
        <div className="container">
          <Reveal className="section-head">
            <span className="section-tag">Why Click</span>
            <h2>Marketing That Moves With the Market.</h2>
            <p>
              We connect strategy, creativity, and execution — helping UAE brands stand
              out, stay relevant, and convert attention into real growth.
            </p>
          </Reveal>

          <HighlightsRow items={HIGHLIGHTS} />
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="section what-we-do">
        <div className="ambient" aria-hidden="true" />
        <div className="container">
          <Reveal className="section-head">
            <span className="section-tag">What We Do</span>
            <h2>Strategy, Creativity, and Growth — <span className="gradient-text">All Under One Roof.</span></h2>
            <p>Eight specialised practices, one creative team — built to help brands grow with clarity and confidence.</p>
          </Reveal>
        </div>

        <WhatWeDoScrolly services={SERVICES} />
      </section>

      {/* WHY CHOOSE */}
      <section className="section why">
        <div className="container">
          <div className="why__head">
            <Reveal className="section-head" style={{ marginBottom: 0 }}>
              <span className="section-tag">Why Brands Choose Click</span>
              <h2>A studio built for serious UAE brands.</h2>
            </Reveal>
            <Reveal delay={0.1} as="p" className="why__lead">
              We bring together strategy, design, and growth thinking into one creative
              partner — so you can move faster without losing brand quality.
            </Reveal>
          </div>

          <Stagger className="grid grid-3 why__grid">
            {WHY.map((w, i) => (
              <StaggerItem key={w.title}>
                <article className="card why__card">
                  <div className="why__icon" aria-hidden="true">
                    <span>{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3>{w.title}</h3>
                  <p>{w.body}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* GROWTH SHOWCASE */}
      <section className="section growth">
        <div className="ambient" aria-hidden="true" />
        <div className="container">
          <Reveal className="section-head">
            <span className="section-tag">Growth Showcase</span>
            <h2>Numbers that tell the <span className="gradient-text">growth story.</span></h2>
            <p>A snapshot of campaign-scale reach and engagement Click is built to deliver across multi-channel marketing.</p>
          </Reveal>

          <div className="growth__grid">
            {METRICS.map((m, i) => (
              <Reveal key={m.label} delay={i * 0.08} className="growth__card card">
                <div className="growth__chart" aria-hidden="true">
                  <svg viewBox="0 0 200 80" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id={`g${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.55" />
                        <stop offset="100%" stopColor="#FF5A1F" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={pathFor(i)} fill={`url(#g${i})`} stroke="none" />
                    <path d={pathFor(i, true)} fill="none" stroke="#FF7A00" strokeWidth="2" />
                  </svg>
                </div>
                <div className="growth__num gradient-text">{m.value}</div>
                <div className="growth__label">{m.label}</div>
                <div className="growth__sub">{m.sub}</div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3} className="growth__note">
            <span className="hero__dot" />
            Numbers can represent projected, sample, or campaign-based performance depending on client scope.
          </Reveal>
        </div>
      </section>

      {/* PROCESS */}
      <section className="section process">
        <div className="container">
          <Reveal className="section-head">
            <span className="section-tag">Our Process</span>
            <h2>From insight to impact in four clear steps.</h2>
            <p>A repeatable system that combines clarity, creativity, and measurable performance.</p>
          </Reveal>

          <div className="process__rail" aria-hidden="true" />

          <Stagger className="process__grid">
            {PROCESS.map((p) => (
              <StaggerItem key={p.step}>
                <article className="process__card card">
                  <div className="process__step">{p.step}</div>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="section industries">
        <div className="container">
          <Reveal className="section-head">
            <span className="section-tag">Featured Industries</span>
            <h2>Marketing experience across <span className="gradient-text">multiple sectors.</span></h2>
            <p>Click works with brands operating across the UAE's most competitive consumer and business categories.</p>
          </Reveal>

          <Stagger className="grid grid-3">
            {INDUSTRIES.map((ind, i) => (
              <StaggerItem key={ind.title}>
                <article className="industry-card card">
                  <div className="industry-card__icon" aria-hidden="true">
                    <span>{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3>{ind.title}</h3>
                  <p>{ind.body}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="section cta-final">
        <div className="container">
          <Reveal className="cta-final__card">
            <div className="cta-final__glow" aria-hidden="true" />
            <span className="section-tag">Let's Build</span>
            <h2>Ready to Make Your Brand the One People <span className="gradient-text">Click First?</span></h2>
            <p>
              Let's build a marketing presence that feels premium, performs clearly, and
              positions your business for long-term growth in the UAE.
            </p>
            <div className="cta-final__actions">
              <Link to="/contact" className="btn btn-primary">
                Contact Click <span className="btn-arrow" />
              </Link>
              <Link to="/services" className="btn btn-ghost">View Services</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

function WhatWeDoScrolly({ services }) {
  const wrapperRef = useRef(null)
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(1) // 1 = forward (scroll down), -1 = backward
  const prevActiveRef = useRef(0)

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const clamped = Math.max(0, Math.min(0.9999, v))
    const idx = Math.floor(clamped * services.length)
    if (idx !== prevActiveRef.current) {
      setDirection(idx > prevActiveRef.current ? 1 : -1)
      prevActiveRef.current = idx
      setActive(idx)
    }
  })

  return (
    <div
      ref={wrapperRef}
      className="wd-scrolly"
      style={{ height: `${services.length * 38}vh` }}
    >
      <div className="wd-scrolly__sticky">
        <div className="wd-scrolly__bg" aria-hidden="true">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={active}
              className="wd-bg"
              custom={direction}
              variants={{
                enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 1 }),
                center: { x: '0%', opacity: 1 },
                exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 1 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.25 },
              }}
              style={{ backgroundImage: `url(${services[active].image})` }}
            />
          </AnimatePresence>
          <div className="wd-bg__overlay" />
        </div>

        <div className="container wd-scrolly__container">
        <div className="wd-scrolly__grid">
          <aside className="wd-scrolly__titles">
            {services.map((s, i) => (
              <div
                key={s.title}
                className={`wd-title ${i === active ? 'is-active' : ''}`}
              >
                <span className="wd-title__num">{s.num}</span>
                <span className="wd-title__rule" aria-hidden="true" />
                <span className="wd-title__text">{s.title}</span>
              </div>
            ))}
          </aside>

          <div className="wd-scrolly__panel">
            {services.map((s, i) => (
              <div
                key={s.title}
                className={`wd-panel ${i === active ? 'is-active' : ''}`}
                aria-hidden={i !== active}
              >
                <span className="wd-panel__index">
                  {s.num} <span className="wd-panel__index-sep">/</span> {String(services.length).padStart(2, '0')}
                </span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                <Link to="/services" className="wd-panel__link">
                  Explore in detail <span className="btn-arrow" />
                </Link>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

function HighlightsRow({ items }) {
  const ref = useRef(null)
  // Track scroll progress as the row moves through the viewport.
  // 0 = row's top is 95% down the viewport, 1 = row's top reaches 35% down.
  // That ~60% of viewport height of scroll distance is what drives the reveal.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 95%', 'start 35%'],
  })

  // Side cards: slide in from far outside the viewport.
  const leftX = useTransform(scrollYProgress, [0, 1], [-520, 0])
  const rightX = useTransform(scrollYProgress, [0, 1], [520, 0])
  // Side cards opacity ramps up later than the center so the center wins.
  const sideOpacity = useTransform(scrollYProgress, [0, 0.35, 1], [0, 0.1, 1])

  // Center card: rises + scales + fades. Finishes earlier than the sides.
  const centerY = useTransform(scrollYProgress, [0, 0.7], [80, 0])
  const centerScale = useTransform(scrollYProgress, [0, 0.7], [0.9, 1])
  const centerOpacity = useTransform(scrollYProgress, [0, 0.55], [0, 1])

  return (
    <div ref={ref} className="grid grid-3 highlights">
      <motion.article
        className="card highlight"
        style={{ x: leftX, opacity: sideOpacity }}
      >
        <div className="highlight__num">01</div>
        <h3>{items[0].title}</h3>
        <p>{items[0].body}</p>
        <div className="highlight__bar" />
      </motion.article>

      <motion.article
        className="card highlight"
        style={{ y: centerY, scale: centerScale, opacity: centerOpacity }}
      >
        <div className="highlight__num">02</div>
        <h3>{items[1].title}</h3>
        <p>{items[1].body}</p>
        <div className="highlight__bar" />
      </motion.article>

      <motion.article
        className="card highlight"
        style={{ x: rightX, opacity: sideOpacity }}
      >
        <div className="highlight__num">03</div>
        <h3>{items[2].title}</h3>
        <p>{items[2].body}</p>
        <div className="highlight__bar" />
      </motion.article>
    </div>
  )
}

function pathFor(seed, lineOnly = false) {
  // deterministic but varied chart paths per card
  const points = []
  const w = 200
  const h = 80
  const steps = 8
  const heights = [
    [60, 50, 55, 40, 45, 30, 22, 12],
    [55, 58, 45, 50, 32, 38, 20, 14],
    [65, 50, 42, 48, 30, 36, 18, 10],
    [62, 55, 48, 38, 35, 25, 18, 8],
  ]
  const seq = heights[seed % heights.length]
  for (let i = 0; i <= steps - 1; i++) {
    const x = (i / (steps - 1)) * w
    const y = seq[i]
    points.push([x, y])
  }
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ')
  if (lineOnly) return line
  return `${line} L ${w} ${h} L 0 ${h} Z`
}
