import { useState, useEffect } from 'react'
import api from '../api/axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts'

const COLORS = ['#2e7d32', '#f9a825', '#c62828', '#1565c0']
const SEVERITY_COLORS = { low: '#4caf50', medium: '#ff9800', high: '#f44336', critical: '#b71c1c' }

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [reportsOverTime, setReportsOverTime] = useState([])
  const [cropDist, setCropDist] = useState([])
  const [diseaseDist, setDiseaseDist] = useState([])
  const [reports, setReports] = useState([])

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/'),
      api.get('/dashboard/reports-over-time/'),
      api.get('/dashboard/crop-distribution/'),
      api.get('/dashboard/disease-distribution/'),
      api.get('/reports/'),
    ]).then(([s, r, c, d, rep]) => {
      setStats(s.data)
      setReportsOverTime(r.data)
      setCropDist(c.data)
      setDiseaseDist(d.data)
      setReports(rep.data.results || rep.data)
    })
  }, [])

  return (
    <div className="dashboard">
      <h1>Farm Dashboard</h1>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card"><span className="stat-value">{stats.total_reports}</span><span className="stat-label">Total Reports</span></div>
          <div className="stat-card danger"><span className="stat-value">{stats.high_critical_cases}</span><span className="stat-label">High/Critical</span></div>
          <div className="stat-card warning"><span className="stat-value">{stats.pending_reviews}</span><span className="stat-label">Pending Reviews</span></div>
          <div className="stat-card success"><span className="stat-value">{stats.resolved_cases}</span><span className="stat-label">Resolved</span></div>
        </div>
      )}

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Reports Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={reportsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#2e7d32" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Crop Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={cropDist} dataKey="count" nameKey="crop" cx="50%" cy="50%" outerRadius={80} label>
                {cropDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card full-width">
          <h3>Disease Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={diseaseDist}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="disease" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2e7d32" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="recent-reports">
        <h3>Recent Reports</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Crop Type</th>
                <th>Disease</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reports.slice(0, 10).map((r) => (
                <tr key={r.id}>
                  <td>#{r.id}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
