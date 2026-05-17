import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = {
  message: { role: 'user' | 'assistant' | 'system'; content: string }
}

export default function Message({ message }: Props) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-8">
        <div className="bg-foreground text-background rounded-2xl px-4 py-3 max-w-[78%] text-base leading-relaxed">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex mb-8 gap-3.5">
      <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-background text-[11px] font-bold tracking-tight">G</span>
      </div>
      <div className="flex-1 min-w-0 prose prose-base max-w-none
        prose-p:leading-relaxed prose-p:my-3 first:prose-p:mt-0
        prose-headings:font-semibold prose-headings:tracking-tight
        prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-muted prose-pre:rounded-xl prose-pre:border prose-pre:border-border
        prose-li:my-1 prose-ul:my-3 prose-ol:my-3
        text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-code:text-foreground">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.content || ' '}
        </ReactMarkdown>
      </div>
    </div>
  )
}
