import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SourceBadge from './SourceBadge';
import { Bot, User } from 'lucide-react';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 text-xs leading-relaxed ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-lg bg-airforce-500/15 border border-airforce-500/30 text-airforce-500 flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="w-3.5 h-3.5" />
        </div>
      )}

      <div
        className={`max-w-[88%] rounded-xl px-3.5 py-2.5 space-y-2 ${
          isUser
            ? 'bg-airforce-500 text-white rounded-br-none shadow-sm'
            : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-bl-none shadow-sm'
        }`}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap font-sans text-white leading-relaxed">{message.content}</div>
        ) : (
          <div className="markdown-content font-sans text-xs leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-2 mb-1.5 pb-1 border-b border-neutral-200 dark:border-neutral-800" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 mt-2 mb-1" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-xs font-semibold text-airforce-600 dark:text-airforce-400 mt-2 mb-1" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="mb-2 last:mb-0 leading-relaxed" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-outside pl-4 space-y-1 mb-2 text-neutral-700 dark:text-neutral-300" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-outside pl-4 space-y-1 mb-2 text-neutral-700 dark:text-neutral-300" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="leading-relaxed" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold text-neutral-900 dark:text-neutral-100" {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-2 border-airforce-500 pl-2.5 italic text-neutral-500 dark:text-neutral-400 my-1.5" {...props} />
                ),
                code: ({ node, inline, className, children, ...props }) => {
                  return inline ? (
                    <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-airforce-600 dark:text-airforce-400 font-mono text-[11px] border border-neutral-200 dark:border-neutral-700/60" {...props}>
                      {children}
                    </code>
                  ) : (
                    <pre className="p-2.5 rounded-lg bg-neutral-950 text-neutral-100 font-mono text-[11px] overflow-x-auto my-2 border border-neutral-800 leading-normal">
                      <code {...props}>{children}</code>
                    </pre>
                  );
                },
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-2">
                    <table className="w-full text-[11px] border-collapse border border-neutral-200 dark:border-neutral-800" {...props} />
                  </div>
                ),
                th: ({ node, ...props }) => (
                  <th className="border border-neutral-200 dark:border-neutral-800 p-1.5 text-left font-semibold bg-neutral-50 dark:bg-neutral-800/50 text-neutral-800 dark:text-neutral-200" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="border border-neutral-200 dark:border-neutral-800 p-1.5 text-neutral-700 dark:text-neutral-300" {...props} />
                ),
                a: ({ node, ...props }) => (
                  <a className="text-airforce-500 hover:text-airforce-600 dark:hover:text-airforce-400 underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Sources block (CRAG badges) */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 mt-2 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
              Sources:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {message.sources.map((src, idx) => (
                <SourceBadge
                  key={idx}
                  source={src}
                  type={message.source_type || 'repo'}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-6 h-6 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
}
