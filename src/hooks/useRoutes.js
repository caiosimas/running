import { useState, useEffect } from 'react'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore'
import { db } from '../config/firebase'

export function useRoutes(userId) {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setRoutes([])
      setLoading(false)
      return
    }

    const routesRef = collection(db, 'routes')
    const q = query(
      routesRef,
      where('userId', '==', userId)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const routesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setRoutes(routesData)
      setLoading(false)
    }, (error) => {
      console.error('Erro ao carregar rotas:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userId])

  const addRoute = async (route) => {
    try {
      const docRef = await addDoc(collection(db, 'routes'), {
        ...route,
        userId,
        createdAt: new Date().toISOString()
      })
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('Erro ao adicionar rota:', error)
      return { success: false, error: error.message }
    }
  }

  const deleteRoute = async (routeId) => {
    try {
      await deleteDoc(doc(db, 'routes', routeId))
      return { success: true }
    } catch (error) {
      console.error('Erro ao deletar rota:', error)
      return { success: false, error: error.message }
    }
  }

  return { routes, loading, addRoute, deleteRoute }
}

