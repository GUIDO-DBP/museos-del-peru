import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, existsSync } from "node:fs"
import { createHash } from "node:crypto"

const read = (file: string) => JSON.parse(readFileSync(new URL(file, import.meta.url), "utf8"))
const content = read("../src/puno-content.json")
const metadata = read("../public/puno-photo-evidence.json")
const reviewFile = new URL("../documentacion/puno/revision-local/galerias.json", import.meta.url)
const review = existsSync(reviewFile) ? JSON.parse(readFileSync(reviewFile, "utf8")) : null

test("Las 64 fotos publicadas conservan los 61 permisos pendientes, sin inventar licencias", () => {
  assert.equal(metadata.photos.length, 64)
  assert.equal(metadata.photos.filter((p: {authorization:string}) => p.authorization === "pending").length, 61)
  assert.match(metadata.publicationDecision, /no acredita autorización/)
  for (const place of content.places) for (const photo of place.photos) {
    const record = metadata.photos.find((p: {place:string;id:string}) => p.place === place.id && p.id === photo.id)
    assert.ok(record)
    for (const key of ["source", "author", "license", "licenseUrl", "authorization", "correspondence", "quality", "changes"])
      assert.equal(record[key], photo[key], `${place.id}/${photo.id}/${key}`)
    assert.match(record.webSha256, /^[a-f0-9]{64}$/)
    assert.equal(record.webSha256, createHash("sha256").update(readFileSync(new URL("../public" + photo.src, import.meta.url))).digest("hex"))
  }
})

test("La producción conserva exactamente la selección local aprobada y sus créditos", { skip: !review }, () => {
  for (const place of content.places) {
    const approved = review.photos[place.id]
    assert.deepEqual(place.photos.map((p: {id:string}) => p.id), approved.map((p: {id:string}) => p.id))
    for (const [i, photo] of place.photos.entries()) {
      const original = approved[i]
      for (const key of ["alt", "author", "creditText", "creditInstitution", "source", "license", "licenseUrl", "authorization", "width", "height"])
        assert.equal(photo[key], original[key], `${place.id}/${photo.id}/${key}`)
      assert.equal(photo.src.split("/").at(-1), original.src.split("/").at(-1))
    }
  }
})

test("Las 32 descripciones conservan fuentes y dos párrafos con límites de extensión", () => {
  const draftsFile = new URL("../documentacion/puno/revision-local/descripciones.json", import.meta.url)
  const drafts = existsSync(draftsFile) ? JSON.parse(readFileSync(draftsFile, "utf8")) : null
  assert.equal(content.places.length, 32)
  for (const place of content.places) {
    if (drafts) assert.equal(place.description, drafts[place.id].paragraphs.join("\n\n"))
    assert.equal(place.description.split("\n\n").length, 2)
    assert.ok(place.sources.length)
    assert.ok(place.description.split(/\s+/).length <= 160)
  }
})
