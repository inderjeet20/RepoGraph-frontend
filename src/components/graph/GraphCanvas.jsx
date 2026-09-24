import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';
import { useStore } from '../../store/useStore';
import { X, Sparkles } from 'lucide-react';

const nodeTypes = {
  custom: CustomNode,
};

export default function GraphCanvas() {
  const {
    graphData,
    selectedNode,
    setSelectedNode,
    highlightedPath,
    focusMode,
    clearFocus,
  } = useStore();

  // Compute hierarchical positions if not already fixed
  const flowNodes = useMemo(() => {
    if (!graphData.nodes || graphData.nodes.length === 0) return [];

    // Group nodes by layer/type
    const typeOrder = ['frontend', 'backend', 'service', 'database', 'external'];
    const groups = {};
    typeOrder.forEach((t) => (groups[t] = []));

    graphData.nodes.forEach((n) => {
      const t = n.type || 'service';
      if (!groups[t]) groups[t] = [];
      groups[t].push(n);
    });

    const calculated = [];
    let currentY = 50;

    typeOrder.forEach((t) => {
      const groupNodes = groups[t] || [];
      if (groupNodes.length === 0) return;

      const totalWidth = groupNodes.length * 260;
      const startX = Math.max(80, 500 - totalWidth / 2);

      groupNodes.forEach((node, idx) => {
        calculated.push({
          id: node.id,
          type: 'custom',
          position: {
            x: startX + idx * 260,
            y: currentY,
          },
          data: node,
          selected: selectedNode?.id === node.id,
        });
      });

      currentY += 150;
    });

    return calculated;
  }, [graphData.nodes, selectedNode]);

  // Edges with animated Air Force Blue styling when highlighted in trace flow
  const flowEdges = useMemo(() => {
    if (!graphData.edges) return [];

    return graphData.edges.map((edge) => {
      // Check if this edge connects two consecutive nodes in the trace path
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
        animated: isPathEdge,
        style: {
          stroke: isPathEdge ? '#4789b8' : focusMode ? '#737373' : '#a3a3a3',
          strokeWidth: isPathEdge ? 2.5 : 1.5,
          opacity: focusMode && !isPathEdge ? 0.25 : 0.8,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isPathEdge ? '#4789b8' : '#a3a3a3',
          width: 14,
          height: 14,
        },
      };
    });
  }, [graphData.edges, highlightedPath, focusMode]);

  const onNodeClick = useCallback(
    (_, node) => {
      setSelectedNode(node.data);
    },
    [setSelectedNode]
  );

  const onPaneClick = useCallback(() => {
    // Tapping canvas background closes inspector
    setSelectedNode(null);
  }, [setSelectedNode]);

  return (
    <div className="relative w-full h-full bg-neutral-100/50 dark:bg-neutral-950 overflow-hidden">
      {/* Top Floating Controls: Trace Banner & Legend */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-auto">
        {focusMode && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-mono shadow-md animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 text-airforce-400" />
            <span>Trace Flow Active ({highlightedPath.length} steps)</span>
            <button
              onClick={clearFocus}
              className="ml-1 p-0.5 rounded hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
              title="Clear Trace"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 text-[11px] font-mono text-neutral-600 dark:text-neutral-400 shadow-sm backdrop-blur-sm">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Frontend
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-airforce-500" /> Backend
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500" /> Service
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Database
          </span>
        </div>
      </div>

      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.3}
        maxZoom={1.5}
        className="transition-colors"
      >
        <Background color="#a3a3a3" gap={20} size={1} className="opacity-30" />
        <Controls className="!bg-white dark:!bg-neutral-900 !border-neutral-200 dark:!border-neutral-800 !shadow-sm !rounded-lg" />
      </ReactFlow>
    </div>
  );
}
