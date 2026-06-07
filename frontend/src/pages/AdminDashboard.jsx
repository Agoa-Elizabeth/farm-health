import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const COLORS = ['#2e7d32', '#f9a825', '#c62828', '#1565c0', '#6a1b9a', '#00897b', '#e65100', '#4e342e']
const SEVERITY_COLORS = { low: '#4caf50', medium: '#ff9800', high: '#f44336', critical: '#b71c1c' }
const STATUS_COLORS = { pending: '#ff9800', reviewed: '#2196f3', resolved: '#4caf50' }

/* =========== ICONS =========== */
function Icon({ path, size = 20, viewBox = '0 0 24 24' }) {
  return <svg width={size} height={size} viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg>
}

const I = {
  shield: <Icon path="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={28} />,
  activity: <Icon path="M22 12h-4l-3 9L9 3l-3 9H2" />,
  users: <Icon path="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" />,
  file: <Icon path="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8" />,
  clipboard: <Icon path="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M8 2h8v4H8z M12 11v4 M12 18h.01" />,
  map: <Icon path="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />,
  cpu: <Icon path="M18 8h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2 M6 8H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2 M8 2v4 M16 2v4 M8 18v4 M16 18v4 M2 12h4 M18 12h4" />,
  image: <Icon path="M21 19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5L5 21" />,
  bell: <Icon path="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" />,
  download: <Icon path="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3" />,
  search: <Icon path="M3 3h18v18H3z M3 9h18 M9 21V9" />,
  plus: <Icon path="M12 5v14 M5 12h14" />,
  check: <Icon path="M20 6L9 17l-5-5" />,
  x: <Icon path="M18 6L6 18 M6 6l12 12" />,
  eye: <Icon path="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0 6z" />,
  filter: <Icon path="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />,
}

/* =========== STAT CARD =========== */
function StatCard({ value, label, color }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color || 'var(--primary)' }}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

