import Link from 'next/link'
import Mark from './mark'
import ModelInfo from './model-info'

export function Brand() {
  return (
    <span className="brand">
      <Mark size={32} small />
      Grove
    </span>
  )
}

export default function SiteHead({ info = false }: { info?: boolean }) {
  return (
    <header className="site-head">
      <Link className="brand-link" href="/" aria-label="Grove home">
        <Brand />
      </Link>
      <div className="row">
        <a className="lab" href="https://layeredlabs.ai" target="_blank" rel="noopener">
          A Layered Labs experiment
        </a>
        {info && <ModelInfo />}
      </div>
    </header>
  )
}
