import { useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../styles/RouteViewer.css'

// Fix para ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function RouteViewer({ route, height = 300 }) {
  if (!route || !route.coordinates || route.coordinates.length === 0) {
    return null
  }

  // Converter coordenadas do Firestore para formato do Leaflet
  const convertCoordinates = (coords) => {
    if (!coords || coords.length === 0) return []
    // Se já está no formato [lat, lng], retorna como está
    if (Array.isArray(coords[0]) && typeof coords[0][0] === 'number') {
      return coords
    }
    // Se está no formato {lat, lng}, converte para [lat, lng]
    return coords.map(c => [c.lat || c[0], c.lng || c[1]])
  }

  const coordinates = convertCoordinates(route.coordinates)

  const getCenter = () => {
    const lats = coordinates.map(c => c[0])
    const lons = coordinates.map(c => c[1])
    return [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lons) + Math.max(...lons)) / 2
    ]
  }

  const getBounds = () => {
    const lats = coordinates.map(c => c[0])
    const lons = coordinates.map(c => c[1])
    return [
      [Math.min(...lats), Math.min(...lons)],
      [Math.max(...lats), Math.max(...lons)]
    ]
  }

  return (
    <div className="route-viewer" style={{ height: `${height}px` }}>
      <MapContainer
        center={getCenter()}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        bounds={getBounds()}
        boundsOptions={{ padding: [20, 20] }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline
          positions={coordinates}
          color="#6366f1"
          weight={5}
          opacity={0.9}
        />
        {coordinates.length > 0 && (
          <>
            <Marker position={coordinates[0]} />
            {coordinates.length > 1 && (
              <Marker position={coordinates[coordinates.length - 1]} />
            )}
          </>
        )}
      </MapContainer>
    </div>
  )
}

export default RouteViewer

