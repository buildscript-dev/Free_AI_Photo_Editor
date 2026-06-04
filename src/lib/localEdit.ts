// Local image-edit engine. Pure pixel math on RGBA bytes — no CSS filters,
// so the exact same algorithm ports straight to Dart's `image` package.
import type { Adjust } from './presets'

// Extra cinematic ops layered after the basic Adjust pass (for "Looks").
export interface LookExtras {
  fade?: number // 0..1 — lift blacks for a matte/film fade
  gamma?: number // !=1 — <1 brightens mids, >1 darkens
  shadowTint?: [number, number, number] // RGB pushed into dark areas
  highlightTint?: [number, number, number] // RGB pushed into bright areas
  tintStrength?: number // 0..1 — split-tone intensity
}

export const NO_EXTRAS: LookExtras = {}

// Full pipeline: basic adjust, then optional cinematic extras (fade/gamma/split-tone).
export function applyLook(src: ImageData, a: Adjust, x: LookExtras = {}): ImageData {
  const out = applyAdjust(src, a)
  const hasExtras =
    (x.fade ?? 0) > 0 || (x.gamma ?? 1) !== 1 || (x.shadowTint || x.highlightTint)
  if (!hasExtras) return out

  const d = out.data
  const fade = x.fade ?? 0
  const gamma = x.gamma ?? 1
  const ts = x.tintStrength ?? 0.5
  const sh = x.shadowTint
  const hi = x.highlightTint
  const invGamma = gamma !== 1 ? 1 / gamma : 1

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i]
    let g = d[i + 1]
    let b = d[i + 2]

    // gamma (mid-tone curve)
    if (gamma !== 1) {
      r = 255 * Math.pow(r / 255, invGamma)
      g = 255 * Math.pow(g / 255, invGamma)
      b = 255 * Math.pow(b / 255, invGamma)
    }

    // fade: lift the black point toward fade*64
    if (fade > 0) {
      const lift = fade * 64
      r = lift + r * (1 - fade * 0.25)
      g = lift + g * (1 - fade * 0.25)
      b = lift + b * (1 - fade * 0.25)
    }

    // split-tone: tint shadows vs highlights by luma weight
    if (sh || hi) {
      const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255
      if (sh) {
        const w = (1 - luma) * ts
        r += (sh[0] - 128) * w * 0.4
        g += (sh[1] - 128) * w * 0.4
        b += (sh[2] - 128) * w * 0.4
      }
      if (hi) {
        const w = luma * ts
        r += (hi[0] - 128) * w * 0.4
        g += (hi[1] - 128) * w * 0.4
        b += (hi[2] - 128) * w * 0.4
      }
    }

    d[i] = clamp(r)
    d[i + 1] = clamp(g)
    d[i + 2] = clamp(b)
  }
  return out
}

// Apply adjustments to an ImageData in place (except sharpen, which needs a copy).
export function applyAdjust(src: ImageData, a: Adjust): ImageData {
  const w = src.width
  const h = src.height
  const out = new ImageData(new Uint8ClampedArray(src.data), w, h)
  const d = out.data

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i]
    let g = d[i + 1]
    let b = d[i + 2]

    // brightness (multiplicative)
    r *= a.brightness
    g *= a.brightness
    b *= a.brightness

    // contrast around mid-grey
    r = (r - 128) * a.contrast + 128
    g = (g - 128) * a.contrast + 128
    b = (b - 128) * a.contrast + 128

    // saturation via luma
    const luma = 0.299 * r + 0.587 * g + 0.114 * b
    r = luma + (r - luma) * a.saturation
    g = luma + (g - luma) * a.saturation
    b = luma + (b - luma) * a.saturation

    // warmth: push red up, blue down (or reverse for cool)
    r += a.warmth * 30
    b -= a.warmth * 30

    d[i] = clamp(r)
    d[i + 1] = clamp(g)
    d[i + 2] = clamp(b)
  }

  let result = out
  if (a.sharpen > 0) result = unsharpMask(result, a.sharpen)
  if (a.vignette > 0) applyVignette(result, a.vignette)
  return result
}

function clamp(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v
}

// 3x3 sharpen blended by `amount` (0..1) so it's never harsh.
function unsharpMask(src: ImageData, amount: number): ImageData {
  const w = src.width
  const h = src.height
  const s = src.data
  const out = new ImageData(new Uint8ClampedArray(s), w, h)
  const d = out.data
  // center-weighted high-pass kernel
  const k = [0, -1, 0, -1, 5, -1, 0, -1, 0]
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const o = (y * w + x) * 4
      for (let c = 0; c < 3; c++) {
        let acc = 0
        let ki = 0
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            acc += s[((y + ky) * w + (x + kx)) * 4 + c] * k[ki++]
          }
        }
        // blend original <-> sharpened by amount
        d[o + c] = clamp(s[o + c] * (1 - amount) + acc * amount)
      }
    }
  }
  return out
}

// Darken toward the corners. strength 0..1.
function applyVignette(img: ImageData, strength: number): void {
  const w = img.width
  const h = img.height
  const d = img.data
  const cx = w / 2
  const cy = h / 2
  const maxD = Math.sqrt(cx * cx + cy * cy)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / maxD
      const factor = 1 - strength * dist * dist
      const o = (y * w + x) * 4
      d[o] = clamp(d[o] * factor)
      d[o + 1] = clamp(d[o + 1] * factor)
      d[o + 2] = clamp(d[o + 2] * factor)
    }
  }
}

// --- Canvas <-> ImageData helpers (browser only; the math above is portable) ---

export function imageToCanvas(img: HTMLImageElement, maxDim = 1600): HTMLCanvasElement {
  let { naturalWidth: w, naturalHeight: h } = img
  const scale = Math.min(1, maxDim / Math.max(w, h))
  w = Math.round(w * scale)
  h = Math.round(h * scale)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  c.getContext('2d')!.drawImage(img, 0, 0, w, h)
  return c
}

export function canvasToDataUrl(c: HTMLCanvasElement, type = 'image/jpeg', q = 0.92): string {
  return c.toDataURL(type, q)
}

export function getImageData(c: HTMLCanvasElement): ImageData {
  return c.getContext('2d')!.getImageData(0, 0, c.width, c.height)
}

export function putImageData(data: ImageData): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = data.width
  c.height = data.height
  c.getContext('2d')!.putImageData(data, 0, 0)
  return c
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
