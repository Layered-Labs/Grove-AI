'use client'

import { useEffect } from 'react'

// Registers the service worker so the app shell opens without a connection.
export default function OfflineStatus() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])
  return null
}
