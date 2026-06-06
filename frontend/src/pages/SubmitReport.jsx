import { useState } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const BANANA_SYMPTOMS = [
  'yellowing_of_leaves', 'wilting_of_leaves', 'leaf_collapse',
  'yellow_brown_leaf_streaks', 'premature_ripening_of_fruits',
  'splitting_of_pseudostem', 'black_spots_on_leaves',
  'stunted_growth', 'drying_leaf_edges',
]

const COFFEE_SYMPTOMS = [
  'yellow_leaf_spots', 'orange_powder_on_leaf_underside', 'leaf_drop',
  'brown_lesions_on_leaves', 'wilting_branches', 'dieback_of_twigs',
  'premature_berry_drop', 'blackened_berries', 'stunted_growth',
]

const SYMPTOM_LABELS = {
  yellowing_of_leaves: 'Yellowing of Leaves',
  wilting_of_leaves: 'Wilting of Leaves',
  leaf_collapse: 'Leaf Collapse',
  yellow_brown_leaf_streaks: 'Yellow/Brown Leaf Streaks',
  premature_ripening_of_fruits: 'Premature Ripening of Fruits',
  splitting_of_pseudostem: 'Splitting of Pseudostem',
  black_spots_on_leaves: 'Black Spots on Leaves',
  stunted_growth: 'Stunted Growth',
  drying_leaf_edges: 'Drying Leaf Edges',
  yellow_leaf_spots: 'Yellow Leaf Spots',
  orange_powder_on_leaf_underside: 'Orange Powder on Leaf Underside',
  leaf_drop: 'Leaf Drop',
  brown_lesions_on_leaves: 'Brown Lesions on Leaves',
  wilting_branches: 'Wilting Branches',
  dieback_of_twigs: 'Dieback of Twigs',
  premature_berry_drop: 'Premature Berry Drop',
  blackened_berries: 'Blackened Berries',
}

