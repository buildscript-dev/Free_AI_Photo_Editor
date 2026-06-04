import { Sparkles, Wand2, Type, Crop, Upload, ScanFace, Image as ImageIcon, Share2 } from 'lucide-react'

const FEATURES = [
  { icon: Sparkles, title: 'AI auto-enhance + Looks', body: 'Drop a photo and it’s graded instantly — context-detected and matched to a cinematic look. Tap to fine-tune.' },
  { icon: Wand2, title: 'Prompt transform + auto-refine', body: 'Pick visual options or type a rough idea. AI refines it into the perfect prompt, then re-renders your photo.' },
  { icon: Type, title: 'AI captions & descriptions', body: 'Generate Instagram / X / LinkedIn captions, hashtags and accessible alt-text from the image — one tap.' },
  { icon: Crop, title: 'Social sizes + background removal', body: 'One-tap background cut and export presets for IG square, 4:5, Story 9:16 and X 16:9. Ready to post.' },
]

const STEPS = [
  { icon: Upload, label: 'Upload' },
  { icon: ScanFace, label: 'AI detects' },
  { icon: Sparkles, label: 'Auto-enhance' },
  { icon: ImageIcon, label: 'Transform' },
  { icon: Share2, label: 'Post' },
]

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-20">
      <div className="reveal mb-12 max-w-2xl">
        <span className="pill bg-sage text-ink"><Sparkles size={15} /> Everything, free</span>
        <h2 className="font-display mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
          One tool, the whole post.
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="reveal card-soft flex gap-4 p-6">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-lime text-ink">
              <f.icon size={22} />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold">{f.title}</h3>
              <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">{f.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="reveal mt-14 flex flex-wrap items-center justify-center gap-2 md:gap-4">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2 md:gap-4">
            <div className="flex flex-col items-center gap-2">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-sm">
                <s.icon size={22} className="text-ink" />
              </span>
              <span className="text-xs font-semibold text-ink-soft">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <span className="text-lime-deep">→</span>}
          </div>
        ))}
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-4 pb-10">
      {/* ads-ready slot */}
      <div className="reveal mb-8 grid h-24 place-items-center rounded-2xl border border-dashed border-ink/15 text-xs text-ink-soft">
        Ad space (728×90) — reserved
      </div>
      <div className="card-soft flex flex-col items-center gap-4 p-8 text-center">
        <span className="flex items-center gap-2">
          <span className="grid grid-cols-3 gap-0.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} className="h-1.5 w-1.5 rounded-[2px] bg-ink" />
            ))}
          </span>
          <span className="font-display text-lg font-extrabold">Postly<span className="text-lime-deep">.</span>AI</span>
        </span>
        <p className="max-w-md text-sm text-ink-soft">
          Free AI photo editor for social. Auto-enhance, transform, caption and resize — no account, no cost.
        </p>
        <div className="flex gap-5 text-sm font-medium text-ink-soft">
          <a href="#editor" className="hover:text-ink">Editor</a>
          <a href="#features" className="hover:text-ink">Features</a>
          <a href="#" className="hover:text-ink">Privacy</a>
          <a href="#" className="hover:text-ink">Terms</a>
        </div>
        <p className="text-xs text-ink-soft/70">© {new Date().getFullYear()} Postly AI</p>
      </div>
    </footer>
  )
}
