import { Plus } from 'lucide-react'
import Wordmark from '../wordmark'

export const COMP_W = 1280
export const COMP_H = 720
export const CHROME_H = 40
export const SIDEBAR_W = 210
export const APP_H = COMP_H - CHROME_H

export function BrowserChrome({ rightSlot }: { rightSlot?: React.ReactNode }) {
  return (
    <div style={{
      height: CHROME_H, background: '#ede8e3',
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '0 14px', borderBottom: '1px solid #ddd8d0', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {['#f87171', '#fbbf24', '#4ade80'].map(c => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.75 }} />
        ))}
      </div>
      <div style={{
        flex: 1, background: '#ddd8d0', borderRadius: 5,
        height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 11, color: '#78716c' }}>groveai.space</span>
      </div>
      {rightSlot}
    </div>
  )
}

export function ChatSidebar({ active = 0 }: { active?: number }) {
  const convos = ['Fever question', 'Blood pressure meds', 'Concussion signs']
  return (
    <div style={{
      width: SIDEBAR_W, height: APP_H, flexShrink: 0,
      background: '#faf8f5', borderRight: '1px solid #ede8e3',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #ede8e3' }}>
        <Wordmark className="text-sm" />
      </div>
      <div style={{ padding: '6px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', color: '#78716c', fontSize: 12, marginBottom: 4 }}>
          <Plus style={{ width: 12, height: 12 }} />
          New conversation
        </div>
        <p style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a8a29e', padding: '4px 10px', marginBottom: 2 }}>Recent</p>
        {convos.map((t, i) => (
          <div key={t} style={{
            padding: '7px 10px', borderRadius: 6, fontSize: 12, marginBottom: 1,
            background: i === active ? 'rgba(0,0,0,0.06)' : 'transparent',
            color: i === active ? '#1c1917' : '#78716c',
          }}>
            {t}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChatInput() {
  return (
    <div style={{ padding: '0 16px 16px' }}>
      <div style={{ background: '#faf8f5', border: '1px solid #ddd8d0', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#c0b9b0' }}>
        Ask a health question...
      </div>
    </div>
  )
}

export function UserBubble({ text, opacity = 1, y = 0 }: { text: string; opacity?: number; y?: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', opacity, transform: `translateY(${y}px)` }}>
      <div style={{
        background: '#faf8f5', border: '1px solid #ede8e3',
        borderRadius: 16, padding: '10px 14px',
        fontSize: 13, lineHeight: 1.55, color: '#1c1917', maxWidth: '72%',
      }}>
        {text}
      </div>
    </div>
  )
}

export function AssistantBubble({ text, cursor = false }: { text: string; cursor?: boolean }) {
  return (
    <div style={{ maxWidth: '88%', fontSize: 13, lineHeight: 1.75, color: '#44403c' }}>
      {text}
      {cursor && <span style={{ opacity: 0.5, marginLeft: 1 }}>|</span>}
    </div>
  )
}
