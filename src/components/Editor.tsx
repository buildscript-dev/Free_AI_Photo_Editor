import { useEffect, useRef, useState } from 'react'
import {
  Sparkles,
  Sliders,
  Wand2,
  Type,
  Crop,
  Download,
  Scissors,
  RotateCcw,
  Copy,
  Check,
  Upload,
  Loader2,
} from 'lucide-react'
import {
  PRESETS,
  NEUTRAL,
  CONTEXT_META,
  type Adjust,
  type Context,
} from '../lib/presets'
import {
  loadImage,
  imageToCanvas,
  getImageData,
  applyLook,
  putImageData,
  canvasToDataUrl,
  type LookExtras,
} from '../lib/localEdit'
import { LOOKS, autoRecipe } from '../lib/looks'
import { GUIDED } from '../lib/guided'
import {
  classify,
  generativeEdit,
  refinePrompt,
  caption as apiCaption,
  health,
  type Caption,
} from '../lib/api'
import { cutBackground } from '../lib/bgRemove'
import { BeforeAfter } from './BeforeAfter'

type Tab = 'enhance' | 'transform' | 'caption' | 'export'

const SIZES = [
  { id: 'orig', label: 'Original', ratio: 0 },
  { id: 'ig1', label: 'IG 1:1', ratio: 1 },
  { id: 'ig45', label: 'IG 4:5', ratio: 4 / 5 },
  { id: 'story', label: 'Story 9:16', ratio: 9 / 16 },
  { id: 'x', label: 'X 16:9', ratio: 16 / 9 },
]

