import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { BrowserChrome, ChatSidebar, ChatInput, UserBubble, AssistantBubble, APP_H } from './ChatBase'
import { WifiOff } from 'lucide-react'

const USER = "My landlord won't return my deposit. What are my rights?"
const ASSISTANT = "Most states require landlords to return your deposit (minus lawful deductions) within 14-30 days, with an itemized list if they withhold any of it. If they've missed the deadline or the deductions look unreasonable, send a written demand letter first. If that doesn't work, small claims court is usually fast and doesn't require a lawyer. Want help drafting that letter?"

// OfflineAnimation: UI shown → wifi disconnects → offline pill → conversation works anyway
// Timeline:
//   0–20   chat UI fades in (online)
//  20–40   wifi disconnects, offline pill slides in
//  40–75   user message springs in
//  75–175  assistant types despite offline
// 175–190  hold

export function OfflineAnimation() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const uiOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Offline pill slides in
  const pillSp = spring({ frame: Math.max(0, frame - 22), fps, config: { damping: 20, stiffness: 160 } })
  const pillOpacity = interpolate(pillSp, [0, 1], [0, 1])
  const pillX = interpolate(pillSp, [0, 1], [20, 0])

  const msgSp = spring({ frame: Math.max(0, frame - 45), fps, config: { damping: 22, stiffness: 140 } })
  const msgOpacity = interpolate(msgSp, [0, 1], [0, 1])
  const msgY = interpolate(msgSp, [0, 1], [14, 0])

  const visibleChars = Math.floor(interpolate(frame, [78, 172], [0, ASSISTANT.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  const showCursor = frame >= 78 && visibleChars < ASSISTANT.length && Math.floor(frame / 8) % 2 === 0

  const isOffline = frame >= 22

  return (
    <div style={{ width: '100%', height: '100%', background: '#faf8f5', fontFamily: 'var(--font-inter)', opacity: uiOpacity }}>
      <BrowserChrome />
      <div style={{ display: 'flex', height: APP_H }}>
        <ChatSidebar active={2} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
          {/* Header */}
          <div style={{ height: 42, borderBottom: '1px solid #f5f0eb', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 20px' }}>
            {isOffline && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: '#fee2e2', borderRadius: 999, padding: '3px 10px',
                opacity: pillOpacity, transform: `translateX(${pillX}px)`,
              }}>
                <WifiOff style={{ width: 10, height: 10, color: '#991b1b' }} />
                <span style={{ fontSize: 11, color: '#991b1b', fontWeight: 500 }}>Offline and running</span>
              </div>
            )}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {frame >= 45 && <UserBubble text={USER} opacity={msgOpacity} y={msgY} />}
            {frame >= 78 && <AssistantBubble text={ASSISTANT.slice(0, visibleChars)} cursor={showCursor} />}
          </div>
          <ChatInput />
        </div>
      </div>
    </div>
  )
}
