'use client'

import Link from 'next/link'
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'
import { getEngine } from '@/lib/engine'
import { useEngine } from '@/lib/use-engine'
import Message, { ChatMessage } from './message'
import ModelInfo from './model-info'
import ModelStrip from './model-strip'
import { Brand } from './site-head'
import Unsupported from './unsupported'

type Conversation = {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
}

const STORAGE_KEY = 'grove_conversations'
const OLD_STORAGE_KEY = 'groveai_conversations'

const SYSTEM_PROMPT: ChatMessage = {
  role: 'system',
  content: `You are Grove, a warm and knowledgeable assistant for people who don't always have easy access to expert help.

Speak in plain, easy-to-understand English. Never use jargon without immediately explaining what it means. Be empathetic, direct, and genuinely helpful.

Give useful and honest answers across any topic someone brings up, whether that's writing, learning, everyday decisions, or something more personal. If something requires a licensed professional (medical, legal, financial), say so clearly and gently, and encourage them to follow up with one for anything that needs it.`,
}

const SUGGESTIONS = [
  'Help me write a short email to quit my job.',
  'Explain compound interest as if I am new to it.',
  'What can I do if my landlord keeps my deposit?',
  'Give me a simple dinner using eggs, rice and spinach.',
]

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(OLD_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveConversations(list: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // Storage can be full or blocked. The chat still works for this visit.
  }
}

export default function Chat() {
  const { progress, ready, failed, supported, retry } = useEngine()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [generating, setGenerating] = useState(false)
  const [offline, setOffline] = useState(false)
  const historyRef = useRef<HTMLDialogElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setConversations(loadConversations())
    setOffline(!navigator.onLine)
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  const current = conversations.find((c) => c.id === activeId)
  const messages = current?.messages ?? []

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Grow the box with what is typed, up to a limit.
  useEffect(() => {
    const el = textRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`
  }, [input])

  const write = (next: Conversation[]) => {
    setConversations(next)
    saveConversations(next)
  }

  const send = async (raw: string) => {
    const text = raw.trim()
    if (!ready || !text || generating) return
    const engine = await getEngine()

    const userMessage: ChatMessage = { role: 'user', content: text }
    setInput('')
    setGenerating(true)

    let convId = activeId
    let list = [...conversations]
    if (!convId) {
      const created: Conversation = { id: crypto.randomUUID(), title: text.slice(0, 42), messages: [], createdAt: Date.now() }
      list = [created, ...list]
      convId = created.id
      setActiveId(convId)
    }
    const id = convId
    const history = [...(list.find((c) => c.id === id)?.messages ?? []), userMessage]
    const withReply = (content: string) => (c: Conversation) =>
      c.id === id ? { ...c, messages: [...history, { role: 'assistant' as const, content }] } : c

    write(list.map(withReply('')))

    try {
      const stream = await engine.chat.completions.create({ messages: [SYSTEM_PROMPT, ...history], stream: true })
      let content = ''
      for await (const chunk of stream) {
        content += chunk.choices[0]?.delta?.content ?? ''
        const snapshot = content
        setConversations((prev) => prev.map(withReply(snapshot)))
      }
      setConversations((prev) => {
        const next = prev.map(withReply(content))
        saveConversations(next)
        return next
      })
    } catch (err) {
      console.error('Inference error:', err)
      write(list.map(withReply('Something went wrong. Please try again.')))
    } finally {
      setGenerating(false)
      textRef.current?.focus()
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void send(input)
  }

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send(input)
    }
  }

  const newChat = () => {
    setActiveId(null)
    setInput('')
  }

  if (!supported) return <Unsupported />

  if (!ready) {
    return (
      <section className="screen">
        <div className="chat-top">
          <Brand />
        </div>
        <div className="center">
          <h1>Getting Grove ready</h1>
          <p className="sub">This happens once. It stays on this device.</p>
          <ModelStrip ready={ready} progress={progress} failed={failed} onRetry={retry} />
        </div>
      </section>
    )
  }

  return (
    <section className="screen chat">
      <div className="chat-top">
        <Link className="brand-link" href="/" aria-label="Grove home">
          <Brand />
        </Link>
        <div className="row">
          <ModelInfo />
          <button className="tool-btn" type="button" onClick={() => historyRef.current?.showModal()}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            History
          </button>
          <button className="tool-btn" type="button" onClick={newChat} disabled={messages.length === 0}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New chat
          </button>
        </div>
      </div>

      <main className="messages" aria-live="polite">
        {messages.length === 0 ? (
          <div className="empty">
            <h1 className="h2">What would you like to know?</h1>
            <div className="chips">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="chip" type="button" onClick={() => void send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => <Message key={i} message={m} pending={generating && i === messages.length - 1} />)
        )}
        <div ref={bottomRef} />
      </main>

      <footer className="composer">
        <form className="send-row" onSubmit={onSubmit}>
          <label className="grow">
            <span className="sr">Your message</span>
            <textarea
              ref={textRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              rows={1}
              placeholder="Ask anything..."
              enterKeyHint="send"
              disabled={generating}
            />
          </label>
          <button className="send" type="submit" aria-label="Send" disabled={!input.trim() || generating}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 19V5" />
              <path d="m5 12 7-7 7 7" />
            </svg>
          </button>
        </form>
        <p className="foot">{offline ? 'You are offline. Grove is still working.' : 'Runs on this device. Nothing is sent anywhere.'}</p>
      </footer>

      <dialog ref={historyRef} aria-labelledby="historyTitle" onClick={(e) => e.target === historyRef.current && historyRef.current?.close()}>
        <div className="sheet">
          <div className="row between">
            <h2 id="historyTitle">Your chats</h2>
            <button className="icon-btn plain" type="button" aria-label="Close" onClick={() => historyRef.current?.close()}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
          {conversations.length === 0 ? (
            <p className="note">No chats yet. They are saved on this device.</p>
          ) : (
            <ul className="history">
              {conversations.map((c) => (
                <li key={c.id}>
                  <button
                    className="history-item"
                    type="button"
                    onClick={() => {
                      setActiveId(c.id)
                      historyRef.current?.close()
                    }}
                  >
                    {c.title}
                  </button>
                  <button
                    className="icon-btn plain"
                    type="button"
                    aria-label={`Delete ${c.title}`}
                    onClick={() => {
                      write(conversations.filter((x) => x.id !== c.id))
                      if (activeId === c.id) setActiveId(null)
                    }}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="m6 6 1 14h10l1-14" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </dialog>
    </section>
  )
}
