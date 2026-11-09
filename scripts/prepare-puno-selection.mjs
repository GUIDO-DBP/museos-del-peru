// Optional editorial import. Build consumes only the committed src/public files.
// Publication is the owner's decision; authorization and licenses stay unchanged.
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from "node:fs"
import { createHash } from "node:crypto"
import path from "node:path"
import assert from "node:assert/strict"
const root = path.resolve(import.meta.dirname, "..")
const read = file => JSON.parse(readFileSync(path.join(root, file), "utf8"))
const write = (file, value) => writeFileSync(path.join(root, file), JSON.stringify(value, null, 2) + "\n")
const content = read("src/puno-content.json")
const selected = read("documentacion/puno/revision-local/galerias.json").photos
const evidence = read("documentacion/puno/revision-local/evidencia-fotografica.json").photos
const metadata = []
const destination = path.join(root, "public/images/puno")
mkdirSync(destination, { recursive: true })
function resource(url) {
  if (url.startsWith("/images/puno/")) return url
  assert.match(url, /^\/__revision-puno\/[a-z0-9-]+\.webp$/)
  const filename = path.basename(url)
  const source = path.join(root, "documentacion/puno/revision-local/recursos", filename)
  const target = path.join(destination, filename)
  if (existsSync(target)) assert.deepEqual(readFileSync(target), readFileSync(source))
  else copyFileSync(source, target)
  return "/images/puno/" + filename
}
for (const place of content.places) {
  const photos = selected[place.id]
  assert.equal(photos.length, 2, place.id)
  place.photos = photos.map(original => {
    const { reviewOnly: _reviewOnly, ...photo } = original
    photo.src = resource(original.src)
    photo.srcSet = original.srcSet.split(", ").map(part => {
      const [url, width] = part.split(" ")
      return `${resource(url)} ${width}`
    }).join(", ")
    const record = evidence.find(e => e.place === place.id && e.id === photo.id)
    metadata.push({
      place: place.id, id: photo.id, source: photo.source, author: photo.author,
      license: photo.license, licenseUrl: photo.licenseUrl,
      authorization: photo.authorization, correspondence: photo.correspondence,
      quality: photo.quality, provenance: photo.provenance ?? record?.procedencia,
      identificationEvidence: record?.evidencia_correspondencia,
      authorizationRecord: record?.autorizacion,
      originalSha256: record?.sha256,
      webSha256: createHash("sha256").update(readFileSync(path.join(root, "public", photo.src))).digest("hex"),
      changes: photo.changes,
    })
    return photo
  })
}
assert.equal(content.places.length, 32)
assert.equal(metadata.length, 64)
assert.equal(metadata.filter(p => p.authorization === "pending").length, 61)
write("src/puno-content.json", content)
write("public/puno-photo-evidence.json", {
  publicationDecision: "Selección publicada por decisión expresa del responsable del sitio. Esta decisión no acredita autorización de los autores ni modifica las licencias registradas.",
  photos: metadata,
})
console.log("Imported 32 approved galleries / 64 photographs; 61 authorizations remain pending.")
