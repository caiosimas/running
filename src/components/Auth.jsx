import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import '../styles/Auth.css'

function Auth() {
  const { login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!isLogin && password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)

    if (isLogin) {
      const result = await login(email, password)
      if (!result.success) {
        setError(result.error || 'Erro ao fazer login')
      }
    } else {
      const result = await register(email, password)
      if (result.success) {
        setMessage('Conta criada com sucesso! Você já está logado.')
      } else {
        setError(result.error || 'Erro ao criar conta')
      }
    }

    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Entrar' : 'Criar Conta'}</h2>
        <p className="auth-subtitle">
          {isLogin 
            ? 'Entre para sincronizar seus dados em todos os dispositivos'
            : 'Crie uma conta para começar a usar o Running Tracker'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Mínimo 6 caracteres"
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Senha</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Digite a senha novamente"
                disabled={loading}
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isLogin ? 'Não tem uma conta? ' : 'Já tem uma conta? '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setMessage('')
                setPassword('')
                setConfirmPassword('')
              }}
              className="switch-button"
            >
              {isLogin ? 'Criar conta' : 'Fazer login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Auth

