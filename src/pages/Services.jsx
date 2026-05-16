import { Link } from 'react-router-dom'
import Reveal, { Stagger, StaggerItem } from '../components/Reveal.jsx'
import './Services.css'

const SERVICES = [
  {
    id: 'marketing',
    number: '01',
    title: 'Marketing',
    short: 'Full-service marketing planning, campaign development, and market positioning.',
    explanation:
      'A complete marketing approach that combines audience insight, campaign planning, and clear positioning — built to give brands a structured way to attract, convert, and retain the right customers.',
    includes: [
      'Market research and audience analysis',
      'Brand positioning and messaging frameworks',
      'Marketing strategy and channel planning',
      'Campaign development and creative direction',
      'Quarterly roadmaps and performance reviews',
    ],
    why: 'Marketing without a strategy is noise. We help businesses make every campaign count — with a clear plan, the right audience, and a measurable outcome.',
  },
  {
    id: 'advertising',
    number: '02',
    title: 'Advertising',
    short: 'Creative ad concepts, paid media direction, and performance-focused messaging.',
    explanation:
      'Advertising that earns attention and drives action. We craft concepts, visuals, and copy that fit how audiences scroll, watch, and buy — across digital, social, and offline channels.',
    includes: [
      'Ad concepts and creative direction',
      'Visual and copy production for campaigns',
      'Paid social and paid search direction',
      'Display, video, and influencer campaign planning',
      'Performance reporting and creative optimisation',
    ],
    why: 'Great ads stop the scroll, lift the brand, and convert real customers. We balance creative quality with performance discipline — so paid spend actually pays back.',
  },
  {
    id: 'branding',
    number: '03',
    title: 'Branding',
    short: 'Brand identity, tone of voice, visual systems, and full brand storytelling.',
    explanation:
      'A brand is more than a logo — it is the way a business looks, sounds, and is remembered. We help businesses build identities that feel premium, distinctive, and consistent across every touchpoint.',
    includes: [
      'Logo and visual identity systems',
      'Brand colour, type, and design language',
      'Tone of voice and messaging guidelines',
      'Brand storytelling and narrative frameworks',
      'Brand guidelines and asset libraries',
    ],
    why: 'A clear, well-crafted brand reduces friction, raises perceived value, and helps every campaign perform better. It is the foundation everything else is built on.',
  },
  {
    id: 'events',
    number: '04',
    title: 'Events',
    short: 'Event concepts, launch campaigns, promotional materials, and brand activations.',
    explanation:
      'From product launches to brand activations, we plan and produce events that translate brand values into in-person experiences — visually polished, on-message, and engineered for engagement.',
    includes: [
      'Event concepts and creative direction',
      'Launch campaigns and pre-event marketing',
      'On-site branding, signage, and visual materials',
      'Brand activations and experiential ideas',
      'Audience engagement and post-event content',
    ],
    why: 'Events are where brands become memorable. The right event — promoted well, executed cleanly, and captured properly — fuels marketing for months afterwards.',
  },
  {
    id: 'corporate',
    number: '05',
    title: 'Corporate Strategies',
    short: 'Business communication, corporate campaigns, reputation, and long-term planning.',
    explanation:
      'For corporate businesses, professional firms, and B2B operators, we provide strategic communications and brand work that builds reputation, supports growth, and projects authority in the market.',
    includes: [
      'Corporate communications and positioning',
      'Reputation building and trust narratives',
      'B2B marketing campaigns and lead generation',
      'Internal communications and culture campaigns',
      'Long-term corporate growth planning',
    ],
    why: 'Corporate brands win on credibility. We translate complex business value into clear, professional communications that resonate with stakeholders and clients.',
  },
  {
    id: 'development',
    number: '06',
    title: 'Business Development',
    short: 'Digital growth systems, campaign funnels, and market expansion strategies.',
    explanation:
      'A growth-focused practice combining marketing, sales enablement, and digital systems — built to help brands expand into new audiences, channels, and territories across the UAE.',
    includes: [
      'Digital growth systems and funnel design',
      'Lead generation and nurture campaigns',
      'Market expansion strategy and roadmaps',
      'CRM, retention, and lifecycle marketing',
      'Brand improvement and repositioning plans',
    ],
    why: 'Growth is not just more spend — it is better systems. We design the marketing infrastructure that turns interest into pipeline and pipeline into long-term customers.',
  },
  {
    id: 'social',
    number: '07',
    title: 'Social Media Strategies',
    short: 'Content planning, platform direction, community growth, and engagement strategy.',
    explanation:
      'A modern social media practice that treats social as a brand channel — building strategic content, growing communities, and converting audiences across Instagram, TikTok, LinkedIn, and beyond.',
    includes: [
      'Social media strategy and content pillars',
      'Monthly content calendars and production',
      'Platform direction (Instagram, TikTok, LinkedIn, X)',
      'Community management and engagement playbooks',
      'Influencer concepts and partnership planning',
    ],
    why: 'Social is the modern shopfront. A clear, consistent social presence builds trust before customers ever speak to a brand — and turns followers into buyers.',
  },
  {
    id: 'digital',
    number: '08',
    title: 'Digital Campaigns',
    short: 'End-to-end digital campaigns built around clear goals and measurable outcomes.',
    explanation:
      'Digital campaigns that connect strategy, creative, and performance into a single rollout — designed to launch fast, learn fast, and scale what works.',
    includes: [
      'Campaign strategy and creative direction',
      'Landing pages and conversion experiences',
      'Paid media planning and execution',
      'Email, SMS, and lifecycle activation',
      'Analytics, attribution, and reporting',
    ],
    why: 'A well-run digital campaign is the fastest way to test a market, prove a message, and unlock growth. We build campaigns that move from idea to insight to revenue.',
  },
]

