import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react"
import { punoPlaces, punoProvinces, type PunoPhoto } from "../puno-data"
import { punoHref, resolvePunoRoute } from "../puno-navigation"
import { navigateLocal, useLocationSearch } from "../usePunoNavigation"
import { Icon } from "./Icon"
import PunoPhotoDialog, { PunoPhotoCredit } from "./PunoPhotoDialog"
import "../puno.css"
const PunoMap = lazy(() => import("./PunoMap"))

function plainClick(e: MouseEvent<HTMLAnchorElement>) {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
}

export default function PunoExplorer() {
  const search = useLocationSearch()
  const route = resolvePunoRoute(search, punoProvinces, punoPlaces)
  const province = punoProvinces.find(p => p.id === route.provinceId)
  const place = punoPlaces.find(p => p.id === route.placeId)
  const places = punoPlaces.filter(p => p.provinceId === province?.id)
  const [photo, setPhoto] = useState<PunoPhoto | null>(null)
  const [failedImages, setFailedImages] = useState<string[]>([])
  const title = useRef<HTMLHeadingElement>(null)
  const provinceTitle = useRef<HTMLHeadingElement>(null)

  function rememberListPosition(focusId = document.activeElement?.id || "puno-province-title") {
    history.replaceState({ ...history.state, punoPosition: { y: window.scrollY, focusId } }, "")
  }

  useEffect(() => {
    const remember = () => { if (!place) rememberListPosition() }
    window.addEventListener("beforeunload", remember)
    window.addEventListener("pagehide", remember)
    return () => {
      window.removeEventListener("beforeunload", remember)
      window.removeEventListener("pagehide", remember)
    }
  }, [search])

  useLayoutEffect(() => {
    const restore = history.scrollRestoration
    history.scrollRestoration = "manual"
    return () => { history.scrollRestoration = restore }
  }, [])

  useLayoutEffect(() => {
    setPhoto(null)
    setFailedImages([])
    const frame = requestAnimationFrame(() => {
      const position = history.state?.punoPosition
      if (!place && position) {
        document.getElementById(position.focusId)?.focus({ preventScroll: true })
        window.scrollTo({ top: position.y, behavior: "instant" })
      } else if (place || route.notFound || !province) {
        title.current?.focus({ preventScroll: true })
        window.scrollTo({ top: 0, behavior: "instant" })
      } else if (history.state?.punoSelection) {
        provinceTitle.current?.focus({ preventScroll: true })
        if (matchMedia("(max-width: 760px)").matches)
          provinceTitle.current?.scrollIntoView({ block: "start", behavior: "instant" })
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [search]) // Apply the history entry's scroll/focus only on navigation.

  function selectProvince(id: string) {
    rememberListPosition()
    navigateLocal(punoHref(location.href, id), { punoSelection: true })
  }
  function openPlace(e: MouseEvent<HTMLAnchorElement>, id: string) {
    if (!plainClick(e)) return
    e.preventDefault()
    const returnHref = punoHref(location.href, province!.id)
    rememberListPosition(`puno-open-${id}`)
    navigateLocal(punoHref(location.href, province!.id, id), { punoReturn: returnHref })
  }
  function backToProvince(e: MouseEvent<HTMLAnchorElement>) {
    if (!plainClick(e)) return
    e.preventDefault()
    const target = punoHref(location.href, province?.id)
    if (history.state?.punoReturn === target) history.back()
    else navigateLocal(target, { punoSelection: true })
  }

  if (route.notFound) return <main className="puno-section section" id="explora-puno">
    <p className="eyebrow">EXPLORA PUNO</p>
    <h1 ref={title} tabIndex={-1}>No encontramos este lugar.</h1>
    <p>Elige una provincia para explorar los lugares disponibles.</p>
    <a className="text-link" href={punoHref(location.href)} onClick={e => { if (plainClick(e)) { e.preventDefault(); navigateLocal(punoHref(location.href)) } }}>Volver a Explora Puno <Icon name="arrow" /></a>
  </main>

  if (place && province) return <main className="puno-section puno-place section" id="explora-puno">
    <div className="puno-place-navigation">
    <nav className="puno-breadcrumbs" aria-label="Ruta de navegación">
      <a href={punoHref(location.href)} onClick={e => { if (plainClick(e)) { e.preventDefault(); navigateLocal(punoHref(location.href)) } }}>Explora Puno</a><span aria-hidden="true">/</span>
      <a href={punoHref(location.href, province.id)} onClick={backToProvince}>{province.name}</a>
    </nav>
    <a className="puno-back text-link" href={punoHref(location.href, province.id)} onClick={backToProvince}><span className="puno-back-arrow"><Icon name="arrow" size={18} /></span>Volver a la provincia · {province.name}</a>
    </div>
    <header className="puno-place-heading">
      <p className="eyebrow">PATRIMONIO DE PUNO · {place.category}</p>
      <h1 ref={title} tabIndex={-1}>{place.name}</h1>
      <p className="puno-location"><Icon name="pin" size={18} /> {place.district} · {province.name}</p>
    </header>
    {place.photos.length ? <div className={`puno-photo-pair${place.photos.length === 1 ? " puno-photo-single" : ""}`}
      style={place.photos.length === 1 ? { maxWidth: place.photos[0].height > place.photos[0].width ? 640 : 1000 } : undefined}>
      {place.photos.map((image, i) => <figure key={image.id} style={{ maxWidth: image.width, width: "100%", marginInline: "auto" }}>
        {failedImages.includes(image.id) ? <p className="puno-photo-pending">No se pudo cargar esta fotografía.</p> :
          <button className="puno-enlarge" onClick={() => setPhoto(image)} aria-label={`Ampliar foto ${i + 1}: ${image.alt}`}>
            <img src={image.src} srcSet={image.srcSet}
              sizes={place.photos.length === 1 ? `(max-width: 760px) 100vw, ${image.height > image.width ? 640 : 1000}px` : "(max-width: 760px) 100vw, 50vw"}
              loading="lazy" decoding="async" alt={image.alt} width={image.width} height={image.height}
              onError={() => setFailedImages(ids => [...ids, image.id])} />
            <span aria-hidden="true"><Icon name="diagonal" size={18} /></span>
          </button>}
        <figcaption><p className="puno-photo-caption">{image.alt}</p><PunoPhotoCredit photo={image} /></figcaption>
      </figure>)}
    </div> : <p className="puno-photo-pending"><Icon name="mountain" size={21} /><span>Fotografías pendientes de incorporación.</span></p>}
    <section className="puno-about" aria-labelledby="puno-about-title">
      <h2 id="puno-about-title">Sobre este lugar</h2>
      <div className="puno-place-description">{place.description.split("\n\n").map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
      <p className="puno-sources">{place.sources.length > 1 ? "Fuentes: " : "Fuente: "}{place.sources.map((source, i) => <span key={source.url}>{i > 0 && " · "}<a href={source.url} target="_blank" rel="noreferrer">{source.label.split(" · ")[0]} ↗</a></span>)}</p>
    </section>
    <div className="puno-place-footer"><span>Puno · Patrimonio cultural y paisajes</span></div>
    {photo && <PunoPhotoDialog photo={photo} onClose={() => setPhoto(null)} />}
  </main>

  return <main className="puno-section section" id="explora-puno">
    <header className="puno-intro">
      <div><p className="eyebrow">UN TERRITORIO POR DESCUBRIR</p><h1 ref={title} tabIndex={-1}>Explora <em>Puno.</em></h1></div>
      <p>Patrimonio cultural y paisajes.<br />Elige una provincia y conoce los lugares que guarda.</p>
    </header>
    <div className="puno-explorer-layout">
      <Suspense fallback={<div className="puno-map-placeholder" role="status">Preparando el mapa…</div>}><PunoMap selected={province?.id || ""} onSelect={selectProvince} /></Suspense>
      <section className="puno-province-panel" aria-labelledby="puno-province-title">
        <label className="puno-selector">ELIGE UNA PROVINCIA
          <select id="puno-province-selector" value={province?.id || ""} onChange={e => selectProvince(e.target.value)} aria-label="Provincia de Puno">
            <option value="">Selecciona una provincia</option>
            {punoProvinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <div className="puno-province-heading">
          <p className="eyebrow">{province ? "TU DESTINO" : "COMIENZA A EXPLORAR"}</p>
          <h2 id="puno-province-title" ref={provinceTitle} tabIndex={-1}>{province?.name || "Las historias de Puno"}</h2>
          <p role="status">{province ? `${places.length} ${places.length === 1 ? "lugar disponible" : "lugares disponibles"}` : "Trece provincias, distintas miradas al territorio."}</p>
        </div>
        {!province ? <div className="puno-empty"><Icon name="map" size={34} /><p>Selecciona una provincia en el mapa o en el listado para conocer sus lugares.</p></div> : !places.length ?
          <div className="puno-empty"><Icon name="book" size={30} /><p>El material inicial todavía no incluye lugares de {province.name}.</p><p>Puedes seguir explorando otra provincia.</p></div> :
          <ul className="puno-place-list">{places.map(p => <li key={p.id}>
            <div><span>{p.category}</span><h3>{p.name}</h3><p>{p.district}</p></div>
            <a className="text-link" id={`puno-open-${p.id}`} href={punoHref(location.href, province.id, p.id)} onClick={e => openPlace(e, p.id)} aria-label={`Ver lugar: ${p.name}`}>Ver lugar <Icon name="arrow" size={17} /></a>
          </li>)}</ul>}
      </section>
    </div>
    <p className="puno-scope">Una selección de lugares documentados. El patrimonio cultural y los paisajes de Puno siguen por descubrir.</p>
  </main>
}
