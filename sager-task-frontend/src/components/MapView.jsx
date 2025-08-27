import { useEffect, useMemo, useRef, useState } from 'react'
import Map, { Source, Layer, Marker, Popup } from 'react-map-gl'
import io from 'socket.io-client'
import { useDispatch, useSelector } from 'react-redux'
import { BACKEND_WS, MAPBOX_TOKEN } from '../config'
import { 
  upsertFromFeature, 
  selectDrone, 
  selectSelected, 
  selectFocused, 
  selectAllDrones, 
  unfocusDrone,
  updateDronePosition 
} from '../store/dronesSlice'
import DroneIcon from './DroneIcon'
import { isAllowed, msToHMS } from '../utils/formatters'

const lineLayer = {
  id: 'paths',
  type: 'line',
  paint: {
    'line-width': [
      'case',
      ['==', ['get', 'isFocused'], true], 4,
      3
    ],
    'line-color': ['get', 'color'],
    'line-opacity': 0.8,
    'line-blur': 0.3,
  },
  layout: {
    'line-cap': 'round',
    'line-join': 'round'
  }
}

export default function MapView() {
  const mapRef = useRef(null)
  const dispatch = useDispatch()
  const drones = useSelector(selectAllDrones)
  const selectedSerial = useSelector(selectSelected)
  const focusedSerial = useSelector(selectFocused)
  const [hovered, setHovered] = useState(null)
  const animationRef = useRef(null)
  
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .selected-drone {
        z-index: 10 !important;
        filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
      }
      
      .drone-wrapper {
        transition: transform 0.3s ease;
      }
      
      .drone-wrapper:hover {
        transform: scale(1.1);
      }
      
      .mapboxgl-popup-content {
        background: #262837;
        color: white;
        border-radius: 10px;
        box-shadow: 0 3px 14px rgba(0, 0, 0, 0.4);
        padding: 12px;
        min-width: 200px;
      }

      .mapboxgl-popup-tip {
        border-top-color: #262837;
        border-bottom-color: #262837;
      }

      .mapboxgl-popup-close-button {
        color: white;
        font-size: 18px;
      }
      
      .mapboxgl-popup-close-button:hover {
        color: #ccc;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, [])

  // WebSocket connection
  useEffect(() => {
    console.log('Setting up WebSocket connection to:', BACKEND_WS)
    const socket = io(BACKEND_WS, { transports: ['polling'] })
    
    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket')
    })
    
    socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket')
    })
    
    socket.on('message', (fc) => {
      const feat = fc?.features?.[0]
      if (feat) {
        dispatch(upsertFromFeature(feat))
      }
    })
    
    socket.on('error', (error) => {
      console.error('🚨 WebSocket error:', error)
    })
    
    return () => socket.close()
  }, [dispatch])

  const calculateBearing = (coord1, coord2) => {
    if (!coord1 || !coord2) return 0;
    
    const [lon1, lat1] = coord1
    const [lon2, lat2] = coord2
    
    const dLon = (lon2 - lon1) * Math.PI / 180
    const lat1Rad = lat1 * Math.PI / 180
    const lat2Rad = lat2 * Math.PI / 180
    
    const y = Math.sin(dLon) * Math.cos(lat2Rad)
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon)
    
    const bearing = Math.atan2(y, x) * 180 / Math.PI
    return (bearing + 360) % 360
  }

  useEffect(() => {
    let frameCount = 0;
    
    const moveDrones = () => {
      frameCount++;
      
      if (frameCount % 10 === 0) {
        drones.forEach(drone => {
          const randomLat = (Math.random() - 0.5) * 0.0001
          const randomLon = (Math.random() - 0.5) * 0.0001
          
          const newCoord = [
            drone.coord[0] + randomLon,
            drone.coord[1] + randomLat
          ]
          
          dispatch(updateDronePosition({
            serial: drone.serial,
            coord: newCoord,
            yaw: calculateBearing(drone.coord, newCoord)
          }))
        })
      }
      
      animationRef.current = requestAnimationFrame(moveDrones)
    }
    
    if (drones.length > 0) {
      animationRef.current = requestAnimationFrame(moveDrones)
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [drones, dispatch])

  const pathsGeoJSON = useMemo(() => {
    const features = [];

    drones.forEach(drone => {
      if (!drone.path || drone.path.length < 2) return;

      const allowed = isAllowed(drone.registration);
      const color = allowed ? '#00C48C' : '#FF5252';
      const isFocused = focusedSerial === drone.serial;

      const recentPath = drone.path.slice(-200);
      
      features.push({
        type: 'Feature',
        properties: {
          serial: drone.serial,
          color,
          isFocused,
          'line-width': isFocused ? 4 : 3,
          'line-opacity': isFocused ? 0.9 : 0.7
        },
        geometry: {
          type: 'LineString',
          coordinates: recentPath
        }
      });
    });

    return {
      type: 'FeatureCollection',
      features
    };
  }, [drones, focusedSerial]);

  // Fly to focused drone
  useEffect(() => {
    if (!focusedSerial) return
    const d = drones.find((x) => x.serial === focusedSerial)
    if (d && mapRef.current) {
      mapRef.current.flyTo({ center: d.coord, zoom: 14, duration: 1000 })
    }
  }, [focusedSerial, drones])

  const handleMapClick = (e) => {
    if (focusedSerial && !e.originalEvent.defaultPrevented) {
      dispatch(unfocusDrone());
      e.originalEvent.stopPropagation();
    }
  }

  return (
    <div className="map-container" style={{ height: '100%', width: '100%' }}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: 35.9106, 
          latitude: 31.9539,
          zoom: 12
        }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        onClick={handleMapClick}
        interactiveLayerIds={[]}
        attributionControl={false}
        logoPosition="bottom-left"
        dragRotate={true}
        touchZoomRotate={true}
        doubleClickZoom={true}
        scrollZoom={{smooth: true, speed: 0.3}}
        minZoom={2}
        maxZoom={18}
        cooperativeGestures={true}
        maxPitch={60}
      >
        
        <Source id="paths" type="geojson" data={pathsGeoJSON}>
          <Layer {...lineLayer} />
        </Source>

        
        {drones.map((drone) => (
          <Marker
            key={drone.serial}
            longitude={drone.coord[0]}
            latitude={drone.coord[1]}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.preventDefault()
              e.originalEvent.stopPropagation()
              dispatch(selectDrone(drone.serial))
            }}
            className={focusedSerial === drone.serial ? 'selected-drone' : ''}
          >
            <div
              className="drone-wrapper"
              onMouseEnter={() => setHovered(drone)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              <DroneIcon 
                yaw={drone.yaw} 
                registration={drone.registration}
                isSelected={selectedSerial === drone.serial}
                isFocused={focusedSerial === drone.serial}
              />
            </div>
          </Marker>
        ))}

        {/* Popup for hovered or focused drone */}
        {(hovered || focusedSerial) && (
          <Popup
            longitude={(focusedSerial ? drones.find(d => d.serial === focusedSerial) : hovered)?.coord[0]}
            latitude={(focusedSerial ? drones.find(d => d.serial === focusedSerial) : hovered)?.coord[1]}
            closeButton={!!focusedSerial}
            closeOnClick={false}
            onClose={() => dispatch(unfocusDrone())}
            offset={25}
            className="drone-popup"
            maxWidth="300px"
          >
            {(() => {
              const drone = focusedSerial ? drones.find(d => d.serial === focusedSerial) : hovered;
              if (!drone) return null;
              
              const isAllowedToFly = isAllowed(drone.registration);
              
              return (
                <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong style={{ fontSize: '16px', color: '#fff' }}>{drone.name || 'Unknown Drone'}</strong>
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Serial:</strong> {drone.serial}
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Registration:</strong> 
                    <span style={{ color: isAllowedToFly ? '#00C48C' : '#FF5252', marginLeft: '4px' }}>
                      {drone.registration}
                    </span>
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Status:</strong> 
                    <span style={{ color: isAllowedToFly ? '#00C48C' : '#FF5252', marginLeft: '4px' }}>
                      {isAllowedToFly ? 'Authorized' : 'Unauthorized'}
                    </span>
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Altitude:</strong> {drone.altitude || 0} m
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Coordinates:</strong> {drone.coord[1].toFixed(6)}, {drone.coord[0].toFixed(6)}
                  </div>
                  {drone.firstTimestamp && drone.lastTimestamp && (
                    <div style={{ marginBottom: '4px' }}>
                      <strong>Flight Time:</strong> {msToHMS(drone.lastTimestamp - drone.firstTimestamp)}
                    </div>
                  )}
                  {drone.yaw !== undefined && (
                    <div>
                      <strong>Heading:</strong> {Math.round(drone.yaw)}°
                    </div>
                  )}
                </div>
              );
            })()}
          </Popup>
        )}
      </Map>
    </div>
  )
}