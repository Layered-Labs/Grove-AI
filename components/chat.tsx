'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { ArrowUp, Loader2, PanelLeft } from 'lucide-react'
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

const MODEL_ID = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC'
const STORAGE_KEY = 'groveai_conversations'

const SYSTEM_PROMPT: ChatMessage = {
  role: 'system' as const,
  content: `You are GroveAI, a health information assistant built to make medical knowledge accessible to everyone — especially families and communities with limited access to healthcare.

Speak in plain, warm, easy-to-understand English. Never use medical jargon without immediately explaining what it means. Be empathetic, direct, and genuinely helpful.

When someone asks about symptoms, medications, or health decisions, give them useful, honest information. Always remind them to follow their healthcare provider's advice for personal medical decisions, and tell them clearly when something sounds serious enough to seek immediate care.

You exist to bridge the gap for people who don't have easy access to a doctor. Treat every question with care and respect.`,
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
  const [status, setStatus] = useState<'loading' | 'ready' | 'generating'>('loading')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setConversations(loadConversations())
  }, [])

  useEffect(() => {
    const init = async () => {
      const webllm = await import('@mlc-ai/web-llm')
      const e = await webllm.CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (p: any) => {
          setLoadProgress(Math.round(p.progress * 100))
          setLoadText(p.text)
        },
      })
      setEngine(e)
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
      <div className="flex flex-col items-center justify-center h-screen gap-4 px-8">
        <p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed">
          {loadText}
        </p>
        <Progress value={loadProgress} className="w-72 h-1.5" />
        <p className="text-xs text-muted-foreground/50">This only happens once - your information stays on your device</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div
        className={cn(
          'border-r border-border/50 bg-muted/20 flex-shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out',
          sidebarOpen ? 'w-64' : 'w-0'
        )}
      >
        <div className="w-64 h-full">
          <Sidebar
            conversations={conversations}
            activeId={activeId}
            onNew={() => { setActiveId(null); setInput('') }}
            onSelect={setActiveId}
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
        <div className="flex items-center gap-2 px-4 py-3.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 flex justify-center">
            <Wordmark className="text-base" />
          </div>
          <div className="h-8 w-8 flex-shrink-0" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            {currentMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[55vh] gap-6 text-center">
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold tracking-tight">Ask me anything about your health.</h2>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full max-w-xl mt-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-left text-sm px-4 py-3 rounded-xl border border-border hover:bg-muted transition-colors leading-snug text-muted-foreground hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
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
        <div className="px-4 pb-6 pt-2">
          <div className="max-w-3xl mx-auto">
            <div className="relative rounded-2xl border border-border bg-background shadow-sm focus-within:border-foreground/25 transition-colors duration-150">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message GroveAI..."
                rows={1}
                className="resize-none border-0 shadow-none focus-visible:ring-0 text-base px-4 pt-3.5 pb-12 min-h-0 bg-transparent leading-relaxed"
                disabled={status === 'generating'}
              />
              <div className="absolute bottom-3 right-3">
                <Button
                  onClick={send}
                  disabled={!input.trim() || status === 'generating'}
                  size="icon"
                  className="h-8 w-8 rounded-xl"
                >
                  {status === 'generating' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground/40 mt-3">
              Your health questions stay private, nothing leaves your device. For personal medical decisions, always follow your provider's advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
