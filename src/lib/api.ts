// Client side of the proxy. Sends base64 (no data: prefix) to the express server.
import type { Context } from './presets'

function stripPrefix(dataUrl: string): { data: string; mimeType: string } {
  const m = dataUrl.match(/^data:(.+?);base64,(.*)$/)
  if (!m) return { data: dataUrl, mimeType: 'image/jpeg' }
  return { mimeType: m[1], data: m[2] }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`)
  return json
}

export async function classify(dataUrl: string): Promise<Context> {
  const { data, mimeType } = stripPrefix(dataUrl)
  const r = await post<{ context: Context }>('/api/classify', { imageBase64: data, mimeType })
  return r.context
}

export async function generativeEdit(dataUrl: string, prompt: string): Promise<string> {
  const { data, mimeType } = stripPrefix(dataUrl)
  const r = await post<{ imageBase64: string; mimeType: string }>('/api/edit', {
    imageBase64: data,
    mimeType,
    prompt,
  })
  return `data:${r.mimeType};base64,${r.imageBase64}`
}

export async function suggestPrompt(dataUrl: string): Promise<string> {
  const { data, mimeType } = stripPrefix(dataUrl)
  const r = await post<{ prompt: string }>('/api/suggest-prompt', { imageBase64: data, mimeType })
  return r.prompt
}

export async function refinePrompt(
  idea: string,
  choices: Record<string, string>,
  context: string,
): Promise<string> {
  const r = await post<{ prompt: string }>('/api/refine-prompt', { idea, choices, context })
  return r.prompt
}

export interface Caption {
  caption: string
  hashtags: string[]
  altText: string
}

export async function caption(dataUrl: string, platform: string): Promise<Caption> {
  const { data, mimeType } = stripPrefix(dataUrl)
  return await post<Caption>('/api/caption', { imageBase64: data, mimeType, platform })
}

export interface Health {
  hasKey: boolean
  canEdit: boolean
  editProvider: 'huggingface' | 'gemini' | 'none'
  hfModel: string
}

export async function health(): Promise<Health> {
  const res = await fetch('/api/health')
  return res.json()
}
