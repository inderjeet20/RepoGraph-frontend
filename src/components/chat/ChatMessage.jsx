import React from 'react';
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
        className={`max-w-[85%] rounded-xl px-3.5 py-2.5 space-y-2 ${
          isUser
            ? 'bg-airforce-500 text-white rounded-br-none'
            : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-bl-none shadow-sm'
        }`}
      >
        <div className="whitespace-pre-wrap font-sans">{message.content}</div>

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
