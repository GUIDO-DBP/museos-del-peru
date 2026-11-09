export interface PunoRoute {
  active: boolean
  provinceId: string
  placeId: string
  notFound: boolean
}

export function resolvePunoRoute(
  search: string,
  provinces: readonly { id: string }[],
  places: readonly { id: string; provinceId: string }[],
): PunoRoute {
  const params = new URLSearchParams(search)
  const provinceId = params.get("provincia") || ""
  const placeId = params.get("lugar") || ""
  const place = places.find(p => p.id === placeId)
  return {
    active: params.get("seccion") === "puno",
    provinceId: place?.provinceId || (provinces.some(p => p.id === provinceId) ? provinceId : ""),
    placeId: place?.id || "",
    notFound: Boolean((placeId && !place) || (provinceId && !provinces.some(p => p.id === provinceId))),
  }
}

// Retains museum filters and unrelated parameters while changing only the Puno route.
export function punoHref(href: string, provinceId = "", placeId = ""): string {
  const url = new URL(href, "https://museos.invalid")
  url.searchParams.set("seccion", "puno")
  for (const [key, value] of [["provincia", provinceId], ["lugar", placeId]]) {
    if (value) url.searchParams.set(key, value)
    else url.searchParams.delete(key)
  }
  url.hash = ""
  return url.pathname + url.search
}

export function nationalHref(href: string, anchor: string): string {
  const url = new URL(href, "https://museos.invalid")
  for (const key of ["seccion", "provincia", "lugar"]) url.searchParams.delete(key)
  url.hash = anchor
  return url.pathname + url.search + url.hash
}
