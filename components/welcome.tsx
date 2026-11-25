'use client'

import { useRouter } from 'next/navigation'
import { useEngine } from '@/lib/use-engine'
import Mark from './mark'
import ModelChip from './model-chip'
import ModelStrip from './model-strip'
import SiteHead from './site-head'
import Unsupported from './unsupported'

export default function Welcome() {
  const router = useRouter()
  const { progress, ready, failed, supported, retry } = useEngine()

  if (!supported) return <Unsupported />

  return (
    <section className="screen welcome">
      <SiteHead />
      <ModelStrip ready={ready} progress={progress} failed={failed} onRetry={retry} />
      <div className="center">
        <Mark size={72} />
        <h1>
          Ask anything.
          <br />
          Privately.
        </h1>
        <p className="sub">Free. Runs on this device.</p>
        <ModelChip />
      </div>
      <button className="btn primary" type="button" onClick={() => router.push('/chat')}>
        Start chatting
      </button>
      <div className="preview" aria-hidden="true">
        <div className="msg me">
          <span className="bubble">How do I get my deposit back from my landlord?</span>
        </div>
        <div className="msg">
          <span className="reply">
            Start with a short, polite letter asking for it by a set date. Keep a copy, and say you will go to small claims court if you hear nothing.
          </span>
        </div>
        <div className="preview-input">
          <span>Ask anything...</span>
          <span className="send">
            <svg viewBox="0 0 24 24">
              <path d="M12 19V5" />
              <path d="m5 12 7-7 7 7" />
            </svg>
          </span>
        </div>
      </div>
    </section>
  )
}
