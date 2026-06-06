import { useState, useEffect } from 'react'
import api from '../api/axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#2e7d32', '#f9a825', '#c62828', '#1565c0', '#6a1b9a']
const SEVERITY_COLORS = { low: '#4caf50', medium: '#ff9800', high: '#f44336', critical: '#b71c1c' }

export default function AdminDashboard() {
  const [tab, setTab] = useState('analytics')
  const [analytics, setAnalytics] = useState(null)
  const [users, setUsers] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/analytics/'),
      api.get('/admin/users/').catch(() => []),
      api.get('/admin/reports/').catch(() => ({ data: { results: [] } })),
    ]).then(([a, u, r]) => {
      setAnalytics(a.data)
      setUsers(u.data || [])
      setReports(r.data.results || r.data || [])
    }).finally(() => setLoading(false))
  }, [])

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.patch(`/admin/users/${userId}/`, { is_active: !currentStatus })
      setUsers(users.map((u) => u.id === userId ? { ...u, is_active: !currentStatus } : u))
    } catch {}
  }

  const updateReportStatus = async (reportId, status) => {
    try {
      await api.patch(`/reports/${reportId}/status/`, { status })
      setReports(reports.map((r) => r.id === reportId ? { ...r, status } : r))
    } catch {}
  }

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <div className="page admin-page">
      <h1>Admin Dashboard</h1>
      <div className="admin-tabs">
        {['analytics', 'users', 'reports'].map((t) => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'analytics' && analytics && (
        <div className="admin-analytics">
          <div className="stats-grid">
            <div className="stat-card"><span className="stat-value">{analytics.total_farmers}</span><span className="stat-label">Total Farmers</span></div>
            <div className="stat-card"><span className="stat-value">{analytics.total_reports}</span><span className="stat-label">Total Reports</span></div>
          </div>
          <div className="charts-grid">
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
            <div className="chart-card">
              <h3>Monthly Trends</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.monthly_trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2e7d32" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Top Regions</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.regional_stats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="location" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f9a825" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <h3>Severity Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={Object.entries(analytics.severity_stats || {}).map(([k, v]) => ({ name: k, value: v }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {Object.keys(analytics.severity_stats || {}).map((k, i) => <Cell key={k} fill={SEVERITY_COLORS[k] || COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="admin-table-section">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.full_name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone_number}</td>
                    <td>{u.role}</td>
                    <td><span className={`badge ${u.is_active ? 'badge-success' : 'badge-error'}`}>{u.is_active ? 'Active' : 'Disabled'}</span></td>
                    <td>
                      <button className="btn btn-sm btn-outline" onClick={() => toggleUserStatus(u.id, u.is_active)}>
                        {u.is_active ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'reports' && (
        <div className="admin-table-section">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Farmer</th><th>Crop</th><th>Disease</th><th>Severity</th><th>Status</th><th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td>#{r.id}</td>
                    <td>{r.farmer_name}</td>
                    <td>{r.crop_type_display}</td>
                    <td>{r.disease_display || '—'}</td>
                    <td>{r.severity && <span className="badge" style={{ background: SEVERITY_COLORS[r.severity] }}>{r.severity_display}</span>}</td>
                    <td>{r.status_display}</td>
                    <td>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td>
                      <select value={r.status} onChange={(e) => updateReportStatus(r.id, e.target.value)} className="input input-sm">
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
