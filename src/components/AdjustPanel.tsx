import type { Adjust } from '../lib/presets'

const ROWS: { key: keyof Adjust; label: string; min: number; max: number; step: number }[] = [
  { key: 'brightness', label: 'Brightness', min: 0.5, max: 1.6, step: 0.01 },
  { key: 'contrast', label: 'Contrast', min: 0.5, max: 2, step: 0.01 },
  { key: 'saturation', label: 'Saturation', min: 0, max: 2, step: 0.01 },
  { key: 'warmth', label: 'Warmth', min: -1, max: 1, step: 0.01 },
  { key: 'sharpen', label: 'Sharpen', min: 0, max: 1, step: 0.01 },
  { key: 'vignette', label: 'Vignette', min: 0, max: 1, step: 0.01 },
]

export function AdjustPanel({
  value,
  onChange,
}: {
  value: Adjust
  onChange: (a: Adjust) => void
}) {
  return (
    <div className="space-y-3">
      {ROWS.map((r) => (
        <label key={r.key} className="block">
          <div className="mb-1 flex justify-between text-xs text-purple-900/70">
            <span>{r.label}</span>
            <span className="tabular-nums">{value[r.key].toFixed(2)}</span>
          </div>
          <input
            type="range"
            className="w-full"
            min={r.min}
            max={r.max}
            step={r.step}
            value={value[r.key]}
            onChange={(e) => onChange({ ...value, [r.key]: parseFloat(e.target.value) })}
          />
        </label>
      ))}
    </div>
  )
}
