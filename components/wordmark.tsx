import { cn } from '@/lib/utils'

export default function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn('font-bold tracking-tight inline-flex items-center gap-2', className)}
      style={{ color: '#14532d' }}
    >
      <svg
        viewBox="0 0 473 811"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ height: '1.2em', width: 'auto' }}
        aria-hidden="true"
      >
        <path d="M50 808.371L50 703.371L50 573.371L50 329.23C50 227.253 111.939 135.497 206.518 97.3653L333 46.3711" stroke="#1B1917" strokeWidth="100"/>
        <path d="M191 808.371L191 564.371V339.471C191 288.554 221.883 242.726 269.076 223.612L403 169.371" stroke="#1B1917" strokeWidth="100"/>
        <path d="M333.476 808.871L327 549.371V390.218C327 364.862 342.201 341.977 365.573 332.146L453 295.371" stroke="#1B1917" strokeWidth="100"/>
      </svg>
      <span>Grove<span style={{ color: '#1c1917' }}>AI</span></span>
    </span>
  )
}
