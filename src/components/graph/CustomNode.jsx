import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useStore } from '../../store/useStore';
import { Layout, Server, Cpu, Database, ExternalLink } from 'lucide-react';

const TYPE_CONFIG = {
  frontend: {
    icon: Layout,
    colorText: 'text-emerald-600 dark:text-emerald-400',
    borderDefault: 'border-emerald-500/40 hover:border-emerald-500',
    borderSelected: 'border-emerald-500 ring-2 ring-emerald-500/20',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    label: 'Frontend',
  },
  backend: {
    icon: Server,
    colorText: 'text-airforce-500',
    borderDefault: 'border-airforce-500/40 hover:border-airforce-500',
    borderSelected: 'border-airforce-500 ring-2 ring-airforce-500/20',
    badgeBg: 'bg-airforce-500/10 text-airforce-600 dark:text-airforce-400',
    label: 'Backend',
  },
  service: {
    icon: Cpu,
    colorText: 'text-purple-600 dark:text-purple-400',
    borderDefault: 'border-purple-500/40 hover:border-purple-500',
    borderSelected: 'border-purple-500 ring-2 ring-purple-500/20',
    badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    label: 'Service',
  },
  database: {
    icon: Database,
    colorText: 'text-amber-600 dark:text-amber-400',
    borderDefault: 'border-amber-500/40 hover:border-amber-500',
    borderSelected: 'border-amber-500 ring-2 ring-amber-500/20',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    label: 'Database',
  },
  external: {
    icon: ExternalLink,
    colorText: 'text-neutral-500',
    borderDefault: 'border-neutral-400/40 hover:border-neutral-500',
    borderSelected: 'border-neutral-500 ring-2 ring-neutral-500/20',
    badgeBg: 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400',
    label: 'External',
  },
};

function CustomNode({ id, data, selected }) {
  const { highlightedPath, focusMode } = useStore();

  const nodeType = data.type || 'service';
  const config = TYPE_CONFIG[nodeType] || TYPE_CONFIG.service;
  const Icon = config.icon;

  // Focus mode calculation: dim everything except highlighted path
  const isHighlighted = highlightedPath.includes(id);
  const pathIndex = isHighlighted ? highlightedPath.indexOf(id) + 1 : null;
  const isDimmed = focusMode && !isHighlighted;

  return (
    <div
      className={`min-w-[190px] max-w-[240px] px-3.5 py-3 rounded-xl bg-white dark:bg-neutral-900 border transition-all duration-300 shadow-sm cursor-pointer select-none ${
        selected ? config.borderSelected : config.borderDefault
      } ${
        isDimmed
          ? 'opacity-20 scale-95 blur-[0.5px]'
          : isHighlighted
          ? 'scale-105 shadow-md ring-2 ring-airforce-500'
          : 'opacity-100 hover:shadow-md'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 !bg-neutral-400 dark:!bg-neutral-600 !border-none"
      />

      {/* Top Header: Badge & Trace step badge if highlighted */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded font-medium ${config.badgeBg}`}
        >
          {config.label}
        </span>

        {pathIndex && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-airforce-500 text-white font-bold">
            Step {pathIndex}
          </span>
        )}
      </div>

      {/* Title */}
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={`w-4 h-4 shrink-0 ${config.colorText}`} />
        <h4 className="font-medium text-xs text-neutral-900 dark:text-white truncate">
          {data.label}
        </h4>
      </div>

      {/* Description */}
      {data.description && (
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
          {data.description}
        </p>
      )}

      {/* Files counter */}
      {data.files && data.files.length > 0 && (
        <div className="mt-2 pt-1.5 border-t border-neutral-100 dark:border-neutral-800 text-[10px] font-mono text-neutral-400">
          {data.files.length} file{data.files.length > 1 ? 's' : ''}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 !bg-neutral-400 dark:!bg-neutral-600 !border-none"
      />
    </div>
  );
}

export default memo(CustomNode);
