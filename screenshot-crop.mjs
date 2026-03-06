import puppeteer from 'puppeteer'
import fs        from 'fs'
import path      from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const [,,url,x,y,w,h,label] = process.argv
const clip = { x: Number(x||0), y: Number(y||0), width: Number(w||600), height: Number(h||200) }

const dir = path.join(__dirname, 'temporary screenshots')
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
let n = 1
while (fs.existsSync(path.join(dir, `crop-${n}${label?'-'+label:''}.png`))) n++
const outFile = path.join(dir, `crop-${n}${label?'-'+label:''}.png`)

const browser = await puppeteer.launch({ headless: true })
const page    = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 3 })
await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 })
await new Promise(r => setTimeout(r, 600))
await page.screenshot({ path: outFile, clip })
await browser.close()
console.log(outFile)
