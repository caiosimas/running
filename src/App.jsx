import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import WorkoutForm from './components/WorkoutForm'
import WorkoutList from './components/WorkoutList'
import TrainingPlans from './components/TrainingPlans'
import BackupRestore from './components/BackupRestore'
import Auth from './components/Auth'
import './styles/App.css'

function App() {
  const { user, loading: authLoading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('register')
  const [prefillData, setPrefillData] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (prefillData) {
      setActiveTab('register')
    }
  }, [prefillData])

  const handleWorkoutFromPlan = (workoutData) => {
    setPrefillData(workoutData)
  }

  const handleDataImported = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (authLoading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <h1>Running Tracker</h1>
            <p>Registre seus treinos e acompanhe seu progresso</p>
          </div>
        </header>
        <main className="app-main">
          <Auth />
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Running Tracker</h1>
          <p>Registre seus treinos e acompanhe seu progresso</p>
          <div className="user-info">
            <span className="user-email">{user.email}</span>
            <button onClick={logout} className="logout-button">
              Sair
            </button>
          </div>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === 'register' ? 'active' : ''}
          onClick={() => setActiveTab('register')}
        >
          <span className="tab-icon">➕</span>
          Registrar Treino
        </button>
        <button
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          <span className="tab-icon">📊</span>
          Histórico
        </button>
        <button
          className={activeTab === 'plans' ? 'active' : ''}
          onClick={() => setActiveTab('plans')}
        >
          <span className="tab-icon">📅</span>
          Planos de Treino
        </button>
        <button
          className={activeTab === 'backup' ? 'active' : ''}
          onClick={() => setActiveTab('backup')}
        >
          <span className="tab-icon">💾</span>
          Backup
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'register' && <WorkoutForm userId={user.uid} prefillData={prefillData} onPrefillUsed={() => setPrefillData(null)} key={refreshKey} />}
        {activeTab === 'history' && <WorkoutList userId={user.uid} key={refreshKey} />}
        {activeTab === 'plans' && <TrainingPlans userId={user.uid} onMarkAsDone={handleWorkoutFromPlan} key={refreshKey} />}
        {activeTab === 'backup' && <BackupRestore userId={user.uid} onDataImported={handleDataImported} />}
      </main>
    </div>
  )
}

export default App

