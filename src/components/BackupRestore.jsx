import { useState, useEffect } from 'react'
import '../styles/BackupRestore.css'

function BackupRestore({ onDataImported }) {
  const [importText, setImportText] = useState('')
  const [importMode, setImportMode] = useState('merge') // 'merge' or 'replace'
  const [stats, setStats] = useState({ workouts: 0, plans: 0 })

  useEffect(() => {
    updateStats()
  }, [])

  const updateStats = () => {
    const workouts = JSON.parse(localStorage.getItem('workouts') || '[]')
    const plans = JSON.parse(localStorage.getItem('trainingPlans') || '[]')
    setStats({ workouts: workouts.length, plans: plans.length })
  }

  const exportAllData = () => {
    const workouts = JSON.parse(localStorage.getItem('workouts') || '[]')
    const plans = JSON.parse(localStorage.getItem('trainingPlans') || '[]')
    
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      workouts: workouts,
      trainingPlans: plans
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `running-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    
    alert(`Backup exportado com sucesso!\n\nTreinos: ${workouts.length}\nPlanos: ${plans.length}`)
  }

  const handleFileImport = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result)
        handleImport(importedData)
      } catch (error) {
        alert('Erro ao ler o arquivo. Verifique se é um arquivo JSON válido.')
        console.error(error)
      }
    }
    reader.readAsText(file)
    e.target.value = '' // Reset input
  }

  const handleTextImport = () => {
    if (!importText.trim()) {
      alert('Cole o conteúdo do backup no campo de texto.')
      return
    }

    try {
      const importedData = JSON.parse(importText)
      handleImport(importedData)
    } catch (error) {
      alert('Erro ao importar dados. Verifique o formato JSON.')
      console.error(error)
    }
  }

  const handleImport = (importedData) => {
    // Verificar se é o formato novo (com version) ou formato antigo
    let workouts = []
    let plans = []

    if (importedData.version) {
      // Formato novo com estrutura completa
      workouts = importedData.workouts || []
      plans = importedData.trainingPlans || []
    } else if (Array.isArray(importedData)) {
      // Formato antigo - apenas planos
      plans = importedData
    } else if (importedData.workouts || importedData.trainingPlans) {
      // Formato parcial
      workouts = importedData.workouts || []
      plans = importedData.trainingPlans || []
    } else {
      alert('Formato de arquivo não reconhecido.')
      return
    }

    if (importMode === 'replace') {
      // Substituir tudo
      localStorage.setItem('workouts', JSON.stringify(workouts))
      localStorage.setItem('trainingPlans', JSON.stringify(plans))
      alert(`Dados importados com sucesso!\n\nTreinos: ${workouts.length}\nPlanos: ${plans.length}\n\nTodos os dados anteriores foram substituídos.`)
    } else {
      // Mesclar dados
      const existingWorkouts = JSON.parse(localStorage.getItem('workouts') || '[]')
      const existingPlans = JSON.parse(localStorage.getItem('trainingPlans') || '[]')

      // Mesclar treinos (evitar duplicatas por ID)
      const workoutIds = new Set(existingWorkouts.map(w => w.id))
      const newWorkouts = workouts.filter(w => !workoutIds.has(w.id))
      const mergedWorkouts = [...existingWorkouts, ...newWorkouts]

      // Mesclar planos (evitar duplicatas por ID)
      const planIds = new Set(existingPlans.map(p => p.id))
      const newPlans = plans.filter(p => !planIds.has(p.id))
      const mergedPlans = [...existingPlans, ...newPlans]

      localStorage.setItem('workouts', JSON.stringify(mergedWorkouts))
      localStorage.setItem('trainingPlans', JSON.stringify(mergedPlans))

      alert(`Dados mesclados com sucesso!\n\nTreinos adicionados: ${newWorkouts.length}\nPlanos adicionados: ${newPlans.length}\n\nTotal de treinos: ${mergedWorkouts.length}\nTotal de planos: ${mergedPlans.length}`)
    }

    setImportText('')
    updateStats()
    
    // Notificar componentes para recarregar
    if (onDataImported) {
      onDataImported()
    }
    
    // Recarregar a página para atualizar todos os componentes
    window.location.reload()
  }

  const clearAllData = () => {
    if (window.confirm('ATENÇÃO: Isso irá apagar TODOS os seus dados (treinos e planos). Esta ação não pode ser desfeita!\n\nTem certeza?')) {
      if (window.confirm('Última confirmação: Apagar todos os dados?')) {
        localStorage.removeItem('workouts')
        localStorage.removeItem('trainingPlans')
        updateStats()
        alert('Todos os dados foram apagados.')
        window.location.reload()
      }
    }
  }

  return (
    <div className="backup-restore-container">
      <div className="backup-section">
        <h2>Exportar Dados</h2>
        <p className="section-description">
          Exporte todos os seus dados (treinos e planos) para um arquivo JSON que pode ser usado em outros dispositivos.
        </p>
        
        <div className="stats-cards">
          <div className="stat-card">
            <span className="stat-label">Treinos Registrados</span>
            <span className="stat-value">{stats.workouts}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Planos de Treino</span>
            <span className="stat-value">{stats.plans}</span>
          </div>
        </div>

        <button className="export-button" onClick={exportAllData}>
          <span className="button-icon">💾</span>
          Exportar Backup Completo
        </button>
      </div>

      <div className="restore-section">
        <h2>Importar Dados</h2>
        <p className="section-description">
          Importe dados de um backup anterior. Você pode substituir todos os dados ou mesclar com os dados existentes.
        </p>

        <div className="import-mode-selector">
          <label className="radio-option">
            <input
              type="radio"
              name="importMode"
              value="merge"
              checked={importMode === 'merge'}
              onChange={(e) => setImportMode(e.target.value)}
            />
            <span>Mesclar com dados existentes</span>
            <small>Mantém os dados atuais e adiciona os novos</small>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="importMode"
              value="replace"
              checked={importMode === 'replace'}
              onChange={(e) => setImportMode(e.target.value)}
            />
            <span>Substituir todos os dados</span>
            <small>Remove todos os dados atuais e importa apenas os do backup</small>
          </label>
        </div>

        <div className="import-methods">
          <div className="import-method">
            <h3>Importar Arquivo</h3>
            <p>Selecione um arquivo JSON de backup</p>
            <label className="file-input-label">
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="file-input"
              />
              <span className="file-input-button">📁 Escolher Arquivo</span>
            </label>
          </div>

          <div className="import-method">
            <h3>Importar Texto</h3>
            <p>Cole o conteúdo do arquivo JSON aqui</p>
            <textarea
              className="import-textarea"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='{"version": "1.0", "workouts": [...], "trainingPlans": [...]}'
              rows="8"
            />
            <button className="import-button" onClick={handleTextImport}>
              Importar
            </button>
          </div>
        </div>
      </div>

      <div className="danger-section">
        <h2>Zona de Perigo</h2>
        <p className="section-description danger-text">
          As ações abaixo são irreversíveis. Use com cuidado!
        </p>
        <button className="danger-button" onClick={clearAllData}>
          🗑️ Apagar Todos os Dados
        </button>
      </div>
    </div>
  )
}

export default BackupRestore

