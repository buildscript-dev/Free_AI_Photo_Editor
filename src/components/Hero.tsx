import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Camera, ArrowUpRight, Mic, Menu, ArrowRight } from 'lucide-react'
import { Gallery } from './Gallery'

const SLIDER_ICONS = ['Exposure', 'Brightness', 'Brilliance', 'Highlights', 'Vignette', 'Noise']
const SLIDER_GLYPH = ['±', '☀', '◐', '◑', '⬡', '◎']

function scrollToEditor() {
  document.getElementById('editor')?.scrollIntoView({ behavior: 'smooth' })
}

export function Hero() {
  const root = useRef<HTMLDivElement>(null)
  const [s1, setS1] = useState(28)
  const [s2, setS2] = useState(64)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('.hero-nav', { y: -20, opacity: 0, duration: 0.6 })
        .from('.hero-line > span', { yPercent: 110, duration: 0.9, stagger: 0.1 }, '-=0.2')
        .from('.hero-demo', { scale: 0.85, opacity: 0, duration: 0.5 }, '-=0.5')
        .from('.hero-sub', { y: 18, opacity: 0, duration: 0.6, stagger: 0.08 }, '-=0.4')
        .from('.hero-gallery', { y: 28, opacity: 0, duration: 0.6 }, '-=0.3')
        .from('.hero-img', { scale: 1.08, duration: 1.2 }, 0.1)
        .from('.hero-social', { x: -16, opacity: 0, duration: 0.6 }, '-=0.7')
        .from('.hero-controls', { y: 28, opacity: 0, duration: 0.7 }, '-=0.5')
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} className="p-3 sm:p-4 lg:p-5">
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-[minmax(0,47%)_minmax(0,1fr)] lg:gap-5">
        {/* LEFT */}
        <div className="card-soft flex min-w-0 flex-col justify-between gap-9 p-6 sm:p-8 lg:min-h-[calc(100vh-2.5rem)] lg:p-10">
          {/* nav */}
          <nav className="hero-nav flex items-center justify-between gap-3">
            <a href="#" className="flex items-center gap-2">
              <span className="grid grid-cols-3 gap-0.5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <span key={i} className="h-1.5 w-1.5 rounded-[2px] bg-ink" />
                ))}
              </span>
              <span className="font-display text-lg font-extrabold tracking-tight">
                Postly<span className="text-lime-deep">.</span>AI
              </span>
            </a>
            <div className="hidden items-center gap-5 text-sm font-medium text-ink-soft md:flex lg:hidden xl:flex">
              <a className="flex items-center gap-1.5 text-ink" href="#editor">
                <span className="h-1.5 w-1.5 rounded-full bg-lime-deep" /> Home
              </a>
              <a href="#features" className="transition hover:text-ink">Guides</a>
              <a href="#features" className="transition hover:text-ink">Tips</a>
            </div>
            <button onClick={scrollToEditor} className="pill bg-ink text-white transition hover:bg-ink/90">
              Menu <Menu size={16} />
            </button>
          </nav>

          {/* headline */}
          <div className="min-w-0">
            <div className="hero-demo mb-7 flex items-center justify-between gap-3">
              <button onClick={scrollToEditor} className="pill bg-paper text-ink transition hover:bg-sage">
                <Camera size={16} /> WATCH DEMO
              </button>
              <span className="hidden items-center gap-2 text-sm text-ink-soft sm:flex">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-paper">
                  <Mic size={17} />
                </span>
                <ArrowUpRight size={14} className="text-lime-deep" /> Our podcast
              </span>
            </div>

            <h1 className="font-display font-extrabold leading-[0.95] tracking-[-0.02em] text-[2.45rem] sm:text-[3.2rem] md:text-[4.2rem] lg:text-[3.5rem] xl:text-[4.3rem] 2xl:text-[5rem]">
              <span className="hero-line reveal-line"><span>AI editing</span></span>
              <span className="hero-line reveal-line"><span>made simple</span></span>
              <span className="hero-line reveal-line">
                <span className="whitespace-nowrap">
                  and{' '}
                  <span className="relative ml-1 inline-block rounded-xl border border-ink/25 px-2 text-ink-soft md:px-3">
                    powerful
                    <Corner className="-left-1 -top-1" />
                    <Corner className="-right-1 -top-1" />
                    <Corner className="-bottom-1 -left-1" />
                    <Corner className="-bottom-1 -right-1" />
                  </span>
                </span>
              </span>
            </h1>

            <p className="hero-sub mt-6 max-w-md text-[15px] leading-relaxed text-ink-soft">
              From automatic enhancements and background removal to AI prompt transforms and
              social captions — Postly helps you achieve stunning results in seconds. 100% free.
            </p>
            <button
              onClick={scrollToEditor}
              className="hero-sub btn-lime lift mt-6 inline-flex items-center gap-2"
            >
              Start editing — free <ArrowRight size={16} />
            </button>
          </div>

          {/* gallery */}
          <div className="hero-gallery min-w-0">
            <Gallery />
          </div>
        </div>

        {/* RIGHT */}
        <div className="grain relative min-h-[58vh] min-w-0 overflow-hidden rounded-3xl bg-sage-deep lg:min-h-[calc(100vh-2.5rem)]">
          <img
            src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1100&q=80"
            alt="AI edited portrait"
            className="hero-img duotone absolute inset-0 h-full w-full object-cover object-center"
          />
          {/* duotone layers: lift highlights to sage, push shadows to deep green */}
          <div className="absolute inset-0 bg-sage mix-blend-screen opacity-55" />
          <div className="absolute inset-0 bg-[#37511c] mix-blend-multiply opacity-55" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />

          {/* social pill */}
          <div className="hero-social absolute left-3 top-1/2 flex -translate-y-1/2 flex-col gap-1 rounded-full bg-gradient-to-b from-lime to-sage-deep p-1.5 shadow-lg sm:left-4">
            {[FB, X, IG].map((Icon, i) => (
              <button
                key={i}
                onClick={scrollToEditor}
                aria-label="Try the editor"
                title="Try the editor"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/85 text-ink transition hover:scale-105 hover:bg-white"
              >
                <Icon size={16} />
              </button>
            ))}
          </div>

          {/* editor controls overlay */}
          <div className="hero-controls glass absolute inset-x-3 bottom-3 rounded-2xl p-3 text-white sm:p-4">
            <div className="mb-3 grid grid-cols-6 gap-1 text-center text-[9px] font-medium sm:text-[10px]">
              {SLIDER_ICONS.map((l, i) => (
                <div key={l} className={`flex flex-col items-center gap-1 ${i === 5 ? 'text-lime' : ''}`}>
                  <span className={`grid h-7 w-7 place-items-center rounded-lg ${i === 5 ? 'bg-white text-ink' : 'bg-white/15'}`}>
                    {SLIDER_GLYPH[i]}
                  </span>
                  <span className="truncate">{l}</span>
                </div>
              ))}
            </div>
            <input type="range" className="mb-2 w-full" value={s1} onChange={(e) => setS1(+e.target.value)} />
            <input
              type="range"
              className="w-full"
              value={s2}
              onChange={(e) => setS2(+e.target.value)}
              style={{ background: `linear-gradient(90deg,#b8e04d ${s2}%, rgba(255,255,255,.3) ${s2}%)` }}
            />
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
