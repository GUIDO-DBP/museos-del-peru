import { useState } from "react"
import type { Museum } from "../data"
import { Icon, Mark } from "./Icon"
export function MuseumImage({
  museum,
  priority = false,
}: {
  museum: Museum
  priority?: boolean
}) {
  const [failed, setFailed] = useState(false)
  return museum.image && !failed ? (
    <img
      src={museum.image.src}
      alt={museum.image.alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  ) : (
    <div className="image-placeholder">
      <Mark />
      <span>{museum.department}</span>
      <small>Fotografía por incorporar</small>
    </div>
  )
}
export default function MuseumCard({
  museum,
  onOpen,
}: {
  museum: Museum
  onOpen: () => void
}) {
  return (
    <article className="museum-card">
      <button
        className="card-image"
        onClick={onOpen}
        aria-label={`Conocer ${museum.name}`}
      >
        <MuseumImage museum={museum} />
        <span className="region-tag">{museum.department}</span>
        {!museum.virtualUrl && !!museum.resources?.length && <span className="virtual-tag"><Icon name="book" size={13} /> Recursos digitales</span>}
        {museum.virtualUrl && (
          <span className="virtual-tag">
            <Icon name="globe" size={13} /> Recorrido virtual
          </span>
        )}
      </button>
      <div className="card-body">
        <p className="card-type">{museum.type}</p>
        <h3>
          <button onClick={onOpen}>{museum.name}</button>
        </h3>
        <p className="card-location">
          <Icon name="pin" size={15} />
          {museum.city}, {museum.department}
        </p>
        <p className="card-description">
          {museum.description ||
            `Consulta la ubicación y las fuentes disponibles de este espacio cultural en ${museum.city}.`}
        </p>
        <button className="card-link" onClick={onOpen}>
          Conocer museo <Icon name="diagonal" size={20} />
        </button>
      </div>
    </article>
  )
}
