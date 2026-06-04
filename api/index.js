// Vercel serverless entry — reuses the Express app. vercel.json rewrites
// /api/* to this function; Express matches the original /api/... paths.
import app from '../server/index.js'

export default app
