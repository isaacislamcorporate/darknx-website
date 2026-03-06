import puppeteer from 'puppeteer'
import fs        from 'fs'
import path      from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const url       = process.argv[2] || 'http://localhost:3000'
const scrollY   = parseInt(process.argv[3] || '0')
const label     = process.argv[4] || 'section'

const dir = path.join(__dirname, 'temporary screenshots')
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

let n = 1
while (fs.existsSync(path.join(dir, `screenshot-${n}-${label}.png`))) n++
const outFile = path.join(dir, `screenshot-${n}-${label}.png`)

const browser = await puppeteer.launch({ headless: true })
const page    = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 })
await page.evaluate(y => window.scrollTo(0, y), scrollY)
await new Promise(r => setTimeout(r, 500))
await page.screenshot({ path: outFile, clip: { x: 0, y: 0, width: 1440, height: 900 } })
await browser.close()
console.log(outFile)
