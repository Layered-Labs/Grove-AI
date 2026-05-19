'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { ArrowUp, Loader2, PanelLeft, WifiOff, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import Message from './message'
import Sidebar from './sidebar'
import Wordmark from './wordmark'

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export type Conversation = {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
}

const MODEL_PRIMARY = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC'
const MODEL_FALLBACK = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC'
const STORAGE_KEY = 'groveai_conversations'

const SYSTEM_PROMPT: ChatMessage = {
  role: 'system' as const,
  content: `You are GroveAI, a warm and knowledgeable health companion for families and communities who don't always have easy access to a doctor.

Speak in plain, easy-to-understand English. Never use medical jargon without immediately explaining what it means. Be empathetic, direct, and genuinely helpful.

When someone asks about symptoms, medications, or health decisions, give them useful and honest information. If something sounds serious, say so clearly and gently. Always encourage them to follow up with a healthcare provider for personal medical decisions.`,
}

const SUGGESTIONS = [
  'My child has a fever of 102°F. When should I go to the ER?',
  'What are the side effects of metformin?',
  'Can I take ibuprofen with my blood pressure medication?',
  'How do I know if a cut needs stitches?',
]

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveConversations(conversations: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
}

export default function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [engine, setEngine] = useState<any>(null)
  const [loadProgress, setLoadProgress] = useState(0)
  const [loadText, setLoadText] = useState('Initializing...')
  const [loadedModel, setLoadedModel] = useState<'1.5B' | '0.5B' | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'generating'>('loading')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setConversations(loadConversations())

    const mq = window.matchMedia('(max-width: 768px)')
    setIsMobile(mq.matches)
    setSidebarOpen(!mq.matches)
    const mqHandler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
      if (e.matches) setSidebarOpen(false)
    }
    mq.addEventListener('change', mqHandler)

    setIsOffline(!navigator.onLine)
    const onOnline = () => setIsOffline(false)
    const onOffline = () => setIsOffline(true)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    return () => {
      mq.removeEventListener('change', mqHandler)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      const webllm = await import('@mlc-ai/web-llm')
      const callback = (p: any) => {
        setLoadProgress(Math.round(p.progress * 100))
        setLoadText(p.text)
      }
      try {
        const e = await webllm.CreateMLCEngine(MODEL_PRIMARY, { initProgressCallback: callback })
        setEngine(e)
        setLoadedModel('1.5B')
      } catch {
        setLoadProgress(0)
        setLoadText('Switching to lighter model...')
        const e = await webllm.CreateMLCEngine(MODEL_FALLBACK, { initProgressCallback: callback })
        setEngine(e)
        setLoadedModel('0.5B')
      }
      setStatus('ready')
    }
    init()
  }, [])

  const currentMessages = conversations.find((c) => c.id === activeId)?.messages ?? []

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages])

  const updateConversations = (updated: Conversation[]) => {
    setConversations(updated)
    saveConversations(updated)
  }

  const sendMessage = async (text: string) => {
    if (!engine || !text.trim() || status === 'generating') return

    const userMessage: ChatMessage = { role: 'user', content: text.trim() }
    setInput('')
    setStatus('generating')

    let convId = activeId
    let convList = [...conversations]

    if (!convId) {
      const newConv: Conversation = {
        id: crypto.randomUUID(),
        title: text.trim().slice(0, 42),
        messages: [],
        createdAt: Date.now(),
      }
      convList = [newConv, ...convList]
      convId = newConv.id
      setActiveId(convId)
    }

    const history = [
      ...(convList.find((c) => c.id === convId)?.messages ?? []),
      userMessage,
    ]

    const withPlaceholder = convList.map((c) =>
      c.id === convId
        ? { ...c, messages: [...history, { role: 'assistant' as const, content: '' }] }
        : c
    )
    updateConversations(withPlaceholder)

    const stream = await engine.chat.completions.create({
      messages: [SYSTEM_PROMPT, ...history],
      stream: true,
    })

    let content = ''
    for await (const chunk of stream) {
      content += chunk.choices[0]?.delta?.content ?? ''
      setConversations((prev) => {
        const next = prev.map((c) =>
          c.id === convId
            ? { ...c, messages: [...history, { role: 'assistant' as const, content }] }
            : c
        )
        saveConversations(next)
        return next
      })
    }

    setStatus('ready')
    textareaRef.current?.focus()
  }

  const send = () => sendMessage(input)

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6 px-8">
        <Wordmark className="text-3xl" />
        <div className="w-64 space-y-3 text-center">
          <Progress value={loadProgress} className="h-[2px] rounded-none" style={{ background: '#e7e0d8' }} />
          <p className="text-xs leading-relaxed" style={{ color: '#78716c' }}>{loadText}</p>
        </div>
        <p className="text-[11px] text-center max-w-xs" style={{ color: '#a8a29e' }}>
          This only happens once - your information stays on your device.<br />
          Best on Google Chrome or Microsoft Edge.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'border-r border-border/50 bg-background flex-shrink-0 overflow-hidden transition-[width,transform] duration-200 ease-in-out',
          isMobile
            ? cn('fixed inset-y-0 left-0 z-50 w-64 shadow-xl', sidebarOpen ? 'translate-x-0' : '-translate-x-full')
            : cn('relative', sidebarOpen ? 'w-64' : 'w-0')
        )}
      >
        <div className="w-64 h-full">
          <Sidebar
            conversations={conversations}
            activeId={activeId}
            onNew={() => { setActiveId(null); setInput(''); if (isMobile) setSidebarOpen(false) }}
            onSelect={(id) => { setActiveId(id); if (isMobile) setSidebarOpen(false) }}
            onDelete={(id) => {
              updateConversations(conversations.filter((c) => c.id !== id))
              if (activeId === id) setActiveId(null)
            }}
          />
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 px-6 py-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 flex-shrink-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            {loadedModel && !isOffline && (
              <div className="hidden sm:flex items-center gap-1.5" style={{ color: '#a8a29e' }}>
                <Lock className="h-3 w-3" />
                <span className="text-xs">Running on your device</span>
              </div>
            )}
            {isOffline && loadedModel && (
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: '#fee2e2', color: '#991b1b' }}
              >
                <WifiOff className="h-3 w-3" />
                <span>Offline and running</span>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-10">
          <div className="max-w-2xl mx-auto">
            {currentMessages.length === 0 && (
              <div className="flex flex-col justify-center min-h-[50vh] gap-10">
                <div>
                  <h2
                    className="font-[family-name:var(--font-playfair)] text-3xl font-bold leading-tight mb-2"
                    style={{ color: '#1c1917' }}
                  >
                    What would you like<br />to know today?
                  </h2>
                  <p className="text-xs" style={{ color: '#78716c' }}>
                    Free health information, running privately on your device.
                  </p>
                </div>
                <div className="space-y-1">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="group flex items-start gap-4 w-full text-left py-3 border-t transition-colors duration-150 hover:opacity-70"
                      style={{ borderColor: '#e7e0d8' }}
                    >
                      <span className="text-xs mt-0.5 font-mono flex-shrink-0" style={{ color: '#14532d' }}>
                        0{i + 1}
                      </span>
                      <span className="text-sm leading-snug" style={{ color: '#44403c' }}>{s}</span>
                      <ArrowUp
                        className="ml-auto h-3.5 w-3.5 flex-shrink-0 mt-0.5 rotate-45 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: '#14532d' }}
                      />
                    </button>
                  ))}
                  <div className="border-t" style={{ borderColor: '#e7e0d8' }} />
                </div>
              </div>
            )}
            {currentMessages.map((msg, i) => (
              <Message key={i} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="px-6 pb-6 pt-2">
          <div className="max-w-2xl mx-auto">
            <div
              className="relative rounded-xl bg-white transition-colors duration-150"
              style={{ border: '1px solid #ddd8d0' }}
            >
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a health question..."
                rows={1}
                className="resize-none border-0 shadow-none focus-visible:ring-0 text-sm px-4 pt-3.5 pb-12 min-h-0 bg-transparent leading-relaxed placeholder:text-stone-400"
                style={{ color: '#1c1917' }}
                disabled={status === 'generating'}
              />
              <div className="absolute bottom-3 right-3">
                <button
                  onClick={send}
                  disabled={!input.trim() || status === 'generating'}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-150 disabled:opacity-30"
                  style={{ background: '#14532d', color: '#ffffff' }}
                >
                  {status === 'generating' ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <ArrowUp className="h-3 w-3" />
                  )}
                  {status === 'generating' ? 'Thinking' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
