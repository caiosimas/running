import { useState, useEffect } from 'react'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore'
import { db } from '../config/firebase'

export function useWorkouts(userId) {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) {
      setWorkouts([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    const workoutsRef = collection(db, 'workouts')
    
    // Tenta primeiro sem orderBy para evitar problemas de índice
    const q = query(
      workoutsRef,
      where('userId', '==', userId)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const workoutsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Ordenar localmente por data (mais recente primeiro)
      workoutsData.sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt || 0)
        const dateB = new Date(b.date || b.createdAt || 0)
        return dateB.getTime() - dateA.getTime()
      })
      
      console.log('Treinos carregados:', workoutsData.length)
      setWorkouts(workoutsData)
      setLoading(false)
      setError(null)
    }, (error) => {
      console.error('Erro ao carregar treinos:', error)
      setError(error.message)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userId])

  const addWorkout = async (workout) => {
    try {
      const docRef = await addDoc(collection(db, 'workouts'), {
        ...workout,
        userId,
        createdAt: new Date().toISOString()
      })
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('Erro ao adicionar treino:', error)
      return { success: false, error: error.message }
    }
  }

  const deleteWorkout = async (workoutId) => {
    try {
      await deleteDoc(doc(db, 'workouts', workoutId))
      return { success: true }
    } catch (error) {
      console.error('Erro ao deletar treino:', error)
      return { success: false, error: error.message }
    }
  }

  return { workouts, loading, error, addWorkout, deleteWorkout }
}

export function useTrainingPlans(userId) {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setPlans([])
      setLoading(false)
      return
    }

    const plansRef = collection(db, 'trainingPlans')
    const q = query(
      plansRef,
      where('userId', '==', userId)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const plansData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setPlans(plansData)
      setLoading(false)
    }, (error) => {
      console.error('Erro ao carregar planos:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userId])

  const addPlan = async (plan) => {
    try {
      const docRef = await addDoc(collection(db, 'trainingPlans'), {
        ...plan,
        userId,
        createdAt: new Date().toISOString()
      })
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('Erro ao adicionar plano:', error)
      return { success: false, error: error.message }
    }
  }

  const deletePlan = async (planId) => {
    try {
      await deleteDoc(doc(db, 'trainingPlans', planId))
      return { success: true }
    } catch (error) {
      console.error('Erro ao deletar plano:', error)
      return { success: false, error: error.message }
    }
  }

  const importPlans = async (plansArray) => {
    try {
      const results = []
      for (const plan of plansArray) {
        const { id, ...planData } = plan
        const result = await addPlan({
          ...planData,
          imported: true
        })
        results.push(result)
      }
      return { success: true, results }
    } catch (error) {
      console.error('Erro ao importar planos:', error)
      return { success: false, error: error.message }
    }
  }

  return { plans, loading, addPlan, deletePlan, importPlans }
}

