'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getAllAssessmentIds, type GradeMap } from './grade-utils'

const STORAGE_KEY = 'efy-grade-data-v1'

type GradeContextValue = {
  grades: GradeMap
  setGrade: (id: string, value: number | null) => void
  clearAll: () => void
}

const GradeContext = createContext<GradeContextValue | null>(null)

function loadStoredGrades(): GradeMap {
  if (typeof window === 'undefined') return {}
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) return {}
  try {
    const parsed = JSON.parse(stored) as Record<string, unknown>
    const allowedIds = new Set(getAllAssessmentIds())
    const cleaned: GradeMap = {}

    for (const [key, value] of Object.entries(parsed)) {
      if (!allowedIds.has(key)) continue
      if (typeof value === 'number' && !Number.isNaN(value)) {
        cleaned[key] = value
      }
    }

    return cleaned
  } catch (error) {
    console.error('Failed to load stored grades', error)
    return {}
  }
}

export function GradeProvider({ children }: { children: React.ReactNode }) {
  const [grades, setGrades] = useState<GradeMap>({})

  useEffect(() => {
    setGrades(loadStoredGrades())
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(grades))
  }, [grades])

  const setGrade = useCallback((id: string, value: number | null) => {
    setGrades((prev) => ({ ...prev, [id]: value }))
  }, [])

  const clearAll = useCallback(() => {
    setGrades({})
  }, [])

  const value = useMemo(() => ({ grades, setGrade, clearAll }), [grades, setGrade, clearAll])

  return <GradeContext.Provider value={value}>{children}</GradeContext.Provider>
}

export function useGrades() {
  const context = useContext(GradeContext)
  if (!context) {
    throw new Error('useGrades must be used within GradeProvider')
  }
  return context
}
