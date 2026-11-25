// The on-device model. One engine per page load, shared by every screen.
// It runs in the browser on WebGPU through WebLLM; nothing is sent to a server.
const MODEL = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC'

type ProgressFn = (progress: number) => void

/* eslint-disable @typescript-eslint/no-explicit-any */
let _promise: Promise<any> | null = null
let _engine: any | null = null
let _progress = 0
const _subs = new Set<ProgressFn>()

function _notify(progress: number) {
  _progress = progress
  _subs.forEach((fn) => fn(progress))
}

export function subscribeProgress(fn: ProgressFn): () => void {
  _subs.add(fn)
  fn(_progress)
  return () => {
    _subs.delete(fn)
  }
}

export function isEngineReady(): boolean {
  return _engine !== null
}

export function webGpuAvailable(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator
}

export function getEngine(): Promise<any> {
  if (!_promise) {
    _promise = (async () => {
      const webllm = await import('@mlc-ai/web-llm')
      const cb = (p: { progress: number }) => _notify(Math.round(p.progress * 100))
      _engine = await webllm.CreateMLCEngine(MODEL, { initProgressCallback: cb })
      _notify(100)
      return _engine
    })().catch((err) => {
      // Allow a retry after a failed download.
      _promise = null
      throw err
    })
  }
  return _promise
}
