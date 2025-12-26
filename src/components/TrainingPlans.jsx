import { useState } from 'react'
import { useTrainingPlans } from '../hooks/useFirestore'
import '../styles/TrainingPlans.css'

function TrainingPlans({ userId, onMarkAsDone }) {
  const { plans, loading, addPlan, deletePlan: deletePlanFirestore, importPlans } = useTrainingPlans(userId)
  const [showImport, setShowImport] = useState(false)
  const [showCreatePlan, setShowCreatePlan] = useState(false)
  const [importText, setImportText] = useState('')
  const [expandedPlan, setExpandedPlan] = useState(null)

  const handleImport = async () => {
    try {
      const importedPlans = JSON.parse(importText)
      
      if (Array.isArray(importedPlans)) {
        const result = await importPlans(importedPlans)
        if (result.success) {
          setImportText('')
          setShowImport(false)
          alert('Planos importados com sucesso!')
        } else {
          alert('Erro ao importar: ' + result.error)
        }
      } else {
        alert('Formato inválido. O arquivo deve conter um array de planos.')
      }
    } catch (error) {
      alert('Erro ao importar planos. Verifique o formato JSON.')
      console.error(error)
    }
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(plans, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'planos-treino.json'
    link.click()
  }

  const deletePlan = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este plano?')) {
      const result = await deletePlanFirestore(id)
      if (!result.success) {
        alert('Erro ao excluir plano: ' + result.error)
      }
    }
  }

  if (loading) {
    return (
      <div className="training-plans-container">
        <div className="loading-state">
          <p>Carregando planos...</p>
        </div>
      </div>
    )
  }

  const markWorkoutAsDone = (workout, planName) => {
    // Extrair distância numérica
    const distanceMatch = workout.distance?.match(/([\d.]+)/)
    const distance = distanceMatch ? parseFloat(distanceMatch[1]) : ''
    
    // Extrair duração numérica (minutos)
    const durationMatch = workout.duration?.match(/([\d.]+)/)
    const duration = durationMatch ? parseFloat(durationMatch[1]) : ''

    const workoutData = {
      date: workout.date || new Date().toISOString().split('T')[0],
      distance: distance,
      duration: duration,
      type: workout.type?.toLowerCase().replace(/\s+/g, '-') || 'treino',
      notes: `Treino do plano: ${planName}${workout.notes ? ' - ' + workout.notes : ''}`
    }

    if (onMarkAsDone) {
      onMarkAsDone(workoutData)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isWorkoutPast = (dateString) => {
    if (!dateString) return false
    const workoutDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    workoutDate.setHours(0, 0, 0, 0)
    return workoutDate < today
  }

  const isWorkoutToday = (dateString) => {
    if (!dateString) return false
    const workoutDate = new Date(dateString)
    const today = new Date()
    return workoutDate.toDateString() === today.toDateString()
  }

  const getWorkoutStatus = (workout) => {
    if (!workout.date) return 'pending'
    if (isWorkoutToday(workout.date)) return 'today'
    if (isWorkoutPast(workout.date)) return 'past'
    return 'upcoming'
  }

  return (
    <div className="training-plans-container">
      <div className="plans-header">
        <h2>Planos de Treino</h2>
        <div className="plans-actions">
          <button className="action-button" onClick={() => setShowImport(!showImport)}>
            {showImport ? 'Cancelar' : 'Importar'}
          </button>
          <button className="action-button" onClick={handleExport} disabled={plans.length === 0}>
            Exportar
          </button>
          <button className="action-button primary" onClick={() => setShowCreatePlan(!showCreatePlan)}>
            {showCreatePlan ? 'Cancelar' : 'Criar Plano'}
          </button>
        </div>
      </div>

      {showCreatePlan && <CreatePlanForm userId={userId} onPlanCreated={() => { setShowCreatePlan(false); }} />}

      {showImport && (
        <div className="import-section">
          <h3>Importar Plano de Treino</h3>
          <p>Cole o JSON do plano de treino abaixo:</p>
          <textarea
            className="import-textarea"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='[{"id": 1, "name": "Plano 5K", "duration": "8 semanas", "workouts": [...]}]'
            rows="10"
          />
          <button className="import-button" onClick={handleImport}>
            Importar
          </button>
        </div>
      )}

      {plans.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum plano de treino cadastrado.</p>
          <p>Importe um plano ou crie um novo para começar!</p>
        </div>
      ) : (
        <div className="plans-list">
          {plans.map(plan => (
            <div key={plan.id} className="plan-card">
              <div className="plan-header">
                <div>
                  <h3>{plan.name}</h3>
                  {plan.duration && <span className="plan-duration">{plan.duration}</span>}
                </div>
                <div className="plan-header-actions">
                  <button
                    className="expand-button"
                    onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                  >
                    {expandedPlan === plan.id ? '▼' : '▶'}
                  </button>
                  <button
                    className="delete-plan-button"
                    onClick={() => deletePlan(plan.id)}
                  >
                    ×
                  </button>
                </div>
              </div>
              {plan.description && (
                <p className="plan-description">{plan.description}</p>
              )}
              
              {expandedPlan === plan.id && plan.workouts && plan.workouts.length > 0 && (
                <div className="plan-workouts">
                  <div className="workouts-header">
                    <h4>Treinos Agendados</h4>
                    <span className="workouts-count">{plan.workouts.length} treino(s)</span>
                  </div>
                  <div className="workouts-list">
                    {plan.workouts
                      .sort((a, b) => {
                        if (!a.date && !b.date) return 0
                        if (!a.date) return 1
                        if (!b.date) return -1
                        return new Date(a.date) - new Date(b.date)
                      })
                      .map((workout, idx) => {
                        const status = getWorkoutStatus(workout)
                        return (
                          <div key={idx} className={`workout-item ${status}`}>
                            <div className="workout-item-header">
                              <div className="workout-date-info">
                                {workout.date ? (
                                  <span className="workout-date">{formatDate(workout.date)}</span>
                                ) : (
                                  <span className="workout-day">{workout.day}</span>
                                )}
                                {status === 'today' && <span className="status-badge today">Hoje</span>}
                                {status === 'past' && <span className="status-badge past">Passado</span>}
                                {status === 'upcoming' && <span className="status-badge upcoming">Futuro</span>}
                              </div>
                              <button
                                className="mark-done-button"
                                onClick={() => markWorkoutAsDone(workout, plan.name)}
                                title="Marcar como executado"
                              >
                                ✓ Executar
                              </button>
                            </div>
                            <div className="workout-item-details">
                              <span className="workout-type-badge">{workout.type}</span>
                              <span className="workout-distance">{workout.distance}</span>
                              <span className="workout-duration">{workout.duration}</span>
                            </div>
                            {workout.notes && (
                              <p className="workout-notes">{workout.notes}</p>
                            )}
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="import-help">
        <h3>Formato de Importação</h3>
        <p>O arquivo JSON deve seguir este formato:</p>
        <pre className="format-example">
{`[
  {
    "id": 1,
    "name": "Nome do Plano",
    "duration": "8 semanas",
    "description": "Descrição do plano",
    "workouts": [
      {
        "date": "2024-01-15",
        "type": "Corrida leve",
        "distance": "3km",
        "duration": "20min",
        "notes": "Observações opcionais"
      }
    ]
  }
]`}
        </pre>
      </div>
    </div>
  )
}

function CreatePlanForm({ userId, onPlanCreated }) {
  const { addPlan } = useTrainingPlans(userId)
  const [planName, setPlanName] = useState('')
  const [duration, setDuration] = useState('')
  const [description, setDescription] = useState('')
  const [workouts, setWorkouts] = useState([
    { date: '', type: 'treino', distance: '', duration: '', notes: '' }
  ])

  const addWorkout = () => {
    setWorkouts([...workouts, { date: '', type: 'treino', distance: '', duration: '', notes: '' }])
  }

  const removeWorkout = (index) => {
    setWorkouts(workouts.filter((_, i) => i !== index))
  }

  const updateWorkout = (index, field, value) => {
    const updated = [...workouts]
    updated[index] = { ...updated[index], [field]: value }
    setWorkouts(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const newPlan = {
      name: planName,
      duration: duration,
      description: description,
      workouts: workouts.filter(w => w.date || w.distance || w.duration)
    }

    const result = await addPlan(newPlan)
    
    if (result.success) {
      alert('Plano criado com sucesso!')
      onPlanCreated()
    } else {
      alert('Erro ao criar plano: ' + result.error)
    }
  }

  return (
    <div className="create-plan-form">
      <h3>Criar Novo Plano</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Nome do Plano</label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              required
              placeholder="Ex: Plano de 5K"
            />
          </div>
          <div className="form-group">
            <label>Duração</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Ex: 8 semanas"
            />
          </div>
        </div>
        <div className="form-group">
          <label>Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="2"
            placeholder="Descrição do plano..."
          />
        </div>
        
        <div className="workouts-section">
          <div className="workouts-section-header">
            <h4>Treinos</h4>
            <button type="button" className="add-workout-button" onClick={addWorkout}>
              + Adicionar Treino
            </button>
          </div>
          {workouts.map((workout, idx) => (
            <div key={idx} className="workout-form-item">
              <div className="workout-form-row">
                <div className="form-group">
                  <label>Data</label>
                  <input
                    type="date"
                    value={workout.date}
                    onChange={(e) => updateWorkout(idx, 'date', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Tipo</label>
                  <select
                    value={workout.type}
                    onChange={(e) => updateWorkout(idx, 'type', e.target.value)}
                  >
                    <option value="treino">Treino</option>
                    <option value="longao">Longão</option>
                    <option value="tiro">Tiro</option>
                    <option value="recuperacao">Recuperação</option>
                    <option value="corrida-livre">Corrida Livre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Distância</label>
                  <input
                    type="text"
                    value={workout.distance}
                    onChange={(e) => updateWorkout(idx, 'distance', e.target.value)}
                    placeholder="Ex: 5km"
                  />
                </div>
                <div className="form-group">
                  <label>Duração</label>
                  <input
                    type="text"
                    value={workout.duration}
                    onChange={(e) => updateWorkout(idx, 'duration', e.target.value)}
                    placeholder="Ex: 30min"
                  />
                </div>
                <button
                  type="button"
                  className="remove-workout-button"
                  onClick={() => removeWorkout(idx)}
                >
                  ×
                </button>
              </div>
              <div className="form-group">
                <label>Observações</label>
                <input
                  type="text"
                  value={workout.notes}
                  onChange={(e) => updateWorkout(idx, 'notes', e.target.value)}
                  placeholder="Observações opcionais..."
                />
              </div>
            </div>
          ))}
        </div>

        <button type="submit" className="submit-plan-button">
          Criar Plano
        </button>
      </form>
    </div>
  )
}

export default TrainingPlans
