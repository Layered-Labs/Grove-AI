import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { BrowserChrome, ChatSidebar, ChatInput, UserBubble, AssistantBubble, APP_H, CHROME_H } from './ChatBase'
import Wordmark from '../wordmark'

const USER = "My child has a fever of 102°F. When should I go to the ER?"
const ASSISTANT = "Go to the ER now if your child has a stiff neck, rash, trouble breathing, won't wake up, or seems very confused. Also go immediately if they're under 3 months old with any fever. For a 102°F fever in an older child who is alert and drinking fluids, you can usually manage at home with Tylenol or Motrin and monitor closely. Call your pediatrician if the fever lasts more than 2-3 days or gets worse."

// LocalAnimation: shows model loading → chat ready → conversation
// Timeline:
//   0–65   loading screen (progress bar 0→100%)
//  65–85   crossfade to chat
//  85–115  user message springs in
// 115–195  assistant response types in
// 195–210  hold

export function LocalAnimation() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const loadOpacity = interpolate(frame, [0, 8, 58, 72], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const progress = interpolate(frame, [5, 62], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const chatOpacity = interpolate(frame, [72, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const msgSp = spring({ frame: Math.max(0, frame - 95), fps, config: { damping: 22, stiffness: 140 } })
  const msgOpacity = interpolate(msgSp, [0, 1], [0, 1])
  const msgY = interpolate(msgSp, [0, 1], [14, 0])

  const visibleChars = Math.floor(interpolate(frame, [118, 220], [0, ASSISTANT.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  const showCursor = frame >= 118 && visibleChars < ASSISTANT.length && Math.floor(frame / 8) % 2 === 0

  return (
    <div style={{ width: '100%', height: '100%', background: '#faf8f5', fontFamily: 'var(--font-inter)', position: 'relative', overflow: 'hidden' }}>

      {/* Loading screen */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 10, background: '#ffffff',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 28, opacity: loadOpacity, pointerEvents: 'none',
      }}>
        <Wordmark className="text-3xl" />
        <div style={{ width: 220, textAlign: 'center' }}>
          <div style={{ height: 2, background: '#e7e0d8', borderRadius: 1, marginBottom: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: '#14532d', borderRadius: 1 }} />
          </div>
          <p style={{ fontSize: 11, color: '#78716c' }}>Loading model... {Math.round(progress)}%</p>
        </div>
        <p style={{ fontSize: 10, color: '#a8a29e', textAlign: 'center', maxWidth: 260, lineHeight: 1.6 }}>
          This only happens once. Your information stays on your device.
        </p>
      </div>

      {/* Chat UI */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', opacity: chatOpacity }}>
        <BrowserChrome />
        <div style={{ display: 'flex', height: APP_H }}>
          <ChatSidebar active={0} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
            <div style={{ height: 42, borderBottom: '1px solid #f5f0eb', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 20px', gap: 5 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span style={{ fontSize: 11, color: '#a8a29e' }}>Running on your device</span>
            </div>
            <div style={{ flex: 1, padding: '28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {frame >= 95 && <UserBubble text={USER} opacity={msgOpacity} y={msgY} />}
              {frame >= 118 && <AssistantBubble text={ASSISTANT.slice(0, visibleChars)} cursor={showCursor} />}
            </div>
            <ChatInput />
          </div>
        </div>
      </div>
    </div>
  )
}
