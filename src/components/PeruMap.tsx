import { useEffect, useRef, useState } from "react"
import {
  Map as GLMap,
  NavigationControl,
  AttributionControl,
  setWorkerUrl,
  type MapLayerMouseEvent,
} from "maplibre-gl"
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url"
import type { FeatureCollection, Polygon, MultiPolygon } from "geojson"
import "maplibre-gl/dist/maplibre-gl.css"
import { departments } from "../data"
import { Icon } from "./Icon"

setWorkerUrl(workerUrl)
type Geography = FeatureCollection<Polygon | MultiPolygon, { name: string }>
type Props = {
  selected: string
  onSelect: (name: string) => void
  counts: Record<string, number>
  visible: boolean
}
const countryBounds: [[number, number], [number, number]] = [
  [-81.5, -18.5],
  [-68.6, 0.1],
]
function boundsFor(
  data: Geography,
  name: string,
): [[number, number], [number, number]] {
  const f = data.features.find((f) => f.properties.name === name)
  if (!f) return countryBounds
  const points = f.geometry.coordinates.flat(
    f.geometry.type === "MultiPolygon" ? 2 : 1,
  ) as number[][]
  return [
    [
      Math.min(...points.map((p) => p[0])),
      Math.min(...points.map((p) => p[1])),
    ],
    [
      Math.max(...points.map((p) => p[0])),
      Math.max(...points.map((p) => p[1])),
    ],
  ]
}
export default function PeruMap({
  selected,
  onSelect,
  counts,
  visible,
}: Props) {
  const host = useRef<HTMLDivElement>(null),
    map = useRef<GLMap | null>(null),
    data = useRef<Geography | null>(null)
  const selectRef = useRef(onSelect)
  selectRef.current = onSelect
  const selectedRef = useRef(selected)
  selectedRef.current = selected
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">(
    "loading",
  )
  const [terrain, setTerrain] = useState(true),
    [hovered, setHovered] = useState(""),
    [attempt, setAttempt] = useState(0),
    [tileError, setTileError] = useState(false)
  const terrainRef = useRef(terrain)
  terrainRef.current = terrain
  const reduce = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  function frame(name: string, animate = true) {
    if (!map.current || !data.current) return
    map.current.fitBounds(boundsFor(data.current, name), {
      padding: window.innerWidth < 600 ? 50 : 70,
      maxZoom: name === "Callao" ? 10 : 8.5,
      pitch: terrainRef.current ? (name ? 48 : 25) : 0,
      bearing: 0,
      duration: animate && !reduce() ? 1100 : 0,
    })
  }
  useEffect(() => {
    if (!host.current) return
    let disposed = false,
      timer: ReturnType<typeof setTimeout>,
      current: GLMap | undefined
    const showUnavailable = () => {
      if (disposed) return
      clearTimeout(timer)
      controller.abort()
      setStatus("unavailable")
      current?.remove()
      current = undefined
      map.current = null
    }
    const controller = new AbortController()
    setStatus("loading")
    setTileError(false)
    const initialize = async () => {
      try {
        const r = await fetch("/maps/peru-departments.geojson", {
          signal: controller.signal,
        })
        if (!r.ok) throw new Error("geography")
        const geometry = (await r.json()) as Geography
        if (disposed) return
        data.current = geometry
        // A failed GPU constructor can leave a partial canvas in the host.
        host.current!.replaceChildren()
        current = new GLMap({
          container: host.current!,
          style: "/maps/atlas-style.json",
          center: [-75, -9.5],
          zoom: 4.2,
          pitch: 25,
          minZoom: 3,
          maxZoom: 15,
          maxPitch: 65,
          maxBounds: [
            [-91, -27],
            [-58, 9],
          ],
          attributionControl: false,
          cooperativeGestures: true,
          canvasContextAttributes: { antialias: true },
          locale: {
            "NavigationControl.ZoomIn": "Acercar",
            "NavigationControl.ZoomOut": "Alejar",
            "NavigationControl.ResetBearing": "Orientar al norte",
            "CooperativeGesturesHandler.WindowsHelpText":
              "Usa Ctrl + rueda para acercar el mapa",
            "CooperativeGesturesHandler.MacHelpText":
              "Usa ⌘ + rueda para acercar el mapa",
            "CooperativeGesturesHandler.MobileHelpText":
              "Usa dos dedos para mover el mapa",
          },
        })
        map.current = current
        current.addControl(
          new NavigationControl({ visualizePitch: true }),
          "top-right",
        )
        current.addControl(
          new AttributionControl({
            compact: true,
            customAttribution:
              'Límites: <a href="https://github.com/juaneladio/peru-geojson" target="_blank" rel="noreferrer">peru-geojson</a>',
          }),
          "bottom-right",
        )
        current.on("error", () => {
          if (!disposed) setTileError(true)
        })
        current.on("webglcontextlost", showUnavailable)
        current.on("load", () => {
          if (disposed || !current) return
          current.addSource("elevation", {
            type: "raster-dem",
            tiles: ["https://tiles.mapterhorn.com/{z}/{x}/{y}.webp"],
            tileSize: 512,
            encoding: "terrarium",
            maxzoom: 14,
            attribution:
              '<a href="https://mapterhorn.com/attribution/" target="_blank" rel="noreferrer">© Mapterhorn</a>',
          })
          current.addSource("shading", {
            type: "raster-dem",
            tiles: ["https://tiles.mapterhorn.com/{z}/{x}/{y}.webp"],
            tileSize: 512,
            encoding: "terrarium",
            maxzoom: 14,
          })
          const firstLine = current
            .getStyle()
            .layers.find((l) => l.type === "line")?.id
          current.addLayer(
            {
              id: "relief-shading",
              type: "hillshade",
              source: "shading",
              paint: {
                "hillshade-exaggeration": 0.45,
                "hillshade-shadow-color": "#615e46",
                "hillshade-highlight-color": "#fff7db",
                "hillshade-accent-color": "#766b4e",
              },
            },
            firstLine,
          )
          current.setTerrain(terrainRef.current ? { source: "elevation", exaggeration: 1.4 } : null)
          current.addSource("departments", { type: "geojson", data: geometry })
          current.addLayer({
            id: "department-fill",
            type: "fill",
            source: "departments",
            paint: {
              "fill-color": "#aa4e32",
              "fill-opacity": [
                "case",
                ["==", ["get", "name"], selectedRef.current],
                0.18,
                0.015,
              ],
            },
          })
          current.addLayer({
            id: "department-line",
            type: "line",
            source: "departments",
            paint: {
              "line-color": "#6a6653",
              "line-width": 0.8,
              "line-opacity": 0.65,
            },
          })
          current.addLayer({
            id: "department-active",
            type: "line",
            source: "departments",
            filter: ["==", ["get", "name"], selectedRef.current],
            paint: { "line-color": "#a34023", "line-width": 2.7 },
          })
          current.addLayer({
            id: "department-hover",
            type: "line",
            source: "departments",
            filter: ["==", ["get", "name"], ""],
            paint: { "line-color": "#733f27", "line-width": 2 },
          })
          const click = (event: MapLayerMouseEvent) => {
            const name = event.features?.[0]?.properties?.name
            if (typeof name === "string") selectRef.current(name)
          }
          current.on("click", "department-fill", click)
          current.on("mousemove", "department-fill", (event) => {
            const name = event.features?.[0]?.properties?.name
            if (typeof name === "string") {
              setHovered(name)
              current!.getCanvas().style.cursor = "pointer"
              current!.setFilter("department-hover", [
                "==",
                ["get", "name"],
                name,
              ])
            }
          })
          current.on("mouseleave", "department-fill", () => {
            setHovered("")
            current!.getCanvas().style.cursor = ""
            current!.setFilter("department-hover", ["==", ["get", "name"], ""])
          })
          current
            .getCanvas()
            .setAttribute(
              "aria-label",
              "Mapa del Perú. Usa los controles para acercarte o el selector de región para explorar con teclado.",
            )
          current.resize()
          frame(selectedRef.current, false)
          // A loaded style is not proof that a visible map has rendered.
          // Wait for the first complete frame before exposing the canvas.
          const revealMap = () => {
            if (disposed || !current) return
            const rect = current.getContainer().getBoundingClientRect()
            if (rect.width < 1 || rect.height < 1) return
            current.off("idle", revealMap)
            clearTimeout(timer)
            setStatus("ready")
          }
          current.on("idle", revealMap)
        })
      } catch (error) {
        if (
          !disposed &&
          !(error instanceof DOMException && error.name === "AbortError")
        ) {
          console.warn("El mapa no está disponible en este navegador:", error)
          showUnavailable()
        }
      }
    }
    timer = setTimeout(showUnavailable, 22000)
    initialize()
    return () => {
      disposed = true
      controller.abort()
      clearTimeout(timer)
      current?.remove()
      map.current = null
    }
  }, [attempt])
  useEffect(() => {
    const m = map.current
    if (status !== "ready" || !m) return
    m.setFilter("department-active", ["==", ["get", "name"], selected])
    m.setPaintProperty("department-fill", "fill-opacity", [
      "case",
      ["==", ["get", "name"], selected],
      0.18,
      0.015,
    ])
    frame(selected)
  }, [selected, status])
  useEffect(() => {
    const m = map.current
    if (status !== "ready" || !m) return
    m.setTerrain(terrain ? { source: "elevation", exaggeration: 1.4 } : null)
    m.easeTo({
      pitch: terrain ? (selected ? 48 : 25) : 0,
      duration: reduce() ? 0 : 700,
    })
  }, [terrain, status])
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        map.current?.resize()
        if (status === "ready") frame(selected, false)
      }, 80)
      return () => clearTimeout(timer)
    }
  }, [visible, status])
  useEffect(() => {
    if (!host.current) return
    const observer = new ResizeObserver(() => {
      if (host.current?.clientWidth && host.current.clientHeight) map.current?.resize()
    })
    observer.observe(host.current)
    return () => observer.disconnect()
  }, [])
  return (
    <div className="atlas" aria-label="Explorador geográfico">
      <div ref={host} className={`atlas-canvas ${status === "ready" ? "is-ready" : ""}`} />
      {status === "loading" && <div className="map-loading" role="status"><Icon name="mountain" size={42} /><span>Preparando el paisaje del Perú…</span><small>El mapa con relieve necesita conexión a internet.</small></div>}
      {status === "unavailable" && <div className="map-unavailable">
        <Icon name="mountain" size={42} />
        <p className="eyebrow">EL PERÚ SIGUE A TU ALCANCE</p>
        <h3>El mapa no pudo cargarse</h3>
        <p>Comprueba tu conexión o vuelve a intentarlo en un navegador con aceleración gráfica. También puedes explorar los museos seleccionando una región.</p>
        <button className="button primary" onClick={() => setAttempt(a => a + 1)}><Icon name="reset" size={17} /> Reintentar mapa</button>
        <div className="region-choices" aria-label="Seleccionar región">{departments.map(d => <button key={d} aria-pressed={selected === d} onClick={() => onSelect(d)}>{d}<span>{counts[d]}</span></button>)}</div>
        <button className="text-link" onClick={() => onSelect("")}>Ver todo el Perú <Icon name="arrow" size={16} /></button>
      </div>}
      {status === "ready" && <>
        <div className="atlas-caption"><span className="eyebrow">ATLAS DEL PERÚ</span><strong>{hovered || selected || "Explora el Perú"}</strong><span>{hovered ? `${counts[hovered] || 0} espacios en el catálogo` : "Selecciona un territorio para descubrir sus museos"}</span></div>
        <div className="map-mode" aria-label="Presentación del mapa">
          <button className={terrain ? "active" : ""} aria-pressed={terrain} onClick={() => setTerrain(true)}><Icon name="mountain" size={16} /> Relieve 3D</button>
          <button className={!terrain ? "active" : ""} aria-pressed={!terrain} onClick={() => setTerrain(false)}>Plano</button>
        </div>
        <div className="map-bottom"><button className="map-reset" onClick={() => { onSelect(""); frame("") }}><Icon name="reset" size={16} /> Ver todo el Perú</button><button className="callao-button" onClick={() => onSelect("Callao")}>Explorar Callao <Icon name="arrow" size={14} /></button></div>
        {tileError && <div className="tile-warning" role="status">No se pudieron cargar algunas capas del mapa. <button onClick={() => setAttempt(a => a + 1)}>Reintentar</button></div>}
      </>}
    </div>
  )
}
