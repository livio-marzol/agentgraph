import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  StepForward, 
  Sparkles, 
  Key, 
  Coins, 
  Cpu, 
  LifeBuoy, 
  Terminal, 
  Search, 
  Database, 
  Sliders,
  Send,
  Zap,
  ShieldCheck,
  Check,
  Info,
  HelpCircle
} from 'lucide-react';
import { AgentScenario } from '../types/agent-graph';
import { PRELOADED_SCENARIOS } from '../utils/agent-graph-engine';

interface LeftSidebarProps {
  selectedScenarioId: string;
  onSelectScenario: (scenario: AgentScenario) => void;
  customPrompt: string;
  onChangeCustomPrompt: (val: string) => void;
  onSubmitCustomPrompt: () => void;
  isRunning: boolean;
  onPlayPause: () => void;
  onStepForward: () => void;
  onReset: () => void;
  playbackSpeed: number;
  onChangePlaybackSpeed: (speed: number) => void;
  isRealApiMode: boolean;
  onToggleApiMode: (val: boolean) => void;
  customApiKey: string;
  onChangeCustomApiKey: (key: string) => void;
  selectedModel: string;
  onChangeSelectedModel: (model: string) => void;
  hasServerApiKey: boolean;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  selectedScenarioId,
  onSelectScenario,
  customPrompt,
  onChangeCustomPrompt,
  onSubmitCustomPrompt,
  isRunning,
  onPlayPause,
  onStepForward,
  onReset,
  playbackSpeed,
  onChangePlaybackSpeed,
  isRealApiMode,
  onToggleApiMode,
  customApiKey,
  onChangeCustomApiKey,
  selectedModel,
  onChangeSelectedModel,
  hasServerApiKey
}) => {
  const [showKeyInput, setShowKeyInput] = useState(false);

  const getScenarioIcon = (category: string) => {
    switch (category) {
      case 'finance':
        return <Coins className="w-4 h-4 text-yellow-400" />;
      case 'engineering':
        return <Cpu className="w-4 h-4 text-yellow-400" />;
      case 'support':
        return <LifeBuoy className="w-4 h-4 text-yellow-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <aside className="w-84 border-r border-neutral-800 bg-[#0a0a0a] flex flex-col shrink-0 h-full overflow-hidden select-none">
      
      {/* Scrollable controls */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        
        {/* Section 1: Modo de Execução */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Como você quer testar?</span>
            </label>
            <span className="text-[10px] text-yellow-400 font-medium">
              {isRealApiMode ? 'Gemini Inteligência Real' : 'Modo Demonstração'}
            </span>
          </div>

          <div className="grid grid-cols-2 p-1 bg-neutral-900 rounded-xl border border-neutral-800">
            <button
              onClick={() => onToggleApiMode(false)}
              className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all text-center ${
                !isRealApiMode
                  ? 'bg-yellow-400 text-black shadow-sm font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Demonstração Rápida
            </button>
            <button
              onClick={() => onToggleApiMode(true)}
              className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                isRealApiMode
                  ? 'bg-yellow-400 text-black shadow-sm font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              API Gemini Real
            </button>
          </div>

          {/* Real API Settings panel */}
          {isRealApiMode && (
            <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-yellow-500/30 space-y-2.5 text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-neutral-300 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-yellow-400" />
                  Chave no Servidor:
                </span>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                  hasServerApiKey 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' 
                    : 'bg-yellow-950 text-yellow-300 border border-yellow-800/40'
                }`}>
                  {hasServerApiKey ? 'Ativa no Servidor' : 'Padrão'}
                </span>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Modelo de Inteligência</label>
                <select
                  value={selectedModel}
                  onChange={(e) => onChangeSelectedModel(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 text-neutral-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-yellow-400"
                >
                  <option value="gemini-3.8-flash">gemini-3.8-flash (Recomendado)</option>
                  <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                </select>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowKeyInput(!showKeyInput)}
                  className="text-[11px] text-yellow-400 hover:text-yellow-300 underline underline-offset-2 flex items-center gap-1"
                >
                  <Key className="w-3 h-3" />
                  {showKeyInput ? 'Fechar campo de chave' : 'Inserir chave própria (opcional)'}
                </button>
                {showKeyInput && (
                  <div className="mt-2">
                    <input
                      type="password"
                      value={customApiKey}
                      onChange={(e) => onChangeCustomApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-black border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-neutral-200 font-mono focus:outline-none focus:border-yellow-400"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">
                      A chave é utilizada com segurança somente para executar seu teste.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Exemplos Práticos Pré-Configurados */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
            <span>Exemplos Práticos</span>
            <span className="text-[10px] text-neutral-500 font-normal">Clique para carregar</span>
          </label>
          <div className="space-y-2">
            {PRELOADED_SCENARIOS.map((sc, idx) => {
              const isSelected = selectedScenarioId === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => onSelectScenario(sc)}
                  className={`w-full text-left p-3 rounded-xl border transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'bg-neutral-900 border-yellow-400 shadow-md shadow-yellow-500/10'
                      : 'bg-neutral-900/50 border-neutral-800 hover:bg-neutral-900 hover:border-neutral-700'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-yellow-400" />
                  )}
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 shrink-0 mt-0.5">
                      {getScenarioIcon(sc.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-yellow-400 uppercase tracking-wide">
                        <span>Exemplo {idx + 1}</span>
                      </div>
                      <div className="text-xs font-bold text-white truncate group-hover:text-yellow-300 transition-colors mt-0.5">
                        {sc.title}
                      </div>
                      <div className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-snug">
                        {sc.tagline}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Prompt Personalizado do Usuário */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            Ou crie sua própria tarefa:
          </label>
          <div className="space-y-1.5">
            <textarea
              value={customPrompt}
              onChange={(e) => onChangeCustomPrompt(e.target.value)}
              placeholder="Ex: Como planejar um roteiro de viagem de 3 dias com dicas de transporte e custos?"
              rows={3}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 resize-none transition-all leading-relaxed"
            />
            <button
              onClick={onSubmitCustomPrompt}
              disabled={!customPrompt.trim() || isRunning}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-yellow-400 border border-yellow-500/30 text-xs font-bold transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gerar Novo Fluxo de Pensamento</span>
            </button>
          </div>
        </div>

        {/* Section 4: Ferramentas que a IA Sabe Usar (Guia Simples) */}
        <div className="space-y-2 p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-yellow-400" />
            Ferramentas que a IA Utiliza
          </div>
          <div className="space-y-2 text-[11px] pt-1">
            <div className="flex items-start gap-2">
              <Search className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">Busca na Web</span>
                <span className="text-neutral-400">Procura dados e referências atualizadas online.</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Terminal className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">Cálculos Exatos (Python)</span>
                <span className="text-neutral-400">Processa fórmulas e matemática sem erros manuais.</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Database className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">Banco de Dados</span>
                <span className="text-neutral-400">Consulta tabelas e cadastros organizados.</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">Autorreflexão</span>
                <span className="text-neutral-400">A IA checa se o resultado está correto antes de entregar.</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Unified Primary Control Panel (No duplicate buttons) */}
      <div className="p-4 border-t border-neutral-800 bg-[#0e0e0e] space-y-3">
        {/* Speed Controls with clear labels */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-400 font-medium flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-yellow-400" />
            Velocidade:
          </span>
          <div className="flex items-center gap-1">
            {[
              { label: '0.5x', val: 0.5 },
              { label: '1x (Padrão)', val: 1 },
              { label: '2x', val: 2 },
              { label: 'Instantâneo', val: 0 }
            ].map((spd) => (
              <button
                key={spd.val}
                onClick={() => onChangePlaybackSpeed(spd.val)}
                className={`py-0.5 px-2 text-[10px] font-semibold rounded transition-colors ${
                  playbackSpeed === spd.val
                    ? 'bg-yellow-400 text-black font-bold'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Action Button (Single, Prominent, Clear) */}
        <button
          onClick={onPlayPause}
          className={`w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all ${
            isRunning
              ? 'bg-neutral-800 text-yellow-400 border border-yellow-400 hover:bg-neutral-700'
              : 'bg-yellow-400 text-black hover:bg-yellow-300 shadow-yellow-500/20 active:scale-[0.99]'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-current animate-pulse" />
              <span>PAUSAR PENSAMENTO DA IA</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>INICIAR RACIOCÍNIO DA IA</span>
            </>
          )}
        </button>

        {/* Secondary controls: Avançar 1 passo e Recomeçar */}
        <div className="flex items-center gap-2">
          <button
            onClick={onStepForward}
            disabled={isRunning}
            className="flex-1 py-1.5 px-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 disabled:opacity-40 text-xs font-semibold transition-colors border border-neutral-800 flex items-center justify-center gap-1.5"
            title="Avança apenas uma etapa no pensamento da IA"
          >
            <StepForward className="w-3.5 h-3.5 text-yellow-400" />
            <span>Avançar 1 Passo</span>
          </button>
          
          <button
            onClick={onReset}
            className="py-1.5 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors border border-neutral-800 flex items-center gap-1 text-xs"
            title="Volta ao estado inicial"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Recomeçar</span>
          </button>
        </div>
      </div>

    </aside>
  );
};
