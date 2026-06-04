import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSmoothScroll } from './lib/useSmoothScroll'
import { Hero } from './components/Hero'
import { Features, Footer } from './components/Sections'
import { Editor } from './components/Editor'

export default function App() {
  useSmoothScroll()

  useEffect(() => {
    // Respect reduced-motion: leave everything visible, skip reveal animation.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        })
      })
      ScrollTrigger.refresh()
    })
    return () => ctx.revert()
  }, [])

  return (
    <main className="overflow-x-hidden">
      <Hero />
      <Features />
      <Editor />
      <Footer />
    </main>
  )
}
