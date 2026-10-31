import React, { useState } from 'react';
import { 
  Download, 
  HelpCircle,
  CheckCircle2,
  Sparkles,
  X,
  Compass,
  ArrowRight,
  Layers,
  Brain
} from 'lucide-react';
import { AgentNode } from '../types/agent-graph';

interface HeaderProps {
  isRunning: boolean;
  onExportJson: () => void;
  scenarioTitle: string;
  activeNode: AgentNode | null;
  completedCount: number;
  totalCount: number;
  isRealApiMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isRunning,
  onExportJson,
  scenarioTitle,
  activeNode,
  completedCount,
  totalCount,
  isRealApiMode
}) => {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const isFinished = totalCount > 0 && completedCount === totalCount && !isRunning;

  return (
    <>
      <header className="h-14 border-b border-neutral-800 bg-[#0a0a0a] px-5 flex items-center justify-between shrink-0 z-30 select-none">
        {/* Brand & Zone 1 */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-yellow-400 text-black flex items-center justify-center shadow-lg shadow-yellow-500/20 font-black text-sm tracking-tighter">
            AG
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                AgentGraph
                <span className="text-[10px] font-bold text-yellow-400 bg-yellow-950/80 border border-yellow-500/40 px-1.5 py-0.5 rounded tracking-wide">
                  OBSERVADOR DE IA
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-neutral-400 leading-none">
              Visualizador Amigável do Raciocínio de Agentes
            </p>
          </div>
        </div>

        {/* Center Zone: Active Scenario & Status Indicator */}
        <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs">
          <span className="text-neutral-300 max-w-[280px] truncate font-medium">
            {scenarioTitle}
          </span>
          <span className="text-neutral-700">|</span>
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            {isRunning ? (
              <span className="flex items-center gap-1.5 text-yellow-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                Pensando: {activeNode?.title || 'Processando...'}
              </span>
            ) : isFinished ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Concluído com Sucesso ({completedCount}/{totalCount})
              </span>
            ) : (
              <span className="flex items-center gap-1 text-neutral-400 font-medium">
                <Compass className="w-3.5 h-3.5 text-yellow-500" />
                Pronto para Iniciar ({completedCount}/{totalCount} passos)
              </span>
            )}
          </div>
          <span className="text-neutral-700">|</span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-neutral-800 text-yellow-300 border border-yellow-500/20">
            {isRealApiMode ? 'Gemini Real' : 'Modo Demonstração'}
          </span>
        </div>

        {/* Right Zone: Help Guide and Export (No duplicate play buttons) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-yellow-400 bg-yellow-950/40 hover:bg-yellow-950/80 border border-yellow-500/40 transition-colors"
            title="Ver explicação simples de como funciona"
          >
            <HelpCircle className="w-3.5 h-3.5 text-yellow-400" />
            <span>Como Funciona?</span>
          </button>

          <button
            onClick={onExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-colors"
            title="Baixar histórico completo em formato JSON"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Salvar Relatório</span>
          </button>
        </div>
      </header>

      {/* Newbie-Friendly "Como Funciona?" Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#0e0e0e] border border-yellow-500/40 rounded-2xl p-6 shadow-2xl shadow-yellow-500/10 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2 text-yellow-400 font-bold text-base">
                <Brain className="w-5 h-5 text-yellow-400" />
                Guia Rápido para Iniciantes
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-neutral-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5 text-sm text-yellow-400">
                  <Sparkles className="w-4 h-4" />
                  1. O que é um Agente de IA?
                </div>
                <p>
                  Diferente de um chatbot comum que apenas responde em texto, um <strong>Agente Autônomo</strong> pensa, quebra o problema em etapas, pesquisa informações e usa ferramentas sozinho para resolver sua tarefa.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5 text-sm text-yellow-400">
                  <Layers className="w-4 h-4" />
                  2. O que representam as caixas (Grafo)?
                </div>
                <p>
                  Cada retângulo no centro da tela é um <strong>Passo do Pensamento da IA</strong>. As linhas conectam de onde veio a informação e para onde ela vai, desde o seu pedido até a conclusão final.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5 text-sm text-yellow-400">
                  <ArrowRight className="w-4 h-4" />
                  3. Como navegar?
                </div>
                <p>
                  - Clique no botão amarelo <strong>Iniciar Raciocínio</strong> para assistir à IA pensando passo a passo.<br />
                  - Clique em qualquer caixinha do grafo para ver na lateral direita os detalhes simples de cada etapa.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 rounded-lg bg-yellow-400 text-black font-bold text-xs hover:bg-yellow-300 transition-colors shadow-lg shadow-yellow-500/20"
              >
                Entendi, vamos começar!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
