import { Plus, Trash2, MessageSquare, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
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
    <div className="flex flex-col h-full py-3">
      <div className="px-4 mb-4">
        <Wordmark className="text-sm" />
      </div>

      <div className="px-3 mb-2">
        <Button
          onClick={onNew}
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-sm font-normal text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
          New chat
        </Button>
      </div>

      {conversations.length > 0 && (
        <p className="px-5 text-xs font-medium text-muted-foreground/50 mb-1 mt-2">Recent</p>
      )}

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-0.5">
          {conversations.length === 0 && (
            <p className="text-xs text-muted-foreground/50 text-center py-6">No conversations yet</p>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                'group relative flex items-center rounded-lg px-2 py-2 cursor-pointer hover:bg-muted/60 transition-colors',
                activeId === conv.id && 'bg-muted'
              )}
              onClick={() => onSelect(conv.id)}
            >
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0 mr-2.5" />
              <span className="text-sm truncate flex-1 pr-5">{conv.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(conv.id)
                }}
                className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="px-4 py-3 flex items-center gap-2">
        <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" />
        <span className="text-xs text-muted-foreground/60">Works offline, no data leaves your device</span>
      </div>
    </div>
  )
}
