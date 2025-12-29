import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distPath = join(__dirname, '../dist/index.html')

let html = readFileSync(distPath, 'utf8')

// Remove type="module" and crossorigin attributes for file:// compatibility
// Add defer to ensure DOM is ready before script executes
html = html.replace(/type="module"\s*/g, '')
html = html.replace(/\s*crossorigin/g, '')
html = html.replace('<script src="./script.js">', '<script defer src="./script.js">')

// Remove vite.svg favicon link
html = html.replace(/<link rel="icon"[^>]*>\s*/g, '')

writeFileSync(distPath, html)
console.log('Post-build: Fixed index.html for file:// compatibility')
