// Key-safe proxy for Gemini. Holds GEMINI_API_KEY server-side so it never ships
// to the client. Each route maps 1:1 to a Supabase Edge Function when ported.
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { GoogleGenAI } from '@google/genai'
import { InferenceClient } from '@huggingface/inference'

const PORT = process.env.PORT || 8787
const KEY = process.env.GEMINI_API_KEY

// Image-edit model ("Nano Banana"); text/vision model for classify + caption.
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image'
const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash'

// Free generative-edit provider (no card). FLUX.1-Kontext = instruction editing.
const HF_TOKEN = process.env.HF_TOKEN
const HF_MODEL = process.env.HF_MODEL || 'black-forest-labs/FLUX.1-Kontext-dev'

const app = express()
app.use(cors())
app.use(express.json({ limit: '25mb' }))

const ai = KEY ? new GoogleGenAI({ apiKey: KEY }) : null
const hf = HF_TOKEN ? new InferenceClient(HF_TOKEN) : null
// Which provider serves /api/edit. HF preferred when present (free); Gemini needs paid billing.
const EDIT_PROVIDER = hf ? 'huggingface' : ai ? 'gemini' : 'none'

function requireKey(res) {
  if (!ai) {
    res.status(503).json({
      error: 'No GEMINI_API_KEY. Add it to .env (get one free at aistudio.google.com).',
    })
    return false
  }
  return true
}

// Pull the first inline image part out of a generateContent response.
function extractImage(resp) {
  const parts = resp?.candidates?.[0]?.content?.parts ?? []
  for (const p of parts) {
    if (p.inlineData?.data) {
      return { imageBase64: p.inlineData.data, mimeType: p.inlineData.mimeType || 'image/png' }
    }
  }
  return null
}

function extractText(resp) {
  const parts = resp?.candidates?.[0]?.content?.parts ?? []
  return parts.map((p) => p.text || '').join('').trim()
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    hasKey: !!ai, // Gemini text features (classify / suggest-prompt)
    canEdit: EDIT_PROVIDER !== 'none',
    editProvider: EDIT_PROVIDER,
    imageModel: IMAGE_MODEL,
    textModel: TEXT_MODEL,
    hfModel: HF_MODEL,
  })
})

// Classify the photo into one of the known contexts so the UI can auto-pick a preset.
const CONTEXTS = ['food', 'portrait', 'product', 'landscape', 'document', 'event', 'unknown']
app.post('/api/classify', async (req, res) => {
  if (!requireKey(res)) return
  const { imageBase64, mimeType } = req.body || {}
  if (!imageBase64) return res.status(400).json({ error: 'imageBase64 required' })
  try {
    const resp = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: mimeType || 'image/jpeg', data: imageBase64 } },
            {
              text:
                `Classify this photo into exactly ONE of: ${CONTEXTS.join(', ')}. ` +
                `Reply with only the single lowercase word, nothing else.`,
            },
          ],
        },
      ],
    })
    let label = extractText(resp).toLowerCase().replace(/[^a-z]/g, '')
    if (!CONTEXTS.includes(label)) label = 'unknown'
    res.json({ context: label })
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) })
  }
})

// Generative edit: user prompt + image -> new image. HF (free) when available, else Gemini (paid).
app.post('/api/edit', async (req, res) => {
  const { imageBase64, mimeType, prompt } = req.body || {}
  if (!imageBase64 || !prompt) return res.status(400).json({ error: 'imageBase64 and prompt required' })
  if (EDIT_PROVIDER === 'none') {
    return res.status(503).json({
      error: 'No edit provider. Add HF_TOKEN (free, no card, huggingface.co/settings/tokens) to .env.',
    })
  }
  try {
    if (EDIT_PROVIDER === 'huggingface') {
      const out = await hf.imageToImage({
        model: HF_MODEL,
        inputs: new Blob([Buffer.from(imageBase64, 'base64')], { type: mimeType || 'image/jpeg' }),
        parameters: { prompt },
      })
      const buf = Buffer.from(await out.arrayBuffer())
      return res.json({ imageBase64: buf.toString('base64'), mimeType: out.type || 'image/png' })
    }
    // Gemini path (needs paid billing on the image model)
    const resp = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: mimeType || 'image/jpeg', data: imageBase64 } },
            { text: prompt },
          ],
        },
      ],
    })
    const img = extractImage(resp)
    if (!img) return res.status(502).json({ error: 'Model returned no image', text: extractText(resp) })
    res.json(img)
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) })
  }
})

