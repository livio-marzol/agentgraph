import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Target, 
  Brain, 
  Terminal, 
  Search, 
  Database, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Grid, 
  Crosshair,
  Layers,
  Clock,
  Zap,
  Info
} from 'lucide-react';
import { AgentNode, AgentEdge, NodeType, ToolType, NodeStatus } from '../types/agent-graph';
import { getBezierPath } from '../utils/agent-graph-engine';

interface GraphCanvasProps {
  nodes: AgentNode[];
  edges: AgentEdge[];
  selectedNodeId: string | null;
  onSelectNode: (node: AgentNode) => void;
  isRunning: boolean;
}

const NODE_WIDTH = 260;
const NODE_HEIGHT = 112;

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  isRunning
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Transform states: zoom and pan offset
  const [zoom, setZoom] = useState(0.60);
  const [pan, setPan] = useState({ x: 40, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [autoFollow, setAutoFollow] = useState(true);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.40), 2.0));
  };

  // Drag pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.agent-node-card')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.12, 2.0));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.12, 0.40));

  const handleFitView = useCallback(() => {
    if (!nodes.length || !containerRef.current) return;
    const minX = Math.min(...nodes.map((n) => n.x));
    const maxX = Math.max(...nodes.map((n) => n.x + NODE_WIDTH));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxY = Math.max(...nodes.map((n) => n.y + NODE_HEIGHT));

    const contentWidth = maxX - minX + 160;
    const contentHeight = maxY - minY + 160;

    const { clientWidth, clientHeight } = containerRef.current;
    if (clientWidth === 0 || clientHeight === 0) return;

    const scale = Math.min(
      Math.max(Math.min((clientWidth - 40) / contentWidth, (clientHeight - 40) / contentHeight), 0.55),
      1.0
    );

    setZoom(scale);
    setPan({
      x: (clientWidth - contentWidth * scale) / 2 - minX * scale + 80 * scale,
      y: (clientHeight - contentHeight * scale) / 2 - minY * scale + 60 * scale
    });
  }, [nodes]);

  // Initial auto-fit
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFitView();
    }, 150);
    return () => clearTimeout(timer);
  }, [nodes.length, handleFitView]);

  // Center on active node when running if autoFollow is on
  useEffect(() => {
    if (!autoFollow || !isRunning) return;
    const runningNode = nodes.find((n) => n.status === 'running');
    if (runningNode && containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setPan({
        x: clientWidth / 2 - (runningNode.x + NODE_WIDTH / 2) * zoom,
        y: clientHeight / 2 - (runningNode.y + NODE_HEIGHT / 2) * zoom
      });
    }
  }, [nodes, isRunning, autoFollow, zoom]);

  // Node visuals in Black & Yellow theme
  const getNodeVisuals = (node: AgentNode, index: number) => {
    let icon = <Brain className="w-3.5 h-3.5 text-yellow-400" />;
    let typeLabel = 'Raciocínio';
    let stepNumber = `Etapa ${index + 1}`;
    let badgeBg = 'bg-neutral-900 text-yellow-400 border-yellow-500/40';

    switch (node.type) {
      case 'goal':
        icon = <Target className="w-3.5 h-3.5 text-yellow-400" />;
        typeLabel = 'Seu Pedido';
        badgeBg = 'bg-yellow-400 text-black font-bold border-yellow-400';
        break;
      case 'planner':
        icon = <Brain className="w-3.5 h-3.5 text-yellow-400" />;
        typeLabel = 'Plano de Ação';
        badgeBg = 'bg-neutral-900 text-yellow-300 border-yellow-500/50';
        break;
      case 'tool_call':
        if (node.toolType === 'code_interpreter') {
          icon = <Terminal className="w-3.5 h-3.5 text-yellow-400" />;
          typeLabel = 'Cálculo Python';
        } else if (node.toolType === 'web_search') {
          icon = <Search className="w-3.5 h-3.5 text-yellow-400" />;
          typeLabel = 'Busca Web';
        } else if (node.toolType === 'database_query') {
          icon = <Database className="w-3.5 h-3.5 text-yellow-400" />;
          typeLabel = 'Banco de Dados';
        } else {
          icon = <Zap className="w-3.5 h-3.5 text-yellow-400" />;
          typeLabel = 'Ferramenta';
        }
        badgeBg = 'bg-yellow-950/90 text-yellow-300 border-yellow-500/60 font-semibold';
        break;
      case 'reflection':
        icon = <RotateCcw className="w-3.5 h-3.5 text-yellow-300" />;
        typeLabel = 'Autorreflexão';
        badgeBg = 'bg-neutral-900 text-yellow-200 border-yellow-400/50';
        break;
      case 'final_output':
        icon = <Sparkles className="w-3.5 h-3.5 text-black" />;
        typeLabel = 'Resposta Final';
        badgeBg = 'bg-yellow-400 text-black font-extrabold border-yellow-400';
        break;
    }

    return { icon, typeLabel, stepNumber, badgeBg };
  };

  // Node status formatting in clear Portuguese
  const getStatusBadge = (status: NodeStatus) => {
    switch (status) {
      case 'running':
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-yellow-300 bg-yellow-950 border border-yellow-400 px-2 py-0.5 rounded-full font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
            Pensando...
          </span>
        );
      case 'success':
      case 'correction':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-neutral-900 border border-emerald-500/50 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Concluído
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-neutral-900 border border-amber-500/50 px-2 py-0.5 rounded-full">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            Ajustando
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-neutral-500 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-full">
            Aguardando
          </span>
        );
    }
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`relative w-full h-full overflow-hidden bg-[#050505] select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Background Grid Pattern with Subtle Yellow Dots */}
      {showGrid && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <defs>
            <pattern
              id="graph-grid"
              width={32 * zoom}
              height={32 * zoom}
              patternUnits="userSpaceOnUse"
              x={pan.x % (32 * zoom)}
              y={pan.y % (32 * zoom)}
            >
              <circle cx="16" cy="16" r="1.2" fill="#facc15" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#graph-grid)" />
        </svg>
      )}

      {/* Floating Canvas Controls Overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-neutral-950/90 backdrop-blur-md border border-neutral-800 shadow-xl">
        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded-lg text-neutral-300 hover:text-yellow-400 hover:bg-neutral-900 transition-colors"
          title="Aproximar Visão"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono text-yellow-400 font-bold px-1 select-none">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded-lg text-neutral-300 hover:text-yellow-400 hover:bg-neutral-900 transition-colors"
          title="Afastar Visão"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-neutral-800" />
        <button
          onClick={handleFitView}
          className="p-1.5 rounded-lg text-neutral-300 hover:text-yellow-400 hover:bg-neutral-900 transition-colors"
          title="Centralizar e Enquadrar Todos os Passos"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-1.5 rounded-lg transition-colors ${
            showGrid ? 'text-yellow-400 bg-yellow-950/60' : 'text-neutral-400 hover:text-white'
          }`}
          title="Alternar Grade de Fundo"
        >
          <Grid className="w-4 h-4" />
        </button>
        <button
          onClick={() => setAutoFollow(!autoFollow)}
          className={`p-1.5 rounded-lg transition-colors ${
            autoFollow ? 'text-yellow-400 bg-yellow-950/60' : 'text-neutral-400 hover:text-white'
          }`}
          title="Acompanhar automaticamente a etapa em execução"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Main Canvas Viewport with Pan & Zoom */}
      <div
        className="absolute inset-0 origin-top-left transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
        }}
      >
        {/* SVG Connections (Yellow Paths & Glowing Particles) */}
        <svg
          className="absolute inset-0 overflow-visible pointer-events-none"
          style={{ width: '4000px', height: '3000px' }}
        >
          <defs>
            <linearGradient id="edge-active-yellow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#facc15" />
            </linearGradient>
            <linearGradient id="edge-complete-yellow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>

            <filter id="yellow-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {edges.map((edge) => {
            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            const { path, midX, midY } = getBezierPath(sourceNode, targetNode, NODE_WIDTH, NODE_HEIGHT);
            const isActive = edge.status === 'active';
            const isCompleted = edge.status === 'completed';

            return (
              <g key={edge.id} className="transition-all duration-300">
                {/* Dark baseline shadow */}
                <path
                  d={path}
                  fill="none"
                  stroke="#000000"
                  strokeWidth="6"
                  strokeLinecap="round"
                  opacity="0.9"
                />

                {/* Base curve line in black/yellow */}
                <path
                  d={path}
                  fill="none"
                  stroke={
                    isActive
                      ? 'url(#edge-active-yellow)'
                      : isCompleted
                      ? 'url(#edge-complete-yellow)'
                      : '#262626'
                  }
                  strokeWidth={isActive ? '3' : '2'}
                  strokeDasharray={isActive ? '6 6' : undefined}
                  className={isActive ? 'animate-dash-flow' : undefined}
                  filter={isActive ? 'url(#yellow-glow)' : undefined}
                />

                {/* Flowing animated yellow particle when edge is active */}
                {isActive && (
                  <circle r="4.5" fill="#facc15" filter="url(#yellow-glow)">
                    <animateMotion
                      path={path}
                      dur="1.1s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Connection Label badge */}
                {edge.label && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-38"
                      y="-11"
                      width="76"
                      height="22"
                      rx="6"
                      fill="#0d0d0d"
                      stroke={isActive ? '#facc15' : isCompleted ? '#eab308' : '#262626'}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={isActive ? '#facc15' : isCompleted ? '#fef08a' : '#737373'}
                      fontSize="10"
                      fontFamily="ui-monospace, monospace"
                      fontWeight="600"
                    >
                      {edge.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* HTML Interactive Node Cards (Black & Yellow Theme) */}
        {nodes.map((node, index) => {
          const isSelected = selectedNodeId === node.id;
          const isRunningNode = node.status === 'running';
          const isSuccess = node.status === 'success' || node.status === 'correction';
          const { icon, typeLabel, stepNumber, badgeBg } = getNodeVisuals(node, index);

          return (
            <div
              key={node.id}
              onClick={() => onSelectNode(node)}
              style={{
                position: 'absolute',
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: `${NODE_WIDTH}px`,
                height: `${NODE_HEIGHT}px`
              }}
              className={`agent-node-card group cursor-pointer rounded-2xl transition-all duration-200 select-none ${
                isSelected
                  ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-black shadow-2xl scale-[1.02]'
                  : 'hover:scale-[1.01]'
              } ${
                isRunningNode
                  ? 'animate-pulse-glow border-yellow-400 bg-neutral-900'
                  : isSuccess
                  ? 'border-yellow-500/40 bg-[#111111]'
                  : 'border-neutral-800 bg-[#0c0c0c] hover:border-neutral-700'
              } border p-3 flex flex-col justify-between`}
            >
              {/* Card Header: Step Pill & Status Badge */}
              <div className="flex items-center justify-between gap-1.5">
                <span className={`flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-lg border ${badgeBg}`}>
                  {icon}
                  <span>{typeLabel}</span>
                </span>
                {getStatusBadge(node.status)}
              </div>

              {/* Title & Subtitle */}
              <div className="my-1">
                <div className="text-xs font-bold text-white group-hover:text-yellow-400 transition-colors truncate">
                  {node.title}
                </div>
                <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                  {node.subtitle}
                </div>
              </div>

              {/* Card Footer: Simple Latency & Token Metric */}
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 border-t border-neutral-800/80 pt-1.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-yellow-500" />
                  {node.executionTimeMs ? `${node.executionTimeMs}ms` : '—'}
                </span>
                <span className="text-yellow-400/80 font-medium">
                  {node.tokens ? `${node.tokens.total} tokens` : '—'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Minimap in Bottom Right (Black & Yellow) */}
      <div className="absolute bottom-4 right-4 z-20 w-48 h-32 rounded-xl bg-neutral-950/90 backdrop-blur-md border border-neutral-800 p-2.5 shadow-2xl pointer-events-none hidden sm:block">
        <div className="flex items-center justify-between text-[9px] font-mono text-neutral-400 mb-1 border-b border-neutral-800 pb-1">
          <span className="flex items-center gap-1 text-yellow-400 font-bold">
            <Layers className="w-3 h-3" />
            MAPA GERAL
          </span>
          <span>{nodes.length} etapas</span>
        </div>
        <div className="relative w-full h-[88px] overflow-hidden">
          {nodes.map((n) => {
            const miniX = (n.x / 2200) * 160 + 5;
            const miniY = (n.y / 500) * 68 + 5;
            const isRun = n.status === 'running';
            const isDone = n.status === 'success' || n.status === 'correction';

            return (
              <div
                key={n.id}
                style={{
                  position: 'absolute',
                  left: `${miniX}px`,
                  top: `${miniY}px`,
                  width: '18px',
                  height: '8px'
                }}
                className={`rounded-sm transition-colors ${
                  isRun
                    ? 'bg-yellow-400 animate-ping'
                    : isDone
                    ? 'bg-yellow-400'
                    : 'bg-neutral-800'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
