// In-browser background removal (no server, no quota, no privacy leak).
// Ports to Flutter as Google ML Kit Subject/Selfie Segmentation.
// Lazy-loaded so the ~heavy onnx runtime stays out of the initial bundle.

export async function cutBackground(dataUrl: string): Promise<string> {
  const { removeBackground } = await import('@imgly/background-removal')
  const blob = await removeBackground(dataUrl)
  return await blobToDataUrl(blob)
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = reject
    r.readAsDataURL(blob)
  })
}
