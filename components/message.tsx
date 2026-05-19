import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = {
  message: { role: 'user' | 'assistant' | 'system'; content: string }
}

export default function Message({ message }: Props) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-8 pl-12">
        <div
          className="px-4 py-2.5 rounded-2xl max-w-[78%] text-sm leading-relaxed"
          style={{ background: '#faf8f5', color: '#1c1917', border: '1px solid #ede8e3' }}
        >
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-10 pr-4">
      <div
        className="prose prose-sm max-w-none
          prose-p:leading-relaxed prose-p:my-3
          prose-headings:font-semibold prose-headings:tracking-tight
          prose-code:text-[13px] prose-code:bg-stone-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
          prose-pre:bg-stone-50 prose-pre:rounded-lg prose-pre:border prose-pre:border-stone-200
          prose-li:my-1 prose-ul:my-3 prose-ol:my-3
          prose-strong:font-semibold"
        style={{ color: '#44403c' }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.content || ' '}
        </ReactMarkdown>
      </div>
    </div>
  )
}
