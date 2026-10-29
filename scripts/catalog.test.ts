import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, existsSync } from "node:fs"
import { museums, departments } from "../src/data.ts"
import { filterMuseums, initialFilters, mapsUrl } from "../src/catalog.ts"

test("El catálogo conserva sus 66 registros y los 25 territorios", () => {
  assert.equal(museums.length, 66)
  assert.equal(new Set(museums.map((m) => m.id)).size, 66)
  assert.deepEqual(
    [...new Set(museums.map((m) => m.department))].sort(),
    [...departments].sort(),
  )
})
test("Buscar chavin y CHAVÍN produce el mismo museo", () => {
  const search = (q: string) =>
    filterMuseums(museums, { ...initialFilters, search: q })
  assert.deepEqual(
    search("chavin").map((m) => m.id),
    search(" CHAVÍN ").map((m) => m.id),
  )
  assert.equal(search("chavin")[0].name, "Museo Nacional Chavín")
})
test("Región, búsqueda y recorrido virtual se combinan sin perder filtros", () => {
  const result = filterMuseums(museums, {
    ...initialFilters,
    department: "Puno",
    search: "pukara",
    virtual: true,
  })
  assert.equal(result.length, 1)
  assert.equal(result[0].name, "Museo Lítico de Pukara")
  assert.equal(
    filterMuseums(museums, {
      ...initialFilters,
      department: "Callao",
      search: "pukara",
    }).length,
    0,
  )
  assert.equal(
    filterMuseums(museums, {
      ...initialFilters,
      department: "Puno",
      type: "Templo museo",
    }).length,
    2,
  )
})
test("Orden descendente e inicial no mutan el catálogo", () => {
  const before = museums.map((m) => m.id)
  const az = filterMuseums(museums, initialFilters).map((m) => m.id)
  assert.deepEqual(
    filterMuseums(museums, { ...initialFilters, sort: "za" }).map((m) => m.id),
    az.toReversed(),
  )
  assert.deepEqual(
    museums.map((m) => m.id),
    before,
  )
})
test("Maps recibe nombre y dirección íntegros con caracteres españoles", () => {
  const m = museums.find((m) => m.name === "Museo Lítico de Pukara")!
  const url = new URL(mapsUrl(m))
  assert.equal(
    url.searchParams.get("query"),
    `${m.name}, ${m.address}, ${m.department}, Perú`,
  )
})
test("Cada territorio del selector tiene geometría local válida, incluido Callao", () => {
  const g = JSON.parse(
    readFileSync("public/maps/peru-departments.geojson", "utf8"),
  )
  assert.equal(g.features.length, 25)
  assert.deepEqual(
    g.features.map((f: any) => f.properties.name).sort(),
    [...departments].sort(),
  )
  for (const f of g.features) {
    const coords = f.geometry.coordinates.flat(
      f.geometry.type === "MultiPolygon" ? 2 : 1,
    )
    assert.ok(coords.length > 3)
    assert.ok(
      coords.every(
        (p: number[]) => p[0] >= -82 && p[0] <= -68 && p[1] >= -19 && p[1] <= 1,
      ),
    )
  }
})
test("Los 66 museos tienen foto local, crédito, derechos y procedencia", () => {
  const enriched = museums.filter((m) => m.image)
  assert.equal(enriched.length, 66)
  assert.equal(new Set(enriched.map((m) => m.image!.src)).size, 66)
  for (const m of enriched) {
    assert.ok(existsSync(`public${m.image!.src}`))
    assert.ok(m.image!.author)
    assert.ok(m.image!.alt)
    assert.equal(new URL(m.image!.source).protocol, "https:")
    const rights = new URL(m.image!.licenseUrl)
    if (m.image!.license.startsWith("CC ")) {
      assert.equal(rights.hostname, "creativecommons.org")
    } else {
      assert.equal(rights.hostname, "museos.cultura.pe")
      assert.match(m.image!.license, /Derechos reservados/)
      assert.match(new URL(m.image!.source).hash, /^#page=\d+$/)
    }
  }
  const described = museums.filter((m) => m.description)
  assert.equal(described.length, 66)
  assert.ok(described.every((m) => m.descriptionSource && m.verifiedAt))
})


test("Buscar admite varias palabras en cualquier orden, tildes y temas documentados", () => {
  const search = (q: string) => filterMuseums(museums, { ...initialFilters, search: q })
  assert.deepEqual(search("PUNO,   pukara").map(m => m.id), search("pukara puno").map(m => m.id))
  assert.equal(search("puno pukara")[0].name, "Museo Lítico de Pukara")
  assert.ok(search("textiles").length > 0)
  assert.equal(search("zxqnotfound").length, 0)
  assert.equal(search("   ").length, 66)
})

test("Las 66 fichas tienen destacados y procedencia; los recursos conservan tipo y fuente", () => {
  const audit = JSON.parse(readFileSync("public/resource-audit.json", "utf8"))
  assert.equal(audit.museums.length, 66)
  for (const m of museums) {
    assert.ok(m.highlights && m.highlights.length >= 2)
    assert.ok(m.themes && m.themes.length >= 2)
    assert.ok(m.descriptionSource)
    if (m.story) assert.ok(m.storySource)
    const resources = m.resources || []
    assert.equal(new Set(resources.map(r => r.url)).size, resources.length)
    assert.equal(m.virtualUrl, resources.find(r => r.kind === "tour")?.url)
    for (const r of resources) {
      assert.ok(["tour", "collection", "video", "audio", "guide"].includes(r.kind))
      assert.equal(new URL(r.url).protocol, "https:")
      assert.equal(new URL(r.source).protocol, "https:")
      assert.ok(r.title && r.checkedAt)
    }
  }
  assert.equal(filterMuseums(museums, { ...initialFilters, virtual: true }).length, 29)
})
