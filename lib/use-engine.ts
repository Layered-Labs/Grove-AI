'use client'

import { useEffect, useState } from 'react'
import { getEngine, isEngineReady, subscribeProgress, webGpuAvailable } from './engine'

/** Starts the model download once and reports how far it has got. */
export function useEngine() {
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(isEngineReady())
  const [failed, setFailed] = useState(false)
  const [supported, setSupported] = useState(true)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!webGpuAvailable()) {
      setSupported(false)
      return
    }
    setFailed(false)
    const unsub = subscribeProgress(setProgress)
    getEngine()
      .then(() => setReady(true))
      .catch(() => setFailed(true))
    return unsub
  }, [attempt])

  return { progress, ready, failed, supported, retry: () => setAttempt((n) => n + 1) }
}
