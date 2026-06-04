import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Camera, ArrowUpRight, Mic, Menu, ArrowRight } from 'lucide-react'
import { Gallery } from './Gallery'

const SLIDER_ICONS = ['Exposure', 'Brightness', 'Brilliance', 'Highlights', 'Vignette', 'Noise']

function scrollToEditor() {
  document.getElementById('editor')?.scrollIntoView({ behavior: 'smooth' })
}

export function Hero() {
  const root = useRef<HTMLDivElement>(null)
  const [s1, setS1] = useState(28)
  const [s2, setS2] = useState(64)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('.hero-nav', { y: -20, opacity: 0, duration: 0.6 })
        .from('.hero-line > span', { yPercent: 110, duration: 0.9, stagger: 0.12 }, '-=0.2')
        .from('.hero-sub', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
        .from('.hero-demo', { scale: 0.8, opacity: 0, duration: 0.5 }, '-=0.4')
        .from('.hero-gallery', { y: 30, opacity: 0, duration: 0.6 }, '-=0.3')
        .from('.hero-img', { scale: 1.08, opacity: 0, duration: 1.1 }, 0.1)
        .from('.hero-social', { x: -20, opacity: 0, duration: 0.6 }, '-=0.6')
        .from('.hero-controls', { y: 30, opacity: 0, duration: 0.7 }, '-=0.5')
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} className="min-h-screen p-3 md:p-5">
      <div className="grid gap-3 md:gap-5 lg:grid-cols-[minmax(0,46%)_1fr]">
        {/* LEFT */}
        <div className="card-soft flex flex-col justify-between gap-8 p-6 md:p-9">
          {/* nav */}
          <nav className="hero-nav flex items-center justify-between">
            <a href="#" className="flex items-center gap-2">
              <span className="grid grid-cols-3 gap-0.5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <span key={i} className="h-1.5 w-1.5 rounded-[2px] bg-ink" />
                ))}
              </span>
              <span className="font-display text-lg font-extrabold">Postly<span className="text-lime-deep">.</span>AI</span>
            </a>
            <div className="hidden items-center gap-5 text-sm font-medium text-ink-soft md:flex">
              <a className="flex items-center gap-1 text-ink" href="#editor">
                <span className="h-1.5 w-1.5 rounded-full bg-lime-deep" /> Home
              </a>
              <a href="#features" className="hover:text-ink">Guides</a>
              <a href="#features" className="hover:text-ink">Tips</a>
            </div>
            <button onClick={scrollToEditor} className="pill bg-ink text-white">
              Menu <Menu size={16} />
            </button>
          </nav>

          {/* headline */}
          <div className="relative">
            <button onClick={scrollToEditor} className="hero-demo pill mb-6 bg-paper text-ink shadow-sm">
              <Camera size={16} /> WATCH DEMO
            </button>

            <h1 className="font-display text-[2.4rem] font-extrabold leading-[0.98] tracking-tight sm:text-[3.4rem] md:text-[4.6rem] lg:text-[4.4rem] xl:text-[5.2rem]">
              <span className="hero-line reveal-line"><span>AI editing</span></span>
              <span className="hero-line reveal-line"><span>made simple</span></span>
              <span className="hero-line reveal-line flex items-baseline gap-2 md:gap-3">
                <span>and</span>
                <span className="relative inline-block rounded-xl border border-ink/30 px-2 text-ink-soft md:px-3">
                  powerful
                  <Corner className="-left-1 -top-1" />
                  <Corner className="-right-1 -top-1" />
                  <Corner className="-bottom-1 -left-1" />
                  <Corner className="-bottom-1 -right-1" />
                </span>
              </span>
            </h1>

            {/* podcast badge */}
            <div className="absolute right-0 top-2 hidden items-center gap-2 md:flex">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-paper">
                <Mic size={18} />
              </span>
              <span className="text-sm text-ink-soft">
                <ArrowUpRight size={14} className="inline text-lime-deep" /> Our podcast
              </span>
            </div>

            <p className="hero-sub mt-6 max-w-md text-[15px] leading-relaxed text-ink-soft">
              From automatic enhancements and background removal to AI prompt transforms and
              social captions — Postly helps you achieve stunning results in seconds. 100% free.
            </p>
            <button onClick={scrollToEditor} className="hero-sub btn-lime mt-5 inline-flex items-center gap-2">
              Start editing — free <ArrowRight size={16} />
            </button>
          </div>

          {/* gallery */}
          <div className="hero-gallery">
            <Gallery />
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative min-h-[60vh] overflow-hidden rounded-3xl bg-sage lg:min-h-0">
          <img
            src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1100&q=80"
            alt="AI edited portrait"
            className="hero-img absolute inset-0 h-full w-full object-cover [filter:grayscale(0.6)_contrast(1.05)]"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-lime/55 via-sage/25 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/30" />

          {/* social pill */}
          <div className="hero-social absolute left-4 top-1/2 flex -translate-y-1/2 flex-col gap-1 rounded-full bg-gradient-to-b from-lime to-sage-deep p-1.5 shadow-lg">
            {[FB, X, IG].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/85 text-ink transition hover:bg-white"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>

          {/* editor controls overlay */}
          <div className="hero-controls glass absolute bottom-3 left-3 right-3 rounded-2xl p-4 text-white">
            <div className="mb-3 grid grid-cols-6 gap-1 text-center text-[10px] font-medium">
              {SLIDER_ICONS.map((l, i) => (
                <div key={l} className={`flex flex-col items-center gap-1 ${i === 5 ? 'text-lime' : ''}`}>
                  <span className={`grid h-7 w-7 place-items-center rounded-lg ${i === 5 ? 'bg-white text-ink' : 'bg-white/15'}`}>
                    {['±', '☀', '◐', '◑', '⬡', '◎'][i]}
                  </span>
                  {l}
                </div>
              ))}
            </div>
            <input type="range" className="mb-2 w-full" value={s1} onChange={(e) => setS1(+e.target.value)} />
            <input type="range" className="w-full accent-lime" value={s2} onChange={(e) => setS2(+e.target.value)}
              style={{ background: `linear-gradient(90deg,#b8e04d ${s2}%, rgba(255,255,255,.3) ${s2}%)` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Corner({ className = '' }: { className?: string }) {
  return <span className={`absolute h-2 w-2 border border-ink/40 ${className}`} />
}

// lucide dropped brand marks — inline SVGs for the social trio.
function X({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.9 2H22l-7.5 8.6L23 22h-6.9l-5-6.6L5.4 22H2.3l8-9.2L1.5 2h7l4.5 6 5.9-6Zm-1.2 18h1.7L7.4 3.8H5.6L17.7 20Z" />
    </svg>
  )
}
function FB({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.3-1.5 1.6-1.5h1.7V4.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V14h2.6v8h3.6Z" />
    </svg>
  )
}
function IG({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
