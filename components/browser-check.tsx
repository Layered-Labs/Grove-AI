'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function BrowserCheck() {
  const [unsupported, setUnsupported] = useState(false)

  useEffect(() => {
    if (!('gpu' in navigator)) setUnsupported(true)
  }, [])

  if (!unsupported) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-6">
      <div className="max-w-sm w-full border border-border rounded-2xl p-6 bg-background shadow-lg space-y-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <span className="font-semibold text-base">Browser not supported</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          GroveAI runs entirely on your device using WebGPU - no data is ever sent anywhere. Your browser doesn't support WebGPU yet.
        </p>
        <div className="text-sm text-muted-foreground leading-relaxed space-y-1">
          <p className="font-medium text-foreground">Supported browsers:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Google Chrome (desktop + Android)</li>
            <li>Microsoft Edge (desktop)</li>
            <li>version 113 or newer</li>
          </ul>
        </div>
        <a
          href="https://www.google.com/chrome/"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center text-sm font-medium bg-foreground text-background rounded-xl py-2.5 hover:opacity-80 transition-opacity"
        >
          Download Chrome
        </a>
      </div>
    </div>
  )
}
