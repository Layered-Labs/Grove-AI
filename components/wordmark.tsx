import { cn } from '@/lib/utils'

export default function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-[family-name:var(--font-playfair)] font-bold', className)}>
      GroveAI
    </span>
  )
}
