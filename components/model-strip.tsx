// Shows the model download. When it is finished the bar goes away and a check
// appears, so a full bar never looks like "still going".
export default function ModelStrip({ ready, progress, failed, onRetry }: { ready: boolean; progress: number; failed: boolean; onRetry: () => void }) {
  if (failed) {
    return (
      <div className="dl failed" role="status">
        <span>Grove could not get ready. Check your connection.</span>
        <button className="link-btn" type="button" onClick={onRetry}>
          Try again
        </button>
      </div>
    )
  }
  if (ready) {
    return (
      <div className="dl ready" role="status">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <span>Ready on this device</span>
      </div>
    )
  }
  return (
    <div className="dl" role="status">
      <span>Getting Grove ready</span>
      <span className="bar" aria-hidden="true">
        <i style={{ width: `${progress}%` }} />
      </span>
      <span className="pct">{progress}%</span>
    </div>
  )
}
