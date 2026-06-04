// Guided generation: instead of only typing, the user picks visual options.
// Each pick contributes a prompt fragment; choices are sent to /api/refine-prompt
// which merges them with any free-text idea into one polished instruction.

export interface Choice {
  label: string
  value: string // prompt fragment sent to the refiner
  thumb?: string // small preview image (backgrounds)
  grad?: string // css gradient swatch (looks/lighting/mood)
}

export interface ChoiceGroup {
  key: string // becomes the label in refine-prompt choices map
  title: string
  options: Choice[]
}

const u = (id: string) => `https://images.unsplash.com/${id}?w=160&h=120&fit=crop&q=70`

export const GUIDED: ChoiceGroup[] = [
  {
    key: 'Background',
    title: 'Background',
    options: [
      { label: 'Keep', value: 'keep the original background', grad: 'linear-gradient(135deg,#e9eaec,#cfd2d6)' },
      { label: 'Studio White', value: 'clean seamless white studio backdrop', thumb: u('photo-1517705008128-361805f42e86') },
      { label: 'Beach Sunset', value: 'warm beach at golden sunset behind subject', thumb: u('photo-1507525428034-b723cf961d3e') },
      { label: 'Neon City', value: 'moody neon-lit city street at night', thumb: u('photo-1492571350019-22de08371fd3') },
      { label: 'Nature', value: 'soft green natural outdoor foliage', thumb: u('photo-1441974231531-c6227db76b6e') },
      { label: 'Soft Bokeh', value: 'creamy blurred bokeh background', thumb: u('photo-1519681393784-d120267933ba') },
    ],
  },
  {
    key: 'Lighting',
    title: 'Lighting',
    options: [
      { label: 'Golden Hour', value: 'warm golden-hour light', grad: 'linear-gradient(135deg,#ffd089,#ff9e57)' },
      { label: 'Studio Soft', value: 'soft balanced studio softbox lighting', grad: 'linear-gradient(135deg,#fdfbf6,#dcd6c8)' },
      { label: 'Dramatic', value: 'dramatic high-contrast directional lighting', grad: 'linear-gradient(135deg,#3a3d44,#0e0f12)' },
      { label: 'Neon Glow', value: 'colourful neon rim glow', grad: 'linear-gradient(135deg,#c14bff,#3ad7ff)' },
    ],
  },
  {
    key: 'Mood',
    title: 'Mood / Colour',
    options: [
      { label: 'Warm', value: 'warm cozy colour grade', grad: 'linear-gradient(135deg,#ffb86b,#ff7a59)' },
      { label: 'Cinematic', value: 'teal-and-orange cinematic grade', grad: 'linear-gradient(135deg,#0fb8b0,#ff8a3d)' },
      { label: 'B&W', value: 'high-contrast black and white', grad: 'linear-gradient(135deg,#f2f2f2,#1a1a1a)' },
      { label: 'Vibrant', value: 'punchy vibrant saturated colours', grad: 'linear-gradient(135deg,#ff4d6d,#ffd166)' },
      { label: 'Pastel', value: 'soft dreamy pastel tones', grad: 'linear-gradient(135deg,#ffd6e7,#cdebff)' },
    ],
  },
  {
    key: 'Style',
    title: 'Finish',
    options: [
      { label: 'Realistic', value: 'natural photorealistic finish', grad: 'linear-gradient(135deg,#dfe3e8,#b9c0c8)' },
      { label: 'Film', value: '35mm analog film look with grain', grad: 'linear-gradient(135deg,#d8c9a3,#8a7b56)' },
      { label: 'Editorial', value: 'glossy magazine editorial retouch', grad: 'linear-gradient(135deg,#f5e9df,#c9a98c)' },
      { label: 'Dreamy', value: 'soft glowy dreamy haze', grad: 'linear-gradient(135deg,#ffe9f3,#e9d6ff)' },
    ],
  },
]
