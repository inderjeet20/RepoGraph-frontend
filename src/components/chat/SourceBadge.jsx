import React from 'react';
import { FileCode, Globe, ExternalLink } from 'lucide-react';

export default function SourceBadge({ source, type = 'repo' }) {
  const isWeb = type === 'web' || source.startsWith('http');

  // Format label
  let displayLabel = source;
  let domain = '';
  if (isWeb) {
    try {
      const url = new URL(source);
      domain = url.hostname.replace(/^www\./, '');
      displayLabel = domain + (url.pathname.length > 1 ? url.pathname.slice(0, 18) + '...' : '');
    } catch {
      displayLabel = source.slice(0, 24) + '...';
    }
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300">
      {isWeb ? (
        <>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Web knowledge" />
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Web:</span>
          <a
            href={source}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-center gap-1"
          >
            <span>{displayLabel}</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-airforce-500 shrink-0" title="Repository knowledge" />
          <span className="text-airforce-600 dark:text-airforce-400 font-medium">Repo:</span>
          <span className="truncate max-w-[200px]">{displayLabel}</span>
        </>
      )}
    </div>
  );
}
