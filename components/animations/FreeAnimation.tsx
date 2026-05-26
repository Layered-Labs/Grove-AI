import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

const COMP_W = 1280
const COMP_H = 720

// FreeAnimation: price counts down from $20 → $0, lands with a pop, "Free forever" appears
// Timeline:
//   0–25   "$20/month" fades in
//  25–40   hold at $20
//  40–62   rapid countdown 20 → 0
//  62–80   $0 pops with spring scale, color shifts to green
//  80–120  "No servers. No cost." slides up
// 120–190  hold

export function FreeAnimation() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const introOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Price countdown — eases out as it approaches 0
  const rawPrice = interpolate(frame, [40, 62], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: t => 1 - Math.pow(1 - t, 2),
  })
  const price = Math.round(rawPrice)
  const isZero = price === 0 && frame >= 62

  // Pop spring when landing on 0
  const popSp = spring({ frame: Math.max(0, frame - 62), fps, config: { damping: 10, stiffness: 220 } })
  const scale = isZero ? interpolate(popSp, [0, 0.4, 1], [0.88, 1.1, 1]) : 1

  // Color: white → green cross-fade
  const greenOpacity = interpolate(frame, [62, 74], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Subtitle slides in
  const subSp = spring({ frame: Math.max(0, frame - 82), fps, config: { damping: 22, stiffness: 130 } })
  const subOpacity = interpolate(subSp, [0, 1], [0, 1])
  const subY = interpolate(subSp, [0, 1], [18, 0])

  // Blinking cursor on the countdown
  const showCursor = !isZero && frame >= 40 && Math.floor(frame / 6) % 2 === 0

  return (
    <div style={{
      width: COMP_W, height: COMP_H,
      background: '#faf8f5',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 0, opacity: introOpacity,
      fontFamily: 'var(--font-inter)',
    }}>

      {/* /month label */}
      <p style={{
        fontSize: 18, letterSpacing: '0.08em', textTransform: 'uppercase',
        color: '#a8a29e', fontWeight: 500, marginBottom: 16,
      }}>
        per month
      </p>

      {/* Price number */}
      <div style={{ position: 'relative', transform: `scale(${scale})` }}>
        {/* White layer */}
        <p style={{

          fontSize: 200, fontWeight: 700, lineHeight: 1,
          letterSpacing: '-0.04em',
          color: '#1c1917',
          opacity: 1 - greenOpacity,
          margin: 0, userSelect: 'none',
          position: isZero ? 'absolute' : 'relative',
          inset: 0,
        }}>
          ${price}
        </p>
        {/* Green layer (cross-fades in at 0) */}
        {isZero && (
          <p style={{
  
            fontSize: 200, fontWeight: 700, lineHeight: 1,
            letterSpacing: '-0.04em',
            color: '#4ade80',
            opacity: greenOpacity,
            margin: 0, userSelect: 'none',
          }}>
            $0
          </p>
        )}
        {/* Countdown cursor */}
        {showCursor && (
          <span style={{
            position: 'absolute', right: -20, top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 120, color: 'rgba(28,25,23,0.12)', fontWeight: 300,
          }}>|</span>
        )}
      </div>

      {/* Subtitle */}
      <p style={{
        fontSize: 22, lineHeight: 1.6,
        color: '#78716c',
        marginTop: 28,
        opacity: subOpacity,
        transform: `translateY(${subY}px)`,
        textAlign: 'center',
      }}>
        No servers to run. No cost to pass on.
      </p>
    </div>
  )
}