export default function SubmitReport() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [form, setForm] = useState({
    farmer_name: '',
    contact_info: '',
    location: '',
    latitude: '',
    longitude: '',
    crop_type: 'banana',
    symptoms: {},
    comments: '',
    image: null,
  })

  const currentSymptoms = form.crop_type === 'banana' ? BANANA_SYMPTOMS : COFFEE_SYMPTOMS

  const toggleSymptom = (key) => {
    setForm({
      ...form,
      symptoms: { ...form.symptoms, [key]: !form.symptoms[key] },
    })
  }

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const valid = ['image/jpeg', 'image/png', 'image/jpg']
    if (!valid.includes(file.type)) {
      toast.error('Only JPG, JPEG, PNG allowed')
      return
    }
    if (file.size > 16 * 1024 * 1024) {
      toast.error('Image must be < 16MB')
      return
    }
    setForm({ ...form, image: file })
  }

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setForm({ ...form, latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => toast.error('Unable to get location')
      )
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const hasSymptoms = Object.values(form.symptoms).some(Boolean)
    if (!hasSymptoms) {
      toast.error('Select at least one symptom')
      setLoading(false)
      return
    }

    const fd = new FormData()
    fd.append('farmer_name', form.farmer_name)
    fd.append('contact_info', form.contact_info)
    fd.append('location', form.location)
    fd.append('crop_type', form.crop_type)
    fd.append('symptoms', JSON.stringify(form.symptoms))
    fd.append('comments', form.comments)
    if (form.latitude) fd.append('latitude', form.latitude)
    if (form.longitude) fd.append('longitude', form.longitude)
    if (form.image) fd.append('image', form.image)

    try {
      const { data } = await api.post('/reports/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(data)
      setStep(3)
      toast.success('Report submitted successfully!')
    } catch {
    } finally {
      setLoading(false)
    }
  }

  if (step === 3 && result) {
    return (
      <div className="page">
        <h1>Report Submitted</h1>
        <div className="result-card">
          <div className="result-header">
            <span className="result-icon">✅</span>
            <h2>Analysis Complete</h2>
          </div>
          <div className="result-body">
            <div className="detail-grid">
              <div><strong>Disease:</strong> {result.disease_display}</div>
              <div><strong>Severity:</strong> <span className={`badge badge-${result.severity}`}>{result.severity_display}</span></div>
              <div><strong>Confidence:</strong> {result.confidence ? `${(result.confidence * 100).toFixed(0)}%` : '—'}</div>
              <div><strong>Report ID:</strong> #{result.id}</div>
            </div>
          </div>
          {result.advisory && (
            <div className="advisory-section">
              <h3>Advisory</h3>
              <p>{result.advisory.description}</p>
              <h4>Treatment</h4>
              <ul>{result.advisory.treatment.map((t, i) => <li key={i}>{t}</li>)}</ul>
              <h4>Prevention</h4>
              <ul>{result.advisory.prevention.map((p, i) => <li key={i}>{p}</li>)}</ul>
              <h4>Best Practices</h4>
              <ul>{result.advisory.best_practices.map((b, i) => <li key={i}>{b}</li>)}</ul>
            </div>
          )}
          <button className="btn btn-primary" onClick={() => { setStep(1); setResult(null); setForm({ farmer_name: '', contact_info: '', location: '', latitude: '', longitude: '', crop_type: 'banana', symptoms: {}, comments: '', image: null }) }}>
            Submit Another Report
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Submit Report</h1>
      <div className="progress-bar">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1. Details</div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2. Symptoms</div>
      </div>

      <form onSubmit={handleSubmit} className="report-form">
        {step === 1 && (
          <div className="form-section">
            <h2>Farmer Information</h2>
            <div className="form-group">
              <label>Farmer Name</label>
              <input required value={form.farmer_name} onChange={(e) => setForm({ ...form, farmer_name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Contact Information</label>
              <input required value={form.contact_info} onChange={(e) => setForm({ ...form, contact_info: e.target.value })} placeholder="+256700000000" />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="District, Village" />
            </div>
            <div className="form-group">
              <label>GPS Coordinates <button type="button" className="btn btn-sm btn-outline" onClick={getLocation}>Get Location</button></label>
              <div className="coord-row">
                <input placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
                <input placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
              </div>
            </div>

            <h2>Crop Information</h2>
            <div className="crop-selector">
              <label className={`crop-option ${form.crop_type === 'banana' ? 'selected' : ''}`}>
                <input type="radio" name="crop_type" value="banana" checked={form.crop_type === 'banana'} onChange={() => setForm({ ...form, crop_type: 'banana', symptoms: {} })} />
                <span className="crop-icon">🍌</span>
                <span>Banana</span>
              </label>
              <label className={`crop-option ${form.crop_type === 'coffee' ? 'selected' : ''}`}>
                <input type="radio" name="crop_type" value="coffee" checked={form.crop_type === 'coffee'} onChange={() => setForm({ ...form, crop_type: 'coffee', symptoms: {} })} />
                <span className="crop-icon">☕</span>
                <span>Coffee</span>
              </label>
            </div>

            <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>Next: Symptoms</button>
          </div>
        )}

        {step === 2 && (
          <div className="form-section">
            <h2>Symptoms - {form.crop_type === 'banana' ? 'Banana' : 'Coffee'}</h2>
            <div className="symptoms-grid">
              {currentSymptoms.map((key) => (
                <label key={key} className={`symptom-checkbox ${form.symptoms[key] ? 'checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.symptoms[key] || false}
                    onChange={() => toggleSymptom(key)}
                  />
                  <span>{SYMPTOM_LABELS[key] || key.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>

            <div className="form-group">
              <label>Additional Comments</label>
              <textarea
                rows={4}
                value={form.comments}
                onChange={(e) => setForm({ ...form, comments: e.target.value })}
                placeholder="When symptoms first appeared, weather conditions, treatments already applied..."
              />
            </div>

            <div className="form-group">
              <label>Upload Leaf Image (JPG, PNG)</label>
              <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleImage} />
              {form.image && <p className="file-name">{form.image.name}</p>}
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Analyzing...' : 'Submit Report'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
