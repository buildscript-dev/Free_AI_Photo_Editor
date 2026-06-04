import { useState } from 'react'
import { ArrowLeft, ArrowRight, QrCode } from 'lucide-react'

const SHOTS = [
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=260&fit=crop&q=70',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=260&fit=crop&q=70',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=260&fit=crop&q=70',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=260&fit=crop&q=70',
]

export function Gallery() {
  const [active, setActive] = useState(1)
  const move = (d: number) => setActive((a) => (a + d + SHOTS.length) % SHOTS.length)

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-ink-soft">Unleash your creativity</span>
        <div className="flex items-center gap-1">
          <button onClick={() => move(-1)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-paper">
            <ArrowLeft size={15} />
          </button>
          <button onClick={() => move(1)} className="grid h-8 w-8 place-items-center rounded-full bg-lime text-ink">
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-1.5">
          {SHOTS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-2 w-2 rounded-full transition ${active === i ? 'bg-lime-deep' : 'border border-ink/30'}`}
            />
          ))}
        </div>
        <div className="no-scrollbar flex flex-1 gap-2.5 overflow-x-auto">
          {SHOTS.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              className={`relative shrink-0 overflow-hidden rounded-2xl transition-all duration-300 ${
                active === i ? 'w-28 ring-2 ring-lime' : 'w-20'
              }`}
            >
              <img src={src} alt="" className="h-28 w-full object-cover" />
            </button>
          ))}
          <button
            onClick={() => document.getElementById('editor')?.scrollIntoView({ behavior: 'smooth' })}
            className="grid h-28 w-24 shrink-0 place-items-center rounded-2xl bg-paper text-ink-soft"
          >
            <QrCode size={22} />
            <span className="mt-1 text-[11px] font-semibold">Our platform</span>
          </button>
        </div>
      </div>
    </div>
  )
}
