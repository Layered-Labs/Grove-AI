const MODEL = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC'

type ProgressFn = (progress: number, text: string) => void

let _promise: Promise<any> | null = null
let _engine: any | null = null
let _progress = 0
let _text = 'Initializing...'
const _subs = new Set<ProgressFn>()

function _notify(progress: number, text: string) {
  _progress = progress
  _text = text
  _subs.forEach((fn) => fn(progress, text))
}

export function subscribeProgress(fn: ProgressFn): () => void {
  _subs.add(fn)
  fn(_progress, _text)
  return () => _subs.delete(fn)
}

export function isEngineReady(): boolean {
  return _engine !== null
}

export function getEngine(): Promise<any> {
  if (!_promise) {
    _promise = (async () => {
      const webllm = await import('@mlc-ai/web-llm')
      const cb = (p: any) => _notify(Math.round(p.progress * 100), p.text)
      try {
        _engine = await webllm.CreateMLCEngine(MODEL, { initProgressCallback: cb })
      } catch {
        _notify(0, 'Switching to lighter model...')
        _engine = await webllm.CreateMLCEngine(MODEL, { initProgressCallback: cb })
      }
      _notify(100, 'Ready')
      return _engine
    })()
  }
  return _promise
}
