import { useState, useEffect } from 'react'
import { useWorkouts } from '../hooks/useFirestore'
import '../styles/WorkoutForm.css'

function WorkoutForm({ userId, prefillData, onPrefillUsed }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    distance: '',
    duration: '',
    pace: '',
    type: 'treino',
    notes: ''
  })

  useEffect(() => {
    if (prefillData) {
      setFormData({
        date: prefillData.date || new Date().toISOString().split('T')[0],
        distance: prefillData.distance || '',
        duration: prefillData.duration || '',
        pace: prefillData.pace || '',
        type: prefillData.type || 'treino',
        notes: prefillData.notes || ''
      })
      if (onPrefillUsed) {
        onPrefillUsed()
      }
    }
  }, [prefillData, onPrefillUsed])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const calculatePace = () => {
    if (formData.distance && formData.duration) {
      const distance = parseFloat(formData.distance)
      const duration = parseFloat(formData.duration)
      if (distance > 0 && duration > 0) {
        const pace = duration / distance
        const minutes = Math.floor(pace)
        const seconds = Math.round((pace - minutes) * 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')} min/km`
      }
    }
    return ''
  }

  const { addWorkout } = useWorkouts(userId)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const workout = {
      ...formData,
      date: formData.date,
      distance: parseFloat(formData.distance),
      duration: parseFloat(formData.duration),
      pace: formData.pace || calculatePace(),
      type: formData.type,
      notes: formData.notes || ''
    }

    const result = await addWorkout(workout)
    
    if (result.success) {
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        distance: '',
        duration: '',
        pace: '',
        type: 'treino',
        notes: ''
      })
      alert('Treino registrado com sucesso!')
    } else {
      alert('Erro ao registrar treino: ' + result.error)
    }
  }

  return (
    <div className="workout-form-container">
      <h2>Registrar Novo Treino</h2>
      <form onSubmit={handleSubmit} className="workout-form">
        <div className="form-group">
          <label htmlFor="date">Data</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="distance">Distância (km)</label>
            <input
              type="number"
              id="distance"
              name="distance"
              value={formData.distance}
              onChange={handleChange}
              step="0.1"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="duration">Duração (minutos)</label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              step="0.1"
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="pace">Ritmo (min/km) - Opcional</label>
          <input
            type="text"
            id="pace"
            name="pace"
            value={formData.pace}
            onChange={handleChange}
            placeholder="Ex: 5:30"
          />
          {formData.distance && formData.duration && (
            <small className="pace-hint">
              Ritmo calculado: {calculatePace()}
            </small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="type">Tipo de Treino</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="treino">Treino</option>
            <option value="longao">Longão</option>
            <option value="tiro">Tiro</option>
            <option value="recuperacao">Recuperação</option>
            <option value="corrida-livre">Corrida Livre</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Observações</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            placeholder="Como você se sentiu? Condições do tempo? Etc..."
          />
        </div>

        <button type="submit" className="submit-button">
          Salvar Treino
        </button>
      </form>
    </div>
  )
}

export default WorkoutForm

