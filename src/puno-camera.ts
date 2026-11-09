export type RegionalBounds = [[number, number], [number, number]]
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value))
const x = (longitude: number) => (longitude + 180) / 360
const y = (latitude: number) => (1 - Math.log(Math.tan(Math.PI / 4 + latitude * Math.PI / 360)) / Math.PI) / 2
const latitude = (mercatorY: number) => Math.atan(Math.sinh(Math.PI * (1 - 2 * mercatorY))) * 180 / Math.PI

// Keep the viewport over the region. If an axis already fits entirely, lock its
// center instead of zooming in to satisfy maxBounds and clipping the other axis.
export function constrainPunoCamera(bounds: RegionalBounds, width: number, height: number, minZoom: number,
  longitude: number, lat: number, requestedZoom: number, padding = 40) {
  const zoom = clamp(requestedZoom, minZoom, 14)
  const world = 512 * 2 ** zoom
  const west = x(bounds[0][0]), east = x(bounds[1][0])
  const north = y(bounds[1][1]), south = y(bounds[0][1])
  const centerX = (west + east) / 2, centerY = (north + south) / 2
  const rangeX = Math.max(0, (east - west) / 2 - Math.max(0, width / 2 - padding) / world)
  const rangeY = Math.max(0, (south - north) / 2 - Math.max(0, height / 2 - padding) / world)
  return { longitude: clamp(x(longitude), centerX - rangeX, centerX + rangeX) * 360 - 180,
    latitude: latitude(clamp(y(clamp(lat, -85, 85)), centerY - rangeY, centerY + rangeY)), zoom }
}
