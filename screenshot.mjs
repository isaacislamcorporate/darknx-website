import puppeteer from 'puppeteer'
import fs        from 'fs'
import path      from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const url       = process.argv[2] || 'http://localhost:3000'
const label     = process.argv[3] || ''

const dir = path.join(__dirname, 'temporary screenshots')
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

// Auto-increment filename
let n = 1
while (fs.existsSync(path.join(dir, `screenshot-${n}${label ? '-' + label : ''}.png`))) n++
const outFile = path.join(dir, `screenshot-${n}${label ? '-' + label : ''}.png`)

const browser = await puppeteer.launch({ headless: true })
const page    = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 })
await new Promise(r => setTimeout(r, 600)) // let animations settle
await page.screenshot({ path: outFile, fullPage: true })
await browser.close()

console.log(outFile)
