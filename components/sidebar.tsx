import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Conversation } from './chat'
import Wordmark from './wordmark'

type Props = {
  conversations: Conversation[]
  activeId: string | null
  onNew: () => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export default function Sidebar({ conversations, activeId, onNew, onSelect, onDelete }: Props) {
  return (
    <div className="flex flex-col h-full" style={{ background: '#faf8f5' }}>
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid #ede8e3' }}>
        <Wordmark className="text-base" />
      </div>

      <button
        onClick={onNew}
        className="flex items-center gap-2 mx-4 my-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-black/5"
        style={{ color: '#78716c' }}
      >
        <Plus className="h-3.5 w-3.5" />
        New conversation
      </button>

      {conversations.length > 0 && (
        <p className="px-5 text-[10px] uppercase tracking-widest font-medium mb-1" style={{ color: '#a8a29e' }}>
          Recent
        </p>
      )}

      <div className="flex-1 overflow-y-auto px-2">
        {conversations.length === 0 && (
          <p className="text-xs text-center py-8" style={{ color: '#a8a29e' }}>No conversations yet</p>
        )}
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={cn(
              'group relative flex items-center rounded-lg px-3 py-2.5 cursor-pointer transition-colors mb-0.5',
              activeId === conv.id ? 'bg-black/8' : 'hover:bg-black/5'
            )}
            onClick={() => onSelect(conv.id)}
          >
            <span
              className="text-[13px] truncate flex-1 pr-5 leading-snug"
              style={{ color: activeId === conv.id ? '#1c1917' : '#57534e' }}
            >
              {conv.title}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(conv.id)
              }}
              className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
              style={{ color: '#a8a29e' }}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

    </div>
  )
}
