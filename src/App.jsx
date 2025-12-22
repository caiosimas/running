import { useState, useEffect } from 'react'
import WorkoutForm from './components/WorkoutForm'
import WorkoutList from './components/WorkoutList'
import TrainingPlans from './components/TrainingPlans'
import BackupRestore from './components/BackupRestore'
import GoogleDriveSync from './components/GoogleDriveSync'
import './styles/App.css'

function App() {
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

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Running Tracker</h1>
          <p>Registre seus treinos e acompanhe seu progresso</p>
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
        <button
          className={activeTab === 'sync' ? 'active' : ''}
          onClick={() => setActiveTab('sync')}
        >
          <span className="tab-icon">🔄</span>
          Sincronizar
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'register' && <WorkoutForm prefillData={prefillData} onPrefillUsed={() => setPrefillData(null)} key={refreshKey} />}
        {activeTab === 'history' && <WorkoutList key={refreshKey} />}
        {activeTab === 'plans' && <TrainingPlans onMarkAsDone={handleWorkoutFromPlan} key={refreshKey} />}
        {activeTab === 'backup' && <BackupRestore onDataImported={handleDataImported} />}
        {activeTab === 'sync' && <GoogleDriveSync onDataImported={handleDataImported} />}
      </main>
    </div>
  )
}

export default App

