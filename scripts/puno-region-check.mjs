// Real-browser camera and layout checks; dependencies and diagnostic access stay in QA.
import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { tmpdir } from "node:os"
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright")
const base = process.env.PUNO_BASE_URL || "http://127.0.0.1:5173"
const out = process.env.PUNO_CAPTURE_DIR || path.join(tmpdir(), "museos-puno-region")
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" })
const errors = [], measurements = []
page.on("pageerror", e => errors.push(e.message))
async function ready() {
  await page.locator('.puno-terrain[data-map-status="ready"]').waitFor({ timeout: 30000 })
  await page.locator('.puno-terrain-canvas[data-idle="true"]').waitFor({ timeout: 30000 })
  // Read the existing ref through React only in this audit; no production globals.
  await page.evaluate(() => {
    const host = document.querySelector(".puno-terrain-canvas")
    let fiber = host[Object.keys(host).find(k => k.startsWith("__reactFiber"))]
    while (fiber) {
      for (let hook = fiber.memoizedState; hook; hook = hook.next) {
        if (typeof hook.memoizedState?.current?.getZoom === "function") {
          window.auditPunoMap = hook.memoizedState.current
          return
        }
      }
      fiber = fiber.return
    }
    throw new Error("Map ref unavailable")
  })
}
async function fullRegion() {
  return page.evaluate(async () => {
    const map = window.auditPunoMap, box = map.getContainer().getBoundingClientRect()
    const data = await (await fetch("/maps/puno-provinces.geojson")).json()
    const vertices = data.features.flatMap(f => f.geometry.coordinates.flat(f.geometry.type === "Polygon" ? 1 : 2))
    const pixels = vertices.map(p => map.project(p))
    return { zoom: map.getZoom(), minZoom: map.getMinZoom(), center: map.getCenter().toArray(), width: box.width, height: box.height,
      margins: [Math.min(...pixels.map(p => p.x)), Math.min(...pixels.map(p => p.y)),
        box.width - Math.max(...pixels.map(p => p.x)), box.height - Math.max(...pixels.map(p => p.y))] }
  })
}
try {
  await page.goto(base + "/?seccion=puno&provincia=2101")
  await ready()
  for (const [name, width, height] of [["escritorio", 1440, 1000], ["portatil", 1024, 900], ["movil", 390, 844], ["estrecho", 320, 740], ["regreso-escritorio", 1440, 1000]]) {
    await page.setViewportSize({ width, height })
    await page.waitForFunction(() => { const m = window.auditPunoMap; return m.getCanvas().clientWidth === m.getContainer().clientWidth })
    await page.waitForTimeout(300)
    const frame = await fullRegion()
    assert.ok(frame.margins.every(v => v >= 39), name + " cropped region: " + JSON.stringify(frame))
    assert.ok(Math.abs(frame.zoom - frame.minZoom) < 1e-7)
    const layout = await page.locator(".puno-explorer-layout").evaluate(e => {
      const map = e.querySelector(".puno-map").getBoundingClientRect(), panel = e.querySelector(".puno-province-panel").getBoundingClientRect()
      return { ratio: map.width / (map.width + panel.width), stacked: panel.top >= map.bottom - 1,
        overflow: document.documentElement.scrollWidth > innerWidth }
    })
    if (width > 760) assert.ok(Math.abs(layout.ratio - .7) < .001)
    else assert.ok(layout.stacked)
    assert.equal(layout.overflow, false)
    // Extreme API requests exercise the same transform constraint as gestures.
    await page.evaluate(() => { const m = window.auditPunoMap; m.jumpTo({ center: [-77, -4], zoom: 1 }) })
    const limited = await fullRegion()
    assert.ok(Math.abs(limited.zoom - frame.minZoom) < 1e-7)
    assert.ok(limited.margins.every(v => v >= 39))
    const reach = await page.evaluate(async () => {
      const m = window.auditPunoMap, box = m.getContainer().getBoundingClientRect()
      const data = await (await fetch("/maps/puno-provinces.geojson")).json()
      const points = data.features.flatMap(f => {
        const rings = f.geometry.coordinates.flat(f.geometry.type === "Polygon" ? 0 : 1)
        return [f.properties.label, ...rings.flatMap(r => r.filter((_, i) => i % 25 === 0))]
      })
      let failed = 0
      for (const zoom of [m.getMinZoom() + 1, 10, 14]) for (const point of points) {
        m.jumpTo({ center: point, zoom })
        const p = m.project(point)
        if (p.x < 39 || p.y < 39 || p.x > box.width - 39 || p.y > box.height - 39) failed++
      }
      // Center cannot escape the regional envelope even at detailed zoom.
      m.jumpTo({ center: [-80, 0], zoom: 10 })
      const extreme = m.getCenter().toArray()
      return { samples: points.length * 3, failed, extreme }
    })
    assert.equal(reach.failed, 0, name + " inaccessible provincial geometry")
    assert.ok(reach.extreme[0] > -72 && reach.extreme[1] < -13)
    await page.getByRole("button", { name: "Puno completo", exact: true }).click()
    const reset = await fullRegion()
    assert.ok(reset.margins.every(v => v >= 39))
    const marker = page.locator("#puno-province-2108")
    await marker.focus(); await page.keyboard.press("Enter")
    await page.waitForURL(/provincia=2108/)
    for (let id = 2101; id <= 2113; id++) {
      await page.getByRole("combobox", { name: "Provincia de Puno", exact: true }).selectOption(String(id))
      assert.equal(await page.locator(`#puno-province-${id}`).getAttribute("aria-pressed"), "true")
      const fits = await page.locator(".puno-place-list li").evaluateAll(rows => rows.every(row => {
        const box = row.getBoundingClientRect()
        return [...row.querySelectorAll("h3, .text-link")].every(e => {
          const r = e.getBoundingClientRect()
          return r.left >= box.left - 1 && r.right <= box.right + 1 && e.scrollWidth <= e.clientWidth + 1
        })
      }))
      assert.ok(fits, name + " place name/button overflow in " + id)
    }
    await page.getByRole("combobox", { name: "Provincia de Puno", exact: true }).selectOption("2101")
    const summary = page.locator(".puno-map-info summary")
    await summary.focus(); await page.keyboard.press("Enter")
    assert.equal(await page.locator(".puno-map-info").getAttribute("open"), "")
    assert.ok(await page.locator('.puno-map-info a[href*="odbl"]').isVisible())
    await page.keyboard.press("Enter")
    for (const a of await page.locator(".puno-map-attribution a").all()) assert.ok(await a.isVisible())
    // Capture from the page origin after keyboard testing, so sticky headers and
    // focus-only skip links do not appear in the middle of a full-page image.
    await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0) })
    await page.waitForTimeout(150)
    if (["escritorio", "movil"].includes(name)) await page.screenshot({ path: path.join(out, `mapa-panel-${name}.png`), fullPage: true })
    measurements.push({ name, frame, layout, reach })
    console.log("PASS", name, "ratio", layout.ratio, "camera samples", reach.samples)
  }
  // Pointer pan at maximum zoom-out cannot displace the regional frame.
  await page.locator(".puno-terrain").scrollIntoViewIfNeeded()
  const canvas = await page.locator(".puno-terrain canvas").boundingBox()
  const before = await fullRegion()
  await page.mouse.move(canvas.x + canvas.width / 2, canvas.y + canvas.height / 2)
  await page.mouse.down(); await page.mouse.move(canvas.x + canvas.width - 20, canvas.y + 30, { steps: 15 }); await page.mouse.up()
  await page.waitForTimeout(400)
  const after = await fullRegion()
  assert.ok(Math.abs(after.center[0] - before.center[0]) < 1e-6 && Math.abs(after.center[1] - before.center[1]) < 1e-6)
  await page.getByRole("button", { name: "Acercar", exact: true }).click()
  await page.waitForTimeout(400)
  assert.ok((await fullRegion()).zoom > before.zoom + .8)
  await page.getByRole("button", { name: "Puno completo", exact: true }).click()
  assert.ok(await page.getByRole("button", { name: "Alejar", exact: true }).isDisabled())
  for (const place of ["tinajani", "inka-uyu"]) for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 })
    await page.goto(base + "/?seccion=puno&provincia=" + (place === "tinajani" ? "2108" : "2101") + "&lugar=" + place)
    await page.locator(".puno-about").waitFor()
    const card = await page.locator(".puno-about").evaluate(e => {
      const b = e.getBoundingClientRect(), parent = e.parentElement.getBoundingClientRect(), style = getComputedStyle(e)
      return { width: b.width, offset: b.x + b.width / 2 - parent.x - parent.width / 2,
        background: style.backgroundColor, titleAlign: getComputedStyle(e.querySelector("h2")).textAlign }
    })
    assert.ok(card.width <= 900 && Math.abs(card.offset) < 1)
    assert.equal(card.background, "rgb(255, 255, 255)")
    assert.equal(card.titleAlign, "center")
    await page.waitForFunction(() => [...document.querySelectorAll(".puno-enlarge img")].every(i => i.complete && i.naturalWidth))
    await page.screenshot({ path: path.join(out, `ficha-${place}-${width === 1440 ? "escritorio" : "movil"}.png`), fullPage: true })
    measurements.push({ name: "description-" + place + "-" + width, card })
  }
  assert.deepEqual(errors, [])
  writeFileSync(path.join(out, "mediciones.json"), JSON.stringify({ base, browser: await browser.version(), measurements, errors }, null, 2))
} finally { await browser.close() }
