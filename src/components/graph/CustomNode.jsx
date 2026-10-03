import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useStore } from '../../store/useStore';
import { Layout, Server, Cpu, Database, ExternalLink, FileCode } from 'lucide-react';

// ─── Type configurations ───────────────────────────────────────────────────

const TYPE_CONFIG = {
  frontend: {
    Icon: Layout,
    accent: '#10b981',       // emerald-500
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.35)',
    borderSelected: '#10b981',
    ring: 'rgba(16,185,129,0.2)',
    badge: { bg: 'rgba(16,185,129,0.12)', text: '#059669' },
    label: 'Frontend',
  },
  backend: {
    Icon: Server,
    accent: '#4789b8',
    bg: 'rgba(71,137,184,0.08)',
    border: 'rgba(71,137,184,0.35)',
    borderSelected: '#4789b8',
    ring: 'rgba(71,137,184,0.2)',
    badge: { bg: 'rgba(71,137,184,0.12)', text: '#356e9c' },
    label: 'Backend',
  },
  service: {
    Icon: Cpu,
    accent: '#a855f7',
    bg: 'rgba(168,85,247,0.08)',
    border: 'rgba(168,85,247,0.35)',
    borderSelected: '#a855f7',
    ring: 'rgba(168,85,247,0.2)',
    badge: { bg: 'rgba(168,85,247,0.12)', text: '#9333ea' },
    label: 'Service',
  },
  database: {
    Icon: Database,
    accent: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.35)',
    borderSelected: '#f59e0b',
    ring: 'rgba(245,158,11,0.2)',
    badge: { bg: 'rgba(245,158,11,0.12)', text: '#d97706' },
    label: 'Database',
  },
  external: {
    Icon: ExternalLink,
    accent: '#0ea5e9',
    bg: 'rgba(14,165,233,0.08)',
    border: 'rgba(14,165,233,0.35)',
    borderSelected: '#0ea5e9',
    ring: 'rgba(14,165,233,0.2)',
    badge: { bg: 'rgba(14,165,233,0.12)', text: '#0284c7' },
    label: 'External',
  },
};

// ─── CustomNode component ─────────────────────────────────────────────────

function CustomNode({ id, data, selected }) {
  const { highlightedPath, focusMode } = useStore();

  const nodeType = (data.type || 'service').toLowerCase();
  const cfg = TYPE_CONFIG[nodeType] || TYPE_CONFIG.service;
  const { Icon } = cfg;

  const isHighlighted = highlightedPath.includes(id);
  const pathIndex = isHighlighted ? highlightedPath.indexOf(id) + 1 : null;
  const isDimmed = focusMode && !isHighlighted;

  const fileCount = data.files?.length ?? 0;
  const displayFiles = data.files?.slice(0, 2) ?? [];

  return (
    <div
      style={{
        opacity: isDimmed ? 0.15 : 1,
        transform: isDimmed ? 'scale(0.93)' : 'scale(1)',
        filter: isDimmed ? 'blur(0.5px)' : 'none',
        transition: 'opacity 0.3s ease, transform 0.3s ease, filter 0.3s ease',
        width: 200,
        position: 'relative',
      }}
    >
      {/* Target handle */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 10, height: 10,
          background: cfg.accent,
          border: '2px solid white',
          borderRadius: '50%',
          top: -5,
          opacity: 0.9,
        }}
      />

      {/* Main card */}
      <div
        style={{
          background: selected
            ? cfg.bg
            : isHighlighted
            ? cfg.bg
            : 'rgba(255,255,255,0.97)',
          border: `1.5px solid ${selected ? cfg.borderSelected : isHighlighted ? cfg.accent : cfg.border}`,
          borderRadius: 12,
          boxShadow: selected
            ? `0 0 0 3px ${cfg.ring}, 0 8px 24px rgba(0,0,0,0.12)`
            : isHighlighted
            ? `0 0 0 2px ${cfg.ring}, 0 4px 16px rgba(0,0,0,0.08)`
            : '0 2px 8px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        className="group dark-node"
      >
        {/* Top accent bar */}
        <div style={{
          height: 3,
          background: `linear-gradient(90deg, ${cfg.accent}, ${cfg.accent}80)`,
          width: '100%',
        }} />

        {/* Card content */}
        <div style={{ padding: '10px 12px 10px' }}>
          {/* Header row: icon + type badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{
              width: 28, height: 28,
              borderRadius: 7,
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon size={14} style={{ color: cfg.accent }} />
            </div>

            <span style={{
              fontSize: 9,
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '2px 7px',
              borderRadius: 20,
              background: cfg.badge.bg,
              color: cfg.badge.text,
            }}>
              {cfg.label}
            </span>
          </div>

          {/* Node label */}
          <div style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: '#111827',
            lineHeight: 1.35,
            marginBottom: 6,
            wordBreak: 'break-word',
          }}
            className="node-label"
          >
            {data.label}
          </div>

          {/* Description (truncated) */}
          {data.description && (
            <div style={{
              fontSize: 10,
              color: '#6b7280',
              lineHeight: 1.4,
              marginBottom: 6,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
              className="node-desc"
            >
              {data.description}
            </div>
          )}

          {/* File count row */}
          {fileCount > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              paddingTop: 6,
              borderTop: '1px solid rgba(0,0,0,0.06)',
            }}>
              <FileCode size={9} style={{ color: '#9ca3af', flexShrink: 0 }} />
              <span style={{
                fontSize: 9.5,
                fontFamily: 'JetBrains Mono, monospace',
                color: '#9ca3af',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}>
                {displayFiles[0]?.split('/').pop() || ''}
                {fileCount > 1 ? ` +${fileCount - 1} more` : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Step badge for trace flow */}
      {pathIndex && (
        <div style={{
          position: 'absolute',
          top: -8,
          right: -8,
          background: cfg.accent,
          color: 'white',
          fontSize: 9,
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: 20,
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          zIndex: 10,
          whiteSpace: 'nowrap',
        }}>
          #{pathIndex}
        </div>
      )}

      {/* Source handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 10, height: 10,
          background: cfg.accent,
          border: '2px solid white',
          borderRadius: '50%',
          bottom: -5,
          opacity: 0.9,
        }}
      />
    </div>
  );
}

export default memo(CustomNode);
