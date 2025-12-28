import { useMemo } from 'react'
import { useWorkouts } from '../hooks/useFirestore'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import '../styles/Charts.css'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444']

function Charts({ userId }) {
  const { workouts, loading } = useWorkouts(userId)

  // Processar dados para gráficos
  const chartData = useMemo(() => {
    if (!workouts || workouts.length === 0) return null

    // 1. Evolução da distância ao longo do tempo
    const distanceOverTime = workouts
      .map(w => ({
        date: new Date(w.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
        distance: w.distance || 0,
        fullDate: w.date
      }))
      .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate))
      .slice(-20) // Últimos 20 treinos

    // 2. Distância total por mês
    const monthlyDistance = workouts.reduce((acc, w) => {
      if (!w.date) return acc
      const date = new Date(w.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthLabel, distance: 0, count: 0 }
      }
      acc[monthKey].distance += w.distance || 0
      acc[monthKey].count += 1
      return acc
    }, {})

    const monthlyData = Object.values(monthlyDistance).sort((a, b) => {
      const dateA = Object.keys(monthlyDistance).find(k => monthlyDistance[k] === a)
      const dateB = Object.keys(monthlyDistance).find(k => monthlyDistance[k] === b)
      return dateA.localeCompare(dateB)
    })

    // 3. Distribuição por tipo de treino
    const typeDistribution = workouts.reduce((acc, w) => {
      const type = w.type || 'treino'
      const label = type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    const typeData = Object.entries(typeDistribution).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' '),
      value: count
    }))

    // 4. Ritmo médio ao longo do tempo (últimos 20)
    const paceOverTime = workouts
      .filter(w => w.pace)
      .map(w => {
        // Extrair minutos e segundos do pace (formato: "5:30 min/km")
        const paceMatch = w.pace.match(/(\d+):(\d+)/)
        let paceMinutes = 0
        if (paceMatch) {
          paceMinutes = parseFloat(paceMatch[1]) + parseFloat(paceMatch[2]) / 60
        }
        return {
          date: new Date(w.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
          pace: paceMinutes,
          fullDate: w.date
        }
      })
      .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate))
      .slice(-20)

    // 5. Frequência de treinos por semana
    const weeklyFrequency = workouts.reduce((acc, w) => {
      if (!w.date) return acc
      const date = new Date(w.date)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekKey = weekStart.toISOString().split('T')[0]
      const weekLabel = `Sem ${weekStart.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}`
      
      if (!acc[weekKey]) {
        acc[weekKey] = { week: weekLabel, count: 0 }
      }
      acc[weekKey].count += 1
      return acc
    }, {})

    const weeklyData = Object.values(weeklyFrequency)
      .sort((a, b) => {
        const dateA = Object.keys(weeklyFrequency).find(k => weeklyFrequency[k] === a)
        const dateB = Object.keys(weeklyFrequency).find(k => weeklyFrequency[k] === b)
        return dateA.localeCompare(dateB)
      })
      .slice(-12) // Últimas 12 semanas

    return {
      distanceOverTime,
      monthlyData,
      typeData,
      paceOverTime,
      weeklyData
    }
  }, [workouts])

  if (loading) {
    return (
      <div className="charts-container">
        <div className="loading-state">
          <p>Carregando gráficos...</p>
        </div>
      </div>
    )
  }

  if (!chartData || workouts.length === 0) {
    return (
      <div className="charts-container">
        <div className="empty-state">
          <p>Nenhum dado disponível para gráficos.</p>
          <p>Registre alguns treinos para ver suas estatísticas!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="charts-container">
      <h2>Estatísticas e Gráficos</h2>

      <div className="charts-grid">
        {/* Evolução da Distância */}
        <div className="chart-card">
          <h3>Evolução da Distância</h3>
          <p className="chart-subtitle">Últimos 20 treinos</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.distanceOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="date" 
                stroke="var(--text-secondary)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="var(--text-secondary)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="distance" 
                stroke="#6366f1" 
                strokeWidth={2}
                dot={{ fill: '#6366f1', r: 4 }}
                name="Distância (km)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distância Total por Mês */}
        <div className="chart-card">
          <h3>Distância Total por Mês</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="month" 
                stroke="var(--text-secondary)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="var(--text-secondary)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)'
                }}
              />
              <Bar dataKey="distance" fill="#8b5cf6" name="Distância (km)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição por Tipo */}
        <div className="chart-card">
          <h3>Distribuição por Tipo de Treino</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.typeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Frequência Semanal */}
        <div className="chart-card">
          <h3>Frequência de Treinos por Semana</h3>
          <p className="chart-subtitle">Últimas 12 semanas</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="week" 
                stroke="var(--text-secondary)"
                style={{ fontSize: '11px' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="var(--text-secondary)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)'
                }}
              />
              <Bar dataKey="count" fill="#10b981" name="Treinos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ritmo ao Longo do Tempo */}
        {chartData.paceOverTime.length > 0 && (
          <div className="chart-card">
            <h3>Evolução do Ritmo</h3>
            <p className="chart-subtitle">Últimos 20 treinos com ritmo registrado</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.paceOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--text-secondary)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="var(--text-secondary)"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'min/km', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)'
                  }}
                  formatter={(value) => `${value.toFixed(2)} min/km`}
                />
                <Line 
                  type="monotone" 
                  dataKey="pace" 
                  stroke="#ec4899" 
                  strokeWidth={2}
                  dot={{ fill: '#ec4899', r: 4 }}
                  name="Ritmo (min/km)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

export default Charts

