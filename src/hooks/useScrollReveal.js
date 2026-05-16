import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * useStaggerHeading — splits an `<h2>` (or any element) into word spans
 * and animates them up + into view when the element enters the viewport.
 *
 * Returns a ref to attach to the heading element. The first run wraps
 * each word in a `<span class="reveal-word">` and animates them with a
 * GSAP timeline; on unmount the ScrollTrigger is killed.
 */
export function useStaggerHeading() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof window === 'undefined') return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    if (el.dataset.staggered === 'true') return undefined        // already wrapped
    el.dataset.staggered = 'true'

    // Walk text nodes once; wrap each word in a span. Skip nodes that
    // are already inside our own spans (e.g. .gradient-text) so we don't
    // double-wrap.
    const wrap = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent
        if (!text || !text.trim()) return
        const frag = document.createDocumentFragment()
        const parts = text.split(/(\s+)/)
        for (const part of parts) {
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part))
          } else if (part) {
            const span = document.createElement('span')
            span.className = 'reveal-word'
            span.textContent = part
            frag.appendChild(span)
          }
        }
        node.parentNode.replaceChild(frag, node)
      } else if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('reveal-word')) {
        Array.from(node.childNodes).forEach(wrap)
      }
    }
    Array.from(el.childNodes).forEach(wrap)

    const words = el.querySelectorAll('.reveal-word')
    gsap.set(words, { yPercent: 100, opacity: 0 })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
    })
    tl.to(words, {
      yPercent: 0,
      opacity: 1,
      duration: 0.9,
      ease: 'expo.out',
      stagger: 0.04,
    })

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [])
  return ref
}

/**
 * useParallaxImage — gives an element a slow vertical scroll-driven
 * translate so it parallaxes against its container. Pass `strength`
 * 0..1; higher = more movement (default 0.15).
 */
export function useParallaxImage(strength = 0.15) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof window === 'undefined') return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const tween = gsap.fromTo(
      el,
      { yPercent: -strength * 100 },
      {
        yPercent: strength * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: el.parentElement || el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [strength])
  return ref
}

/**
 * useRevealOnScroll — fades + translates an element when it scrolls
 * into view. Lighter than the stagger helper, for whole cards.
 */
export function useRevealOnScroll({ y = 32, delay = 0 } = {}) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof window === 'undefined') return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    gsap.set(el, { y, opacity: 0 })
    const tween = gsap.to(el, {
      y: 0,
      opacity: 1,
      duration: 0.85,
      ease: 'expo.out',
      delay,
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true,
      },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [y, delay])
  return ref
}
