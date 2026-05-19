import { cn } from '@/lib/utils'

export default function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn('font-[family-name:var(--font-playfair)] font-bold tracking-tight', className)}
      style={{ color: '#14532d' }}
    >
      Grove
      <span style={{ color: '#1c1917' }}>AI</span>
    </span>
  )
}
