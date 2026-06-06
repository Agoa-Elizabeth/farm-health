import { useState, useEffect } from 'react'
import api from '../api/axios'

const SEVERITY_COLORS = { low: '#4caf50', medium: '#ff9800', high: '#f44336', critical: '#b71c1c' }

export default function MyReports() {
  const [reports, setReports] = useState([])
  const [search, setSearch] = useState('')
  const [cropFilter, setCropFilter] = useState('')
  const [diseaseFilter, setDiseaseFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/reports/')
      .then(({ data }) => setReports(data.results || data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = reports.filter((r) => {
    if (search && !r.farmer_name?.toLowerCase().includes(search.toLowerCase()) && !r.location?.toLowerCase().includes(search.toLowerCase())) return false
    if (cropFilter && r.crop_type !== cropFilter) return false
    if (diseaseFilter && r.disease !== diseaseFilter) return false
    return true
  })

  const viewDetail = async (id) => {
    const { data } = await api.get(`/reports/${id}/`)
    setSelected(data)
  }

  return (
    <div className="page">
      <h1>My Reports</h1>

      <div className="filters">
        <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="input" />
        <select value={cropFilter} onChange={(e) => setCropFilter(e.target.value)}>
          <option value="">All Crops</option>
          <option value="banana">Banana</option>
          <option value="coffee">Coffee</option>
        </select>
        <select value={diseaseFilter} onChange={(e) => setDiseaseFilter(e.target.value)}>
          <option value="">All Diseases</option>
          <option value="banana_bacterial_wilt">Banana Bacterial Wilt</option>
          <option value="black_sigatoka">Black Sigatoka</option>
          <option value="fusarium_wilt">Fusarium Wilt</option>
          <option value="coffee_leaf_rust">Coffee Leaf Rust</option>
          <option value="coffee_berry_disease">Coffee Berry Disease</option>
          <option value="coffee_wilt_disease">Coffee Wilt Disease</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : (
        <div className="reports-list">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Farmer</th>
                  <th>Crop</th>
                  <th>Disease</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>#{r.id}</td>
                    <td>{r.farmer_name}</td>
                    <td>{r.crop_type_display}</td>
                    <td>{r.disease_display || '—'}</td>
                    <td>
                      {r.severity && (
                        <span className="badge" style={{ background: SEVERITY_COLORS[r.severity] }}>
                          {r.severity_display}
                        </span>
                      )}
                    </td>
                    <td>{r.status_display}</td>
                    <td>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td><button className="btn btn-sm btn-primary" onClick={() => viewDetail(r.id)}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>&times;</button>
            <h2>Report #{selected.id}</h2>
            <div className="report-detail">
              <div className="detail-grid">
                <div><strong>Farmer:</strong> {selected.farmer_name}</div>
                <div><strong>Contact:</strong> {selected.contact_info}</div>
                <div><strong>Location:</strong> {selected.location}</div>
                <div><strong>Crop:</strong> {selected.crop_type_display}</div>
                <div><strong>Disease:</strong> {selected.disease_display || 'Pending'}</div>
                <div>
                  <strong>Severity:</strong>{' '}
                  {selected.severity && (
                    <span className="badge" style={{ background: SEVERITY_COLORS[selected.severity] }}>
                      {selected.severity_display}
                    </span>
                  )}
                </div>
                <div><strong>Status:</strong> {selected.status_display}</div>
                <div><strong>Confidence:</strong> {selected.confidence ? `${(selected.confidence * 100).toFixed(0)}%` : '—'}</div>
                <div><strong>Submitted:</strong> {new Date(selected.created_at).toLocaleString()}</div>
              </div>

              {selected.comments && (
                <div className="detail-section">
                  <h4>Comments</h4>
                  <p>{selected.comments}</p>
                </div>
              )}

              {selected.image && (
                <div className="detail-section">
                  <h4>Uploaded Image</h4>
                  <img src={selected.image} alt="Leaf" className="report-image" />
                </div>
              )}

              {selected.advisory && (
                <div className="detail-section advisory-section">
                  <h3>Advisory Report</h3>
                  <p><strong>Disease:</strong> {selected.advisory.disease_name}</p>
                  <p>{selected.advisory.description}</p>

                  <div className="adv-block">
                    <h4>Treatment Recommendations</h4>
                    <ul>{selected.advisory.treatment.map((t, i) => <li key={i}>{t}</li>)}</ul>
                  </div>
                  <div className="adv-block">
                    <h4>Prevention Measures</h4>
                    <ul>{selected.advisory.prevention.map((p, i) => <li key={i}>{p}</li>)}</ul>
                  </div>
                  <div className="adv-block">
                    <h4>Best Farming Practices</h4>
                    <ul>{selected.advisory.best_practices.map((b, i) => <li key={i}>{b}</li>)}</ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
