import { useEffect, useRef, useState } from "react"
import { museums, type Museum } from "../data"
import { Icon } from "./Icon"

const slides = [
  { name: "Museo Nacional Chavín", src: "/images/hero-chavin.webp", caption: "El rostro de una cultura milenaria", position: "70% 48%" },
  { name: "Museo Tumbas Reales de Sipán", src: "/images/sipan.webp", caption: "El esplendor de los antiguos señores", position: "65% 50%" },
  { name: "Museo Lítico de Pukara", src: "/images/pukara.webp", caption: "Historias talladas en piedra", position: "70% 48%" },
  { name: "Museo Cao", src: "/images/museums/g2-cao.webp", caption: "Una mirada al mundo mochica", position: "65% 50%" },
].map(s => ({ ...s, museum: museums.find(m => m.name === s.name)! }))

export default function HeroCarousel({ onOpen, onExplore }: { onOpen: (m: Museum) => void; onExplore: (view: "map" | "directory") => void }) {
  const root = useRef<HTMLElement>(null)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [pageVisible, setPageVisible] = useState(!document.hidden)
  const slide = slides[index]

  useEffect(() => {
    const visibility = () => setPageVisible(!document.hidden)
    document.addEventListener("visibilitychange", visibility)
    return () => { document.removeEventListener("visibilitychange", visibility) }
  }, [])

  useEffect(() => {
    if (paused || !pageVisible) return
    const timer = setTimeout(() => {
      setIndex(i => (i + 1) % slides.length)
    }, 4000)
    return () => clearTimeout(timer)
  }, [index, paused, pageVisible])

  const move = (direction: number) => {
    setIndex(i => (i + direction + slides.length) % slides.length)
  }

  return <section ref={root} className="immersive-hero" id="inicio" aria-label="Descubre los museos del Perú" aria-roledescription="carrusel">
    <div className="hero-photographs" aria-hidden="true">
      {slides.map((s, i) => (
        <img
          key={s.name}
          className={index === i ? "is-current" : ""}
          src={s.src}
          alt=""
          style={{ objectPosition: s.position }}
          fetchPriority={i === 0 ? "high" : "low"}
          decoding="async"
        />
      ))}
    </div>
    <div className="hero-shade" />
    <div className="immersive-copy">
      <p className="eyebrow"><span className="tiny-line" /> UN VIAJE POR NUESTRO PATRIMONIO</p>
      <h1>Un territorio.<br />Muchas<br /><em>historias.</em></h1>
      <p className="immersive-description">El Perú también se descubre en sus museos.<br />Encuentra las culturas, las piezas y las historias<br className="desktop-break" /> que nos conectan.</p>
      <div className="immersive-actions">
        <a className="button primary" href="#explorar" onClick={() => onExplore("map")}>Explorar el Perú <Icon name="arrow" /></a>
        <a className="button hero-outline" href="#explorar" onClick={() => onExplore("directory")}>Descubrir museos <Icon name="diagonal" size={18} /></a>
      </div>
      <div className="immersive-stats"><div><strong>{museums.length}</strong><span>museos y espacios<br />por descubrir</span></div><div><strong>25</strong><span>territorios,<br />muchas miradas</span></div></div>
    </div>
    <div className="hero-destination" aria-live={paused ? "polite" : "off"}>
      <span className="eyebrow">{slide.museum.department} / PERÚ</span>
      <h2>{slide.caption}</h2>
      <button className="hero-museum-link" onClick={() => onOpen(slide.museum)}>{slide.name} <Icon name="diagonal" size={18} /></button>
      <a href="#creditos" className="photo-attribution">Foto: {slide.museum.image!.author} · {slide.museum.image!.license}</a>
    </div>
    <div className="carousel-controls" aria-label="Controles de las fotografías">
      <span className="slide-number">0{index + 1} <span>/ 04</span></span>
      <div className="slide-dots">
        {slides.map((s, i) => (
          <button
            key={s.name}
            aria-label={`Mostrar fotografía de ${s.name}`}
            aria-pressed={i === index}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
      <button onClick={() => move(-1)} aria-label="Fotografía anterior"><span className="previous-arrow"><Icon name="arrow" size={18} /></span></button>
      <button
        onClick={() => setPaused(p => !p)}
        aria-label={paused ? "Reanudar cambio de fotografías" : "Pausar cambio de fotografías"}
        aria-pressed={paused}
      >
        {paused ? (
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="m6 3 9 6-9 6Z" fill="none" stroke="currentColor" /></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M6 3v12m6-12v12" stroke="currentColor" strokeWidth="2" /></svg>
        )}
      </button>
      <button onClick={() => move(1)} aria-label="Fotografía siguiente"><Icon name="arrow" size={18} /></button>
    </div>
  </section>
}
