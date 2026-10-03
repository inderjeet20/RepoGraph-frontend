import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';
import { useStore } from '../../store/useStore';
import { X, Sparkles, GitMerge } from 'lucide-react';

const nodeTypes = { custom: CustomNode };

// Color for each node type (used in minimap)
const TYPE_COLORS = {
  frontend: '#10b981',
  backend: '#4789b8',
  service: '#a855f7',
  database: '#f59e0b',
  external: '#0ea5e9',
};

// ─── Layout constants ─────────────────────────────────────────
const NODE_WIDTH = 200;
const HORIZONTAL_SPACING = 260;
const VERTICAL_SPACING = 200;
const CENTER_X = 600;

export default function GraphCanvas() {
  const {
    graphData,
    selectedNode,
    setSelectedNode,
    highlightedPath,
    focusMode,
    clearFocus,
  } = useStore();

  // ─── Compute DAG hierarchical positions ───────────────────
  const flowNodes = useMemo(() => {
    const nodes = graphData.nodes || [];
    const edges = graphData.edges || [];
    if (nodes.length === 0) return [];

    // 1. Assign base layers from data or type defaults
    const typeFallback = { frontend: 0, backend: 1, service: 2, database: 3, external: 3 };
    const layerMap = {};
    nodes.forEach((n) => {
      layerMap[n.id] = typeof n.layer === 'number' ? n.layer : (typeFallback[n.type] ?? 1);
    });

    // 2. DAG relaxation: ensure targets are strictly below sources
    const maxPasses = nodes.length + 2;
    for (let pass = 0; pass < maxPasses; pass++) {
      let changed = false;
      edges.forEach((e) => {
        const s = layerMap[e.source];
        const t = layerMap[e.target];
        if (s !== undefined && t !== undefined && t <= s) {
          layerMap[e.target] = s + 1;
          changed = true;
        }
      });
      if (!changed) break;
    }

    // 3. Group into tiers
    const tiers = {};
    nodes.forEach((n) => {
      const l = layerMap[n.id] ?? 0;
      (tiers[l] = tiers[l] || []).push(n);
    });

    // 4. Calculate positions — centred per tier
    const sortedLayers = Object.keys(tiers).map(Number).sort((a, b) => a - b);
    const result = [];
    let currentY = 60;

    sortedLayers.forEach((l) => {
      const group = tiers[l];
      const totalWidth = (group.length - 1) * HORIZONTAL_SPACING;
      const startX = CENTER_X - totalWidth / 2;

      group.forEach((node, idx) => {
        result.push({
          id: node.id,
          type: 'custom',
          position: { x: startX + idx * HORIZONTAL_SPACING, y: currentY },
          data: node,
          selected: selectedNode?.id === node.id,
        });
      });

      currentY += VERTICAL_SPACING;
    });

    return result;
  }, [graphData.nodes, graphData.edges, selectedNode]);

  // ─── Compute styled edges ─────────────────────────────────
  const flowEdges = useMemo(() => {
    const edges = graphData.edges || [];
    return edges.map((edge) => {
      const fromIdx = highlightedPath.indexOf(edge.source);
      const toIdx = highlightedPath.indexOf(edge.target);
      const isPathEdge =
        focusMode &&
        fromIdx !== -1 &&
        toIdx !== -1 &&
        Math.abs(fromIdx - toIdx) === 1;

      return {
        id: edge.id || `e_${edge.source}_${edge.target}`,
        source: edge.source,
        target: edge.target,
        type: 'smoothstep',
        animated: isPathEdge,
        label: edge.label || '',
        labelStyle: {
          fontSize: 9.5,
          fontFamily: '"JetBrains Mono", monospace',
          fill: isPathEdge ? '#4789b8' : '#9ca3af',
          fontWeight: isPathEdge ? 700 : 500,
        },
        labelBgStyle: {
          fill: '#ffffff',
          fillOpacity: 0.95,
          rx: 4,
        },
        labelBgPadding: [5, 3],
        labelBgBorderRadius: 4,
        style: {
          stroke: isPathEdge ? '#4789b8' : focusMode ? '#d1d5db' : '#d1d5db',
          strokeWidth: isPathEdge ? 2.5 : 1.5,
          opacity: focusMode && !isPathEdge ? 0.15 : 1,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isPathEdge ? '#4789b8' : '#d1d5db',
          width: 12,
          height: 12,
        },
      };
    });
  }, [graphData.edges, highlightedPath, focusMode]);

  const onNodeClick = useCallback((_, node) => setSelectedNode(node.data), [setSelectedNode]);
  const onPaneClick = useCallback(() => setSelectedNode(null), [setSelectedNode]);

  const isEmpty = !graphData.nodes || graphData.nodes.length === 0;

  return (
    <div className="relative w-full h-full bg-neutral-50 dark:bg-neutral-950 overflow-hidden">

      {/* ── Floating top bar ─────────────────────────────── */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
        {/* Trace active pill */}
        {focusMode && (
          <div
            className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-lg
              bg-neutral-900/95 dark:bg-white/95 text-white dark:text-neutral-900
              text-[11px] font-mono shadow-lg backdrop-blur-sm animate-fadeIn"
          >
            <Sparkles className="w-3.5 h-3.5 text-airforce-400 dark:text-airforce-500" />
            <span>Trace · {highlightedPath.length} steps</span>
            <button
              onClick={clearFocus}
              className="ml-1 p-0.5 rounded hover:bg-white/10 dark:hover:bg-black/10 transition-colors"
              title="Clear trace"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Legend pill */}
        {!isEmpty && (
          <div
            className="pointer-events-none hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg
              bg-white/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800
              text-[10px] font-mono text-neutral-500 shadow-sm backdrop-blur-sm"
          >
            {[
              { color: '#10b981', label: 'Frontend' },
              { color: '#4789b8', label: 'Backend' },
              { color: '#a855f7', label: 'Service' },
              { color: '#f59e0b', label: 'Database' },
              { color: '#0ea5e9', label: 'External' },
            ].map(({ color, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Empty state ───────────────────────────────────── */}
      {isEmpty && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 pointer-events-none">
          <GitMerge className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mb-3" />
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            No graph data yet
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-1">
            Analyze a repository to visualize its architecture
          </p>
        </div>
      )}

      {/* ── ReactFlow canvas ─────────────────────────────── */}
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.35 }}
        minZoom={0.2}
        maxZoom={2}
        nodesDraggable
        panOnDrag
        className="transition-colors"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1}
          color="#e5e7eb"
          className="dark:opacity-20"
        />
        <Controls
          className="!rounded-lg !shadow-md !border-neutral-200 dark:!border-neutral-700 !overflow-hidden"
          showInteractive={false}
        />
        <MiniMap
          nodeColor={(n) => TYPE_COLORS[n.data?.type] || '#94a3b8'}
          maskColor="rgba(0,0,0,0.04)"
          className="!rounded-lg !border !border-neutral-200 dark:!border-neutral-800 !shadow-md"
          style={{ width: 140, height: 90 }}
        />
      </ReactFlow>
    </div>
  );
}