// Suggest a plausible generation prompt for the image (honest caption, NOT the "exact" prompt).
app.post('/api/suggest-prompt', async (req, res) => {
  if (!requireKey(res)) return
  const { imageBase64, mimeType } = req.body || {}
  if (!imageBase64) return res.status(400).json({ error: 'imageBase64 required' })
  try {
    const resp = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: mimeType || 'image/jpeg', data: imageBase64 } },
            {
              text:
                'Write ONE concise image-generation prompt (max 30 words) that would recreate ' +
                "this photo's subject, mood, lighting and style. Output only the prompt text.",
            },
          ],
        },
      ],
    })
    res.json({ prompt: extractText(resp) })
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) })
  }
})

// Turn a rough idea + guided choices into one polished, model-ready edit instruction.
app.post('/api/refine-prompt', async (req, res) => {
  if (!requireKey(res)) return
  const { idea, choices, context } = req.body || {}
  const choiceLines = choices && typeof choices === 'object'
    ? Object.entries(choices).filter(([, v]) => v).map(([k, v]) => `- ${k}: ${v}`).join('\n')
    : ''
  if (!idea && !choiceLines) return res.status(400).json({ error: 'idea or choices required' })
  try {
    const resp = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text:
                `You write prompts for an AI image EDITING model that transforms an existing photo.\n` +
                `The photo context is: ${context || 'unknown'}.\n` +
                `User's rough idea: "${idea || '(none)'}"\n` +
                (choiceLines ? `User's chosen options:\n${choiceLines}\n` : '') +
                `\nRewrite this into ONE clear, vivid editing instruction (max 40 words). ` +
                `Preserve the subject/person identity. Describe lighting, mood, colour, background concretely. ` +
                `Output ONLY the final instruction, no quotes, no preamble.`,
            },
          ],
        },
      ],
    })
    res.json({ prompt: extractText(resp) })
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) })
  }
})

// Generate a social caption + hashtags + alt-text for a platform from the image.
app.post('/api/caption', async (req, res) => {
  if (!requireKey(res)) return
  const { imageBase64, mimeType, platform } = req.body || {}
  if (!imageBase64) return res.status(400).json({ error: 'imageBase64 required' })
  const plat = platform || 'instagram'
  try {
    const resp = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: mimeType || 'image/jpeg', data: imageBase64 } },
            {
              text:
                `Write a ${plat} post for this image. Return STRICT JSON only:\n` +
                `{"caption": "<engaging caption, ${plat === 'x' ? 'under 240 chars, punchy' : '1-2 lines with light emoji'}>",` +
                `"hashtags": ["#tag", ...up to 8 relevant lowercase tags],` +
                `"altText": "<concise factual alt-text for accessibility>"}`,
            },
          ],
        },
      ],
    })
    let txt = extractText(resp).replace(/^```json\s*|\s*```$/g, '').trim()
    let data
    try { data = JSON.parse(txt) } catch { data = { caption: txt, hashtags: [], altText: '' } }
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) })
  }
})

// Listen only for local dev. On Vercel (serverless) the app is exported instead.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[postly-ai] proxy on :${PORT} — gemini ${ai ? 'on' : 'off'}, edit via ${EDIT_PROVIDER}`)
  })
}

export default app
