import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { GraphCanvas } from './components/GraphCanvas';
import { RightSidebar } from './components/RightSidebar';
import { 
  AgentScenario, 
  AgentNode, 
  AgentEdge, 
  StepUpdate,
  ExecutionMetrics 
} from './types/agent-graph';
import { 
  PRELOADED_SCENARIOS, 
  calculateMetrics, 
  generateDynamicAgentGraph 
} from './utils/agent-graph-engine';

export default function App() {
  // Active Scenario & Custom input
  const [currentScenario, setCurrentScenario] = useState<AgentScenario>(PRELOADED_SCENARIOS[0]);
  const [nodes, setNodes] = useState<AgentNode[]>(PRELOADED_SCENARIOS[0].nodes);
  const [edges, setEdges] = useState<AgentEdge[]>(PRELOADED_SCENARIOS[0].edges);
  const [sequence, setSequence] = useState<StepUpdate[]>(PRELOADED_SCENARIOS[0].executionSequence);
  const [customPrompt, setCustomPrompt] = useState<string>('');

  // Execution runner state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sequenceIndex, setSequenceIndex] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 0.5, 1, 2, 0 (instant)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inspector & selection state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(PRELOADED_SCENARIOS[0].nodes[0]?.id || null);

  // Gemini API integration state
  const [isRealApiMode, setIsRealApiMode] = useState<boolean>(false);
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [hasServerApiKey, setHasServerApiKey] = useState<boolean>(false);

  // Check server environment probe
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasServerApiKey) {
          setHasServerApiKey(true);
        }
      })
      .catch(() => {
        // Backend running without API key or offline simulation
      });
  }, []);

  // Compute live telemetry metrics
  const metrics = calculateMetrics(nodes);
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0] || null;
  const activeRunningNode = nodes.find((n) => n.status === 'running') || null;

  // Reset graph to initial scenario state
  const handleReset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    setSequenceIndex(0);

    const resetNodes = currentScenario.nodes.map((n) => ({
      ...n,
      status: 'pending' as const
    }));
    const resetEdges = currentScenario.edges.map((e) => ({
      ...e,
      status: 'idle' as const
    }));

    setNodes(resetNodes);
    setEdges(resetEdges);
    setSelectedNodeId(resetNodes[0]?.id || null);
  }, [currentScenario]);

  // Load a scenario
  const handleSelectScenario = (scenario: AgentScenario) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    setCurrentScenario(scenario);
    setSequence(scenario.executionSequence);
    setSequenceIndex(0);

    const resetNodes = scenario.nodes.map((n) => ({
      ...n,
      status: 'pending' as const
    }));
    const resetEdges = scenario.edges.map((e) => ({
      ...e,
      status: 'idle' as const
    }));

    setNodes(resetNodes);
    setEdges(resetEdges);
    setSelectedNodeId(resetNodes[0]?.id || null);
  };

  // Step runner logic
  const executeStep = useCallback((stepIdx: number): boolean => {
    if (stepIdx >= sequence.length) {
      setIsRunning(false);
      return false; // finished
    }

    const step = sequence[stepIdx];

    // Update nodes
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === step.nodeId) {
          return {
            ...node,
            status: step.status,
            executionTimeMs: step.executionTimeMs ?? node.executionTimeMs,
            tokens: step.tokens ?? node.tokens,
            inputData: step.inputData ?? node.inputData,
            outputData: step.outputData ?? node.outputData,
            reasoning: step.reasoning ?? node.reasoning,
            error: step.error ?? node.error
          };
        }
        return node;
      })
    );

    // Update edges
    setEdges((prevEdges) =>
      prevEdges.map((edge) => {
        if (step.activeEdgeIds?.includes(edge.id)) {
          return { ...edge, status: 'active' as const };
        }
        if (step.completedEdgeIds?.includes(edge.id)) {
          return { ...edge, status: 'completed' as const };
        }
        return edge;
      })
    );

    // Highlight current node in inspector
    setSelectedNodeId(step.nodeId);
    setSequenceIndex(stepIdx + 1);
    return true;
  }, [sequence]);

  // Step forward manually (single step)
  const handleStepForward = () => {
    if (isRunning) return;
    executeStep(sequenceIndex);
  };

  // Play / Pause toggle
  const handlePlayPause = () => {
    if (isRunning) {
      setIsRunning(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    } else {
      // If reached end, restart
      if (sequenceIndex >= sequence.length) {
        handleReset();
        setTimeout(() => setIsRunning(true), 100);
      } else {
        setIsRunning(true);
      }
    }
  };

  // Execution animation loop
  useEffect(() => {
    if (!isRunning) return;

    if (sequenceIndex >= sequence.length) {
      setIsRunning(false);
      return;
    }

    const step = sequence[sequenceIndex];
    const baseDelay = step.delayMs || 800;
    // Speed multiplier: 0 = instant, 0.5 = 2x slower, 1 = normal, 2 = 2x faster
    const actualDelay = playbackSpeed === 0 ? 30 : Math.max(baseDelay / playbackSpeed, 80);

    timerRef.current = setTimeout(() => {
      const hasNext = executeStep(sequenceIndex);
      if (!hasNext) {
        setIsRunning(false);
      }
    }, actualDelay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, sequenceIndex, sequence, playbackSpeed, executeStep]);

  // Custom prompt handler (simulation or real Gemini API call)
  const handleSubmitCustomPrompt = async () => {
    if (!customPrompt.trim()) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);

    if (isRealApiMode) {
      // Real API mode
      try {
        setIsRunning(true);
        const res = await fetch('/api/agent/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: customPrompt,
            model: selectedModel,
            apiKey: customApiKey || undefined
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Erro ao comunicar com API Gemini');
        }

        const customScenario: AgentScenario = {
          id: `gemini-run-${Date.now()}`,
          title: `Execução Gemini: ${customPrompt.slice(0, 36)}...`,
          tagline: `Modelo: ${data.modelUsed} · ${data.nodes.length} nós gerados`,
          category: 'custom',
          description: data.summary,
          prompt: customPrompt,
          nodes: data.nodes,
          edges: data.edges,
          executionSequence: data.executionSequence
        };

        setCurrentScenario(customScenario);
        setSequence(customScenario.executionSequence);
        setNodes(customScenario.nodes);
        setEdges(customScenario.edges);
        setSequenceIndex(0);
        setSelectedNodeId(customScenario.nodes[0]?.id || null);
      } catch (err: any) {
        alert(`Erro na API Gemini: ${err.message}. Alternando para visualização simulada adaptativa.`);
        // Graceful fallback to dynamic graph
        const generated = generateDynamicAgentGraph(customPrompt);
        applyGeneratedGraph(generated);
      }
    } else {
      // Instant adaptive simulation
      const generated = generateDynamicAgentGraph(customPrompt);
      applyGeneratedGraph(generated);
    }
  };

  const applyGeneratedGraph = (generated: ReturnType<typeof generateDynamicAgentGraph>) => {
    const customScenario: AgentScenario = {
      id: `custom-${Date.now()}`,
      title: `Tarefa Customizada: ${customPrompt.slice(0, 36)}...`,
      tagline: 'Execução de Grafo Adaptativo em Simulação',
      category: 'custom',
      description: `Agente cognitivo autônomo decompondo o comando: "${customPrompt}"`,
      prompt: customPrompt,
      nodes: generated.nodes,
      edges: generated.edges,
      executionSequence: generated.executionSequence
    };

    setCurrentScenario(customScenario);
    setSequence(customScenario.executionSequence);
    setNodes(customScenario.nodes);
    setEdges(customScenario.edges);
    setSequenceIndex(0);
    setSelectedNodeId(customScenario.nodes[0]?.id || null);
    setIsRunning(true);
  };

  // Export full graph telemetry as JSON file
  const handleExportJson = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      scenario: currentScenario.title,
      prompt: currentScenario.prompt,
      metrics,
      nodes,
      edges
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agentgraph-${currentScenario.id}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#050505] text-neutral-100 overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <Header
        isRunning={isRunning}
        onExportJson={handleExportJson}
        scenarioTitle={currentScenario.title}
        activeNode={activeRunningNode}
        completedCount={metrics.completedNodes}
        totalCount={metrics.totalNodes}
        isRealApiMode={isRealApiMode}
      />

      {/* 3-Column Interactive Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Controls & Scenarios */}
        <LeftSidebar
          selectedScenarioId={currentScenario.id}
          onSelectScenario={handleSelectScenario}
          customPrompt={customPrompt}
          onChangeCustomPrompt={setCustomPrompt}
          onSubmitCustomPrompt={handleSubmitCustomPrompt}
          isRunning={isRunning}
          onPlayPause={handlePlayPause}
          onStepForward={handleStepForward}
          onReset={handleReset}
          playbackSpeed={playbackSpeed}
          onChangePlaybackSpeed={setPlaybackSpeed}
          isRealApiMode={isRealApiMode}
          onToggleApiMode={setIsRealApiMode}
          customApiKey={customApiKey}
          onChangeCustomApiKey={setCustomApiKey}
          selectedModel={selectedModel}
          onChangeSelectedModel={setSelectedModel}
          hasServerApiKey={hasServerApiKey}
        />

        {/* Center Canvas: Interactive Dynamic Reasoning Graph */}
        <main className="flex-1 relative overflow-hidden flex flex-col">
          <GraphCanvas
            nodes={nodes}
            edges={edges}
            selectedNodeId={selectedNodeId}
            onSelectNode={(node) => setSelectedNodeId(node.id)}
            isRunning={isRunning}
          />
        </main>

        {/* Right Sidebar: Step Inspector & Telemetry */}
        <RightSidebar
          selectedNode={selectedNode}
          metrics={metrics}
          allNodes={nodes}
          onSelectNode={(node) => setSelectedNodeId(node.id)}
        />
      </div>
    </div>
  );
}
