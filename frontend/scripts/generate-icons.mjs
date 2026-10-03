// Generates orange PWA icons with white "C" for Charly HB
// Run: node scripts/generate-icons.mjs

import { createWriteStream, mkdirSync } from 'fs'
import { join } from 'path'
import { createCanvas } from 'canvas'

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const outDir = join(process.cwd(), 'public', 'icons')
mkdirSync(outDir, { recursive: true })

for (const size of sizes) {
  const canvas = createCanvas(size, size)
  const ctx    = canvas.getContext('2d')
  const radius = size * 0.22

  // Orange rounded background
  ctx.fillStyle = '#f97316'
  ctx.beginPath()
  ctx.moveTo(radius, 0)
  ctx.arcTo(size, 0, size, radius)
  ctx.arcTo(size, size, 0, size, radius)
  ctx.arcTo(0, size, 0, size, radius)
  ctx.closePath()
  ctx.fill()

  // White "C"
  ctx.fillStyle    = '#ffffff'
  ctx.font         = `bold ${Math.floor(size * 0.52)}px Arial` 
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('C', size / 2, size * 0.52)

  const out  = createWriteStream(join(outDir, `icon-${size}x${size}.png`))
  const stream = canvas.createPNGStream()
  stream.pipe(out)
  console.log(`✓ icon-${size}x${size}.png`)
}
console.log('Done.')
