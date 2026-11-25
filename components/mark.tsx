// The Grove mark: three nested arches. Each arch is its own path so the
// stripes can fade in left to right (see .mark in globals.css).
export default function Mark({ size = 56, small = false }: { size?: number; small?: boolean }) {
  return (
    <svg
      className="mark"
      viewBox="12 8.5 232 232"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      style={{ strokeWidth: small ? 30 : 22 }}
      aria-hidden="true"
    >
      <path d="M40 228V120A88 88 0 0 1 216 120V228" />
      {!small && <path d="M74 228V120A54 54 0 0 1 182 120V228" />}
      <path d={small ? 'M92 228V120A36 36 0 0 1 164 120V228' : 'M108 228V120A20 20 0 0 1 148 120V228'} />
    </svg>
  )
}
