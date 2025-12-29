import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, useMapEvents } from 'react-leaflet'
import { useRoutes } from '../hooks/useRoutes'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../styles/RouteManager.css'

// Fix para ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function MapClickHandler({ onMapClick, isDrawing }) {
  useMapEvents({
    click: (e) => {
      if (isDrawing) {
        onMapClick(e.latlng)
      }
    }
  })
  return null
}

function RouteManager({ userId }) {
  const { routes, loading, addRoute, deleteRoute } = useRoutes(userId)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [routeName, setRouteName] = useState('')
  const [routeDescription, setRouteDescription] = useState('')
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentRoute, setCurrentRoute] = useState([])
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [compareMode, setCompareMode] = useState(false)
  const [routesToCompare, setRoutesToCompare] = useState([])
  const mapRef = useRef(null)

  const handleMapClick = (latlng) => {
    if (isDrawing) {
      setCurrentRoute([...currentRoute, [latlng.lat, latlng.lng]])
    }
  }

  const startDrawing = () => {
    setIsDrawing(true)
    setCurrentRoute([])
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCurrentRoute = () => {
    setCurrentRoute([])
  }

  const saveRoute = async () => {
    if (currentRoute.length < 2) {
      alert('Adicione pelo menos 2 pontos para criar uma rota')
      return
    }

    if (!routeName.trim()) {
      alert('Digite um nome para a rota')
      return
    }

    // Calcular distância total da rota
    let totalDistance = 0
    for (let i = 1; i < currentRoute.length; i++) {
      const [lat1, lon1] = currentRoute[i - 1]
      const [lat2, lon2] = currentRoute[i]
      totalDistance += calculateDistance(lat1, lon1, lat2, lon2)
    }
    totalDistance = Math.round(totalDistance * 100) / 100 // Arredondar para 2 casas decimais

    // Converter coordenadas para formato compatível com Firestore (array de objetos)
    const coordinatesForFirestore = currentRoute.map(([lat, lng]) => ({
      lat,
      lng
    }))

    const route = {
      name: routeName,
      description: routeDescription,
      coordinates: coordinatesForFirestore,
      distance: totalDistance,
      pointCount: currentRoute.length
    }

    const result = await addRoute(route)
    if (result.success) {
      alert('Rota salva com sucesso!')
      setRouteName('')
      setRouteDescription('')
      setCurrentRoute([])
      setIsDrawing(false)
      setShowCreateForm(false)
    } else {
      alert('Erro ao salvar rota: ' + result.error)
    }
  }

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const handleDeleteRoute = async (routeId) => {
    if (window.confirm('Tem certeza que deseja excluir esta rota?')) {
      const result = await deleteRoute(routeId)
      if (!result.success) {
        alert('Erro ao excluir rota: ' + result.error)
      }
    }
  }

  const toggleCompareRoute = (routeId) => {
    if (routesToCompare.includes(routeId)) {
      setRoutesToCompare(routesToCompare.filter(id => id !== routeId))
    } else {
      setRoutesToCompare([...routesToCompare, routeId])
    }
  }

  // Converter coordenadas do Firestore para formato do Leaflet
  const convertCoordinatesForLeaflet = (coords) => {
    if (!coords || coords.length === 0) return []
    // Se já está no formato [lat, lng], retorna como está
    if (Array.isArray(coords[0]) && typeof coords[0][0] === 'number') {
      return coords
    }
    // Se está no formato {lat, lng}, converte para [lat, lng]
    return coords.map(c => [c.lat || c[0], c.lng || c[1]])
  }

  const getRouteBounds = (coords) => {
    if (!coords || coords.length === 0) return null
    const converted = convertCoordinatesForLeaflet(coords)
    const lats = converted.map(c => c[0])
    const lons = converted.map(c => c[1])
    return [[Math.min(...lats), Math.min(...lons)], [Math.max(...lats), Math.max(...lons)]]
  }

  const getCenter = (coords) => {
    if (!coords || coords.length === 0) return [-23.5505, -46.6333] // São Paulo default
    const converted = convertCoordinatesForLeaflet(coords)
    const lats = converted.map(c => c[0])
    const lons = converted.map(c => c[1])
    return [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lons) + Math.max(...lons)) / 2
    ]
  }

  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444']

  if (loading) {
    return (
      <div className="route-manager-container">
        <div className="loading-state">
          <p>Carregando rotas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="route-manager-container">
      <div className="routes-header">
        <h2>Gerenciar Rotas</h2>
        <div className="routes-actions">
          <button
            className="action-button primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancelar' : '+ Nova Rota'}
          </button>
          <button
            className={`action-button ${compareMode ? 'active' : ''}`}
            onClick={() => {
              setCompareMode(!compareMode)
              setRoutesToCompare([])
              setSelectedRoute(null)
            }}
          >
            {compareMode ? 'Sair do Modo Comparação' : 'Comparar Rotas'}
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="create-route-form">
          <h3>Criar Nova Rota</h3>
          <div className="form-group">
            <label>Nome da Rota</label>
            <input
              type="text"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              placeholder="Ex: Parque Ibirapuera"
              required
            />
          </div>
          <div className="form-group">
            <label>Descrição (opcional)</label>
            <textarea
              value={routeDescription}
              onChange={(e) => setRouteDescription(e.target.value)}
              placeholder="Descrição da rota..."
              rows="2"
            />
          </div>
          <div className="drawing-controls">
            <button
              type="button"
              className={`draw-button ${isDrawing ? 'active' : ''}`}
              onClick={isDrawing ? stopDrawing : startDrawing}
            >
              {isDrawing ? '✓ Parar Desenho' : '✏️ Começar a Desenhar'}
            </button>
            {currentRoute.length > 0 && (
              <button
                type="button"
                className="clear-button"
                onClick={clearCurrentRoute}
              >
                Limpar
              </button>
            )}
            {currentRoute.length > 0 && (
              <span className="route-info">
                {currentRoute.length} ponto(s) - {currentRoute.length >= 2 ? 
                  (() => {
                    let dist = 0
                    for (let i = 1; i < currentRoute.length; i++) {
                      dist += calculateDistance(
                        currentRoute[i - 1][0], currentRoute[i - 1][1],
                        currentRoute[i][0], currentRoute[i][1]
                      )
                    }
                    return dist.toFixed(2) + ' km'
                  })() : 
                  'Adicione mais pontos'}
              </span>
            )}
          </div>
          {currentRoute.length >= 2 && (
            <button
              type="button"
              className="save-route-button"
              onClick={saveRoute}
            >
              Salvar Rota
            </button>
          )}
        </div>
      )}

      <div className="routes-content">
        <div className="routes-list">
          <h3>Suas Rotas ({routes.length})</h3>
          {routes.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma rota cadastrada.</p>
              <p>Crie uma nova rota para começar!</p>
            </div>
          ) : (
            <div className="routes-cards">
              {routes.map(route => (
                <div key={route.id} className="route-card">
                  <div className="route-card-header">
                    <h4>{route.name}</h4>
                    <button
                      className="delete-route-button"
                      onClick={() => handleDeleteRoute(route.id)}
                    >
                      ×
                    </button>
                  </div>
                  {route.description && (
                    <p className="route-description">{route.description}</p>
                  )}
                  <div className="route-stats">
                    <span>Distância: {route.distance?.toFixed(2) || 'N/A'} km</span>
                    <span>Pontos: {route.pointCount || 0}</span>
                  </div>
                  <div className="route-actions">
                    <button
                      className="view-route-button"
                      onClick={() => {
                        setSelectedRoute(route.id)
                        setCompareMode(false)
                      }}
                    >
                      Visualizar
                    </button>
                    {compareMode && (
                      <button
                        className={`compare-route-button ${routesToCompare.includes(route.id) ? 'active' : ''}`}
                        onClick={() => toggleCompareRoute(route.id)}
                      >
                        {routesToCompare.includes(route.id) ? '✓ Selecionada' : 'Comparar'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="map-container">
          <MapContainer
            center={
              selectedRoute && routes.find(r => r.id === selectedRoute) ? 
                getCenter(routes.find(r => r.id === selectedRoute).coordinates) :
              routesToCompare.length > 0 && routes.find(r => r.id === routesToCompare[0]) ?
                getCenter(routes.find(r => r.id === routesToCompare[0]).coordinates) :
              currentRoute.length > 0 ?
                getCenter(currentRoute) :
                [-23.5505, -46.6333]
            }
            zoom={selectedRoute || routesToCompare.length > 0 || currentRoute.length > 0 ? 13 : 10}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onMapClick={handleMapClick} isDrawing={isDrawing} />
            
            {/* Rota sendo desenhada */}
            {currentRoute.length > 1 && (
              <Polyline
                positions={currentRoute}
                color="#6366f1"
                weight={4}
                opacity={0.8}
              />
            )}

            {/* Marcadores da rota sendo desenhada */}
            {currentRoute.map((point, idx) => (
              <Marker key={idx} position={point} />
            ))}

            {/* Rota selecionada */}
            {selectedRoute && !compareMode && routes.find(r => r.id === selectedRoute) && (() => {
              const selectedRouteData = routes.find(r => r.id === selectedRoute)
              const coords = convertCoordinatesForLeaflet(selectedRouteData.coordinates)
              return (
                <>
                  <Polyline
                    positions={coords}
                    color="#6366f1"
                    weight={5}
                    opacity={0.9}
                  />
                  {coords.length > 0 && (
                    <>
                      <Marker position={coords[0]} />
                      {coords.length > 1 && (
                        <Marker position={coords[coords.length - 1]} />
                      )}
                    </>
                  )}
                </>
              )
            })()}

            {/* Rotas para comparação */}
            {compareMode && routesToCompare.map((routeId, idx) => {
              const route = routes.find(r => r.id === routeId)
              if (!route) return null
              const coords = convertCoordinatesForLeaflet(route.coordinates)
              return (
                <Polyline
                  key={routeId}
                  positions={coords}
                  color={colors[idx % colors.length]}
                  weight={4}
                  opacity={0.7}
                />
              )
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}

export default RouteManager

