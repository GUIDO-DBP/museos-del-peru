// Optional real-browser regression: npm build/preview first, then run with an
// installed Playwright supplied through PLAYWRIGHT_MODULE. No private files used.
import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright")
const content = JSON.parse(readFileSync(new URL("../src/puno-content.json", import.meta.url), "utf8"))
const base = process.env.PUNO_BASE_URL || "http://127.0.0.1:4173"
const out = process.env.PUNO_CAPTURE_DIR || path.join(tmpdir(), "museos-puno-selection")
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) })
const page = await browser.newPage({ reducedMotion: "reduce" })
const errors = [], cases = [], requests = []
page.on("pageerror", e => errors.push(e.message))
page.on("request", r => requests.push(r.url()))
try {
  for (const [device, width, height] of [["escritorio", 1440, 1000], ["movil", 390, 844]]) {
    await page.setViewportSize({ width, height })
    for (const place of content.places) {
      await page.goto(`${base}/?seccion=puno&provincia=${place.provinceId}&lugar=${place.id}`)
      await page.getByRole("heading", { name: place.name, exact: true }).waitFor()
      assert.equal(await page.locator(".puno-enlarge").count(), 2, place.id)
      const photos = []
      for (const [i, photo] of place.photos.entries()) {
        const button = page.locator(".puno-enlarge").nth(i)
        await button.scrollIntoViewIfNeeded()
        await page.waitForFunction(i => { const im = document.querySelectorAll(".puno-enlarge img")[i]; return im?.complete && im.naturalWidth > 0 }, i)
        const image = await button.locator("img").evaluate(async im => {
          const b = im.getBoundingClientRect(), bitmap = await createImageBitmap(await (await fetch(im.currentSrc)).blob())
          const result = { width: b.width, height: b.height, nativeWidth: bitmap.width, nativeHeight: bitmap.height, src: im.currentSrc, alt: im.alt }
          bitmap.close(); return result
        })
        assert.equal(image.alt, photo.alt)
        const allowed = photo.srcSet.split(", ").map(s => new URL(s.split(" ")[0], base).href)
        assert.ok(allowed.includes(image.src), `${place.id}: selection changed`)
        assert.ok(image.width <= photo.width + 1)
        assert.ok(Math.abs(image.width / image.height - image.nativeWidth / image.nativeHeight) < .006)
        const caption = await page.locator(".puno-photo-pair figcaption").nth(i).innerText()
        assert.ok(!/PDF-\d+|Autoría por documentar|Publicación pendiente|Fuente de contraste/.test(caption))
        if (photo.creditText) assert.ok(caption.includes(photo.creditText))
        await button.click()
        await page.getByRole("dialog").waitFor()
        await page.waitForFunction(() => { const im = document.querySelector(".puno-photo-dialog > img"); return im?.complete && im.naturalWidth > 0 })
        const viewer = await page.locator(".puno-photo-dialog > img").evaluate(im => { const b = im.getBoundingClientRect(); return { dx: b.x + b.width / 2 - innerWidth / 2, dy: b.y + b.height / 2 - innerHeight / 2, inside: b.x >= 0 && b.y >= 0 && b.right <= innerWidth && b.bottom <= innerHeight, src: im.getAttribute("src") } })
        assert.equal(viewer.src, photo.src)
        assert.ok(Math.abs(viewer.dx) < 1 && Math.abs(viewer.dy) < 1 && viewer.inside)
        assert.equal(await page.evaluate(() => document.body.style.overflow), "hidden")
        for (let j = 0; j < 8; j++) {
          await page.keyboard.press("Tab")
          assert.ok(await page.evaluate(() => document.activeElement.closest("dialog")))
        }
        if (place.id === "cancha-cancha") await page.screenshot({ path: path.join(out, `visor-cancha-${i + 1}-${device}.png`) })
        await page.keyboard.press("Escape")
        assert.equal(await button.evaluate(e => e === document.activeElement), true)
        assert.notEqual(await page.evaluate(() => document.body.style.overflow), "hidden")
        photos.push({ id: photo.id, ...image, viewer })
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
      if (["cancha-cancha", "qolo-qolo", "catacumbas-lampa", "tinajani"].includes(place.id)) {
        await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0) })
        await page.screenshot({ path: path.join(out, `ficha-${place.id}-${device}.png`), fullPage: true })
      }
      cases.push({ device, place: place.id, photos })
    }
    console.log("PASS", device, "32 galleries / 64 photographs / 64 centered viewers")
  }
  assert.ok(!requests.some(url => url.includes("/__revision-puno/")))
  assert.deepEqual(errors, [])
  writeFileSync(path.join(out, "mediciones.json"), JSON.stringify({ base, browser: await browser.version(), cases, errors }, null, 2))
} finally { await browser.close() }
