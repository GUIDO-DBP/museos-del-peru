import { useEffect, useRef } from "react"
import { sourceLabels, sourceUrls, type Museum } from "../data"
import { mapsUrl } from "../catalog"
import { Icon } from "./Icon"
import { MuseumImage } from "./MuseumCard"
export default function DetailModal({
  museum,
  onClose,
}: {
  museum: Museum
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = dialog.current
    const prior = document.activeElement as HTMLElement | null
    d?.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      d?.close()
      document.body.style.overflow = overflow
      prior?.focus()
    }
  }, [])
  return (
    <dialog
      ref={dialog}
      className="museum-dialog"
      aria-labelledby="museum-title"
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === dialog.current) {
          const r = dialog.current!.getBoundingClientRect()
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose()
        }
      }}
    >
      <button
        autoFocus
        className="dialog-close"
        onClick={onClose}
        aria-label="Cerrar ficha"
      >
        <Icon name="close" />
      </button>
      <div className="detail-photo">
        <MuseumImage museum={museum} priority />
        <span className="region-tag">{museum.department}</span>
      </div>
      {museum.image && <p className="detail-photo-caption">{museum.image.alt}</p>}
      <div className="detail-body">
        <p className="eyebrow">
          {museum.type} / {museum.city}
        </p>
        <h2 id="museum-title">{museum.name}</h2>
        <p className="detail-description">
          {museum.description ||
            "Un espacio para acercarte al patrimonio de su región. Consulta sus fuentes documentales para conocer más sobre sus colecciones y preparar tu visita."}
        </p>
        {museum.themes?.length && <div className="theme-tags" aria-label="Temas de la colección">{museum.themes.map(theme => <span key={theme}>{theme}</span>)}</div>}
        {museum.highlights?.length && <section className="detail-section"><h3>Qué descubrirás</h3><div className="detail-highlights">{museum.highlights.map(h => <div className="detail-highlight" key={h.title}><h4>{h.title}</h4><p>{h.text}</p></div>)}</div></section>}
        {museum.story && <section className="detail-section"><h3>Una historia que contar</h3><p>{museum.story}</p></section>}
        <section className="detail-section"><h3>Explora desde donde estés</h3>
          <div className="resource-list">
            {(museum.resources || []).map(resource => <a className="resource-link" href={resource.url} target="_blank" rel="noreferrer" key={resource.url}><div><small>{{tour: "Recorrido virtual", collection: "Colección digital", video: "Video", audio: "Audioguía", guide: "Guía documental"}[resource.kind]}</small><strong>{resource.title}</strong>{resource.scope && <p>{resource.scope}</p>}</div><Icon name="external" size={18} /></a>)}
            {!museum.resources?.some(r => r.kind === "tour") && <p className="visit-note">No hemos localizado un recorrido virtual para esta ficha. Puedes conocer sus colecciones en los contenidos documentados y consultar la fuente de información.</p>}
            {museum.descriptionSource && <a className="resource-link" href={museum.descriptionSource} target="_blank" rel="noreferrer"><div><small>Información documentada</small><strong>Conoce más sobre este museo</strong><p>Consulta la ficha o publicación institucional que respalda esta reseña.</p></div><Icon name="book" size={20} /></a>}
          </div>
        </section>
        <section className="detail-section"><h3>Prepara tu visita</h3>
        <dl className="detail-info">
          <div>
            <dt>
              <Icon name="pin" size={18} /> Ubicación
            </dt>
            <dd>
              {museum.city}, {museum.department}
            </dd>
          </div>
          <div>
            <dt>Dirección del catálogo</dt>
            <dd>{museum.address}</dd>
          </div>
        </dl>
        <div className="detail-actions">
          {museum.officialUrl && (
            <a
              className="button outline"
              href={museum.officialUrl}
              target="_blank"
              rel="noreferrer"
            >
              Página oficial <Icon name="external" size={16} />
            </a>
          )}
          <a
            className="button outline"
            href={mapsUrl(museum)}
            target="_blank"
            rel="noreferrer"
          >
            Buscar en Google Maps <Icon name="external" size={16} />
          </a>
        </div>
        <p className="visit-note">
          Antes de ir, consulta los horarios y las condiciones de visita con el
          museo. Google Maps abrirá una búsqueda por nombre y dirección.
        </p>
        </section>
        <details className="detail-sources">
          <summary>Fuentes y créditos</summary>
          <p>
            Datos de ubicación:{" "}
            <a
              href={museum.addressSource || sourceUrls[museum.source]}
              target="_blank"
              rel="noreferrer"
            >
              {museum.addressSource
                ? "Ficha institucional del museo"
                : sourceLabels[museum.source]}
            </a>
            . Las direcciones del catálogo proceden de publicaciones de
            distintas fechas.
          </p>
          {museum.descriptionSource && (
            <p>
              Descripción:{" "}
              <a
                href={museum.descriptionSource}
                target="_blank"
                rel="noreferrer"
              >
                fuente institucional
              </a>
              . Revisada el {museum.verifiedAt?.split("-").reverse().join("/")}.
            </p>
          )}
          {museum.sources?.length && <ul>{museum.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul>}
          {museum.resources?.length && <p>Recursos digitales: enlaces revisados el {museum.resources[0].checkedAt.split("-").reverse().join("/")}. Las plataformas externas pueden cambiar y algunas muestran exposiciones anteriores.</p>}
          {museum.image && (
            <p>
              Fotografía:{" "}
              <a href={museum.image.source} target="_blank" rel="noreferrer">
                {museum.image.author}
              </a>{" "}
              ·{" "}
              <a
                href={museum.image.licenseUrl}
                target="_blank"
                rel="noreferrer"
              >
                {museum.image.license}
              </a>
              . {museum.image.changes} El encuadre se adapta a la pantalla.
            </p>
          )}
        </details>
      </div>
    </dialog>
  )
}
