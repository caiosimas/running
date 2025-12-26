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

  useEffect(() => {
    if (!userId) {
      setWorkouts([])
      setLoading(false)
      return
    }

    const workoutsRef = collection(db, 'workouts')
    const q = query(
      workoutsRef,
      where('userId', '==', userId),
      orderBy('date', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const workoutsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setWorkouts(workoutsData)
      setLoading(false)
    }, (error) => {
      console.error('Erro ao carregar treinos:', error)
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

  return { workouts, loading, addWorkout, deleteWorkout }
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

