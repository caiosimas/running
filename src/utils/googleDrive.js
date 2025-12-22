// Google Drive API Integration
class GoogleDriveSync {
  constructor() {
    this.clientId = null
    this.accessToken = null
    this.isAuthenticated = false
    this.syncInterval = null
    this.fileId = null
    this.SCOPES = 'https://www.googleapis.com/auth/drive.file'
    this.DRIVE_FILE_NAME = 'running-tracker-data.json'
  }

  // Inicializar com Client ID do Google
  async initialize(clientId) {
    this.clientId = clientId
    await this.loadStoredToken()
  }

  // Carregar token armazenado
  loadStoredToken() {
    const token = localStorage.getItem('googleDriveToken')
    const fileId = localStorage.getItem('googleDriveFileId')
    
    if (token) {
      this.accessToken = token
      this.isAuthenticated = true
    }
    
    if (fileId) {
      this.fileId = fileId
    }
  }

  // Salvar token
  saveToken(token, fileId = null) {
    this.accessToken = token
    this.isAuthenticated = true
    localStorage.setItem('googleDriveToken', token)
    
    if (fileId) {
      this.fileId = fileId
      localStorage.setItem('googleDriveFileId', fileId)
    }
  }

  // Limpar autenticação
  clearAuth() {
    this.accessToken = null
    this.isAuthenticated = false
    this.fileId = null
    localStorage.removeItem('googleDriveToken')
    localStorage.removeItem('googleDriveFileId')
  }

