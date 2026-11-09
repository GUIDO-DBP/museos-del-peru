import content from "./puno-content.json"

export const punoProvinces = content.provinces
export type PunoPhoto = {
  id: string; src: string; srcSet: string; width: number; height: number; alt: string
  author: string | null; source: string; license: string | null; licenseUrl: string | null; changes: string
  correspondence: string; quality: string; authorization: "licensed" | "pending"
  provenance?: string; sourceLabel?: string; reviewOnly?: boolean
  creditInstitution?: string
  creditText?: string
  publicationLicense?: { name: string; url: string }
}
export type PunoPlace = Omit<(typeof content.places)[number], "photos"> & { photos: PunoPhoto[] }
// Development and production share the approved selection. Publication does not
// change authorization: pending records remain pending in the shipped metadata.
export const punoPlaces = content.places as PunoPlace[]
