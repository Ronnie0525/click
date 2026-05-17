import { useParallaxImage, useRevealOnScroll } from '../hooks/useScrollReveal.js'
import './WorkShowcase.css'

/**
 * WorkShowcase — six headline advertising services rendered as cards
 * with parallax image reveals on scroll. Same scroll behaviour as
 * before; only the data and copy now reflect the agency's offering
 * instead of a portfolio.
 */

const SERVICES = [
  {
    label: 'Brand & Identity',
    title: 'A look that lasts.',
    body: 'Logo, typography, voice, and brand systems built to scale with your business.',
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&auto=format&fit=crop&q=70',
  },
  {
    label: 'Creative & Advertising',
    title: 'Ideas that stop the scroll.',
    body: 'Concept, copy, and art direction across every channel that matters.',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&auto=format&fit=crop&q=70',
  },
  {
    label: 'Digital Campaigns',
    title: 'Growth, measured.',
    body: 'Paid media, SEO, and conversion-led campaigns engineered for ROI.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=70',
  },
  {
    label: 'Social Media',
    title: 'Always on, never noisy.',
    body: 'Content calendars, community management, and platform-native creative.',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&auto=format&fit=crop&q=70',
  },
  {
    label: 'Content Production',
    title: 'Pixels, perfected.',
    body: 'Photography, video, and post for product launches and brand stories.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&auto=format&fit=crop&q=70',
  },
  {
    label: 'Events & Activations',
    title: 'Rooms that remember.',
    body: 'End-to-end experiential builds, from concept through to teardown.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=70',
  },
]

export default function WorkShowcase() {
  return (
    <section className="section work-showcase">
      <div className="container">
        <div className="section-head work-showcase__head">
          <span className="eyebrow">Our Services</span>
          <h2>Six advertising disciplines, one team.</h2>
          <p>
            From brand foundations through to live campaigns and on-the-ground
            activations — every service you need to take a UAE brand from
            invisible to inevitable.
          </p>
        </div>

        <div className="work-grid">
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.title} item={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceCard({ item, index }) {
  const cardRef = useRevealOnScroll({ y: 40, delay: (index % 3) * 0.05 })
  const imgRef = useParallaxImage(0.12)
  return (
    <article ref={cardRef} className="work-card">
      <div className="work-card__frame">
        <img
          ref={imgRef}
          className="work-card__img"
          src={item.image}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <span className="work-card__label">{item.label}</span>
      </div>
      <div className="work-card__copy">
        <h3>{item.title}</h3>
        <p>{item.body}</p>
      </div>
    </article>
  )
}
