// Optional browser regression audit. Uses Playwright from PLAYWRIGHT_MODULE or the
// normal module resolution path; keeps generated screenshots outside the project.
import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { readFileSync, mkdirSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright")
const base = process.env.PUNO_BASE_URL || "http://127.0.0.1:5173"
const content = JSON.parse(readFileSync(new URL("../src/puno-content.json", import.meta.url), "utf8"))
const out = path.join(tmpdir(), "museos-puno-browser")
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" })
const errors = []
page.on("pageerror", e => errors.push(e.message))
const checks = []
async function check(name, action) {
  await action()
  checks.push(name)
  console.log("PASS", name)
}
async function province(id) {
  await page.getByRole("combobox", { name: "Provincia de Puno", exact: true }).selectOption(id)
  await page.waitForFunction(id => new URL(location.href).searchParams.get("provincia") === id, id)
}
async function noOverflow() {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
}
async function imagesLoaded() {
  await page.waitForFunction(() => [...document.querySelectorAll(".puno-photo-pair img")].every(i => i.complete && i.naturalWidth > 0))
}
try {
  await check("13 provincias, listas sin fotos y estados de Moho/Yunguyo", async () => {
    await page.goto(base + "/?seccion=puno")
    await page.locator(".puno-map").waitFor()
    await page.locator('.puno-terrain[data-map-status="ready"]').waitFor({ timeout: 30000 })
    assert.equal(await page.locator(".puno-terrain-label").count(), 13)
    for (const p of content.provinces) {
      await province(p.id)
      await page.getByRole("heading", { name: p.name, exact: true }).waitFor()
      const expected = content.places.filter(place => place.provinceId === p.id).length
      assert.equal(await page.locator(".puno-place-list li").count(), expected)
      assert.equal(await page.locator(".puno-place-list img").count(), 0)
      if (!expected) assert.match(await page.locator(".puno-empty").innerText(), /material inicial/)
    }
  })
  await check("Selección real con ratón y teclado en el mapa de terreno", async () => {
    const marker = await page.locator("#puno-province-2108").boundingBox()
    await page.mouse.click(marker.x + marker.width / 2, marker.y + marker.height + 8)
    await page.getByRole("heading", { name: "Melgar", exact: true }).waitFor()
    assert.equal(await page.locator("#puno-province-2108").getAttribute("aria-pressed"), "true")
    await page.locator("#puno-province-2101").focus()
    await page.keyboard.press("Enter")
    await page.getByRole("heading", { name: "Puno", exact: true }).waitFor()
    await page.locator("#puno-province-2108").focus()
    await page.keyboard.press("Space")
    await page.getByRole("heading", { name: "Melgar", exact: true }).waitFor()
    await page.screenshot({ path: path.join(out, "map-desktop.png"), fullPage: true })
  })
  await check("Tinajani: fotos, diálogo, Escape y foco contenido/restaurado", async () => {
    await page.getByRole("link", { name: "Ver lugar: Cañón de Tinajani", exact: true }).click()
    await imagesLoaded()
    assert.equal(await page.locator(".puno-photo-pair img").count(), 2)
    const enlarge = page.getByRole("button", { name: /^Ampliar foto 1:/ })
    await enlarge.click()
    await page.getByRole("dialog").waitFor()
    for (let i = 0; i < 7; i++) {
      await page.keyboard.press("Tab")
      assert.equal(await page.evaluate(() => Boolean(document.activeElement.closest("dialog"))), true)
    }
    await page.locator("dialog summary").click()
    for (let i = 0; i < 9; i++) {
      await page.keyboard.press(i % 2 ? "Shift+Tab" : "Tab")
      assert.equal(await page.evaluate(() => Boolean(document.activeElement.closest("dialog"))), true)
    }
    await page.keyboard.press("Escape")
    assert.equal(await page.locator("dialog[open]").count(), 0)
    assert.equal(await enlarge.evaluate(e => e === document.activeElement), true)
    await page.screenshot({ path: path.join(out, "tinajani-desktop.png"), fullPage: true })
  })
  await check("Recarga de ficha y Volver conservan provincia, posición y foco", async () => {
    await page.reload()
    await imagesLoaded()
    await page.getByRole("link", { name: /^Volver a la provincia/ }).click()
    await page.locator(".puno-map").waitFor()
    await page.locator('.puno-terrain[data-map-status="ready"]').waitFor({ timeout: 30000 })
    const open = page.locator("#puno-open-tinajani")
    await open.focus()
    await open.scrollIntoViewIfNeeded()
    await page.evaluate(() => window.scrollTo({ top: 450, behavior: "instant" }))
    const before = await page.evaluate(() => scrollY)
    await open.press("Enter")
    await imagesLoaded()
    await page.getByRole("link", { name: /^Volver a la provincia/ }).click()
    await page.waitForFunction(y => Math.abs(scrollY - y) < 4, before)
    assert.equal(await open.evaluate(e => e === document.activeElement), true)
    assert.equal(await page.getByRole("combobox", { name: "Provincia de Puno" }).inputValue(), "2108")
    await page.reload()
    await page.locator(".puno-map").waitFor()
    await page.waitForFunction(y => Math.abs(scrollY - y) < 4, before)
  })
  await check("Atrás/Adelante entre provincia y ficha", async () => {
    await page.locator("#puno-open-tinajani").click()
    await imagesLoaded()
    await page.goBack()
    await page.locator(".puno-map").waitFor()
    await page.goForward()
    await page.getByRole("heading", { name: "Cañón de Tinajani", exact: true }).waitFor()
    await page.goBack()
    await province("2101")
    await page.getByRole("link", { name: "Ver lugar: Sitio arqueológico Inka Uyu", exact: true }).click()
    await imagesLoaded()
    assert.equal(await page.locator(".puno-photo-pair img").count(), 2)
    const inka = content.places.find(p => p.id === "inka-uyu")
    assert.deepEqual(await page.locator(".puno-photo-caption").allTextContents(), inka.photos.map(p => p.alt))
    await page.getByRole("button", { name: /^Ampliar foto 2:/ }).click()
    await page.getByRole("dialog").waitFor()
    await page.getByRole("button", { name: "Cerrar fotografía", exact: true }).click()
  })
  await check("Las 32 fichas públicas abren por URL, incluido el osario", async () => {
    for (const place of content.places) {
      await page.goto(base + "/?seccion=puno&provincia=" + place.provinceId + "&lugar=" + place.id)
      await page.getByRole("heading", { name: place.name, exact: true }).waitFor()
      assert.equal(await page.locator(".puno-photo-pair img").count(), place.photos.length)
      if (!place.photos.length) assert.match(await page.locator(".puno-photo-pending").innerText(), /pendientes/)
    }
    await page.goto(base + "/?seccion=puno&lugar=catacumbas-lampa")
    await page.getByRole("heading", { name: "Capilla de La Piedad y osario del templo Santiago Apóstol", exact: true }).waitFor()
  })
  await check("Vista móvil: menú, selección, ficha y ampliación sin desbordamiento", async () => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(base + "/?seccion=puno&provincia=2108")
    await page.locator(".puno-map").waitFor()
    await noOverflow()
    await page.screenshot({ path: path.join(out, "map-mobile.png"), fullPage: true })
    await page.getByRole("button", { name: "Abrir menú", exact: true }).click()
    await page.getByRole("navigation", { name: "Navegación principal" }).getByRole("link", { name: "Explora Puno", exact: true }).click()
    await province("2108")
    await page.locator("#puno-open-tinajani").click()
    await imagesLoaded()
    await noOverflow()
    const boxes = await page.locator(".puno-photo-pair figure").evaluateAll(items => items.map(i => { const r = i.getBoundingClientRect(); return { top: r.top, bottom: r.bottom } }))
    assert.ok(boxes[1].top > boxes[0].bottom)
    await page.screenshot({ path: path.join(out, "tinajani-mobile.png"), fullPage: true })
    await page.getByRole("button", { name: /^Ampliar foto 1:/ }).click()
    await page.getByRole("dialog").waitFor()
    await noOverflow()
    await page.keyboard.press("Escape")
    await page.getByRole("link", { name: /^Volver a la provincia/ }).click()
    await page.waitForFunction(() => document.activeElement?.id === "puno-open-tinajani")
    await page.setViewportSize({ width: 320, height: 740 })
    await noOverflow()
  })
  await check("Si falla una foto se muestra un mensaje, sin imagen rota", async () => {
    await page.route("**/images/puno/**", route => route.abort())
    await page.goto(base + "/?seccion=puno&provincia=2108&lugar=tinajani")
    await page.waitForFunction(() => document.querySelectorAll(".puno-photo-pending").length === 2)
    assert.equal(await page.locator(".puno-photo-pair img").count(), 0)
    await page.unroute("**/images/puno/**")
  })
  await check("Regresión nacional: catálogo, filtros, URL, fichas y retorno desde Puno", async () => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto(base + "/?vista=directorio&region=Puno#explorar")
    await page.locator(".directory").waitFor()
    const before = await page.locator(".museum-card").count()
    assert.ok(before > 0)
    await page.getByRole("navigation", { name: "Navegación principal" }).getByRole("link", { name: "Explora Puno", exact: true }).click()
    await province("2108")
    assert.equal(new URL(page.url()).searchParams.get("region"), "Puno")
    await page.getByRole("navigation", { name: "Navegación principal" }).getByRole("link", { name: "Museos", exact: true }).click()
    await page.locator(".directory").waitFor()
    assert.equal(await page.locator(".museum-card").count(), before)
    assert.equal(await page.getByRole("combobox", { name: "Filtrar por región", exact: true }).inputValue(), "Puno")
    const card = page.locator(".museum-card").first()
    await card.getByRole("button").first().click()
    await page.locator("dialog.museum-dialog[open]").waitFor()
    await page.keyboard.press("Escape")
    assert.equal(await page.locator("dialog[open]").count(), 0)
    await page.getByRole("searchbox").fill("zzzzsincoincidencias")
    await page.getByRole("button", { name: "Buscar", exact: true }).click()
    assert.match(await page.locator("#resultados").innerText(), /No encontramos/)
  })
  await check("Mapa nacional: carga o recuperación accesible y selector conservados", async () => {
    await page.goto(base + "/#explorar")
    await page.waitForFunction(() => document.querySelector(".atlas-canvas.is-ready") || document.querySelector(".map-unavailable"), null, { timeout: 30000 })
    const ready = await page.locator(".atlas-canvas.is-ready").count()
    if (ready) {
      await page.getByRole("button", { name: "Plano", exact: true }).click()
      assert.equal(await page.getByRole("button", { name: "Plano", exact: true }).getAttribute("aria-pressed"), "true")
      await page.getByRole("button", { name: "Relieve 3D", exact: true }).click()
      await page.screenshot({ path: path.join(out, "national-map.png"), fullPage: false })
      await page.getByRole("navigation", { name: "Navegación principal" }).getByRole("link", { name: "Explora Puno", exact: true }).click()
      await page.locator(".puno-map").waitFor()
      await page.getByRole("navigation", { name: "Navegación principal" }).getByRole("link", { name: "Explorar el mapa", exact: true }).click()
      await page.locator(".atlas-canvas.is-ready").waitFor()
      const size = await page.locator(".atlas-canvas.is-ready canvas").boundingBox()
      assert.ok(size.width > 100 && size.height > 100)
      assert.equal(await page.getByRole("button", { name: "Relieve 3D", exact: true }).getAttribute("aria-pressed"), "true")
    } else {
      await page.getByRole("button", { name: /Callao/ }).click()
      assert.equal(await page.getByRole("combobox", { name: "Filtrar por región", exact: true }).inputValue(), "Callao")
    }
    console.log("NATIONAL_MAP", ready ? "ready" : "accessible-recovery")
  })
  assert.deepEqual(errors, [])
  writeFileSync(path.join(out, "result.json"), JSON.stringify({ base, checks, errors, screenshots: out }, null, 2))
  console.log("BROWSER_AUDIT", checks.length, "checks; screenshots:", out)
} finally { await browser.close() }
