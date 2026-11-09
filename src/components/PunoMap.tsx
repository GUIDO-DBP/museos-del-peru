import { useEffect, useRef, useState } from "react"
import { Map as GLMap, Marker, NavigationControl, LngLat, setWorkerUrl, type StyleSpecification } from "maplibre-gl"
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url"
import type { FeatureCollection, Polygon, MultiPolygon } from "geojson"
import "maplibre-gl/dist/maplibre-gl.css"
import { punoPlaces, punoProvinces } from "../puno-data"
import { Icon } from "./Icon"
import { constrainPunoCamera } from "../puno-camera"

setWorkerUrl(workerUrl)
type Provinces = FeatureCollection<Polygon | MultiPolygon, { id: string; label: [number, number] }>

export default function PunoMap({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const host = useRef<HTMLDivElement>(null)
  const map = useRef<GLMap | null>(null)
  const labels = useRef<Marker[]>([])
  const selection = useRef(selected)
  const select = useRef(onSelect)
  selection.current = selected
  select.current = onSelect
  const [status, setStatus] = useState("loading")
  const [attempt, setAttempt] = useState(0)
  const [tileError, setTileError] = useState(false)
  const bounds = useRef<[[number, number], [number, number]] | null>(null)
  function frame() {
    const current = map.current
    const region = bounds.current
    if (!current || !region || !host.current?.clientWidth || !host.current.clientHeight) return
    current.stop()
    current.setTransformConstrain(null)
    current.setMinZoom(0)
    const camera = current.cameraForBounds(region, { padding: 40, bearing: 0 })
    if (!camera?.center || camera.zoom === undefined) return
    const width = host.current.clientWidth, height = host.current.clientHeight, minZoom = camera.zoom
    current.setMinZoom(minZoom)
    current.setTransformConstrain((center, zoom) => {
      const constrained = constrainPunoCamera(region, width, height, minZoom, center.lng, center.lat, zoom)
      return { center: new LngLat(constrained.longitude, constrained.latitude), zoom: constrained.zoom }
    })
    current.jumpTo({ ...camera, pitch: 0 })
  }
  useEffect(() => {
    const controller = new AbortController()
    let disposed = false
    let current: GLMap | undefined
    let observer: ResizeObserver | undefined
    setStatus("loading")
    setTileError(false)
    const unavailable = () => {
      if (disposed) return
      clearTimeout(timer)
      setStatus("unavailable")
      controller.abort()
      labels.current.forEach(label => label.remove())
      labels.current = []
      current?.remove()
      current = undefined
      map.current = null
    }
    const timer = setTimeout(unavailable, 22000)
    async function initialize() {
      try {
        const [polygonsResponse, styleResponse, exteriorResponse] = await Promise.all([
          fetch("/maps/puno-provinces.geojson", { signal: controller.signal }),
          fetch("/maps/atlas-style.json", { signal: controller.signal }),
          fetch("/maps/puno-exterior.geojson", { signal: controller.signal }),
        ])
        if (!polygonsResponse.ok || !styleResponse.ok || !exteriorResponse.ok) throw new Error("map resources")
        const geography = await polygonsResponse.json() as Provinces
        const style = await styleResponse.json() as StyleSpecification
        const exterior = await exteriorResponse.json()
        if (disposed) return
        // Tune this fetched copy only: national style and map remain unchanged.
        for (const layer of style.layers) {
          if (layer.type === "background") layer.paint = { "background-color": "#f1f3ee" }
          if (layer.id === "natural_earth" && layer.type === "raster") layer.paint = { "raster-opacity": 0.7, "raster-saturation": -0.55 }
          if (layer.id === "water" && layer.type === "fill") layer.paint = { "fill-color": "#aacbd6", "fill-opacity": 0.95 }
          if (layer.id === "landcover_grass" && layer.type === "fill") layer.paint = { ...layer.paint, "fill-opacity": 0.12 }
          if (layer.id === "landcover_wood" && layer.type === "fill") layer.paint = { ...layer.paint, "fill-opacity": 0.2 }
        }
        const coordinates: number[][] = []
        for (const feature of geography.features) {
          const polygons = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates
          for (const polygon of polygons) for (const ring of polygon) coordinates.push(...ring)
        }
        bounds.current = [
          [Math.min(...coordinates.map(c => c[0])), Math.min(...coordinates.map(c => c[1]))],
          [Math.max(...coordinates.map(c => c[0])), Math.max(...coordinates.map(c => c[1]))],
        ]
        host.current!.replaceChildren()
        current = new GLMap({
          container: host.current!, style, center: [-70, -15], zoom: 5.5,
          attributionControl: false, cooperativeGestures: true, pitch: 0, maxPitch: 0,
          maxZoom: 14, renderWorldCopies: false, dragRotate: false, touchZoomRotate: { around: "center" },
          canvasContextAttributes: { antialias: true },
          locale: {
            "NavigationControl.ZoomIn": "Acercar", "NavigationControl.ZoomOut": "Alejar",
            "CooperativeGesturesHandler.WindowsHelpText": "Usa Ctrl + rueda para acercar el mapa",
            "CooperativeGesturesHandler.MacHelpText": "Usa ⌘ + rueda para acercar el mapa",
            "CooperativeGesturesHandler.MobileHelpText": "Usa dos dedos para mover el mapa",
          },
        })
        map.current = current
        current.touchZoomRotate.disableRotation()
        current.keyboard.disableRotation()
        current.on("idle", () => { if (!disposed) host.current?.setAttribute("data-idle", "true") })
        current.addControl(new NavigationControl({ showCompass: false }), "top-right")
        current.on("webglcontextlost", unavailable)
        current.on("error", () => { if (!disposed) setTileError(true) })
        current.on("load", () => {
          if (disposed || !current) return
          current.addSource("puno-shading", {
            type: "raster-dem", tiles: ["https://tiles.mapterhorn.com/{z}/{x}/{y}.webp"],
            tileSize: 512, encoding: "terrarium", maxzoom: 14,
            attribution: '<a href="https://mapterhorn.com/attribution/" target="_blank" rel="noreferrer">© Mapterhorn</a>',
          })
          const water = style.layers.find(l => l.id === "water")?.id
          current.addLayer({ id: "puno-hillshade", type: "hillshade", source: "puno-shading", paint: {
            "hillshade-exaggeration": 0.55, "hillshade-shadow-color": "#48574e",
            "hillshade-highlight-color": "#ffffff", "hillshade-accent-color": "#7d8b7e",
          } }, water)
          current.addSource("puno-exterior", { type: "geojson", data: exterior })
          current.addLayer({ id: "puno-exterior", type: "fill", source: "puno-exterior", paint: {
            "fill-color": "#f7f8f6", "fill-opacity": 0.5,
          } })
          current.addSource("puno-provinces", { type: "geojson", data: geography })
          current.addLayer({ id: "puno-fill", type: "fill", source: "puno-provinces", paint: {
            "fill-color": "#93482f", "fill-opacity": ["case", ["==", ["get", "id"], selection.current], 0.055, 0],
          } })
          current.addLayer({ id: "puno-lines-halo", type: "line", source: "puno-provinces", paint: { "line-color": "#ffffff", "line-width": 2.7, "line-opacity": 0.8 } })
          current.addLayer({ id: "puno-lines", type: "line", source: "puno-provinces", paint: { "line-color": "#435d50", "line-width": 1.1, "line-opacity": 0.8 } })
          current.addLayer({ id: "puno-selection-halo", type: "line", source: "puno-provinces", filter: ["==", ["get", "id"], selection.current], paint: { "line-color": "#ffffff", "line-width": 6 } })
          current.addLayer({ id: "puno-selection", type: "line", source: "puno-provinces", filter: ["==", ["get", "id"], selection.current], paint: { "line-color": "#a1442c", "line-width": 3.2 } })
          current.on("click", "puno-fill", event => {
            const id = event.features?.[0]?.properties.id
            if (typeof id === "string") select.current(id)
          })
          current.on("mouseenter", "puno-fill", () => { current!.getCanvas().style.cursor = "pointer" })
          current.on("mouseleave", "puno-fill", () => { current!.getCanvas().style.cursor = "" })
          labels.current = geography.features.map(feature => {
            const province = punoProvinces.find(p => p.id === feature.properties.id)!
            const count = punoPlaces.filter(p => p.provinceId === province.id).length
            const button = document.createElement("button")
            button.type = "button"
            button.id = `puno-province-${province.id}`
            button.className = "puno-terrain-label"
            button.textContent = province.name
            button.dataset.province = province.id
            button.setAttribute("aria-label", `${province.name}, ${count} ${count === 1 ? "lugar" : "lugares"}`)
            button.setAttribute("aria-pressed", String(selection.current === province.id))
            button.addEventListener("click", event => { event.stopPropagation(); select.current(province.id) })
            const offset: [number, number] = province.id === "2104" ? [22, 20] : province.id === "2110" ? [32, -14] : province.id === "2109" ? [12, 5] : [0, 0]
            return new Marker({ element: button, offset }).setLngLat(feature.properties.label).addTo(current!)
          })
          current.getCanvas().setAttribute("aria-label", "Terreno de Puno con límites provinciales. Usa las etiquetas o el selector de provincias.")
          frame()
          clearTimeout(timer)
          setStatus("ready")
        })
        observer = new ResizeObserver(() => {
          if (host.current?.clientWidth && host.current.clientHeight) { current?.resize(); frame() }
        })
        observer.observe(host.current!)
      } catch { if (!disposed) unavailable() }
    }
    initialize()
    return () => {
      disposed = true
      clearTimeout(timer)
      controller.abort()
      observer?.disconnect()
      labels.current.forEach(label => label.remove())
      labels.current = []
      current?.remove()
      map.current = null
    }
  }, [attempt])

  useEffect(() => {
    const current = map.current
    if (status !== "ready" || !current) return
    current.setFilter("puno-selection", ["==", ["get", "id"], selected])
    current.setFilter("puno-selection-halo", ["==", ["get", "id"], selected])
    current.setPaintProperty("puno-fill", "fill-opacity", ["case", ["==", ["get", "id"], selected], 0.055, 0])
    for (const label of labels.current) label.getElement().setAttribute("aria-pressed", String(label.getElement().dataset.province === selected))
  }, [selected, status])

  return <figure className="puno-map">
    <div className="puno-map-kicker"><span>EL TERRITORIO DE PUNO</span><span>13 provincias</span></div>
    <div className="puno-terrain" role="group" aria-label="Mapa de las provincias de Puno" data-map-status={status}>
      <div ref={host} className="puno-terrain-canvas" />
      {status === "loading" && <p className="puno-terrain-message" role="status">Preparando el terreno de Puno…</p>}
      {status === "unavailable" && <div className="puno-terrain-message"><Icon name="map" size={28} /><p>No se pudo cargar el terreno. Puedes explorar con el selector de provincias.</p><button className="text-link" onClick={() => setAttempt(i => i + 1)}>Reintentar mapa</button></div>}
      {status === "ready" && <button className="puno-map-reset" onClick={frame}><Icon name="reset" size={16} /> Puno completo</button>}
    </div>
    {tileError && status === "ready" && <p className="puno-map-warning" role="status">Algunas capas del terreno no se pudieron cargar. <button onClick={() => setAttempt(i => i + 1)}>Reintentar</button></p>}
    <figcaption>
      <p className="puno-map-attribution"><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a> · <a href="https://openmaptiles.org/" target="_blank" rel="noreferrer">© OpenMapTiles</a> · <a href="https://openfreemap.org/" target="_blank" rel="noreferrer">OpenFreeMap</a> · <a href="https://mapterhorn.com/attribution/" target="_blank" rel="noreferrer">© Mapterhorn</a> · <a href="https://www.geoboundaries.org/" target="_blank" rel="noreferrer">geoBoundaries</a></p>
      <details className="puno-map-info">
        <summary>Información del mapa</summary>
        <p>Límites referenciales de IGN–OCHA ROLAC, simplificados conservando las fronteras compartidas. <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>; origen <a href="https://creativecommons.org/licenses/by/3.0/igo/" target="_blank" rel="noreferrer">CC BY 3.0 IGO</a>. El exterior atenuado se deriva de esos mismos límites.</p>
        <p>Datos de la base bajo <a href="https://opendatacommons.org/licenses/odbl/" target="_blank" rel="noreferrer">ODbL</a>. Fondo <a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noreferrer">Natural Earth, dominio público</a>. <a href="https://download.mapterhorn.com/attribution.json" target="_blank" rel="noreferrer">Catálogo de fuentes y licencias del relieve</a>.</p>
        <p lang="en">Produced using Copernicus WorldDEM-30 © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018 provided under COPERNICUS by the European Union and ESA; all rights reserved. <a href="https://github.com/mapterhorn/mapterhorn/blob/main/source-catalog/glo30/LICENSE.pdf" target="_blank" rel="noreferrer">Copernicus licence</a>.</p>
        <p>Las organizaciones a cargo del programa Copernicus por ley o delegación no incurren en responsabilidad alguna por el uso de Copernicus WorldDEM-30.</p>
      </details>
    </figcaption>
  </figure>
}
