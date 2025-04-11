import fs from "fs"
import { createCanvas } from "canvas"

// Ensure the icons directory exists
const iconsDir = "./public/icons"
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// Function to generate an icon for Annapurna Badavane Association
function generateIcon(size, primaryColor = "#3b82f6") {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext("2d")

  // Background
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, size, size)

  // Rounded rectangle background
  ctx.fillStyle = primaryColor
  const radius = size * 0.2
  ctx.beginPath()
  ctx.moveTo(size * 0.1 + radius, size * 0.1)
  ctx.lineTo(size * 0.9 - radius, size * 0.1)
  ctx.arcTo(size * 0.9, size * 0.1, size * 0.9, size * 0.1 + radius, radius)
  ctx.lineTo(size * 0.9, size * 0.9 - radius)
  ctx.arcTo(size * 0.9, size * 0.9, size * 0.9 - radius, size * 0.9, radius)
  ctx.lineTo(size * 0.1 + radius, size * 0.9)
  ctx.arcTo(size * 0.1, size * 0.9, size * 0.1, size * 0.9 - radius, radius)
  ctx.lineTo(size * 0.1, size * 0.1 + radius)
  ctx.arcTo(size * 0.1, size * 0.1, size * 0.1 + radius, size * 0.1, radius)
  ctx.fill()

  // Draw "A" for Annapurna
  ctx.fillStyle = "#ffffff"
  ctx.font = `bold ${size * 0.5}px Arial`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("A", size * 0.5, size * 0.5)

  // Save the icon
  const buffer = canvas.toBuffer("image/png")
  fs.writeFileSync(`${iconsDir}/icon-${size}x${size}.png`, buffer)
  console.log(`Generated icon-${size}x${size}.png`)
}

// Generate icons in different sizes
generateIcon(192)
generateIcon(512)

console.log("Icon generation complete!")

