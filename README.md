# Postly AI — Free AI Photo Editor for Social

Upload a photo → it's auto-enhanced instantly → fine-tune, transform with a prompt, caption it, and export for Instagram / X / LinkedIn. 100% free stack.

Animated landing (React 19 + Vite + Tailwind v4 + GSAP + Lenis) with a fully working in-browser editor.

## Run

```bash
npm install
cp .env.example .env      # paste free keys (see below)
npm run dev               # web :5173  +  key-safe proxy :8787
```

### Keys (both free, no card)
- `GEMINI_API_KEY` — context detect, prompt refine, captions. https://aistudio.google.com/apikey
- `HF_TOKEN` — AI prompt transforms (FLUX.1-Kontext). https://huggingface.co/settings/tokens

Without keys, the local engine still works: auto-enhance, looks, sliders, before/after, on-device background removal.

## Features

| Feature | Engine | Cost |
|---|---|---|
| Auto-enhance on upload | local + Gemini classify | free |
| Cinematic Looks + 6 sliders | local pixel math | free |
| Background removal | in-browser (@imgly) | free |
| Guided + prompt transform | Gemini refine → HF FLUX Kontext | free |
| AI captions / hashtags / alt-text | Gemini | free |
| Social size export (IG / Story / X) | canvas crop | free |

## Architecture

- `server/index.js` — key-safe proxy (classify / refine-prompt / edit / caption). Keys never reach the client.
- `src/lib/localEdit.ts` + `presets.ts` + `looks.ts` — portable pixel engine.
- `src/lib/bgRemove.ts` — in-browser background removal.
- `src/components/` — Hero, Gallery, Sections, Editor.

> Privacy: basic edits stay 100% local. AI transforms/captions send the photo to the provider (Gemini/HF). The UI flags this.
