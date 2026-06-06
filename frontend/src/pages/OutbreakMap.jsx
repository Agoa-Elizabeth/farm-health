import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import api from '../api/axios'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const severityColors = {
  low: 'green',
  medium: 'orange',
  high: 'red',
  critical: 'darkred',
}

function ChangeView({ center }) {
  const map = useMap()
  if (center) map.setView(center, 8)
  return null
}

export default function OutbreakMap() {
  const [outbreaks, setOutbreaks] = useState([])
  const [filter, setFilter] = useState('')
  const [center] = useState([0.5, 32.5])

  useEffect(() => {
    api.get('/outbreaks/').then(({ data }) => setOutbreaks(data))
  }, [])

  const filtered = filter
    ? outbreaks.filter((o) => o.disease_key === filter || o.crop_type === filter)
    : outbreaks

  const diseaseOptions = [...new Set(outbreaks.map((o) => o.disease_key).filter(Boolean))]

  return (
    <div className="page">
      <h1>Outbreak Map</h1>
      <div className="map-filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Reports</option>
          <optgroup label="Crop Type">
            <option value="banana">Banana</option>
            <option value="coffee">Coffee</option>
          </optgroup>
          <optgroup label="Disease">
            {diseaseOptions.map((d) => (
              <option key={d} value={d}>{d.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
            ))}
          </optgroup>
        </select>
        <span className="outbreak-count">{filtered.length} reports</span>
      </div>
      <div className="map-container">
        <MapContainer center={center} zoom={7} style={{ height: '500px', width: '100%' }}>
          <ChangeView center={center} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filtered.filter((o) => o.lat && o.lng).map((o) => (
            <Marker key={o.id} position={[o.lat, o.lng]}>
              <Popup>
                <strong>{o.disease}</strong><br />
                Crop: {o.crop_type}<br />
                Severity: {o.severity}<br />
                Location: {o.location}<br />
                Farmer: {o.farmer_name}<br />
                {new Date(o.created_at).toLocaleDateString()}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
