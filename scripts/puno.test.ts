import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, existsSync } from "node:fs"
import { nationalHref, punoHref, resolvePunoRoute } from "../src/puno-navigation.ts"

const content = JSON.parse(readFileSync(new URL("../src/puno-content.json", import.meta.url), "utf8"))
const geometry = JSON.parse(readFileSync(new URL("../public/maps/puno-provinces.geojson", import.meta.url), "utf8"))
type Place = { id: string; provinceId: string; description: string; sources: { url: string }[]; photos: { src: string; source: string; author: string; authorization: string; licenseUrl: string }[] }
const places: Place[] = content.places

test("Puno publica 32 fichas respaldadas y distingue el osario de las réplicas", () => {
  assert.equal(places.length, 32)
  assert.equal(new Set(places.map(p => p.id)).size, 32)
  assert.equal(places.filter(p => p.provinceId === "2107").length, 4)
  assert.equal(places.filter(p => p.id === "catacumbas-lampa").length, 1)
  for (const id of ["tres-tortugas", "catedral-tinajani", "tina-jany", "torre-qaqa", "hongo-tinajani"]) assert.ok(!places.some(p => p.id === id))
  assert.ok(places.every(p => p.description && p.sources.length && p.sources.every(s => s.url.startsWith("https://"))))
  assert.equal(places.filter(p => p.id === "cutimbo").length, 1)
  assert.equal(places.filter(p => p.id === "molloco").length, 1)
})

test("El mapa y el selector provincial conservan los 13 UBIGEO y las provincias sin material", () => {
  const ids = content.provinces.map((p: { id: string }) => p.id).sort()
  assert.deepEqual(ids, Array.from({ length: 13 }, (_, i) => String(2101 + i)))
  assert.deepEqual(geometry.features.map((p: { properties: { id: string } }) => p.properties.id).sort(), ids)
  assert.ok(geometry.features.every((p: { properties: { label: number[] }; geometry: { type: string } }) => ["Polygon", "MultiPolygon"].includes(p.geometry.type) && p.properties.label.length === 2))
  assert.ok(places.every(p => ids.includes(p.provinceId)))
  assert.deepEqual(content.provinces.filter((p: { id: string }) => !places.some(m => m.provinceId === p.id)).map((p: { name: string }) => p.name).sort(), ["Moho", "Yunguyo"])
})

test("Las 32 galerías publican sus dos tomas aprobadas con estados reales de autorización", () => {
  assert.equal(places.filter(p => p.photos.length === 2).length, 32)
  for (const p of places) {
    assert.ok(p.photos.length <= 2)
    for (const image of p.photos) {
      assert.ok(["licensed", "pending"].includes(image.authorization))
      assert.ok(image.source)
      if (image.authorization === "licensed") assert.ok(image.author && image.licenseUrl)
      else assert.equal(image.licenseUrl, null)
      assert.ok(existsSync(new URL("../public" + image.src, import.meta.url)))
      assert.ok(!image.src.includes("documentacion"))
    }
    assert.equal(new Set(p.photos.map(image => image.src)).size, p.photos.length)
  }
})

test("Se conservan las exclusiones de identidad y la selección exacta de Cancha Cancha", () => {
  const excluded = new Set(["PDF-032", "PDF-037", "PDF-052", "PDF-073", "PDF-077", "PDF-078", "PDF-079", "FLI-001"])
  const photos = content.places.flatMap((p: {photos:{id:string}[]}) => p.photos)
  assert.ok(photos.every((p: {id:string}) => !excluded.has(p.id)))
  assert.deepEqual(content.places.find((p: {id:string}) => p.id === "cancha-cancha").photos.map((p: {id:string}) => p.id), ["AZT-001", "AZT-002"])
  assert.deepEqual(content.places.find((p: {id:string}) => p.id === "tinajani").photos.map((p: {id:string}) => p.id), ["PDF-019", "ALT-002"])
})

test("Las rutas Puno conservan filtros nacionales y codifican provincia y lugar", () => {
  const href = punoHref("https://example.test/?q=chav%C3%ADn&region=Puno&vista=directorio#explorar", "2108", "tinajani")
  const url = new URL(href, "https://example.test")
  assert.equal(url.searchParams.get("q"), "chavín")
  assert.equal(url.searchParams.get("vista"), "directorio")
  assert.equal(url.hash, "")
  const route = resolvePunoRoute(url.search, content.provinces, places)
  assert.deepEqual(route, { active: true, provinceId: "2108", placeId: "tinajani", notFound: false })
  assert.equal(new URL(punoHref(href, "2108"), url).searchParams.has("lugar"), false)
  const national = new URL(nationalHref(href, "explorar"), url)
  assert.equal(national.searchParams.has("seccion"), false)
  assert.equal(national.searchParams.has("lugar"), false)
  assert.equal(national.searchParams.get("region"), "Puno")
  assert.equal(national.hash, "#explorar")
})

test("Una URL directa resuelve la provincia real y rechaza contenido no publicado", () => {
  assert.equal(resolvePunoRoute("?seccion=puno&lugar=inka-uyu", content.provinces, places).provinceId, "2101")
  assert.equal(resolvePunoRoute("?seccion=puno&lugar=catacumbas-lampa", content.provinces, places).provinceId, "2107")
  assert.equal(resolvePunoRoute("?seccion=puno&provincia=9999", content.provinces, places).notFound, true)
})
