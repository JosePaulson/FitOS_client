import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Leaflet's default marker icon references image files that don't survive
// bundling with Vite unless pointed at explicit URLs — rebuild it manually.
const pinIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const DEFAULT_CENTER = [12.9716, 77.5946] // Bengaluru — just a reasonable fallback if nothing is set yet

/** Recenters the map imperatively when `center` changes (e.g. "use my location"). */
function Recenter({ center }) {
  const map = useMapEvents({})
  useEffect(() => { if (center) map.setView(center, map.getZoom()) }, [center]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

/** Clicking anywhere on the map moves the pin there too, not just dragging it. */
function ClickToPlace({ onPlace }) {
  useMapEvents({ click(e) { onPlace([e.latlng.lat, e.latlng.lng]) } })
  return null
}

/**
 * Drag-and-drop (or click-to-place) pin for setting a gym's location.
 * `value` is { lat, lng } or null. Calls onChange({ lat, lng }) whenever
 * the pin moves.
 */
export default function GymLocationMap({ value, onChange }) {
  const [position, setPosition] = useState(value?.lat != null ? [value.lat, value.lng] : null)
  const [recenterTo, setRecenterTo] = useState(null)
  const [locating, setLocating] = useState(false)
  const markerRef = useRef(null)

  useEffect(() => {
    if (value?.lat != null && value?.lng != null) setPosition([value.lat, value.lng])
  }, [value?.lat, value?.lng])

  function place(latlng) {
    setPosition(latlng)
    onChange({ lat: latlng[0], lng: latlng[1] })
  }

  function useMyLocation() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = [pos.coords.latitude, pos.coords.longitude]
        place(latlng)
        setRecenterTo(latlng)
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden border rounded-xl border-white/10" style={{ height: 320 }}>
        <MapContainer center={position || DEFAULT_CENTER} zoom={position ? 17 : 12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToPlace onPlace={place} />
          <Recenter center={recenterTo} />
          {position && (
            <Marker
              position={position}
              icon={pinIcon}
              draggable
              ref={markerRef}
              eventHandlers={{
                dragend: () => {
                  const m = markerRef.current
                  if (m) place([m.getLatLng().lat, m.getLatLng().lng])
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted">
          {position
            ? `${position[0].toFixed(6)}, ${position[1].toFixed(6)} — drag the pin or click the map to fine-tune`
            : 'Click the map to drop a pin at your gym\'s entrance'}
        </p>
        <button type="button" onClick={useMyLocation} disabled={locating}
          className="shrink-0 text-xs border border-white/10 text-muted hover:text-cream px-3 py-1.5 rounded-lg hover:border-white/20 transition-all disabled:opacity-50">
          {locating ? 'Locating…' : '📍 Use my current location'}
        </button>
      </div>
    </div>
  )
}
