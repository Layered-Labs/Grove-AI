import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export default function Message({ message, pending }: { message: ChatMessage; pending: boolean }) {
  if (message.role === 'user') {
    return (
      <div className="msg me">
        <span className="bubble">{message.content}</span>
      </div>
    )
  }
  return (
    <div className="msg">
      {message.content ? (
        <div className="reply md">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
        </div>
      ) : (
        pending && (
          <span className="thinking" role="status">
            <span className="bars" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            Thinking
          </span>
        )
      )}
    </div>
  )
}