export function Editor() {
  const [tab, setTab] = useState<Tab>('enhance')
  const [original, setOriginal] = useState<string | null>(null)
  const [context, setContext] = useState<Context>('unknown')
  const [adjust, setAdjust] = useState<Adjust>(NEUTRAL)
  const [extras, setExtras] = useState<LookExtras>({})
  const [edited, setEdited] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  const [hasKey, setHasKey] = useState(false)
  const [canEdit, setCanEdit] = useState(false)

  // guided generation
  const [choices, setChoices] = useState<Record<string, string>>({})
  const [idea, setIdea] = useState('')
  const [refined, setRefined] = useState('')

  // caption
  const [platform, setPlatform] = useState('instagram')
  const [cap, setCap] = useState<Caption | null>(null)
  const [copied, setCopied] = useState(false)

  const [aspect, setAspect] = useState(0)
  const baseData = useRef<ImageData | null>(null)

  useEffect(() => {
    health()
      .then((h) => {
        setHasKey(h.hasKey)
        setCanEdit(h.canEdit)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!baseData.current) return
    setEdited(canvasToDataUrl(putImageData(applyLook(baseData.current, adjust, extras))))
  }, [adjust, extras])

  async function onFile(file: File) {
    setStatus('Loading…')
    setAiResult(null)
    setCap(null)
    setRefined('')
    setChoices({})
    const url = URL.createObjectURL(file)
    const img = await loadImage(url)
    const canvas = imageToCanvas(img)
    baseData.current = getImageData(canvas)
    const dataUrl = canvasToDataUrl(canvas)
    setOriginal(dataUrl)
    setAdjust(NEUTRAL)
    setExtras({})
    setEdited(dataUrl)
    URL.revokeObjectURL(url)

    if (hasKey) {
      setStatus('🤖 AI analysing…')
      try {
        const ctx = await classify(dataUrl)
        const r = autoRecipe(ctx)
        setContext(ctx)
        setAdjust(r.adjust)
        setExtras(r.extras)
        setStatus(`✨ Auto-enhanced · ${CONTEXT_META[ctx].label} · ${r.note}`)
      } catch {
        const r = autoRecipe('unknown')
        setAdjust(r.adjust)
        setExtras(r.extras)
        setStatus('✨ Auto-enhanced (offline best-fit)')
      }
    } else {
      const r = autoRecipe('unknown')
      setAdjust(r.adjust)
      setExtras(r.extras)
      setStatus('✨ Auto-enhanced')
    }
  }

  function pickLook(id: string) {
    const l = LOOKS.find((x) => x.id === id)
    if (!l) return
    setAdjust(l.adjust)
    setExtras(l.extras ?? {})
    setStatus(`Look · ${l.label}`)
  }

  const afterImg = aiResult ?? edited

  async function doRefine(): Promise<string> {
    setStatus('Refining your prompt…')
    const p = await refinePrompt(idea, choices, context)
    setRefined(p)
    return p
  }

  async function runTransform(promptOverride?: string) {
    if (!edited) return
    setBusy(true)
    try {
      const p = promptOverride ?? refined ?? (await doRefine())
      const finalPrompt = p || (await doRefine())
      setStatus('🎨 Generating…')
      const out = await generativeEdit(edited, finalPrompt)
      setAiResult(out)
      setStatus('Done ✓')
    } catch (e) {
      const msg = (e as Error).message
      if (/quota|RESOURCE_EXHAUSTED|limit: 0/i.test(msg)) setStatus('Provider quota hit — try later.')
      else if (/loading|503|warm|currently/i.test(msg)) setStatus('Model warming up — tap again in ~20s.')
      else setStatus('Transform failed: ' + msg)
    } finally {
      setBusy(false)
    }
  }

  async function runBg() {
    const t = aiResult ?? edited
    if (!t) return
    setBusy(true)
    setStatus('Removing background…')
    try {
      setAiResult(await cutBackground(t))
      setStatus('Background removed ✓')
    } catch (e) {
      setStatus('BG removal failed: ' + (e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function runCaption() {
    const t = aiResult ?? edited
    if (!t) return
    setBusy(true)
    setStatus('Writing caption…')
    try {
      setCap(await apiCaption(t, platform))
      setStatus('Caption ready ✓')
    } catch (e) {
      setStatus('Caption failed: ' + (e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function exportImage() {
    const t = aiResult ?? edited
    if (!t) return
    const img = await loadImage(t)
    let cw = img.naturalWidth
    let ch = img.naturalHeight
    let sx = 0
    let sy = 0
    let sw = cw
    let sh = ch
    if (aspect > 0) {
      const cur = cw / ch
      if (cur > aspect) {
        sw = ch * aspect
        sx = (cw - sw) / 2
      } else {
        sh = cw / aspect
        sy = (ch - sh) / 2
      }
      cw = sw
      ch = sh
    }
    const c = document.createElement('canvas')
    c.width = cw
    c.height = ch
    c.getContext('2d')!.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch)
    const a = document.createElement('a')
    a.href = c.toDataURL('image/png')
    a.download = `postly-${aspect ? aspect.toFixed(2) : 'orig'}.png`
    a.click()
  }

  return (
    <section id="editor" className="mx-auto max-w-6xl px-4 py-20">
      <div className="mb-8 text-center">
        <span className="pill bg-sage text-ink">
          <Sparkles size={15} /> The editor
        </span>
        <h2 className="font-display mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
          Upload. <span className="text-lime-deep">AI does the rest.</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-ink-soft">
          Auto-enhanced the moment you drop a photo. Then fine-tune, transform with a prompt,
          caption it, and export for any platform — free.
        </p>
      </div>

      {!original ? (
        <label className="card-soft mx-auto flex max-w-2xl cursor-pointer flex-col items-center gap-3 border-2 border-dashed border-sage-deep py-24 text-center transition hover:bg-sage/40">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          />
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-lime text-ink">
            <Upload size={26} />
          </div>
          <div className="font-display text-lg font-bold">Drop or choose a photo</div>
          <div className="text-sm text-ink-soft">jpg / png · auto-enhances instantly · stays local until you use AI</div>
        </label>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* preview */}
          <div className="card-soft p-4">
            {afterImg && <BeforeAfter before={original} after={afterImg} />}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button onClick={runBg} disabled={busy} className="btn-ghost inline-flex items-center gap-1.5">
                <Scissors size={14} /> Remove BG
              </button>
              {aiResult && (
                <button onClick={() => setAiResult(null)} className="btn-ghost inline-flex items-center gap-1.5">
                  <RotateCcw size={14} /> Undo AI
                </button>
              )}
              <button
                onClick={() => {
                  setOriginal(null)
                  baseData.current = null
                }}
                className="btn-ghost"
              >
                New image
              </button>
              <span className="ml-auto inline-flex items-center gap-1.5 text-sm text-ink-soft">
                {busy && <Loader2 size={14} className="animate-spin" />}
                {status}
              </span>
            </div>
          </div>

          {/* controls */}
          <div className="card-soft p-4">
            <div className="mb-4 flex gap-1 rounded-full bg-paper p-1 text-sm font-semibold">
              {([
                ['enhance', 'Enhance', Sliders],
                ['transform', 'Transform', Wand2],
                ['caption', 'Caption', Type],
                ['export', 'Export', Crop],
              ] as [Tab, string, typeof Sliders][]).map(([id, label, Icon]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-2 transition ${
                    tab === id ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {tab === 'enhance' && (
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">Looks</p>
                  <div className="flex flex-wrap gap-1.5">
                    {LOOKS.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => pickLook(l.id)}
                        className="rounded-full bg-paper px-2.5 py-1 text-xs font-medium hover:bg-sage"
                      >
                        {l.emoji} {l.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">Fine-tune</p>
                  <Sliders3 value={adjust} onChange={setAdjust} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(CONTEXT_META) as Context[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setContext(c)
                        setAdjust(PRESETS[c])
                        setExtras({})
                      }}
                      className={`rounded-full px-2 py-0.5 text-[11px] ${
                        context === c ? 'bg-lime text-ink' : 'bg-paper text-ink-soft'
                      }`}
                    >
                      {CONTEXT_META[c].emoji} {CONTEXT_META[c].label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === 'transform' && (
              <div className="space-y-4">
                {!canEdit && (
                  <p className="rounded-lg bg-amber-50 p-2 text-[11px] text-amber-700">
                    Add a free HF_TOKEN to .env to enable AI transforms.
                  </p>
                )}
                {GUIDED.map((g) => (
                  <div key={g.key}>
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-soft">{g.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {g.options.map((o) => {
                        const active = choices[g.key] === o.value
                        return (
                          <button
                            key={o.label}
                            onClick={() =>
                              setChoices((c) => ({
                                ...c,
                                [g.key]: active ? '' : o.value,
                              }))
                            }
                            className={`overflow-hidden rounded-xl border-2 text-[10px] font-semibold transition ${
                              active ? 'border-lime' : 'border-transparent'
                            }`}
                            title={o.value}
                          >
                            <span
                              className="block h-9 w-14 bg-cover bg-center"
                              style={o.thumb ? { backgroundImage: `url(${o.thumb})` } : { background: o.grad }}
                            />
                            <span className="block bg-white px-1 py-0.5 text-ink">{o.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
                <input
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="…or describe it in your words (optional)"
                  className="w-full rounded-lg border border-sage-deep px-3 py-2 text-sm outline-none focus:border-lime-deep"
                />
                {refined && (
                  <textarea
                    value={refined}
                    onChange={(e) => setRefined(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg bg-sage/50 px-3 py-2 text-sm outline-none"
                  />
                )}
                <div className="flex gap-2">
                  <button
                    onClick={doRefine}
                    disabled={busy || !hasKey}
                    className="btn-ghost inline-flex items-center gap-1.5"
                  >
                    <Sparkles size={14} /> Refine
                  </button>
                  <button
                    onClick={() => runTransform()}
                    disabled={busy || !canEdit}
                    className="btn-lime inline-flex flex-1 items-center justify-center gap-1.5"
                  >
                    <Wand2 size={15} /> Generate
                  </button>
                </div>
              </div>
            )}

            {tab === 'caption' && (
              <div className="space-y-3">
                <div className="flex gap-1.5">
                  {['instagram', 'x', 'linkedin'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        platform === p ? 'bg-ink text-white' : 'bg-paper text-ink-soft'
                      }`}
                    >
                      {p === 'x' ? 'X' : p}
                    </button>
                  ))}
                </div>
                <button onClick={runCaption} disabled={busy || !hasKey} className="btn-lime w-full">
                  Generate caption
                </button>
                {cap && (
                  <div className="space-y-2 rounded-xl bg-paper p-3 text-sm">
                    <p>{cap.caption}</p>
                    <p className="text-lime-deep">{cap.hashtags?.map((h) => (h.startsWith('#') ? h : '#' + h)).join(' ')}</p>
                    <p className="text-xs text-ink-soft">Alt: {cap.altText}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${cap.caption}\n\n${cap.hashtags?.join(' ')}`,
                        )
                        setCopied(true)
                        setTimeout(() => setCopied(false), 1500)
                      }}
                      className="btn-ghost inline-flex items-center gap-1.5"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {tab === 'export' && (
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Size preset</p>
                <div className="flex flex-wrap gap-1.5">
                  {SIZES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setAspect(s.ratio)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        aspect === s.ratio ? 'bg-lime text-ink' : 'bg-paper text-ink-soft'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <button onClick={exportImage} className="btn-primary inline-flex w-full items-center justify-center gap-1.5">
                  <Download size={15} /> Download
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

// Compact 6-slider panel (themed for the editor).
function Sliders3({ value, onChange }: { value: Adjust; onChange: (a: Adjust) => void }) {
  const rows: [keyof Adjust, string, number, number][] = [
    ['brightness', 'Brightness', 0.5, 1.6],
    ['contrast', 'Contrast', 0.5, 2],
    ['saturation', 'Saturation', 0, 2],
    ['warmth', 'Warmth', -1, 1],
    ['sharpen', 'Sharpen', 0, 1],
    ['vignette', 'Vignette', 0, 1],
  ]
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
      {rows.map(([k, label, min, max]) => (
        <label key={k} className="block">
          <span className="flex justify-between text-[11px] text-ink-soft">
            {label} <span className="tabular-nums">{value[k].toFixed(2)}</span>
          </span>
          <input
            type="range"
            className="range-dark w-full"
            min={min}
            max={max}
            step={0.01}
            value={value[k]}
            onChange={(e) => onChange({ ...value, [k]: parseFloat(e.target.value) })}
          />
        </label>
      ))}
    </div>
  )
}
