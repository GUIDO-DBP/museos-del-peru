import { lazy, Suspense, useEffect, useMemo, useState } from "react"
import {
  departments,
  museums,
  sourceUrls,
  type Museum,
  type MuseumType,
} from "./data"
import { filterMuseums, initialFilters, type Filters } from "./catalog"
import { Icon, Mark } from "./components/Icon"
import MuseumCard, { MuseumImage } from "./components/MuseumCard"
import HeroCarousel from "./components/HeroCarousel"
import DetailModal from "./components/DetailModal"
const PeruMap = lazy(() => import("./components/PeruMap"))
function initialState(): Filters {
  const p = new URLSearchParams(location.search)
  return {
    search: p.get("q") || "",
    department: departments.find((d) => d === p.get("region")) || "",
    type: museums.find((m) => m.type === p.get("tipo"))?.type || "",
    virtual: p.get("virtual") === "1",
    sort: p.get("orden") === "za" ? "za" : "az",
  }
}
export default function App() {
  const [filters, setFilters] = useState<Filters>(initialState),
    [mode, setMode] = useState<"map" | "directory">(() =>
      new URLSearchParams(location.search).get("vista") === "directorio"
        ? "directory"
        : "map",
    ),
    [detail, setDetail] = useState<Museum | null>(null),
    [menu, setMenu] = useState(false),
    [limit, setLimit] = useState(12),
    [mountMap, setMountMap] = useState(false)
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1))
    if (id)
      requestAnimationFrame(() =>
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: "instant", block: "start" }),
      )
  }, [])
  const filtered = useMemo(() => filterMuseums(museums, filters), [filters])
  const counts = useMemo(
    () =>
      Object.fromEntries(
        departments.map((d) => [
          d,
          museums.filter((m) => m.department === d).length,
        ]),
      ),
    [],
  )
  const types = useMemo(() => [...new Set(museums.map((m) => m.type))], [])
  const featured = useMemo(
    () =>
      [
        "Museo Tumbas Reales de Sipán",
        "Museo Nacional Chavín",
        "Museo Lítico de Pukara",
      ].map((name) => museums.find((m) => m.name === name)!),
    [],
  )
  const virtualMuseums = useMemo(() => museums.filter((m) => m.virtualUrl), [])
  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setLimit(12)
  }
  const selectRegion = (department: string) =>
    setFilter("department", department)
  useEffect(() => {
    const target = document.getElementById("explorar")
    if (!target) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && mode === "map") {
          setMountMap(true)
          io.disconnect()
        }
      },
      { rootMargin: "450px" },
    )
    io.observe(target)
    return () => io.disconnect()
  }, [mode])
  useEffect(() => {
    const p = new URLSearchParams()
    if (filters.search) p.set("q", filters.search)
    if (filters.department) p.set("region", filters.department)
    if (filters.type) p.set("tipo", filters.type)
    if (filters.virtual) p.set("virtual", "1")
    if (filters.sort === "za") p.set("orden", "za")
    if (mode === "directory") p.set("vista", "directorio")
    const q = p.toString()
    history.replaceState(
      null,
      "",
      `${location.pathname}${q ? "?" + q : ""}${location.hash}`,
    )
  }, [filters, mode])
  useEffect(() => {
    const onPop = () => {
      setFilters(initialState())
      setMode(
        new URLSearchParams(location.search).get("vista") === "directorio"
          ? "directory"
          : "map",
      )
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])
  const explore = (view: "map" | "directory") => {
    setMode(view)
    setMenu(false)
    if (view === "map") setMountMap(true)
  }
  const submitSearch = () => {
    explore("directory")
    requestAnimationFrame(() => {
      const results = document.getElementById("resultados")
      results?.focus({ preventScroll: true })
      results?.scrollIntoView({ behavior: "instant", block: "start" })
    })
  }
  const active =
    filters.department || filters.type || filters.search || filters.virtual
  return (
    <>
      <a className="skip-link" href="#explorar">
        Saltar a la exploración
      </a>
      <header className="site-header">
        <a
          className="brand"
          href="#inicio"
          aria-label="Museos del Perú, inicio"
        >
          <Mark />
          <span>
            Museos <em>del Perú</em>
            <small>HISTORIAS QUE NOS ENCUENTRAN</small>
          </span>
        </a>
        <nav
          className={menu ? "nav open" : "nav"}
          aria-label="Navegación principal"
        >
          <a href="#explorar" onClick={() => explore("map")}>
            Explorar el mapa
          </a>
          <a href="#explorar" onClick={() => explore("directory")}>
            Museos
          </a>
          <a href="#recorridos" onClick={() => setMenu(false)}>
            Recorridos virtuales
          </a>
          <a href="#proyecto" onClick={() => setMenu(false)}>
            El proyecto
          </a>
        </nav>
        <a
          className="header-action"
          href="#explorar"
          onClick={() => explore("map")}
        >
          Empieza a explorar <Icon name="diagonal" size={17} />
        </a>
        <button
          className="menu-button"
          aria-label={menu ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          <Icon name={menu ? "close" : "menu"} />
        </button>
      </header>
      <main>
        <HeroCarousel onOpen={setDetail} onExplore={explore} />
        <div className="journey-strip">
          <span>LA CURIOSIDAD ES EL PRIMER PASO</span>
          <span className="strip-line" />
          <span>Costa</span>
          <i>✦</i>
          <span>Andes</span>
          <i>✦</i>
          <span>Amazonía</span>
          <a href="#explorar" aria-label="Bajar al mapa">
            <Icon name="arrow" />
          </a>
        </div>
        <section className="explorer section" id="explorar">
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 / EXPLORA EL TERRITORIO</p>
              <h2>
                Explora el Perú.
                <br />
                <em>Descubre su historia.</em>
              </h2>
            </div>
            <div className="section-intro">
              <p>
                De la costa a los Andes y la Amazonía.
                <br />
                Elige una región y descubre lo que guarda.
              </p>
              <div className="view-tabs" aria-label="Vista de exploración">
                <button
                  aria-pressed={mode === "map"}
                  className={mode === "map" ? "active" : ""}
                  onClick={() => explore("map")}
                >
                  <Icon name="map" size={17} /> Mapa
                </button>
                <button
                  aria-pressed={mode === "directory"}
                  className={mode === "directory" ? "active" : ""}
                  onClick={() => explore("directory")}
                >
                  <Icon name="grid" size={17} /> Directorio
                </button>
              </div>
            </div>
          </div>
          <form id="museum-search" className="search-bar" role="search" onSubmit={e => { e.preventDefault(); submitSearch() }}>
            <label className="search-input">
              <Icon name="search" />
              <span className="sr-only">Buscar museo, ciudad, región o tema</span>
              <input
                type="search"
                placeholder="Nombre, ciudad o tema…"
                aria-describedby="search-feedback"
                value={filters.search}
                onChange={(e) => setFilter("search", e.target.value)}
              />
            </label>
            <label>
              <span className="filter-label">REGIÓN</span>
              <select
                aria-label="Filtrar por región"
                value={filters.department}
                onChange={(e) => selectRegion(e.target.value)}
              >
                <option value="">Todo el Perú</option>
                {departments.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="filter-label">TIPO DE ESPACIO</span>
              <select
                aria-label="Filtrar por tipo"
                value={filters.type}
                onChange={(e) =>
                  setFilter("type", e.target.value as MuseumType | "")
                }
              >
                <option value="">Todos</option>
                {types.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="virtual-filter">
              <input
                type="checkbox"
                checked={filters.virtual}
                onChange={(e) => setFilter("virtual", e.target.checked)}
              />
              <span>Con recorrido virtual</span>
            </label>
            <button className="button primary search-submit" type="submit"><Icon name="search" size={18} /> Buscar</button>
          </form>
          <div className="search-feedback" id="search-feedback" role="status">
            {active ? (filtered.length ? <span><strong>{filtered.length}</strong> {filtered.length === 1 ? "museo encontrado" : "museos encontrados"}. Pulsa Buscar para ver los resultados.</span> : <span><strong>No hay coincidencias.</strong> Prueba otro nombre o quita un filtro.</span>) : <span>Busca entre {museums.length} museos y espacios, o selecciona una región.</span>}
          </div>
          {filters.search.trim() && filtered.length > 0 && <div className="search-suggestions" aria-label="Museos que coinciden con tu búsqueda">{filtered.slice(0, 3).map(m => <button key={m.id} onClick={() => setDetail(m)}><span>{m.name}<small>{m.city} · {m.department}</small></span><Icon name="diagonal" size={17} /></button>)}</div>}
          {active && (
            <div className="active-filters">
              <div className="filter-chips">
                {filters.search && <button onClick={() => setFilter("search", "")} aria-label="Quitar búsqueda">“{filters.search}” <Icon name="close" size={13} /></button>}
                {filters.department && <button onClick={() => selectRegion("")} aria-label="Quitar filtro de región">{filters.department} <Icon name="close" size={13} /></button>}
                {filters.type && <button onClick={() => setFilter("type", "")} aria-label="Quitar filtro de tipo">{filters.type} <Icon name="close" size={13} /></button>}
                {filters.virtual && <button onClick={() => setFilter("virtual", false)} aria-label="Quitar filtro de recorrido">Recorrido virtual <Icon name="close" size={13} /></button>}
              </div>
              <button
                onClick={() => {
                  setFilters(initialFilters)
                  setLimit(12)
                }}
              >
                Limpiar filtros <Icon name="close" size={14} />
              </button>
            </div>
          )}
          <div hidden={mode !== "map"} className="map-layout">
            <Suspense
              fallback={<div className="map-loading">Preparando el mapa…</div>}
            >
              {mountMap ? (
                <PeruMap
                  selected={filters.department}
                  onSelect={selectRegion}
                  counts={counts}
                  visible={mode === "map"}
                />
              ) : (
                <div className="map-loading">
                  <Icon name="mountain" size={40} />
                  El paisaje está por descubrirse
                </div>
              )}
            </Suspense>
            <aside className="region-panel">
              <div className="region-panel-top">
                <p className="eyebrow">
                  {filters.department
                    ? "TU DESTINO"
                    : "ELIGE TU PUNTO DE PARTIDA"}
                </p>
                <h3>{filters.department || "Todo el Perú"}</h3>
                <p aria-live="polite">
                  <strong>{filtered.length}</strong> {filtered.length === 1 ? "espacio" : "espacios"} para explorar
                </p>
              </div>
              <div className="region-list">
                {filtered.slice(0, 6).map((m) => (
                  <button
                    className="region-museum"
                    key={m.id}
                    onClick={() => setDetail(m)}
                  >
                    <span className="region-thumb" aria-hidden="true">
                      <MuseumImage museum={m} />
                    </span>
                    <span className="region-museum-copy">
                      <strong>{m.name}</strong>
                      <span>
                        {m.city}
                        {m.virtualUrl ? " · Visita virtual" : ""}
                      </span>
                    </span>
                    <Icon name="diagonal" size={17} />
                  </button>
                ))}
                {!filtered.length && (
                  <div className="empty-state">
                    <Icon name="search" size={30} />
                    <h3>No hay coincidencias</h3>
                    <p>Prueba con otra búsqueda o quita un filtro.</p>
                    <button
                      className="text-link"
                      onClick={() => setFilters(initialFilters)}
                    >
                      Ver todos los museos
                    </button>
                  </div>
                )}
              </div>
              <div className="region-panel-bottom">
                <button
                  className="button dark"
                  onClick={() => explore("directory")}
                >
                  Ver{" "}
                  {filters.department ? "museos de la región" : "el directorio"}{" "}
                  <Icon name="arrow" size={18} />
                </button>
                <small>
                  {filtered.length > 6
                    ? `Mostrando 6 de ${filtered.length} resultados.`
                    : "Selecciona un museo para conocerlo."}
                </small>
              </div>
            </aside>
          </div>
          {mode === "directory" && (
            <div className="directory" id="resultados" tabIndex={-1} aria-label="Resultados de la búsqueda">
              <div className="directory-toolbar">
                <p aria-live="polite">
                  <strong>{filtered.length}</strong> {filtered.length === 1 ? "espacio" : "espacios"}
                  {filters.department
                    ? ` en ${filters.department}`
                    : " en el catálogo"}
                </p>
                <label>
                  Ordenar{" "}
                  <select
                    aria-label="Ordenar resultados"
                    value={filters.sort}
                    onChange={(e) =>
                      setFilter("sort", e.target.value as "az" | "za")
                    }
                  >
                    <option value="az">Nombre: A–Z</option>
                    <option value="za">Nombre: Z–A</option>
                  </select>
                </label>
              </div>
              <div className="museum-grid">
                {filtered.slice(0, limit).map((m) => (
                  <MuseumCard
                    key={m.id}
                    museum={m}
                    onOpen={() => setDetail(m)}
                  />
                ))}
              </div>
              {!filtered.length && (
                <div className="empty-state">
                  <Icon name="search" size={34} />
                  <h3>No encontramos museos con esos criterios</h3>
                  <p>Prueba con otra región o limpia los filtros.</p>
                  <button
                    className="button outline"
                    onClick={() => setFilters(initialFilters)}
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
              {filtered.length > limit && (
                <button
                  className="button outline load-more"
                  onClick={() => setLimit((l) => l + 12)}
                >
                  Mostrar más museos <Icon name="plus" size={17} />
                </button>
              )}
            </div>
          )}
          <p className="map-footnote">
            <span>
              24 departamentos y la Provincia Constitucional del Callao.
            </span>
            <span>
              Catálogo inicial · {museums.length} museos y espacios expositivos
            </span>
          </p>
        </section>
        <section className="featured section" id="descubrir">
          <div className="section-heading">
            <div>
              <p className="eyebrow">02 / ENCUENTROS CON LA HISTORIA</p>
              <h2>
                Huellas de un <em>pasado vivo.</em>
              </h2>
            </div>
            <a
              className="text-link"
              href="#explorar"
              onClick={() => {
                setFilters(initialFilters)
                explore("directory")
              }}
            >
              Ver todos los museos <Icon name="arrow" size={18} />
            </a>
          </div>
          <div className="museum-grid">
            {featured.map((m) => (
              <MuseumCard key={m.id} museum={m} onOpen={() => setDetail(m)} />
            ))}
          </div>
        </section>
        <section className="virtual-section" id="recorridos">
          <div className="virtual-copy">
            <p className="eyebrow">03 / UNA VENTANA ABIERTA A LA CULTURA</p>
            <h2>
              La historia,
              <br />a un <em>clic de ti.</em>
            </h2>
            <p>
              Acércate a las colecciones desde donde estés.
              <br />
              Descubre los museos que ofrecen recorridos
              <br className="desktop-break" /> virtuales en sus plataformas.
            </p>
            <a
              className="button light"
              href="#explorar"
              onClick={() => {
                setFilters({ ...initialFilters, virtual: true })
                explore("directory")
              }}
            >
              Explorar recorridos virtuales <Icon name="diagonal" size={18} />
            </a>
            <span className="virtual-count">
              {virtualMuseums.length} museos con recorrido virtual · Acceso a sitios
              externos
            </span>
          </div>
          <div className="virtual-collage">
            <div className="virtual-orbit" />
            <img
              src="/images/pukara.webp"
              alt="Patio con esculturas del Museo Lítico de Pukara"
              loading="lazy"
            />
            <div className="virtual-image-note">
              <span>Pucará, Puno</span>
              <strong>Museo Lítico de Pukara</strong>
              <button
                onClick={() => setDetail(featured[2])}
                aria-label="Ver ficha del Museo Lítico de Pukara"
              >
                <Icon name="diagonal" />
              </button>
            </div>
          </div>
        </section>
        <section className="about-section section" id="proyecto">
          <div>
            <p className="eyebrow">UN PATRIMONIO QUE NOS CONECTA</p>
            <h2>
              Conocer también
              <br />
              es una forma de <em>cuidar.</em>
            </h2>
          </div>
          <div className="about-copy">
            <p>
              Reunimos museos y espacios expositivos de distintas regiones para
              acercarte a la diversidad cultural del Perú. Cada visita es una
              oportunidad para mirar nuestra historia desde otro lugar.
            </p>
            <p>
              Este es un catálogo independiente en crecimiento. Las fuentes
              institucionales acompañan las fichas para que puedas ampliar la
              información y preparar tu visita.
            </p>
            <a className="text-link" href="#fuentes">
              Conoce nuestras fuentes <Icon name="arrow" size={17} />
            </a>
          </div>
        </section>
        <section className="sources-section section" id="fuentes">
          <details>
            <summary>
              Fuentes del catálogo <Icon name="plus" size={18} />
            </summary>
            <div className="sources-content">
              <p>
                Conservamos los 66 registros de la base inicial, todos con
                fotografías documentadas de sus edificios, salas o colecciones.
                Las 66 fichas incluyen contenido documentado sobre sus colecciones. La
                revisión de direcciones y enlaces continúa. Confirma horarios
                y condiciones directamente con cada museo.
              </p>
              <div className="source-links">
                <a
                  href="https://museos.cultura.pe"
                  target="_blank"
                  rel="noreferrer"
                >
                  Portal de Museos del Ministerio de Cultura ↗
                </a>
                <a href={sourceUrls.guia2023} target="_blank" rel="noreferrer">
                  Guía de museos 2023 ↗
                </a>
                <a href={sourceUrls["2026"]} target="_blank" rel="noreferrer">
                  Listado de museos · febrero de 2026 ↗
                </a>
                <a href={sourceUrls.rutas} target="_blank" rel="noreferrer">
                  Rutas interregionales de museos ↗
                </a>
              </div>
            </div>
          </details>
          <details id="creditos">
            <summary>
              Fotografías y cartografía <Icon name="plus" size={18} />
            </summary>
            <div className="sources-content">
              <p>
                Fotografías reales, redimensionadas y convertidas a WebP. Los
                encuadres se adaptan a la pantalla. La fecha de la fotografía
                puede diferir del estado actual del museo.
              </p>
              <p>
                Cada imagen enlaza a su procedencia. Las fotografías de la Guía
                de Museos 2023 conservan sus derechos institucionales; las de
                Wikimedia Commons indican su licencia específica.
              </p>
              <ul>
                {museums
                  .filter((m) => m.image)
                  .map((m) => (
                    <li key={m.id}>
                      {m.name}:{" "}
                      <a
                        href={m.image!.source}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {m.image!.author}
                      </a>{" "}
                      ·{" "}
                      <a
                        href={m.image!.licenseUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {m.image!.license}
                      </a>
                      .
                    </li>
                  ))}
              </ul>
              <p>
                Mapa:{" "}
                <a
                  href="https://openfreemap.org/"
                  target="_blank"
                  rel="noreferrer"
                >
                  OpenFreeMap
                </a>
                , OpenMapTiles y colaboradores de OpenStreetMap. Relieve:{" "}
                <a
                  href="https://mapterhorn.com/attribution/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Mapterhorn y sus fuentes de elevación
                </a>
                . Límites simplificados:{" "}
                <a
                  href="https://github.com/juaneladio/peru-geojson"
                  target="_blank"
                  rel="noreferrer"
                >
                  peru-geojson
                </a>
                . Cartografía para exploración cultural, no para delimitación
                legal.
              </p>
            </div>
          </details>
        </section>
      </main>
      <footer>
        <a className="brand" href="#inicio">
          <Mark />
          <span>
            Museos <em>del Perú</em>
          </span>
        </a>
        <span>Un territorio. Muchas historias.</span>
        <small>
          Proyecto independiente · Catálogo en ampliación
          <br />
          Sin afiliación al Ministerio de Cultura
        </small>
        <a href="#inicio" className="back-top" aria-label="Volver al inicio">
          <Icon name="arrow" />
        </a>
      </footer>
      {detail && (
        <DetailModal museum={detail} onClose={() => setDetail(null)} />
      )}
    </>
  )
}
