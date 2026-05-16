import { useStaggerHeading, useParallaxImage, useRevealOnScroll } from '../hooks/useScrollReveal.js'
import './WorkShowcase.css'

/**
 * WorkShowcase — placeholder portfolio section for the homepage. Six
 * dummy cards with Unsplash images, each with its own ScrollTrigger
 * reveal and a parallax-on-scroll image inside its frame. Section
 * heading uses the word-stagger reveal so it reads in dramatically.
 */

const WORK = [
  {
    label: 'F&B',
    title: 'A flavour you can hear.',
    body: 'Brand voice + launch film for a Dubai dining concept.',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&auto=format&fit=crop&q=70',
  },
  {
    label: 'Automotive',
    title: 'Drive that sells itself.',
    body: 'Multi-channel campaign for a mobility retailer.',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&auto=format&fit=crop&q=70',
  },
  {
    label: 'Real estate',
    title: 'Spaces, well sold.',
    body: 'Identity + content engine for a property developer.',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=70',
  },
  {
    label: 'Retail',
    title: 'The first 3 seconds.',
    body: 'Performance + creative for a lifestyle brand launch.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=70',
  },
  {
    label: 'Events',
    title: 'Rooms that remember.',
    body: 'Experiential build for a regional brand activation.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=70',
  },
  {
    label: 'Corporate',
    title: 'Trust, articulated.',
    body: 'Strategy + comms refresh for a UAE B2B firm.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=70',
  },
]

export default function WorkShowcase() {
  const headingRef = useStaggerHeading()
  return (
    <section className="section work-showcase">
      <div className="container">
        <div className="section-head work-showcase__head">
          <span className="eyebrow">Selected work</span>
          <h2 ref={headingRef}>
            Real outcomes for ambitious UAE brands.
          </h2>
          <p>
            A glimpse at the kind of strategy + creative + media work the Click
            team has been shipping across the region. Placeholder visuals while
            the new case studies are in production.
          </p>
        </div>

        <div className="work-grid">
          {WORK.map((w, i) => (
            <WorkCard key={w.title} item={w} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function WorkCard({ item, index }) {
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