/* =========== OVERVIEW TAB =========== */
function OverviewTab({ analytics }) {
  if (!analytics) return <div className="loading-screen"><div className="spinner" /></div>
  return (
    <div className="admin-overview">
      <div className="stats-grid">
        <StatCard value={analytics.total_farmers} label="Total Farmers" color="#2e7d32" />
        <StatCard value={analytics.total_reports} label="Total Reports" color="#1565c0" />
        <StatCard value={analytics.reports_today} label="Reports Today" color="#f9a825" />
        <StatCard value={analytics.high_critical_cases} label="High/Critical Cases" color="#c62828" />
      </div>
      <div className="stats-grid">
        <StatCard value={analytics.severity_stats?.low || 0} label="Low Severity" color="#4caf50" />
        <StatCard value={analytics.severity_stats?.medium || 0} label="Medium Severity" color="#ff9800" />
        <StatCard value={analytics.severity_stats?.high || 0} label="High Severity" color="#f44336" />
        <StatCard value={analytics.severity_stats?.critical || 0} label="Critical Severity" color="#b71c1c" />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Reports Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics.monthly_trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#2e7d32" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Disease Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={analytics.disease_distribution} dataKey="count" nameKey="disease" cx="50%" cy="50%" outerRadius={80} label>
                {analytics.disease_distribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Crop Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={analytics.crop_distribution} dataKey="count" nameKey="crop" cx="50%" cy="50%" outerRadius={80} label>
                {analytics.crop_distribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={Object.entries(analytics.severity_stats || {}).map(([k, v]) => ({ name: k, value: v }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {Object.keys(analytics.severity_stats || {}).map((k) => <Cell key={k} fill={SEVERITY_COLORS[k] || '#999'} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Top Diseases</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.top_diseases} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="disease" width={150} />
              <Tooltip />
              <Bar dataKey="count" fill="#1565c0" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Reports by Region</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.regional_stats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="location" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#f9a825" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

/* =========== REPORTS TAB =========== */
function ReportsTab() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', severity: '', crop_type: '', search: '' })
  const [selectedReport, setSelectedReport] = useState(null)
  const [notesInput, setNotesInput] = useState('')

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v) })
      const { data } = await api.get(`/admin/reports/?${params}`)
      setReports(data.results || data || [])
    } catch {} finally { setLoading(false) }
  }, [filters])

  useEffect(() => { fetchReports() }, [fetchReports])

  const updateStatus = async (id, status) => {
    await api.patch(`/admin/reports/${id}/`, { status })
    fetchReports()
  }

  const updateNotes = async () => {
    if (!selectedReport) return
    await api.patch(`/admin/reports/${selectedReport.id}/`, { admin_notes: notesInput })
    setSelectedReport({ ...selectedReport, admin_notes: notesInput })
    fetchReports()
  }

  const viewDetail = async (id) => {
    try {
      const { data } = await api.get(`/reports/${id}/`)
      setSelectedReport(data)
      setNotesInput(data.admin_notes || '')
    } catch {}
  }

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <div className="admin-section">
      <div className="admin-toolbar">
        <div className="admin-filters">
          <input type="text" placeholder="Search by farmer, location, ID..." value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="input input-sm" />
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="input input-sm">
            <option value="">All Status</option><option value="pending">Pending</option><option value="reviewed">Reviewed</option><option value="resolved">Resolved</option>
          </select>
          <select value={filters.severity} onChange={(e) => setFilters({ ...filters, severity: e.target.value })} className="input input-sm">
            <option value="">All Severity</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
          </select>
          <select value={filters.crop_type} onChange={(e) => setFilters({ ...filters, crop_type: e.target.value })} className="input input-sm">
            <option value="">All Crops</option><option value="banana">Banana</option><option value="coffee">Coffee</option>
          </select>
        </div>
        <span className="admin-count">{reports.length} reports</span>
      </div>
      <div className="table-wrapper">
        <table>
          <thead><tr>
            <th>ID</th><th>Farmer</th><th>Crop</th><th>Disease</th><th>Severity</th><th>Status</th><th>Date</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td>#{r.id}</td>
                <td>{r.farmer_name}</td>
                <td>{r.crop_type_display}</td>
                <td>{r.disease_display || '—'}</td>
                <td>{r.severity && <span className="badge" style={{ background: SEVERITY_COLORS[r.severity] }}>{r.severity_display}</span>}</td>
                <td><span className="badge" style={{ background: STATUS_COLORS[r.status] }}>{r.status_display}</span></td>
                <td>{new Date(r.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="admin-actions">
                    <button className="btn btn-sm btn-outline" onClick={() => viewDetail(r.id)}>{I.eye} View</button>
                    <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} className="input input-sm">
                      <option value="pending">Pending</option><option value="reviewed">Reviewed</option><option value="resolved">Resolved</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
            {reports.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>No reports found</td></tr>}
          </tbody>
        </table>
      </div>

      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedReport(null)}>{I.x}</button>
            <h2>Report #{selectedReport.id}</h2>
            <div className="detail-grid">
              <div><strong>Farmer:</strong> {selectedReport.farmer_name}</div>
              <div><strong>Crop:</strong> {selectedReport.crop_type_display}</div>
              <div><strong>Disease:</strong> {selectedReport.disease_display || 'Pending'}</div>
              <div><strong>Severity:</strong> {selectedReport.severity && <span className="badge" style={{ background: SEVERITY_COLORS[selectedReport.severity] }}>{selectedReport.severity_display}</span>}</div>
              <div><strong>Confidence:</strong> {selectedReport.confidence ? `${(selectedReport.confidence * 100).toFixed(1)}%` : '—'}</div>
              <div><strong>Status:</strong> <span className="badge" style={{ background: STATUS_COLORS[selectedReport.status] }}>{selectedReport.status_display}</span></div>
              <div><strong>Location:</strong> {selectedReport.location}</div>
              <div><strong>Contact:</strong> {selectedReport.contact_info}</div>
              <div><strong>Submitted:</strong> {new Date(selectedReport.created_at).toLocaleString()}</div>
            </div>
            {selectedReport.symptoms && Object.keys(selectedReport.symptoms).length > 0 && (
              <div className="detail-section">
                <h4>Symptoms</h4>
                <p>{Object.entries(selectedReport.symptoms).filter(([, v]) => v).map(([k]) => k.replace(/_/g, ' ')).join(', ')}</p>
              </div>
            )}
            {selectedReport.comments && (
              <div className="detail-section"><h4>Comments</h4><p>{selectedReport.comments}</p></div>
            )}
            {selectedReport.image && (
              <div className="detail-section">
                <h4>Uploaded Image</h4>
                <img src={selectedReport.image} alt="Report" className="report-image" style={{ maxWidth: 300 }} />
              </div>
            )}
            {selectedReport.advisory && (
              <div className="advisory-section">
                <h3>Advisory</h3>
                <p>{selectedReport.advisory.description}</p>
                {selectedReport.advisory.treatment?.length > 0 && (
                  <div className="adv-block"><h4>Treatment</h4><ul>{selectedReport.advisory.treatment.map((t, i) => <li key={i}>{t}</li>)}</ul></div>
                )}
                {selectedReport.advisory.prevention?.length > 0 && (
                  <div className="adv-block"><h4>Prevention</h4><ul>{selectedReport.advisory.prevention.map((p, i) => <li key={i}>{p}</li>)}</ul></div>
                )}
              </div>
            )}
            <div className="detail-section">
              <h4>Admin Notes</h4>
              <textarea className="input" rows={3} value={notesInput} onChange={(e) => setNotesInput(e.target.value)} placeholder="Add admin notes..." />
              <button className="btn btn-primary btn-sm" onClick={updateNotes} style={{ marginTop: 8 }}>Save Notes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* =========== FARMERS TAB =========== */
function FarmersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [farmerReports, setFarmerReports] = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = search ? `?search=${search}` : ''
      const { data } = await api.get(`/admin/users/${params}`)
      setUsers(data.results || data || [])
    } catch {} finally { setLoading(false) }
  }, [search])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const toggleActive = async (id, current) => {
    await api.patch(`/admin/users/${id}/`, { is_active: !current })
    fetchUsers()
  }

  const deleteUser = async (id, name) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return
    await api.delete(`/admin/users/${id}/`)
    fetchUsers()
  }

  const viewReports = async (farmerId) => {
    try {
      const { data } = await api.get(`/admin/farmers/${farmerId}/reports/`)
      setFarmerReports(data)
    } catch {}
  }

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <div className="admin-section">
      <div className="admin-toolbar">
        <input type="text" placeholder="Search by name, email, or phone..." value={search}
          onChange={(e) => setSearch(e.target.value)} className="input input-sm" style={{ maxWidth: 360 }} />
        <span className="admin-count">{users.length} users</span>
      </div>
      <div className="table-wrapper">
        <table>
          <thead><tr>
            <th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>{u.phone_number || '—'}</td>
                <td><span className="badge" style={{ background: u.role === 'admin' ? '#6a1b9a' : '#2e7d32' }}>{u.role}</span></td>
                <td><span className={`badge ${u.is_active ? 'badge-success' : 'badge-error'}`}>{u.is_active ? 'Active' : 'Disabled'}</span></td>
                <td>
                  <div className="admin-actions">
                    {u.role === 'farmer' && (
                      <button className="btn btn-sm btn-outline" onClick={() => viewReports(u.id)}>Reports</button>
                    )}
                    <button className={`btn btn-sm ${u.is_active ? 'btn-outline' : 'btn-primary'}`}
                      onClick={() => toggleActive(u.id, u.is_active)}>
                      {u.is_active ? 'Disable' : 'Enable'}
                    </button>
                    {u.role !== 'admin' && (
                      <button className="btn btn-sm btn-danger" onClick={() => deleteUser(u.id, u.full_name)}>Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>No users found</td></tr>}
          </tbody>
        </table>
      </div>

      {farmerReports && (
        <div className="modal-overlay" onClick={() => setFarmerReports(null)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setFarmerReports(null)}>{I.x}</button>
            <h2>{farmerReports.farmer?.full_name} — Reports ({farmerReports.total_reports})</h2>
            <div className="table-wrapper" style={{ marginTop: 16 }}>
              <table>
                <thead><tr><th>ID</th><th>Crop</th><th>Disease</th><th>Severity</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {farmerReports.reports?.map((r) => (
                    <tr key={r.id}>
                      <td>#{r.id}</td>
                      <td>{r.crop_type_display}</td>
                      <td>{r.disease_display || '—'}</td>
                      <td>{r.severity && <span className="badge" style={{ background: SEVERITY_COLORS[r.severity] }}>{r.severity_display}</span>}</td>
                      <td><span className="badge" style={{ background: STATUS_COLORS[r.status] }}>{r.status_display}</span></td>
                      <td>{new Date(r.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* =========== ADVISORIES TAB =========== */
function AdvisoriesTab() {
  const [advisories, setAdvisories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ report: '', disease_name: '', description: '', severity: 'low', treatment: '', prevention: '' })

  const fetchAdvisories = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/advisories/')
      setAdvisories(data.results || data || [])
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAdvisories() }, [fetchAdvisories])

  const toggleApproval = async (id, current) => {
    const endpoint = current ? 'reject' : 'approve'
    await api.post(`/admin/advisories/${id}/${endpoint}/`)
    fetchAdvisories()
  }

  const deleteAdvisory = async (id) => {
    if (!confirm('Delete this advisory?')) return
    await api.delete(`/admin/advisories/${id}/`)
    fetchAdvisories()
  }

  const createAdvisory = async () => {
    try {
      await api.post('/admin/advisories/', {
        ...form,
        report: form.report ? parseInt(form.report) : null,
        treatment: form.treatment.split('\n').filter(Boolean),
        prevention: form.prevention.split('\n').filter(Boolean),
      })
      setShowCreate(false)
      setForm({ report: '', disease_name: '', description: '', severity: 'low', treatment: '', prevention: '' })
      fetchAdvisories()
    } catch {}
  }

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <div className="admin-section">
      <div className="admin-toolbar">
        <h3 style={{ margin: 0 }}>Disease Advisories ({advisories.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>{I.plus} Create Advisory</button>
      </div>
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th><th>Disease</th><th>Report</th><th>Farmer</th><th>Severity</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {advisories.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td><strong>{a.disease_name}</strong></td>
                <td>#{a.report_id}</td>
                <td>{a.farmer_name}</td>
                <td><span className="badge" style={{ background: SEVERITY_COLORS[a.severity] }}>{a.severity}</span></td>
                <td><span className="badge" style={{ background: a.is_approved ? '#4caf50' : '#ff9800' }}>{a.is_approved ? 'Approved' : 'Pending'}</span></td>
                <td>
                  <div className="admin-actions">
                    <button className={`btn btn-sm ${a.is_approved ? 'btn-outline' : 'btn-primary'}`}
                      onClick={() => toggleApproval(a.id, a.is_approved)}>
                      {a.is_approved ? 'Revoke' : 'Approve'}
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => deleteAdvisory(a.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {advisories.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>No advisories found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCreate(false)}>{I.x}</button>
            <h2>Create Custom Advisory</h2>
            <div className="admin-form">
              <div className="form-group">
                <label>Disease Name *</label>
                <input className="input" value={form.disease_name} onChange={(e) => setForm({ ...form, disease_name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Severity</label>
                <select className="input" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                </select>
              </div>
              <div className="form-group">
                <label>Treatment (one per line)</label>
                <textarea className="input" rows={3} value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} placeholder="Apply fungicide&#10;Prune affected leaves&#10;Improve drainage" />
              </div>
              <div className="form-group">
                <label>Prevention (one per line)</label>
                <textarea className="input" rows={3} value={form.prevention} onChange={(e) => setForm({ ...form, prevention: e.target.value })} placeholder="Regular monitoring&#10;Proper spacing&#10;Use resistant varieties" />
              </div>
              <div className="form-actions">
                <button className="btn btn-primary" onClick={createAdvisory}>Create Advisory</button>
                <button className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* =========== OUTBREAK MAP TAB =========== */
function OutbreakMapTab() {
  const [outbreaks, setOutbreaks] = useState([])
  const [loading, setLoading] = useState(true)
  const [diseaseFilter, setDiseaseFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')

  useEffect(() => {
    api.get('/outbreaks/').then(({ data }) => setOutbreaks(data)).finally(() => setLoading(false))
  }, [])

  const filtered = outbreaks.filter((o) => {
    if (diseaseFilter && o.disease_key !== diseaseFilter) return false
    if (severityFilter && o.severity !== severityFilter) return false
    return true
  })

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  const center = filtered.length > 0
    ? [filtered.reduce((s, o) => s + o.lat, 0) / filtered.length, filtered.reduce((s, o) => s + o.lng, 0) / filtered.length]
    : [0.5, 37.5]

  return (
    <div className="admin-section">
      <div className="admin-toolbar">
        <select value={diseaseFilter} onChange={(e) => setDiseaseFilter(e.target.value)} className="input input-sm">
          <option value="">All Diseases</option>
          {[...new Set(outbreaks.map((o) => o.disease_key))].filter(Boolean).map((d) => (
            <option key={d} value={d}>{d.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="input input-sm">
          <option value="">All Severities</option>
          <option value="low">Low</option><option value="medium">Medium</option>
          <option value="high">High</option><option value="critical">Critical</option>
        </select>
        <span className="admin-count">{filtered.length} locations</span>
      </div>
      <div className="map-container" style={{ height: 500 }}>
        <MapContainer center={center} zoom={6} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filtered.map((o) => (
            <div key={o.id}>
              <Circle
                center={[o.lat, o.lng]}
                radius={o.severity === 'critical' ? 30000 : o.severity === 'high' ? 20000 : o.severity === 'medium' ? 15000 : 10000}
                pathOptions={{
                  color: SEVERITY_COLORS[o.severity] || '#999',
                  fillOpacity: 0.3,
                  weight: 2,
                }}
              />
              <Marker position={[o.lat, o.lng]}>
                <Popup>
                  <strong>{o.disease}</strong><br />
                  Severity: {o.severity}<br />
                  Farmer: {o.farmer_name}<br />
                  Location: {o.location}<br />
                  Date: {new Date(o.created_at).toLocaleDateString()}
                </Popup>
              </Marker>
            </div>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

/* =========== AI MONITORING TAB =========== */
function AiMonitoringTab() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/ai-monitoring/').then(({ data }) => setData(data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>
  if (!data) return <p>No data available</p>

  return (
    <div className="admin-section">
      <div className="stats-grid">
        <StatCard value={data.total_predictions} label="Predictions Made" color="#2e7d32" />
        <StatCard value={data.without_prediction} label="Pending Analysis" color="#f9a825" />
        <StatCard value={`${data.average_confidence}%`} label="Avg Confidence" color="#1565c0" />
        <StatCard value={data.pending_manual_review} label="Needs Manual Review" color="#c62828" />
      </div>
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Confidence Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={[
                { name: 'Low (<50%)', value: data.confidence_distribution?.low || 0 },
                { name: 'Medium (50-75%)', value: data.confidence_distribution?.medium || 0 },
                { name: 'High (>75%)', value: data.confidence_distribution?.high || 0 },
              ]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {['#f44336', '#ff9800', '#4caf50'].map((c, i) => <Cell key={i} fill={c} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Prediction Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { name: 'With Prediction', value: data.total_predictions },
              { name: 'Without Prediction', value: data.without_prediction },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#2e7d32" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

/* =========== MEDIA GALLERY TAB =========== */
function MediaGalleryTab() {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/media/').then(({ data }) => setMedia(data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <div className="admin-section">
      <div className="admin-toolbar">
        <span className="admin-count">{media.length} images</span>
      </div>
      {media.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', padding: 24 }}>No images uploaded yet</p>
      ) : (
        <div className="media-grid">
          {media.map((m) => (
            <div key={m.id} className="media-item">
              <img src={m.image_url} alt={`Report ${m.id}`} />
              <div className="media-info">
                <span>{m.farmer_name}</span>
                <span className="text-secondary">{m.crop_type} — {m.disease || 'Pending'}</span>
                <span className="text-secondary">{new Date(m.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* =========== NOTIFICATIONS TAB =========== */
function NotificationsTab() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/notifications/')
      setNotifications(data.results || data || [])
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const markRead = async (id) => {
    await api.post(`/admin/notifications/${id}/mark_read/`)
    fetchNotifications()
  }

  const markAllRead = async () => {
    await api.post('/admin/notifications/mark_all_read/')
    fetchNotifications()
  }

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  const unread = notifications.filter((n) => !n.is_read).length

  return (
    <div className="admin-section">
      <div className="admin-toolbar">
        <h3 style={{ margin: 0 }}>{unread > 0 ? `${unread} unread` : 'All read'}</h3>
        {unread > 0 && <button className="btn btn-primary btn-sm" onClick={markAllRead}>Mark All Read</button>}
      </div>
      {notifications.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', padding: 24 }}>No notifications</p>
      ) : (
        <div className="notification-list">
          {notifications.map((n) => (
            <div key={n.id} className={`notification-item ${n.is_read ? '' : 'unread'}`} onClick={() => !n.is_read && markRead(n.id)}>
              <div className="notification-header">
                <span className={`badge`} style={{
                  background: n.type === 'critical_case' ? '#c62828' : n.type === 'outbreak' ? '#f57f17' : n.type === 'new_report' ? '#2e7d32' : '#1565c0'
                }}>{n.type_display}</span>
                <span className="text-secondary">{new Date(n.created_at).toLocaleString()}</span>
              </div>
              <h4>{n.title}</h4>
              <p>{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* =========== EXPORTS TAB =========== */
function ExportsTab() {
  const [downloading, setDownloading] = useState(null)

  const downloadCSV = async (url, filename) => {
    setDownloading(filename)
    try {
      const { data } = await api.get(url, { responseType: 'blob' })
      const blob = new Blob([data], { type: 'text/csv' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    } catch {} finally {
      setDownloading(null)
    }
  }

  return (
    <div className="admin-section">
      <div className="export-cards">
        <div className="export-card">
          <div className="export-icon">{I.file}</div>
          <h3>Reports Export</h3>
          <p>Download all reports data including farmer info, diseases, severity, and status</p>
          <button className="btn btn-primary" disabled={downloading === 'reports_export.csv'}
            onClick={() => downloadCSV('/api/admin/exports/reports/csv/', 'reports_export.csv')}>
            {I.download} {downloading === 'reports_export.csv' ? 'Downloading...' : 'Download CSV'}
          </button>
        </div>
        <div className="export-card">
          <div className="export-icon">{I.activity}</div>
          <h3>Analytics Export</h3>
          <p>Download system-wide analytics including disease distribution and statistics</p>
          <button className="btn btn-primary" disabled={downloading === 'analytics_export.csv'}
            onClick={() => downloadCSV('/api/admin/exports/analytics/csv/', 'analytics_export.csv')}>
            {I.download} {downloading === 'analytics_export.csv' ? 'Downloading...' : 'Download CSV'}
          </button>
        </div>
        <div className="export-card">
          <div className="export-icon">{I.map}</div>
          <h3>Outbreak Summary</h3>
          <p>View and analyze disease outbreak hotspots and regional distribution on the map</p>
          <span className="text-secondary">Available in the Outbreak Map tab</span>
        </div>
      </div>
    </div>
  )
}

/* =========== MAIN ADMIN DASHBOARD =========== */
const TABS = [
  { key: 'overview', label: 'Overview', icon: I.activity },
  { key: 'reports', label: 'Reports', icon: I.file },
  { key: 'farmers', label: 'Farmers', icon: I.users },
  { key: 'advisories', label: 'Advisories', icon: I.clipboard },
  { key: 'outbreak', label: 'Outbreak Map', icon: I.map },
  { key: 'ai', label: 'AI Monitoring', icon: I.cpu },
  { key: 'media', label: 'Media Gallery', icon: I.image },
  { key: 'notifications', label: 'Notifications', icon: I.bell },
  { key: 'exports', label: 'Exports', icon: I.download },
]

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/analytics/').then(({ data }) => {
      setAnalytics(data)
    }).finally(() => setLoading(false))
  }, [])

  const renderTab = () => {
    switch (tab) {
      case 'overview': return <OverviewTab analytics={analytics} />
      case 'reports': return <ReportsTab />
      case 'farmers': return <FarmersTab />
      case 'advisories': return <AdvisoriesTab />
      case 'outbreak': return <OutbreakMapTab />
      case 'ai': return <AiMonitoringTab />
      case 'media': return <MediaGalleryTab />
      case 'notifications': return <NotificationsTab />
      case 'exports': return <ExportsTab />
      default: return <OverviewTab analytics={analytics} />
    }
  }

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <div className="admin-header-left">
          <span className="admin-header-icon">{I.shield}</span>
          <div>
            <h1>Admin Dashboard</h1>
            <p className="admin-subtitle">System-wide control and oversight</p>
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button key={t.key} className={`btn ${tab === t.key ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t.key)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading && tab === 'overview' ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : (
        renderTab()
      )}
    </div>
  )
}
