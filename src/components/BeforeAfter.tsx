import { useRef, useState } from 'react'

// Swipe-to-compare slider: original (left) vs edited (right).
export function BeforeAfter({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50)
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  function move(clientX: number) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const p = ((clientX - rect.left) / rect.width) * 100
    setPos(Math.max(0, Math.min(100, p)))
  }

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden rounded-2xl select-none touch-none bg-black/5"
      onMouseDown={(e) => {
        dragging.current = true
        move(e.clientX)
      }}
      onMouseMove={(e) => dragging.current && move(e.clientX)}
      onMouseUp={() => (dragging.current = false)}
      onMouseLeave={() => (dragging.current = false)}
      onTouchStart={(e) => move(e.touches[0].clientX)}
      onTouchMove={(e) => move(e.touches[0].clientX)}
    >
      <img src={after} alt="after" className="block w-full" draggable={false} />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img
          src={before}
          alt="before"
          className="block h-full max-w-none object-cover"
          style={{ width: ref.current?.clientWidth ?? '100%' }}
          draggable={false}
        />
        <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-xs text-white">
          Before
        </span>
      </div>
      <span className="absolute right-2 top-2 rounded-full bg-lime px-2 py-0.5 text-xs font-semibold text-ink">
        After
      </span>
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-white shadow-md text-ink text-xs font-bold">
          ⇄
        </div>
      </div>
    </div>
  )
}
