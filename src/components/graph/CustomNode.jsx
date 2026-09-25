import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useStore } from '../../store/useStore';
import { Layout, Server, Cpu, Database, ExternalLink } from 'lucide-react';

const TYPE_CONFIG = {
  frontend: {
    icon: Layout,
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    ringDefault: 'bg-emerald-500/10 border-2 border-emerald-500/40 hover:border-emerald-500 shadow-emerald-500/5',
    ringSelected: 'bg-emerald-500/20 border-2 border-emerald-500 ring-4 ring-emerald-500/25',
    typeText: 'text-emerald-600 dark:text-emerald-400',
    label: 'Frontend',
  },
  backend: {
    icon: Server,
    iconColor: 'text-airforce-500 dark:text-airforce-400',
    ringDefault: 'bg-airforce-500/10 border-2 border-airforce-500/35 hover:border-airforce-500 shadow-airforce-500/5',
    ringSelected: 'bg-airforce-500/20 border-2 border-airforce-500 ring-4 ring-airforce-500/25',
    typeText: 'text-airforce-600 dark:text-airforce-400',
    label: 'Backend',
  },
  service: {
    icon: Cpu,
    iconColor: 'text-purple-500 dark:text-purple-400',
    ringDefault: 'bg-purple-500/10 border-2 border-purple-500/40 hover:border-purple-500 shadow-purple-500/5',
    ringSelected: 'bg-purple-500/20 border-2 border-purple-500 ring-4 ring-purple-500/25',
    typeText: 'text-purple-600 dark:text-purple-400',
    label: 'Service',
  },
  database: {
    icon: Database,
    iconColor: 'text-amber-500 dark:text-amber-400',
    ringDefault: 'bg-amber-500/10 border-2 border-amber-500/40 hover:border-amber-500 shadow-amber-500/5',
    ringSelected: 'bg-amber-500/20 border-2 border-amber-500 ring-4 ring-amber-500/25',
    typeText: 'text-amber-600 dark:text-amber-400',
    label: 'Database',
  },
  external: {
    icon: ExternalLink,
    iconColor: 'text-sky-500 dark:text-sky-400',
    ringDefault: 'bg-sky-500/10 border-2 border-sky-500/40 hover:border-sky-500 shadow-sky-500/5',
    ringSelected: 'bg-sky-500/20 border-2 border-sky-500 ring-4 ring-sky-500/25',
    typeText: 'text-sky-600 dark:text-sky-400',
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
      className={`group relative flex flex-col items-center select-none cursor-pointer transition-all duration-300 ${
        isDimmed ? 'opacity-20 scale-90 blur-[0.5px]' : 'opacity-100'
      }`}
    >
      {/* Circular Node Orb Container */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Top Handle - target */}
        <Handle
          type="target"
          position={Position.Top}
          className="!w-2.5 !h-2.5 !bg-neutral-400 dark:!bg-neutral-500 !border-2 !border-white dark:!border-neutral-900 !rounded-full transition-transform group-hover:scale-125 !top-0"
        />

        {/* Circular Hub */}
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md ${
            selected
              ? `${config.ringSelected} shadow-xl scale-110`
              : isHighlighted
              ? 'ring-4 ring-airforce-500/60 shadow-lg scale-110'
              : `${config.ringDefault} shadow-md group-hover:scale-105 group-hover:shadow-lg`
          }`}
        >
          <Icon className={`w-7 h-7 transition-colors ${config.iconColor}`} />
        </div>

        {/* Step Badge if in trace flow */}
        {pathIndex && (
          <span className="absolute -top-1.5 -right-2 px-2 py-0.5 rounded-full bg-airforce-600 text-white font-mono text-[10px] font-bold shadow-md z-10 animate-bounce">
            Step {pathIndex}
          </span>
        )}

        {/* Bottom Handle - source */}
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-2.5 !h-2.5 !bg-neutral-400 dark:!bg-neutral-500 !border-2 !border-white dark:!border-neutral-900 !rounded-full transition-transform group-hover:scale-125 !bottom-0"
        />
      </div>

      {/* Label and Info Below the Circle */}
      <div className="mt-2.5 flex flex-col items-center text-center max-w-[160px]">
        <span
          className={`text-xs font-semibold leading-tight transition-colors line-clamp-2 ${
            selected
              ? 'text-airforce-600 dark:text-airforce-400 font-bold'
              : 'text-neutral-800 dark:text-neutral-100 group-hover:text-airforce-500'
          }`}
        >
          {data.label}
        </span>

        {/* Type & File Count Pill */}
        <div className="mt-1 flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          <span className={`font-semibold ${config.typeText}`}>{config.label}</span>
          {data.files && data.files.length > 0 && (
            <>
              <span>•</span>
              <span>
                {data.files.length} {data.files.length === 1 ? 'file' : 'files'}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(CustomNode);
