import { useEffect, useRef } from "react"
import type { PunoPhoto } from "../puno-data"
import { Icon } from "./Icon"

export function PunoPhotoCredit({ photo }: { photo: PunoPhoto }) {
  const originalArchive = photo.sourceLabel === "Procedencia MINCETUR"
  const author = photo.author?.replace(/\s*\((?:crédito|nota)[^)]*\)/g, "")
  const institution = photo.creditInstitution || (photo.author?.includes("crédito ANDINA") ? "ANDINA" : undefined)
  return <div className="puno-photo-credit">
    {author && <span>{photo.creditText ? <a href={photo.source} target="_blank" rel="noreferrer">{photo.creditText}</a> : <>Foto: <a href={photo.source} target="_blank" rel="noreferrer">{author}</a>{institution && ` / ${institution}`}</>}</span>}
    {!photo.author && originalArchive && <span>Archivo: <a href={photo.source} target="_blank" rel="noreferrer">MINCETUR</a></span>}
    {!photo.author && !originalArchive && photo.creditText && <span>Fuente: <a href={photo.source} target="_blank" rel="noreferrer">{photo.creditText}</a></span>}
    {photo.license && photo.licenseUrl && <span>{photo.author || originalArchive ? " · " : ""}<a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a></span>}
    <details className="puno-credit-details"><summary>Créditos</summary><div>
      <a href={photo.source} target="_blank" rel="noreferrer">{photo.author || originalArchive ? "Fuente y créditos" : "Referencia de identificación"}</a>
      {photo.publicationLicense && <span> · Licencia de la publicación: <a href={photo.publicationLicense.url} target="_blank" rel="noreferrer">{photo.publicationLicense.name}</a></span>}
      {photo.changes && <span> · {photo.changes}</span>}
    </div></details>
  </div>
}

export default function PunoPhotoDialog({ photo, onClose }: { photo: PunoPhoto; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current!
    const prior = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    element.showModal()
    document.body.style.overflow = "hidden"
    return () => {
      element.close()
      document.body.style.overflow = overflow
      prior?.focus({ preventScroll: true })
    }
  }, [])
  return <dialog ref={dialog} className="puno-photo-dialog" aria-labelledby="puno-photo-title"
    onCancel={e => { e.preventDefault(); onClose() }}
    onKeyDown={e => {
      if (e.key !== "Tab") return
      // Closed <details> descendants can retain rectangles in Chromium while
      // remaining unfocusable. Exclude them when finding the last Tab stop.
      const stops = [...dialog.current!.querySelectorAll<HTMLElement>("button, a[href], summary")].filter(e => e.getClientRects().length > 0 && e.checkVisibility())
      const first = stops[0], last = stops[stops.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }}
    onClick={e => {
      if (e.target !== dialog.current) return
      onClose()
    }}>
    <h2 id="puno-photo-title" className="sr-only">{photo.alt}</h2>
    <button className="puno-viewer-close" autoFocus onClick={onClose} aria-label="Cerrar fotografía"><Icon name="close" size={25} /></button>
    <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} />
    <div className="puno-viewer-credit"><p className="puno-photo-caption">{photo.alt}</p><PunoPhotoCredit photo={photo} /></div>
  </dialog>
}
