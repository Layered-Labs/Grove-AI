import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { BrowserChrome, ChatSidebar, ChatInput, UserBubble, AssistantBubble, APP_H } from './ChatBase'

const USER = "I've been taking lisinopril for blood pressure. Is it safe to take ibuprofen?"
const ASSISTANT = "Taking ibuprofen with lisinopril can reduce how well your blood pressure medication works and may also strain your kidneys over time. For occasional pain, acetaminophen (Tylenol) is generally the safer choice. If you need ibuprofen regularly, check with your doctor, as they may want to adjust your dose or monitor your blood pressure more closely."

// PrivacyAnimation: chat UI appears, lock badge pulses, conversation flows
// Timeline:
//   0–25   UI fades in
//  25–60   user message springs in
//  60–75   lock indicator pulses green
//  75–175  assistant response types
// 175–190  hold

export function PrivacyAnimation() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const uiOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const msgSp = spring({ frame: Math.max(0, frame - 28), fps, config: { damping: 22, stiffness: 140 } })
  const msgOpacity = interpolate(msgSp, [0, 1], [0, 1])
  const msgY = interpolate(msgSp, [0, 1], [14, 0])

  // Lock pulse: glow green briefly at frame 62–75
  const pulseSp = spring({ frame: Math.max(0, frame - 62), fps, config: { damping: 18, stiffness: 200 } })
  const lockScale = interpolate(pulseSp, [0, 0.5, 1], [1, 1.15, 1])
  const lockGlow = interpolate(pulseSp, [0, 0.4, 1], [0, 1, 0])

  const visibleChars = Math.floor(interpolate(frame, [78, 172], [0, ASSISTANT.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  const showCursor = frame >= 78 && visibleChars < ASSISTANT.length && Math.floor(frame / 8) % 2 === 0

  return (
    <div style={{ width: '100%', height: '100%', background: '#faf8f5', fontFamily: 'var(--font-inter)', opacity: uiOpacity }}>
      <BrowserChrome />
      <div style={{ display: 'flex', height: APP_H }}>
        <ChatSidebar active={1} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
          {/* Header with animated lock */}
          <div style={{ height: 42, borderBottom: '1px solid #f5f0eb', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 20px', gap: 5 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              transform: `scale(${lockScale})`,
              filter: lockGlow > 0.1 ? `drop-shadow(0 0 ${lockGlow * 6}px rgba(20,83,45,0.6))` : 'none',
              transition: 'none',
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#14532d" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span style={{ fontSize: 11, color: '#14532d', fontWeight: 500 }}>Private: nothing leaves your device</span>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {frame >= 28 && <UserBubble text={USER} opacity={msgOpacity} y={msgY} />}
            {frame >= 78 && <AssistantBubble text={ASSISTANT.slice(0, visibleChars)} cursor={showCursor} />}
          </div>
          <ChatInput />
        </div>
      </div>
    </div>
  )
}
