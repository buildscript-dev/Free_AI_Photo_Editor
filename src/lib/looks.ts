// Cinematic "Looks" = one-tap styles, fully local. These replace the paid
// Gemini generative edits with free/instant/offline tone grades.
// Each look = base Adjust + optional split-tone/fade extras. Ports to Dart as-is.
import type { Adjust, Context } from './presets'
import { NEUTRAL, PRESETS } from './presets'
import type { LookExtras } from './localEdit'

export interface Look {
  id: string
  label: string
  emoji: string
  adjust: Adjust
  extras?: LookExtras
}

function adj(p: Partial<Adjust>): Adjust {
  return { ...NEUTRAL, ...p }
}

export const LOOKS: Look[] = [
  {
    id: 'golden',
    label: 'Golden Hour',
    emoji: '🌅',
    adjust: adj({ brightness: 1.08, contrast: 0.96, saturation: 1.12, warmth: 0.5 }),
    extras: { fade: 0.12, highlightTint: [255, 200, 120], tintStrength: 0.6 },
  },
  {
    id: 'cinematic',
    label: 'Cinematic',
    emoji: '🎬',
    adjust: adj({ contrast: 1.12, saturation: 1.05, sharpen: 0.2, vignette: 0.18 }),
    extras: { shadowTint: [60, 130, 150], highlightTint: [255, 170, 90], tintStrength: 0.7 },
  },
  {
    id: 'bw',
    label: 'B&W Film',
    emoji: '🎞️',
    adjust: adj({ saturation: 0, contrast: 1.25, sharpen: 0.25, vignette: 0.15 }),
    extras: { fade: 0.08 },
  },
  {
    id: 'vintage',
    label: 'Vintage',
    emoji: '📷',
    adjust: adj({ brightness: 1.04, contrast: 0.9, saturation: 0.85, warmth: 0.25 }),
    extras: { fade: 0.22, shadowTint: [90, 70, 120], highlightTint: [255, 220, 170], tintStrength: 0.5 },
  },
  {
    id: 'vivid',
    label: 'Vivid Pop',
    emoji: '⚡',
    adjust: adj({ brightness: 1.05, contrast: 1.15, saturation: 1.4, sharpen: 0.35 }),
  },
  {
    id: 'moody',
    label: 'Moody',
    emoji: '🌫️',
    adjust: adj({ brightness: 0.97, contrast: 1.18, saturation: 0.9, warmth: -0.2, vignette: 0.22 }),
    extras: { shadowTint: [70, 90, 130], tintStrength: 0.6 },
  },
  {
    id: 'soft',
    label: 'Soft Glow',
    emoji: '💗',
    adjust: adj({ brightness: 1.1, contrast: 0.92, saturation: 1.08, warmth: 0.18 }),
    extras: { fade: 0.18, gamma: 0.92, highlightTint: [255, 210, 225], tintStrength: 0.5 },
  },
]

const byId = (id: string) => LOOKS.find((l) => l.id === id)!

// Autopilot: each detected context -> the recipe applied automatically on upload.
// Some contexts get a curated Look, others just their tuned preset.
export function autoRecipe(c: Context): { adjust: Adjust; extras: LookExtras; note: string } {
  switch (c) {
    case 'portrait':
      return { ...pack(byId('soft')), note: 'Soft Glow' }
    case 'landscape':
      return { ...pack(byId('cinematic')), note: 'Cinematic' }
    case 'event':
      return { ...pack(byId('vivid')), note: 'Vivid Pop' }
    case 'food':
      return { adjust: PRESETS.food, extras: { fade: 0.06, highlightTint: [255, 205, 130], tintStrength: 0.4 }, note: 'Warm & Appetising' }
    default:
      return { adjust: PRESETS[c], extras: {}, note: 'Auto-enhanced' }
  }
}

function pack(l: Look): { adjust: Adjust; extras: LookExtras } {
  return { adjust: l.adjust, extras: l.extras ?? {} }
}
