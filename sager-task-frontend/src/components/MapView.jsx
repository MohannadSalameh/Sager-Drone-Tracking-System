import { useEffect, useMemo, useRef, useState } from 'react'
import Map, { Source, Layer, Marker, Popup } from 'react-map-gl'
import io from 'socket.io-client'
import { useDispatch, useSelector } from 'react-redux'
import { BACKEND_WS, MAPBOX_TOKEN } from '../config'
import { upsertFromFeature, selectDrone, selectSelected, selectAllDrones } from '../store/dronesSlice'
import DroneIcon from './DroneIcon'
import { isAllowed, msToHMS } from '../utils/formatters'

const lineLayer = {
  id: 'paths',
  type: 'line',
  paint: {
    'line-width': 2,
    'line-color': [
      'case',
      ['boolean', ['get', 'allowed'], false],
      '#22c55e',
      '#ef4444'
    ]
  }
}

export default function MapView() {
  const mapRef = useRef(null)
  const dispatch = useDispatch()
  const drones = useSelector(selectAllDrones)


  const selectedRegistration = useSelector(selectSelected)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    const socket = io(BACKEND_WS, { transports: ['polling'] })
    socket.on('message', (fc) => {
      const feat = fc?.features?.[0]
      if (feat) dispatch(upsertFromFeature(feat))
    })
    return () => socket.close()
  }, [dispatch])

  const pathsGeoJSON = useMemo(
    () => ({
      type: 'FeatureCollection',
      features: drones.map((d) => ({
        type: 'Feature',
        properties: { registration: d.registration, allowed: isAllowed(d.registration) },
        geometry: { type: 'LineString', coordinates: d.path }
      }))
    }),
    [drones]
  )


  useEffect(() => {
    if (!selectedRegistration) return
    const d = drones.find((x) => x.registration === selectedRegistration)
    if (d && mapRef.current) {
      mapRef.current.flyTo({ center: d.coord, zoom: 14, duration: 1000 })
    }
  }, [selectedRegistration, drones])

  return (
    <div className="map-container" style={{ height: '100%' }}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{ longitude: 35.93, latitude: 31.95, zoom: 12 }}
        mapStyle="mapbox://styles/mapbox/dark-v11"

        onClick={() => dispatch(selectDrone(null))} //to deselect on map click
      >
        <Source id="paths" type="geojson" data={pathsGeoJSON}>
          <Layer {...lineLayer} />
        </Source>

        {drones.map((d) => (
          <Marker
            key={d.registration}
            longitude={d.coord[0]}
            latitude={d.coord[1]}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              dispatch(selectDrone(d.registration))
            }}
          >
            <div
              onMouseEnter={() => setHovered(d)}
              onMouseLeave={() => setHovered(null)}
            >
              <DroneIcon yaw={d.yaw} registration={d.registration} />
            </div>
          </Marker>
        ))}

        {hovered && (
          <Popup
            longitude={hovered.coord[0]}
            latitude={hovered.coord[1]}
            closeButton={false}
            closeOnClick={false}
            offset={20}
            className="popup"
          >
            <div>
              <strong>{hovered.name}</strong>
            </div>
            <div>Altitude: {hovered.altitude} m</div>
            <div>
              Flight Time: {msToHMS(hovered.lastTimestamp - hovered.firstTimestamp)}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  )
}
