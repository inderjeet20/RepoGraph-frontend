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

  // Compute DAG hierarchical positions: layout nodes in true sequential execution flow
  const flowNodes = useMemo(() => {
    if (!graphData.nodes || graphData.nodes.length === 0) return [];

    const nodes = graphData.nodes;
    const edges = graphData.edges || [];

    // 1. Initial base layer assignment (from AI synthesis or architectural type)
    const layerMap = {};
    const typeFallback = { frontend: 0, backend: 1, service: 2, database: 3, external: 3 };

    nodes.forEach((n) => {
      if (typeof n.layer === 'number') {
        layerMap[n.id] = n.layer;
      } else {
        layerMap[n.id] = typeFallback[n.type] ?? 1;
      }
    });

    // 2. DAG Layer Relaxation:
    // Guarantee that every target is placed strictly below its source in the flow (targetLayer > sourceLayer)
    const maxPasses = Math.min(nodes.length, 8);
    for (let pass = 0; pass < maxPasses; pass++) {
      let changed = false;
      edges.forEach((edge) => {
        const sLayer = layerMap[edge.source];
        const tLayer = layerMap[edge.target];
        if (sLayer !== undefined && tLayer !== undefined) {
          if (tLayer <= sLayer) {
            layerMap[edge.target] = sLayer + 1;
            changed = true;
          }
        }
      });
      if (!changed) break;
    }

    // 3. Group nodes into sequential horizontal tiers
    const layerGroups = {};
    nodes.forEach((node) => {
      const l = layerMap[node.id] || 0;
      if (!layerGroups[l]) layerGroups[l] = [];
      layerGroups[l].push(node);
    });

    const sortedLayers = Object.keys(layerGroups).map(Number).sort((a, b) => a - b);

    // 4. Calculate symmetrical positions with generous spacing
    const calculated = [];
    const CENTER_X = 650;
    const HORIZONTAL_SPACING = 290;
    const VERTICAL_SPACING = 230;
    let currentY = 70;

    sortedLayers.forEach((l) => {
      const groupNodes = layerGroups[l];
      const layerWidth = (groupNodes.length - 1) * HORIZONTAL_SPACING;
      const startX = CENTER_X - layerWidth / 2;

      groupNodes.forEach((node, idx) => {
        calculated.push({
          id: node.id,
          type: 'custom',
          position: {
            x: startX + idx * HORIZONTAL_SPACING,
            y: currentY,
          },
          data: node,
          selected: selectedNode?.id === node.id,
        });
      });

      currentY += VERTICAL_SPACING;
    });

    return calculated;
  }, [graphData.nodes, graphData.edges, selectedNode]);

  // Edges with smooth bezier curves, flow labels, and elegant coloring
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
        type: 'bezier',
        animated: isPathEdge,
        label: edge.label || '',
        labelStyle: {
          fontSize: 10,
          fontFamily: 'monospace',
          fill: isPathEdge ? '#4789b8' : '#71717a',
          fontWeight: isPathEdge ? 600 : 500,
        },
        labelBgStyle: {
          fill: '#ffffff',
          fillOpacity: 0.9,
        },
        labelBgPadding: [6, 2],
        labelBgBorderRadius: 4,
        style: {
          stroke: isPathEdge ? '#4789b8' : focusMode ? '#52525b' : '#94a3b8',
          strokeWidth: isPathEdge ? 2.5 : 1.75,
          opacity: focusMode && !isPathEdge ? 0.2 : 0.85,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isPathEdge ? '#4789b8' : '#94a3b8',
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
    // Tapping canvas background deselects inspector
    setSelectedNode(null);
  }, [setSelectedNode]);

  return (
    <div className="relative w-full h-full bg-neutral-100/50 dark:bg-neutral-950 overflow-hidden">
      {/* Top Floating Controls: Trace Banner & Legend */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-auto">
        {focusMode && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-mono shadow-md animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 text-airforce-400 dark:text-airforce-600" />
            <span>Trace Active ({highlightedPath.length} steps)</span>
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
        <div className="hidden sm:flex items-center gap-3.5 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 text-[11px] font-mono text-neutral-600 dark:text-neutral-400 shadow-sm backdrop-blur-sm">
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
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500" /> External
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
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.25}
        maxZoom={1.5}
        className="transition-colors"
      >
        <Background color="#94a3b8" gap={24} size={1} className="opacity-25" />
        <Controls className="!bg-white dark:!bg-neutral-900 !border-neutral-200 dark:!border-neutral-800 !shadow-sm !rounded-lg" />
      </ReactFlow>
    </div>
  );
}
