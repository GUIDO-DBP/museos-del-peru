import type { Museum, MuseumType } from "./data.ts"

export const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
export type Filters = {
  search: string
  department: string
  type: MuseumType | ""
  virtual: boolean
  sort: "az" | "za"
}
export const initialFilters: Filters = {
  search: "",
  department: "",
  type: "",
  virtual: false,
  sort: "az",
}
export function filterMuseums(museums: Museum[], filters: Filters) {
  const words = normalize(filters.search).split(/\s+/).filter(Boolean)
  return museums
    .filter(
      (m) =>
        (!filters.department || m.department === filters.department) &&
        (!filters.type || m.type === filters.type) &&
        (!filters.virtual || !!m.virtualUrl) &&
        words.every(word => normalize(`${m.name} ${m.city} ${m.department} ${m.type} ${(m.themes || []).join(" ")}`).includes(word)),
    )
    .sort(
      (a, b) =>
        (filters.sort === "az" ? 1 : -1) * a.name.localeCompare(b.name, "es"),
    )
}
export function mapsUrl(m: Museum) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${m.name}, ${m.address}, ${m.department}, Perú`)}`
}