export default function Services() {
  return (
    <div className="services-page">
      <section className="page-hero">
        <div className="ambient" aria-hidden="true" />
        <div className="container">
          <Reveal as="span" className="section-tag">Services</Reveal>
          <Reveal as="h1" delay={0.05}>
            Eight Specialised Practices, <span className="gradient-text">One Creative Team.</span>
          </Reveal>
          <Reveal as="p" delay={0.15} className="lead">
            From strategy to launch, branding to performance — Click brings a complete
            marketing capability set to UAE brands ready to grow with clarity.
          </Reveal>
          <Reveal delay={0.22} className="services-nav">
            {SERVICES.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="services-nav__pill">
                <span>{s.number}</span> {s.title}
              </a>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section services-list">
        <div className="container">
          {SERVICES.map((s, idx) => (
            <Reveal key={s.id} className="service-block" amount={0.1}>
              <div id={s.id} className="service-block__anchor" />
              <div className="service-block__grid">
                <div className="service-block__left">
                  <div className="service-block__num">{s.number}</div>
                  <h2>{s.title}</h2>
                  <p className="service-block__short">{s.short}</p>
                  <Link to="/contact" className="btn btn-primary service-block__cta">
                    Start a Project <span className="btn-arrow" />
                  </Link>
                </div>

                <div className="service-block__right">
                  <div className="card service-block__card">
                    <span className="eyebrow">Overview</span>
                    <p>{s.explanation}</p>
                  </div>

                  <div className="grid grid-2 service-block__details">
                    <div className="card service-block__details-card">
                      <span className="eyebrow">What's Included</span>
                      <ul>
                        {s.includes.map((inc) => (
                          <li key={inc}>
                            <span className="service-block__check" aria-hidden="true" />
                            {inc}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="card service-block__details-card service-block__details-card--why">
                      <span className="eyebrow">Why It Matters</span>
                      <p>{s.why}</p>
                    </div>
                  </div>
                </div>
              </div>
              {idx < SERVICES.length - 1 && <div className="service-block__divider" />}
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section about-cta">
        <div className="container">
          <Reveal className="cta-final__card">
            <div className="cta-final__glow" aria-hidden="true" />
            <span className="section-tag">Build With Click</span>
            <h2>Ready to put one of these to work for your brand?</h2>
            <p>Tell us about your business and goals — we'll recommend the right starting point and shape a plan around it.</p>
            <div className="cta-final__actions">
              <Link to="/contact" className="btn btn-primary">Contact Click <span className="btn-arrow" /></Link>
              <Link to="/profile" className="btn btn-ghost">See Company Profile</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