  // Autenticar com Google (usando redirect)
  async authenticate() {
    if (!this.clientId) {
      throw new Error('Google Client ID não configurado')
    }

    // Salvar estado para depois do redirect
    sessionStorage.setItem('googleAuthPending', 'true')
    sessionStorage.setItem('googleAuthReturnUrl', window.location.href)

    const redirectUri = `${window.location.origin}/oauth-callback.html`
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${this.clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=token&` +
      `scope=${encodeURIComponent(this.SCOPES)}&` +
      `include_granted_scopes=true`

    // Redirecionar para autenticação
    window.location.href = authUrl
  }

  // Processar callback OAuth (chamado pela página de callback)
  processCallback() {
    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get('access_token')
      const error = params.get('error')

      if (accessToken) {
        // Salvar token no sessionStorage para a página principal pegar
        sessionStorage.setItem('googleAuthToken', accessToken)
        // Redirecionar de volta
        const returnUrl = sessionStorage.getItem('googleAuthReturnUrl') || window.location.origin
        sessionStorage.removeItem('googleAuthPending')
        sessionStorage.removeItem('googleAuthReturnUrl')
        window.location.href = returnUrl
      } else if (error) {
        sessionStorage.setItem('googleAuthError', error)
        const returnUrl = sessionStorage.getItem('googleAuthReturnUrl') || window.location.origin
        sessionStorage.removeItem('googleAuthPending')
        sessionStorage.removeItem('googleAuthReturnUrl')
        window.location.href = returnUrl
      }
    }
  }

  // Verificar se há token pendente (após redirect)
  checkPendingAuth() {
    const token = sessionStorage.getItem('googleAuthToken')
    const error = sessionStorage.getItem('googleAuthError')
    
    if (token) {
      this.saveToken(token)
      sessionStorage.removeItem('googleAuthToken')
      return { success: true, token }
    }
    
    if (error) {
      sessionStorage.removeItem('googleAuthError')
      return { success: false, error }
    }
    
    return null
  }

  // Fazer requisição autenticada
  async makeRequest(url, options = {}) {
    if (!this.accessToken) {
      throw new Error('Não autenticado')
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.status === 401) {
      this.clearAuth()
      throw new Error('Token expirado. Por favor, autentique novamente.')
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || `Erro: ${response.status}`)
    }

    return response.json()
  }

  // Buscar arquivo existente
  async findFile() {
    try {
      const response = await this.makeRequest(
        `https://www.googleapis.com/drive/v3/files?q=name='${this.DRIVE_FILE_NAME}' and trashed=false`,
        { method: 'GET' }
      )

      if (response.files && response.files.length > 0) {
        this.fileId = response.files[0].id
        localStorage.setItem('googleDriveFileId', this.fileId)
        return this.fileId
      }
      return null
    } catch (error) {
      console.error('Erro ao buscar arquivo:', error)
      return null
    }
  }

  // Criar arquivo no Drive
  async createFile(data) {
    const metadata = {
      name: this.DRIVE_FILE_NAME,
      mimeType: 'application/json'
    }

    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
    form.append('file', new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: form
      }
    )

    if (!response.ok) {
      throw new Error(`Erro ao criar arquivo: ${response.status}`)
    }

    const result = await response.json()
    this.fileId = result.id
    localStorage.setItem('googleDriveFileId', this.fileId)
    return result.id
  }

  // Atualizar arquivo existente
  async updateFile(data) {
    if (!this.fileId) {
      return await this.createFile(data)
    }

    const form = new FormData()
    form.append('file', new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))

    const response = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${this.fileId}?uploadType=multipart`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: form
      }
    )

    if (response.status === 404) {
      // Arquivo não encontrado, criar novo
      this.fileId = null
      return await this.createFile(data)
    }

    if (!response.ok) {
      throw new Error(`Erro ao atualizar arquivo: ${response.status}`)
    }

    return this.fileId
  }

  // Fazer upload dos dados
  async upload() {
    if (!this.isAuthenticated) {
      throw new Error('Não autenticado')
    }

    const workouts = JSON.parse(localStorage.getItem('workouts') || '[]')
    const trainingPlans = JSON.parse(localStorage.getItem('trainingPlans') || '[]')

    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      workouts,
      trainingPlans
    }

    // Buscar arquivo existente
    if (!this.fileId) {
      await this.findFile()
    }

    // Criar ou atualizar
    await this.updateFile(data)
    return true
  }

  // Fazer download dos dados
  async download() {
    if (!this.isAuthenticated) {
      throw new Error('Não autenticado')
    }

    // Buscar arquivo
    if (!this.fileId) {
      const found = await this.findFile()
      if (!found) {
        throw new Error('Arquivo não encontrado no Drive')
      }
    }

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${this.fileId}?alt=media`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Arquivo não encontrado no Drive')
      }
      throw new Error(`Erro ao baixar: ${response.status}`)
    }

    const data = await response.json()

    // Mesclar com dados locais
    const existingWorkouts = JSON.parse(localStorage.getItem('workouts') || '[]')
    const existingPlans = JSON.parse(localStorage.getItem('trainingPlans') || '[]')

    const workoutIds = new Set(existingWorkouts.map(w => w.id))
    const newWorkouts = (data.workouts || []).filter(w => !workoutIds.has(w.id))
    const mergedWorkouts = [...existingWorkouts, ...newWorkouts]

    const planIds = new Set(existingPlans.map(p => p.id))
    const newPlans = (data.trainingPlans || []).filter(p => !planIds.has(p.id))
    const mergedPlans = [...existingPlans, ...newPlans]

    localStorage.setItem('workouts', JSON.stringify(mergedWorkouts))
    localStorage.setItem('trainingPlans', JSON.stringify(mergedPlans))

    return {
      workoutsAdded: newWorkouts.length,
      plansAdded: newPlans.length
    }
  }

  // Iniciar sincronização automática
  startAutoSync(intervalMinutes = 5, onSync = null) {
    if (this.syncInterval) {
      this.stopAutoSync()
    }

    this.syncInterval = setInterval(async () => {
      try {
        await this.upload()
        if (onSync) onSync({ success: true, type: 'upload' })
      } catch (error) {
        console.error('Erro na sincronização automática:', error)
        if (onSync) onSync({ success: false, error: error.message })
      }
    }, intervalMinutes * 60 * 1000)
  }

  // Parar sincronização automática
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }
}

export default new GoogleDriveSync()

