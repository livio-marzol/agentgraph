import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Clock, 
  Coins, 
  Cpu, 
  Terminal, 
  ShieldCheck, 
  Sparkles, 
  Brain, 
  Activity, 
  BarChart3,
  ListOrdered,
  HelpCircle,
  Info
} from 'lucide-react';
import { AgentNode, ExecutionMetrics, NodeStatus } from '../types/agent-graph';

interface RightSidebarProps {
  selectedNode: AgentNode | null;
  metrics: ExecutionMetrics;
  allNodes: AgentNode[];
  onSelectNode: (node: AgentNode) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  selectedNode,
  metrics,
  allNodes,
  onSelectNode
}) => {
  const [activeTab, setActiveTab] = useState<'inspector' | 'metrics' | 'logs'>('inspector');
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  const copyToClipboard = (text: string, type: 'input' | 'output') => {
    navigator.clipboard.writeText(text);
    if (type === 'input') {
      setCopiedInput(true);
      setTimeout(() => setCopiedInput(false), 1500);
    } else {
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 1500);
    }
  };

  const formatJson = (data: any) => {
    if (!data) return '{\n  "status": "sem dados"\n}';
    if (typeof data === 'string') {
      try {
        return JSON.stringify(JSON.parse(data), null, 2);
      } catch {
        return JSON.stringify({ texto: data }, null, 2);
      }
    }
    return JSON.stringify(data, null, 2);
  };

  return (
    <aside className="w-96 border-l border-neutral-800 bg-[#0a0a0a] flex flex-col shrink-0 h-full overflow-hidden select-none">
      
      {/* Header Tabs (Black & Yellow) */}
      <div className="h-12 border-b border-neutral-800 px-4 flex items-center justify-between shrink-0 bg-[#0e0e0e]">
        <div className="flex items-center gap-1 p-0.5 bg-neutral-900 rounded-lg border border-neutral-800 text-xs">
          <button
            onClick={() => setActiveTab('inspector')}
            className={`px-3 py-1 font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'inspector'
                ? 'bg-yellow-400 text-black shadow-sm font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            Inspetor
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-3 py-1 font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'metrics'
                ? 'bg-yellow-400 text-black shadow-sm font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Estatísticas
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1 font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-yellow-400 text-black shadow-sm font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            Histórico
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Tab 1: Inspetor de Etapa Selecionada */}
        {activeTab === 'inspector' && (
          <>
            {selectedNode ? (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Node Title & Metadata */}
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-yellow-400 bg-yellow-950/80 px-2 py-0.5 rounded border border-yellow-500/40">
                      {selectedNode.type === 'goal' ? 'Seu Pedido Inicial' :
                       selectedNode.type === 'planner' ? 'Planejamento da IA' :
                       selectedNode.type === 'tool_call' ? 'Uso de Ferramenta' :
                       selectedNode.type === 'reflection' ? 'Autorreflexão da IA' : 'Resposta Final'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
                      Etapa: {selectedNode.id}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {selectedNode.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {selectedNode.subtitle}
                    </p>
                  </div>

                  {/* Latency & Token Metric explanation */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800 text-[11px]">
                    <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
                      <div className="text-neutral-500 text-[10px] font-medium flex items-center gap-1">
                        <span>Tempo de Execução</span>
                        <span title="Tempo que a IA demorou para processar esta etapa específica">
                          <HelpCircle className="w-2.5 h-2.5 text-neutral-500" />
                        </span>
                      </div>
                      <div className="text-white font-bold font-mono flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-yellow-400" />
                        {selectedNode.executionTimeMs ? `${selectedNode.executionTimeMs} ms` : 'Aguardando'}
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
                      <div className="text-neutral-500 text-[10px] font-medium flex items-center gap-1">
                        <span>Volume de Tokens</span>
                        <span title="Tokens são fragmentos de palavras processados pelo modelo">
                          <HelpCircle className="w-2.5 h-2.5 text-neutral-500" />
                        </span>
                      </div>
                      <div className="text-yellow-400 font-bold font-mono flex items-center gap-1 mt-0.5">
                        <Cpu className="w-3 h-3 text-yellow-400" />
                        {selectedNode.tokens?.total ? `${selectedNode.tokens.total} tokens` : '—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chain of Thought / Internal Reasoning (Explained in layman terms) */}
                {selectedNode.reasoning && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-yellow-400" />
                      O que a IA pensou neste momento?
                    </label>
                    <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 leading-relaxed font-sans">
                      {selectedNode.reasoning}
                    </div>
                  </div>
                )}

                {/* Input Payload (JSON) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-yellow-400" />
                      Dados de Entrada (O que foi enviado)
                    </label>
                    <button
                      onClick={() => copyToClipboard(formatJson(selectedNode.inputData), 'input')}
                      className="text-[11px] text-neutral-400 hover:text-yellow-400 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-neutral-800 transition-colors"
                      title="Copiar dados"
                    >
                      {copiedInput ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedInput ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-yellow-300 overflow-x-auto max-h-40 leading-relaxed">
                    {formatJson(selectedNode.inputData)}
                  </pre>
                </div>

                {/* Output Payload (JSON) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                      Resultado Obtido (O que a etapa retornou)
                    </label>
                    <button
                      onClick={() => copyToClipboard(formatJson(selectedNode.outputData), 'output')}
                      className="text-[11px] text-neutral-400 hover:text-yellow-400 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-neutral-800 transition-colors"
                      title="Copiar resultado"
                    >
                      {copiedOutput ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedOutput ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-44 leading-relaxed">
                    {formatJson(selectedNode.outputData)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-neutral-500 space-y-2">
                <Brain className="w-8 h-8 mx-auto text-neutral-600" />
                <p className="text-xs">Selecione qualquer caixinha no grafo para ver os detalhes daquele passo.</p>
              </div>
            )}
          </>
        )}

        {/* Tab 2: Estatísticas e Custo Geral */}
        {activeTab === 'metrics' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* KPI Cards in Black & Yellow */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="text-neutral-400 text-[10px] uppercase font-bold flex items-center gap-1">
                  <span>Tempo Total</span>
                  <span title="Tempo total que a IA levou somando todos os passos">
                    <HelpCircle className="w-2.5 h-2.5 text-neutral-500" />
                  </span>
                </div>
                <div className="text-lg font-bold text-white font-mono mt-1">
                  {metrics.totalLatencyMs.toLocaleString()} <span className="text-xs text-yellow-400 font-normal">ms</span>
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">
                  {(metrics.totalLatencyMs / 1000).toFixed(2)} segundos
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="text-neutral-400 text-[10px] uppercase font-bold flex items-center gap-1">
                  <span>Custo Estimado</span>
                  <span title="Custo de API baseado no consumo do Gemini Flash">
                    <HelpCircle className="w-2.5 h-2.5 text-neutral-500" />
                  </span>
                </div>
                <div className="text-lg font-bold text-yellow-400 font-mono mt-1">
                  ${metrics.estimatedCostUsd.toFixed(5)}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">
                  Fração de centavo de dólar
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="text-neutral-400 text-[10px] uppercase font-bold">Total de Tokens</div>
                <div className="text-lg font-bold text-white font-mono mt-1">
                  {metrics.totalTokens.toLocaleString()}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">
                  Lidos e gerados pela IA
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="text-neutral-400 text-[10px] uppercase font-bold">Ferramentas Usadas</div>
                <div className="text-lg font-bold text-yellow-400 font-mono mt-1">
                  {metrics.toolCallCount}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">
                  Ações externas acionadas
                </div>
              </div>
            </div>

            {/* Token Split Bar */}
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-neutral-300 font-medium">
                <span>Distribuição de Palavras (Tokens)</span>
                <span className="font-mono text-[11px] text-yellow-400 font-bold">
                  {metrics.promptTokens} lidos / {metrics.completionTokens} gerados
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-neutral-950 overflow-hidden flex">
                <div
                  style={{
                    width: `${metrics.totalTokens > 0 ? (metrics.promptTokens / metrics.totalTokens) * 100 : 70}%`
                  }}
                  className="bg-yellow-500 h-full"
                  title="Tokens de Entrada (Instruções lidas)"
                />
                <div
                  style={{
                    width: `${metrics.totalTokens > 0 ? (metrics.completionTokens / metrics.totalTokens) * 100 : 30}%`
                  }}
                  className="bg-neutral-600 h-full"
                  title="Tokens de Saída (Respostas geradas)"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  Entrada: ~70%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-neutral-600" />
                  Saída: ~30%
                </span>
              </div>
            </div>

            {/* Step execution speed waterfall */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Velocidade por Etapa
              </label>
              <div className="space-y-1.5">
                {allNodes.map((n) => {
                  const ms = n.executionTimeMs || 0;
                  const maxMs = Math.max(...allNodes.map((x) => x.executionTimeMs || 100), 500);
                  const pct = Math.min((ms / maxMs) * 100, 100);

                  return (
                    <div
                      key={n.id}
                      onClick={() => onSelectNode(n)}
                      className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-yellow-500/50 cursor-pointer text-xs space-y-1.5 transition-colors"
                    >
                      <div className="flex items-center justify-between text-neutral-200">
                        <span className="truncate max-w-[200px] font-semibold">{n.title}</span>
                        <span className="font-mono text-[11px] text-yellow-400 font-bold">{ms} ms</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-neutral-950 overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-yellow-400 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Linha do Tempo e Histórico */}
        {activeTab === 'logs' && (
          <div className="space-y-2 animate-in fade-in duration-150">
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Histórico Sequencial de Passos
            </label>
            <div className="space-y-2">
              {allNodes.map((node, idx) => (
                <div
                  key={node.id}
                  onClick={() => onSelectNode(node)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedNode?.id === node.id
                      ? 'bg-neutral-900 border-yellow-400 shadow-sm'
                      : 'bg-neutral-900/60 border-neutral-800 hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-yellow-400">
                      Passo {idx + 1}
                    </span>
                    <span className="font-mono text-neutral-400">
                      {node.executionTimeMs ? `${node.executionTimeMs}ms` : 'pendente'}
                    </span>
                  </div>
                  <div className="text-white font-bold mt-1">
                    {node.title}
                  </div>
                  {node.reasoning && (
                    <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                      {node.reasoning}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Summary Footer on Base */}
      <div className="p-3.5 border-t border-neutral-800 bg-[#0e0e0e]">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="space-y-0.5">
            <span className="text-[10px] text-neutral-500 block uppercase">Tempo Acumulado</span>
            <span className="text-white font-bold">{metrics.totalLatencyMs} ms</span>
          </div>
          <div className="space-y-0.5 text-center">
            <span className="text-[10px] text-neutral-500 block uppercase">Progresso</span>
            <span className="text-yellow-400 font-bold">{metrics.completedNodes} de {metrics.totalNodes}</span>
          </div>
          <div className="space-y-0.5 text-right">
            <span className="text-[10px] text-neutral-500 block uppercase">Custo</span>
            <span className="text-emerald-400 font-bold">${metrics.estimatedCostUsd.toFixed(5)}</span>
          </div>
        </div>
      </div>

    </aside>
  );
};
