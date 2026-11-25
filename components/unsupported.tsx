import SiteHead from './site-head'

// Shown when the browser has no WebGPU, which the model needs.
export default function Unsupported() {
  return (
    <section className="screen">
      <SiteHead />
      <div className="center">
        <h1>This browser can not run Grove yet</h1>
        <p className="sub">Open it in Chrome or Edge on a computer or an Android phone.</p>
      </div>
      <a className="btn primary" href="https://www.google.com/chrome/" target="_blank" rel="noopener">
        Get Chrome
      </a>
    </section>
  )
}
