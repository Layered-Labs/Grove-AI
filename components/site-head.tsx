import Link from 'next/link'
import Mark from './mark'

export function Brand() {
  return (
    <span className="brand">
      <Mark size={32} small />
      Grove
    </span>
  )
}

export default function SiteHead() {
  return (
    <header className="site-head">
      <Link className="brand-link" href="/" aria-label="Grove home">
        <Brand />
      </Link>
      <a className="lab" href="https://layeredlabs.ai" target="_blank" rel="noopener">
        A Layered Labs experiment
      </a>
    </header>
  )
}
