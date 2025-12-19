import { useState, useEffect } from 'react'
import '../styles/WorkoutList.css'

function WorkoutList() {
  const [workouts, setWorkouts] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadWorkouts()
  }, [])

  const loadWorkouts = () => {
    const stored = JSON.parse(localStorage.getItem('workouts') || '[]')
    setWorkouts(stored.sort((a, b) => new Date(b.date) - new Date(a.date)))
  }

  const deleteWorkout = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este treino?')) {
      const updated = workouts.filter(w => w.id !== id)
      localStorage.setItem('workouts', JSON.stringify(updated))
      setWorkouts(updated)
    }
  }

  const filteredWorkouts = filter === 'all' 
    ? workouts 
    : workouts.filter(w => w.type === filter)

  const totalDistance = filteredWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0)
  const totalDuration = filteredWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="workout-list-container">
      <div className="stats-header">
        <h2>Histórico de Treinos</h2>
        <div className="stats">
          <div className="stat-card">
            <span className="stat-label">Total de Treinos</span>
            <span className="stat-value">{filteredWorkouts.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Distância Total</span>
            <span className="stat-value">{totalDistance.toFixed(1)} km</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Tempo Total</span>
            <span className="stat-value">{Math.round(totalDuration)} min</span>
          </div>
        </div>
      </div>

      <div className="filter-buttons">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Todos
        </button>
        <button
          className={filter === 'treino' ? 'active' : ''}
          onClick={() => setFilter('treino')}
        >
          Treino
        </button>
        <button
          className={filter === 'longao' ? 'active' : ''}
          onClick={() => setFilter('longao')}
        >
          Longão
        </button>
        <button
          className={filter === 'tiro' ? 'active' : ''}
          onClick={() => setFilter('tiro')}
        >
          Tiro
        </button>
        <button
          className={filter === 'recuperacao' ? 'active' : ''}
          onClick={() => setFilter('recuperacao')}
        >
          Recuperação
        </button>
      </div>

      {filteredWorkouts.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum treino registrado ainda.</p>
          <p>Comece registrando seu primeiro treino!</p>
        </div>
      ) : (
        <div className="workout-cards">
          {filteredWorkouts.map(workout => (
            <div key={workout.id} className="workout-card">
              <div className="workout-header">
                <h3>{formatDate(workout.date)}</h3>
                <span className="workout-type">{workout.type}</span>
              </div>
              <div className="workout-details">
                <div className="detail-item">
                  <span className="detail-label">Distância</span>
                  <span className="detail-value">{workout.distance} km</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Duração</span>
                  <span className="detail-value">{workout.duration} min</span>
                </div>
                {workout.pace && (
                  <div className="detail-item">
                    <span className="detail-label">Ritmo</span>
                    <span className="detail-value">{workout.pace}</span>
                  </div>
                )}
              </div>
              {workout.notes && (
                <div className="workout-notes">
                  <p>{workout.notes}</p>
                </div>
              )}
              <button
                className="delete-button"
                onClick={() => deleteWorkout(workout.id)}
              >
                Excluir
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WorkoutList

