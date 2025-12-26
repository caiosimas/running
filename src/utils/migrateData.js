// Utilitário para migrar dados do localStorage para Firestore
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'

export async function migrateLocalStorageToFirestore(userId) {
  try {
    // Verificar se já migrou
    const migrationKey = `migrated_${userId}`
    if (localStorage.getItem(migrationKey)) {
      return { success: true, message: 'Dados já foram migrados anteriormente' }
    }

    // Buscar dados do localStorage
    const workouts = JSON.parse(localStorage.getItem('workouts') || '[]')
    const trainingPlans = JSON.parse(localStorage.getItem('trainingPlans') || '[]')

    if (workouts.length === 0 && trainingPlans.length === 0) {
      return { success: true, message: 'Nenhum dado para migrar' }
    }

    // Verificar se já existem dados no Firestore
    const workoutsQuery = query(
      collection(db, 'workouts'),
      where('userId', '==', userId)
    )
    const plansQuery = query(
      collection(db, 'trainingPlans'),
      where('userId', '==', userId)
    )

    const [workoutsSnapshot, plansSnapshot] = await Promise.all([
      getDocs(workoutsQuery),
      getDocs(plansQuery)
    ])

    const existingWorkouts = workoutsSnapshot.size
    const existingPlans = plansSnapshot.size

    if (existingWorkouts > 0 || existingPlans > 0) {
      return { 
        success: false, 
        message: 'Já existem dados no Firestore. A migração não será realizada para evitar duplicatas.' 
      }
    }

    // Migrar treinos
    let workoutsMigrated = 0
    for (const workout of workouts) {
      const { id, ...workoutData } = workout
      try {
        await addDoc(collection(db, 'workouts'), {
          ...workoutData,
          userId,
          migrated: true,
          migratedAt: new Date().toISOString()
        })
        workoutsMigrated++
      } catch (error) {
        console.error('Erro ao migrar treino:', error)
      }
    }

    // Migrar planos
    let plansMigrated = 0
    for (const plan of trainingPlans) {
      const { id, ...planData } = plan
      try {
        await addDoc(collection(db, 'trainingPlans'), {
          ...planData,
          userId,
          migrated: true,
          migratedAt: new Date().toISOString()
        })
        plansMigrated++
      } catch (error) {
        console.error('Erro ao migrar plano:', error)
      }
    }

    // Marcar como migrado
    localStorage.setItem(migrationKey, new Date().toISOString())

    return {
      success: true,
      message: `Migração concluída! ${workoutsMigrated} treinos e ${plansMigrated} planos migrados.`,
      workoutsMigrated,
      plansMigrated
    }
  } catch (error) {
    console.error('Erro na migração:', error)
    return {
      success: false,
      message: 'Erro ao migrar dados: ' + error.message
    }
  }
}

