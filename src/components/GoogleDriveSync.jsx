import { useState, useEffect } from 'react'
import googleDriveSync from '../utils/googleDrive'
import '../styles/GoogleDriveSync.css'

function GoogleDriveSync({ onDataImported }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [clientId, setClientId] = useState('')
  const [clientIdInput, setClientIdInput] = useState('')
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false)
  const [syncStatus, setSyncStatus] = useState(null)
  const [lastSync, setLastSync] = useState(null)

  useEffect(() => {
    // Carregar configurações salvas
    const savedClientId = localStorage.getItem('googleDriveClientId')
    const savedAutoSync = localStorage.getItem('googleDriveAutoSync') === 'true'
    
    if (savedClientId) {
      setClientId(savedClientId)
      googleDriveSync.initialize(savedClientId)
      
      // Verificar se há autenticação pendente (após redirect)
      const authResult = googleDriveSync.checkPendingAuth()
      if (authResult) {
        if (authResult.success) {
          setIsAuthenticated(true)
          setSyncStatus({ type: 'success', message: 'Autenticado com sucesso!' })
        } else {
          setSyncStatus({ type: 'error', message: authResult.error })
        }
      } else {
        setIsAuthenticated(googleDriveSync.isAuthenticated)
      }
    }
    
    if (savedAutoSync && googleDriveSync.isAuthenticated) {
      setAutoSyncEnabled(true)
      startAutoSync()
    }

    // Listener para mudanças no localStorage (para sincronizar quando dados mudarem)
    const handleStorageChange = () => {
      if (autoSyncEnabled && isAuthenticated) {
        syncUpload()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      googleDriveSync.stopAutoSync()
    }
  }, [autoSyncEnabled, isAuthenticated])

  const saveClientId = () => {
    if (!clientIdInput.trim()) {
      alert('Por favor, insira o Client ID do Google')
      return
    }
    localStorage.setItem('googleDriveClientId', clientIdInput)
    setClientId(clientIdInput)
    googleDriveSync.initialize(clientIdInput)
    setClientIdInput('')
    alert('Client ID salvo com sucesso!')
  }

  const handleAuthenticate = async () => {
    if (!clientId) {
      alert('Por favor, configure o Client ID primeiro')
      return
    }

    setIsLoading(true)
    try {
      await googleDriveSync.authenticate()
      setIsAuthenticated(true)
      setSyncStatus({ type: 'success', message: 'Autenticado com sucesso!' })
    } catch (error) {
      setSyncStatus({ type: 'error', message: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = () => {
    if (window.confirm('Tem certeza que deseja desconectar do Google Drive?')) {
      googleDriveSync.clearAuth()
      googleDriveSync.stopAutoSync()
      setIsAuthenticated(false)
      setAutoSyncEnabled(false)
      localStorage.removeItem('googleDriveAutoSync')
      setSyncStatus({ type: 'info', message: 'Desconectado do Google Drive' })
    }
  }

  const syncUpload = async () => {
    setIsLoading(true)
    try {
      await googleDriveSync.upload()
      setLastSync(new Date())
      setSyncStatus({ type: 'success', message: 'Dados sincronizados com sucesso!' })
      setTimeout(() => setSyncStatus(null), 3000)
    } catch (error) {
      setSyncStatus({ type: 'error', message: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const syncDownload = async () => {
    setIsLoading(true)
    try {
      const result = await googleDriveSync.download()
      setLastSync(new Date())
      setSyncStatus({ 
        type: 'success', 
        message: `Dados baixados! ${result.workoutsAdded} treinos e ${result.plansAdded} planos adicionados.` 
      })
      setTimeout(() => setSyncStatus(null), 5000)
      
      if (onDataImported) {
        onDataImported()
      }
      window.location.reload()
    } catch (error) {
      setSyncStatus({ type: 'error', message: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const startAutoSync = () => {
    googleDriveSync.startAutoSync(5, (result) => {
      if (result.success) {
        setLastSync(new Date())
        setSyncStatus({ type: 'success', message: 'Sincronização automática realizada' })
        setTimeout(() => setSyncStatus(null), 2000)
      } else {
        setSyncStatus({ type: 'error', message: `Erro na sincronização: ${result.error}` })
      }
    })
  }

  const toggleAutoSync = (enabled) => {
    setAutoSyncEnabled(enabled)
    localStorage.setItem('googleDriveAutoSync', enabled.toString())
    
    if (enabled) {
      startAutoSync()
    } else {
      googleDriveSync.stopAutoSync()
    }
  }

  const formatLastSync = () => {
    if (!lastSync) return 'Nunca'
    const now = new Date()
    const diff = Math.floor((now - lastSync) / 1000)
    
    if (diff < 60) return 'Agora mesmo'
    if (diff < 3600) return `${Math.floor(diff / 60)} minutos atrás`
    if (diff < 86400) return `${Math.floor(diff / 3600)} horas atrás`
    return lastSync.toLocaleDateString('pt-BR')
  }

  return (
    <div className="google-drive-sync-container">
      <div className="sync-header">
        <h2>🔄 Sincronização com Google Drive</h2>
        <p className="section-description">
          Sincronize seus dados automaticamente com o Google Drive para acessar de qualquer dispositivo.
        </p>
      </div>

      {!clientId ? (
        <div className="setup-section">
          <h3>Configuração Inicial</h3>
          <p className="setup-description">
            Para usar a sincronização com Google Drive, você precisa criar um projeto no Google Cloud Console e obter um Client ID.
          </p>
          
          <div className="setup-steps">
            <div className="step">
              <h4>1. Criar Projeto no Google Cloud</h4>
              <p>Acesse <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></p>
            </div>
            <div className="step">
              <h4>2. Habilitar Google Drive API</h4>
              <p>Vá em "APIs & Services" > "Library" > Busque "Google Drive API" > "Enable"</p>
            </div>
            <div className="step">
              <h4>3. Criar Credenciais OAuth</h4>
              <p>Vá em "APIs & Services" > "Credentials" > "Create Credentials" > "OAuth client ID"</p>
              <p className="step-note">Tipo: Web application</p>
              <p className="step-note">Authorized redirect URIs: {window.location.origin}</p>
            </div>
            <div className="step">
              <h4>4. Copiar Client ID</h4>
              <p>Copie o Client ID gerado e cole abaixo</p>
            </div>
          </div>

          <div className="client-id-input">
            <input
              type="text"
              value={clientIdInput}
              onChange={(e) => setClientIdInput(e.target.value)}
              placeholder="Cole seu Google Client ID aqui"
              className="client-id-field"
            />
            <button onClick={saveClientId} className="save-client-id-button">
              Salvar Client ID
            </button>
          </div>
        </div>
      ) : (
        <>
          {!isAuthenticated ? (
            <div className="auth-section">
              <h3>Autenticação</h3>
              <p>Conecte sua conta do Google para começar a sincronizar.</p>
              <button 
                onClick={handleAuthenticate} 
                disabled={isLoading}
                className="auth-button"
              >
                {isLoading ? 'Autenticando...' : '🔐 Conectar com Google'}
              </button>
            </div>
          ) : (
            <div className="sync-controls">
              <div className="sync-status-card">
                <div className="status-header">
                  <span className="status-indicator active"></span>
                  <h3>Conectado ao Google Drive</h3>
                  <button onClick={handleDisconnect} className="disconnect-button">
                    Desconectar
                  </button>
                </div>
                <div className="status-info">
                  <p>Última sincronização: <strong>{formatLastSync()}</strong></p>
                </div>
              </div>

              <div className="sync-actions">
                <button 
                  onClick={syncUpload} 
                  disabled={isLoading}
                  className="sync-button upload"
                >
                  {isLoading ? '⏳ Sincronizando...' : '⬆️ Enviar para Drive'}
                </button>
                <button 
                  onClick={syncDownload} 
                  disabled={isLoading}
                  className="sync-button download"
                >
                  {isLoading ? '⏳ Baixando...' : '⬇️ Baixar do Drive'}
                </button>
              </div>

              <div className="auto-sync-section">
                <label className="auto-sync-toggle">
                  <input
                    type="checkbox"
                    checked={autoSyncEnabled}
                    onChange={(e) => toggleAutoSync(e.target.checked)}
                  />
                  <span>Sincronização Automática</span>
                  <small>Sincroniza a cada 5 minutos automaticamente</small>
                </label>
              </div>

              {syncStatus && (
                <div className={`sync-status-message ${syncStatus.type}`}>
                  {syncStatus.message}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="sync-info">
        <h3>ℹ️ Como Funciona</h3>
        <ul>
          <li>Seus dados são salvos em um arquivo privado no seu Google Drive</li>
          <li>A sincronização automática envia mudanças a cada 5 minutos</li>
          <li>Você pode sincronizar manualmente a qualquer momento</li>
          <li>Os dados são mesclados, não substituídos (evita perda de dados)</li>
        </ul>
      </div>
    </div>
  )
}

export default GoogleDriveSync

