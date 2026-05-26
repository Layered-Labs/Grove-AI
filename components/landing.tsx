'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { getEngine, subscribeProgress, isEngineReady } from '@/lib/engine'
import Wordmark from './wordmark'
import { LocalAnimation } from './animations/LocalAnimation'
import { OfflineAnimation } from './animations/OfflineAnimation'
import { COMP_W, COMP_H } from './animations/ChatBase'

const Player = dynamic(() => import('@remotion/player').then(m => m.Player), { ssr: false })

// ─── Animation ────────────────────────────────────────────────────────────────

function useFadeUp(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

const into = (visible: boolean, delay = 0): React.CSSProperties => ({
  opacity: visible ? 1 : 0,
  transform: visible ? 'translateY(0)' : 'translateY(20px)',
  transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  willChange: 'opacity, transform',
})

// ─── Remotion player wrapper ──────────────────────────────────────────────────

const ANIMATIONS = {
  local:   { component: LocalAnimation,   duration: 235 },
  offline: { component: OfflineAnimation, duration: 190 },
} as const

function AnimatedDemo({ variant, bgImage }: { variant: keyof typeof ANIMATIONS; bgImage?: string }) {
  const { component, duration } = ANIMATIONS[variant]
  const playerRef = useRef<{ seekTo: (frame: number) => void } | null>(null)

  useEffect(() => {
    let frame = 0
    const id = setInterval(() => {
      frame = (frame + 1) % duration
      playerRef.current?.seekTo(frame)
    }, 1000 / 30)
    return () => clearInterval(id)
  }, [duration])

  return (
    <div style={{
      background: bgImage ? undefined : 'linear-gradient(160deg, #f0ebe3 0%, #e8e0d6 100%)',
      backgroundImage: bgImage ? `url(${bgImage})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid #ddd8d0',
      boxShadow: '0 4px 24px rgba(28,25,23,0.06), 0 1px 4px rgba(28,25,23,0.04)',
    }}>
      <div style={{ borderRadius: '10px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(28,25,23,0.12)' }}>
        <div style={{ width: '100%', aspectRatio: `${COMP_W} / ${COMP_H}` }}>
          <Player
            ref={playerRef as any}
            component={component}
            durationInFrames={duration}
            fps={30}
            compositionWidth={COMP_W}
            compositionHeight={COMP_H}
            style={{ width: '100%', height: '100%', display: 'block' }}
            clickToPlay={false}
            numberOfSharedAudioTags={0}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Feature section ──────────────────────────────────────────────────────────

function Feature({
  eyebrow, title, description, variant, videoSrc, bgImage,
}: {
  eyebrow: string
  title: string
  description: string
  variant: keyof typeof ANIMATIONS
  videoSrc?: string
  bgImage?: string
}) {
  const text = useFadeUp(0.12)
  const visual = useFadeUp(0.04)

  return (
    <div style={{ padding: 'clamp(56px, 7vw, 80px) clamp(24px, 5vw, 72px)' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
        <div ref={text.ref} style={{ maxWidth: '520px', marginBottom: 'clamp(40px, 5vw, 60px)', ...into(text.visible) }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#14532d', fontWeight: 600, marginBottom: '16px' }}>
            {eyebrow}
          </p>
          <h3 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.025em', color: '#1c1917', marginBottom: '16px' }}>
            {title}
          </h3>
          <p style={{ fontSize: '16px', lineHeight: 1.75, color: '#78716c', maxWidth: '420px' }}>
            {description}
          </p>
        </div>
        <div ref={visual.ref} style={{ ...into(visual.visible, 120) }}>
          {videoSrc ? (
            <video src={videoSrc} autoPlay loop muted playsInline style={{ width: '100%', display: 'block', borderRadius: '10px' }} />
          ) : (
            <AnimatedDemo variant={variant} bgImage={bgImage} />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── CTA button ───────────────────────────────────────────────────────────────

function CtaButton({ ready, progress, onClick, compact = false, inverted = false, pill = false }: {
  ready: boolean; progress: number; onClick: () => void; compact?: boolean; inverted?: boolean; pill?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={!ready}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: ready ? (inverted ? '#faf8f5' : '#1c1917') : (inverted ? 'rgba(250,248,245,0.12)' : '#ede8e3'),
        color: ready ? (inverted ? '#1c1917' : '#fff') : (inverted ? 'rgba(250,248,245,0.3)' : '#a8a29e'),
        border: 'none', borderRadius: '999px',
        padding: compact ? '7px 18px' : pill ? '13px 28px' : '11px 24px',
        fontSize: compact ? '13px' : pill ? '15px' : '14px',
        fontWeight: 600, cursor: ready ? 'pointer' : 'default',
        transition: 'opacity 0.15s', fontFamily: 'inherit', letterSpacing: '-0.01em',
      }}
      onMouseEnter={e => { if (ready) (e.currentTarget as HTMLButtonElement).style.opacity = '0.8' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
    >
      {ready
        ? <><span>Chat with Grove</span><ArrowRight style={{ width: compact ? 12 : 14, height: compact ? 12 : 14 }} /></>
        : <><Loader2 className="animate-spin" style={{ width: compact ? 12 : 14, height: compact ? 12 : 14 }} /><span>{progress > 0 ? `Loading · ${progress}%` : 'Loading model...'}</span></>
      }
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Landing() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(isEngineReady())

  useEffect(() => {
    const unsub = subscribeProgress((p) => {
      setProgress(p)
      if (p === 100) setReady(true)
    })
    getEngine().then(() => setReady(true))
    return unsub
  }, [])

  const goToChat = () => ready && router.push('/chat')
  const pricing = useFadeUp()
  const cta = useFadeUp()

  return (
    <div style={{ background: '#faf8f5', color: '#1c1917', scrollBehavior: 'smooth' }}>

      {/* Nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px clamp(24px, 5vw, 72px)',
        background: '#faf8f5',
      }}>
        <a href="/" style={{ textDecoration: 'none' }}><Wordmark className="text-base" /></a>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <a href="#features" style={{ fontSize: '14px', color: '#78716c', textDecoration: 'none', fontWeight: 500, padding: '6px 12px', borderRadius: '999px' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#1c1917')}
            onMouseLeave={e => (e.currentTarget.style.color = '#78716c')}>
            Features
          </a>
          <a href="#pricing" style={{ fontSize: '14px', color: '#78716c', textDecoration: 'none', fontWeight: 500, padding: '6px 12px', borderRadius: '999px' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#1c1917')}
            onMouseLeave={e => (e.currentTarget.style.color = '#78716c')}>
            Pricing
          </a>
          <CtaButton ready={ready} progress={progress} onClick={goToChat} compact />
        </nav>
      </header>

      {/* Hero */}
      <section style={{
        minHeight: 'calc(100vh - 57px)',
        display: 'flex', alignItems: 'center',
        padding: 'clamp(60px, 10vw, 120px) clamp(24px, 5vw, 72px)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: '-2%', top: '50%',
          transform: 'translateY(-52%)',
          width: 'clamp(280px, 42vw, 580px)',
          opacity: 0.06, pointerEvents: 'none',
        }}>
          <svg viewBox="0 0 473 811" fill="none" style={{ width: '100%', height: 'auto' }}>
            <path d="M50 808.371L50 329.23C50 227.253 111.939 135.497 206.518 97.3653L333 46.3711" stroke="#14532d" strokeWidth="100"/>
            <path d="M191 808.371V339.471C191 288.554 221.883 242.726 269.076 223.612L403 169.371" stroke="#14532d" strokeWidth="100"/>
            <path d="M333.476 808.871L327 390.218C327 364.862 342.201 341.977 365.573 332.146L453 295.371" stroke="#14532d" strokeWidth="100"/>
          </svg>
        </div>
        <div style={{ maxWidth: '640px', position: 'relative' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#14532d', fontWeight: 600, marginBottom: '28px' }}>
            Free · Private
          </p>
          <h1 style={{
            fontSize: 'clamp(3rem, 7vw, 5.25rem)',
            fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.025em',
            color: '#1c1917', marginBottom: '24px',
          }}>
            Health answers<br />that never leave<br />your device.
          </h1>
          <p style={{ fontSize: '17px', lineHeight: 1.7, color: '#78716c', marginBottom: '40px', maxWidth: '460px' }}>
            GroveAI is a free AI health companion that runs entirely in your browser. No servers, no data collected, works offline.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <CtaButton ready={ready} progress={progress} onClick={goToChat} />
            {ready && <p style={{ fontSize: '13px', color: '#a8a29e' }}>Ready on your device</p>}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ background: '#faf8f5' }}>
        <Feature
          eyebrow="On-device AI"
          title="Runs entirely on your device."
          description="The AI model lives in your browser, powered by WebGPU. No cloud servers, no API calls. Your device does all the thinking."
          variant="local"
          bgImage="https://images.unsplash.com/photo-1688223954745-64c14efce45e?q=80&w=2028&auto=format&fit=crop"
        />
        <Feature
          eyebrow="Offline"
          title="Works with no internet."
          description="Once loaded, GroveAI works anywhere: in areas with no signal, on a plane, at a rural clinic. No connection required."
          variant="offline"
          bgImage="https://images.unsplash.com/photo-1752316226345-ee94709ef61f?q=80&w=1031&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        />
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ background: '#faf8f5', padding: 'clamp(72px, 9vw, 110px) clamp(24px, 5vw, 72px)' }}>
        <div ref={pricing.ref} style={{ maxWidth: '1120px', margin: '0 auto', ...into(pricing.visible) }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'clamp(40px, 8vw, 120px)', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px' }}>
              <h2 style={{
                fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
                fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.025em',
                color: '#1c1917', marginBottom: '16px',
              }}>
                Free, forever.
              </h2>
              <p style={{ fontSize: '16px', lineHeight: 1.75, color: '#78716c', maxWidth: '360px' }}>
                No subscription, no account, no catch. There are no servers to pay for. Your device does all the work.
              </p>
            </div>
            <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {['Unlimited conversations', 'No account required', 'No data collected ever', 'Works fully offline'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#14532d" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span style={{ fontSize: '15px', color: '#44403c' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#faf8f5', padding: 'clamp(80px, 10vw, 140px) clamp(24px, 5vw, 72px)', textAlign: 'center' }}>
        <div ref={cta.ref} style={{ ...into(cta.visible) }}>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.025em',
            color: '#1c1917', marginBottom: '40px',
          }}>
            Try GroveAI now.
          </h2>
          <CtaButton ready={ready} progress={progress} onClick={goToChat} pill />
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #e7e0d8',
        padding: '24px clamp(24px, 5vw, 72px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#faf8f5',
      }}>
        <Wordmark className="text-sm" />
        <p style={{ fontSize: '12px', color: '#a8a29e' }}>Built by Layered Labs</p>
      </footer>
    </div>
  )
}
