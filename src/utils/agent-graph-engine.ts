import { AgentNode, AgentEdge, AgentScenario, ExecutionMetrics, StepUpdate, NodeType, ToolType } from '../types/agent-graph';

/**
 * Calculates telemetry metrics across all nodes in the graph
 */
export function calculateMetrics(nodes: AgentNode[]): ExecutionMetrics {
  let totalLatencyMs = 0;
  let promptTokens = 0;
  let completionTokens = 0;
  let toolCallCount = 0;
  let correctionCount = 0;
  let completedNodes = 0;

  for (const node of nodes) {
    if (node.status === 'success' || node.status === 'correction') {
      completedNodes++;
    }
    if (node.executionTimeMs) {
      totalLatencyMs += node.executionTimeMs;
    }
    if (node.tokens) {
      promptTokens += node.tokens.prompt || 0;
      completionTokens += node.tokens.completion || 0;
    }
    if (node.type === 'tool_call') {
      toolCallCount++;
    }
    if (node.type === 'reflection' || node.status === 'correction') {
      correctionCount++;
    }
  }

  const totalTokens = promptTokens + completionTokens;
  // Gemini 2.5/3.8 Flash pricing estimate: ~$0.10 / 1M input tokens, ~$0.40 / 1M output tokens
  const estimatedCostUsd = (promptTokens * 0.0000001) + (completionTokens * 0.0000004);

  return {
    totalLatencyMs,
    totalTokens,
    promptTokens,
    completionTokens,
    estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),
    toolCallCount,
    correctionCount,
    completedNodes,
    totalNodes: nodes.length,
  };
}

/**
 * Computes SVG bezier curve connection path between two nodes
 */
export function getBezierPath(
  source: { x: number; y: number },
  target: { x: number; y: number },
  nodeWidth = 260,
  nodeHeight = 110
): { path: string; midX: number; midY: number } {
  const startX = source.x + nodeWidth;
  const startY = source.y + nodeHeight / 2;

  const endX = target.x;
  const endY = target.y + nodeHeight / 2;

  const dx = Math.abs(endX - startX);
  const controlOffset = Math.max(dx * 0.5, 60);

  const cp1x = startX + controlOffset;
  const cp1y = startY;
  const cp2x = endX - controlOffset;
  const cp2y = endY;

  const path = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  return { path, midX, midY };
}

/**
 * High-fidelity demonstration scenarios with positive, constructive and welcoming terminology
 */
export const PRELOADED_SCENARIOS: AgentScenario[] = [
  {
    id: 'crypto-finance-optimization',
    title: 'Análise & Otimização de Carteira de Criptoativos',
    tagline: 'Estudo quantitativo de eficiência e paridade BTC/ETH 30D',
    category: 'finance',
    description: 'O agente processa uma análise comparativa de retorno e estabilidade, consulta indicadores de mercado em tempo real, efetua cálculo estatístico de média móvel e elabora recomendações claras de equilíbrio para o usuário.',
    prompt: 'Compare os retornos médios e Sharpe ratio de BTC e ETH dos últimos 30 dias e recomende a melhor proporção de balanceamento.',
    nodes: [
      {
        id: 'node-1',
        type: 'goal',
        title: 'Objetivo do Usuário',
        subtitle: 'Otimização de Portfólio',
        status: 'pending',
        level: 0,
        x: 60,
        y: 200,
        inputData: {
          prompt: 'Compare os retornos médios e Sharpe ratio de BTC e ETH dos últimos 30 dias...',
          portfolioTarget: 'Eficiência e Equilíbrio',
          baseCurrency: 'USD'
        },
        reasoning: 'Interpretação da solicitação focada em maximizar consistência e clareza analítica para o investidor.'
      },
      {
        id: 'node-2',
        type: 'planner',
        title: 'Decomposição & Planejamento',
        subtitle: 'Estruturação de Subtarefas',
        status: 'pending',
        level: 1,
        x: 380,
        y: 200,
        inputData: {
          tasks: [
            '1. Consultar cotações diárias consolidadas de BTC e ETH',
            '2. Alinhar intervalo temporal e calcular métricas estatísticas',
            '3. Executar rotina em Python para Sharpe Ratio e Volatilidade',
            '4. Validar consistência dos resultados gerados',
            '5. Sintetizar relatório acessível e amigável'
          ]
        },
        reasoning: 'Planejamento transparente dividido em etapas metódicas com validação prévia antes da síntese final.'
      },
      {
        id: 'node-3',
        type: 'tool_call',
        toolType: 'api_fetch',
        title: 'Coleta de Preços Históricos',
        subtitle: 'Tool: market_price_feed',
        status: 'pending',
        level: 2,
        x: 720,
        y: 100,
        inputData: {
          endpoint: '/v3/coins/historical_range',
          assets: ['BTC', 'ETH'],
          window: '30d',
          metrics: ['close', 'volume_usd']
        },
        outputData: {
          btcCandles: 30,
          ethCandles: 30,
          status: 'SUCCESS_SYNCHRONIZED',
          note: 'Série temporal completa com 30 amostras diárias consolidadas.'
        },
        executionTimeMs: 380,
        tokens: { prompt: 440, completion: 180, total: 620 },
        reasoning: 'Dados coletados e estruturados com sucesso para o cálculo estatístico.'
      },
      {
        id: 'node-4',
        type: 'reflection',
        title: 'Reflexão & Validação de Qualidade',
        subtitle: 'Confirmação de Consistência',
        status: 'pending',
        level: 3,
        x: 1060,
        y: 100,
        inputData: {
          btcSamples: 30,
          ethSamples: 30,
          dataIntegrity: '100% verificado'
        },
        outputData: {
          decision: 'DATASET_APPROVED',
          confidenceScore: 0.998,
          validationNote: 'Indicadores consistentes e prontos para modelagem quantitativa.'
        },
        executionTimeMs: 240,
        tokens: { prompt: 480, completion: 160, total: 640 },
        reasoning: 'O agente confirmou a integridade dos dados e garantiu que o cálculo subsequente terá alta precisão.'
      },
      {
        id: 'node-5',
        type: 'tool_call',
        toolType: 'code_interpreter',
        title: 'Cálculo Estatístico em Python',
        subtitle: 'Tool: python_quant_runner',
        status: 'pending',
        level: 4,
        x: 1400,
        y: 200,
        inputData: {
          script: 'import numpy as np\nsharpe_btc = (mean_btc - rf) / std_btc * np.sqrt(365)\nsharpe_eth = (mean_eth - rf) / std_eth * np.sqrt(365)',
          benchmark: 'S&P 500 Risk-Free 4.25%'
        },
        outputData: {
          btc: { annualizedReturn: '+38.4%', sharpeRatio: 1.84, volatility: '42.1%' },
          eth: { annualizedReturn: '+29.6%', sharpeRatio: 1.35, volatility: '51.8%' },
          suggestedAllocation: '65% BTC / 35% ETH'
        },
        executionTimeMs: 560,
        tokens: { prompt: 780, completion: 290, total: 1070 },
        reasoning: 'Cálculo matemático executado em ambiente isolado fornecendo resultados exatos.'
      },
      {
        id: 'node-6',
        type: 'final_output',
        title: 'Relatório Executivo Consolidado',
        subtitle: 'Recomendação Amigável',
        status: 'pending',
        level: 5,
        x: 1740,
        y: 200,
        inputData: {
          metricsCalculated: true,
          audience: 'Investidor Pessoal'
        },
        outputData: {
          summary: 'Ambos os ativos apresentaram desempenho consistente nos últimos 30 dias.',
          allocation: 'A proporção de 65% BTC e 35% ETH oferece uma relação retorno-risco otimizada.',
          tip: 'Rebalanceamentos mensais ajudam a manter a exposição dentro da zona de conforto desejada.'
        },
        executionTimeMs: 340,
        tokens: { prompt: 940, completion: 380, total: 1320 },
        reasoning: 'Apresentação em linguagem acessível, transparente e positiva com foco na tomada de decisão do usuário.'
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', label: 'Compreensão', status: 'idle' },
      { id: 'e2-3', source: 'node-2', target: 'node-3', label: 'Consultar API', status: 'idle' },
      { id: 'e3-4', source: 'node-3', target: 'node-4', label: 'Validação', status: 'idle' },
      { id: 'e4-5', source: 'node-4', target: 'node-5', label: 'Cálculo', status: 'idle' },
      { id: 'e5-6', source: 'node-5', target: 'node-6', label: 'Síntese', status: 'idle' }
    ],
    executionSequence: [
      { nodeId: 'node-1', status: 'running', delayMs: 500 },
      { nodeId: 'node-1', status: 'success', executionTimeMs: 130, tokens: { prompt: 190, completion: 70, total: 260 }, activeEdgeIds: ['e1-2'], delayMs: 700 },
      { nodeId: 'node-2', status: 'running', delayMs: 700, activeEdgeIds: ['e1-2'] },
      { nodeId: 'node-2', status: 'success', executionTimeMs: 280, tokens: { prompt: 380, completion: 150, total: 530 }, completedEdgeIds: ['e1-2'], activeEdgeIds: ['e2-3'], delayMs: 700 },
      { nodeId: 'node-3', status: 'running', delayMs: 900, activeEdgeIds: ['e2-3'] },
      { nodeId: 'node-3', status: 'success', executionTimeMs: 380, tokens: { prompt: 440, completion: 180, total: 620 }, completedEdgeIds: ['e2-3'], activeEdgeIds: ['e3-4'], delayMs: 800 },
      { nodeId: 'node-4', status: 'running', delayMs: 800, activeEdgeIds: ['e3-4'] },
      { nodeId: 'node-4', status: 'correction', executionTimeMs: 240, tokens: { prompt: 480, completion: 160, total: 640 }, completedEdgeIds: ['e3-4'], activeEdgeIds: ['e4-5'], delayMs: 800 },
      { nodeId: 'node-5', status: 'running', delayMs: 1100, activeEdgeIds: ['e4-5'] },
      { nodeId: 'node-5', status: 'success', executionTimeMs: 560, tokens: { prompt: 780, completion: 290, total: 1070 }, completedEdgeIds: ['e4-5'], activeEdgeIds: ['e5-6'], delayMs: 800 },
      { nodeId: 'node-6', status: 'running', delayMs: 900, activeEdgeIds: ['e5-6'] },
      { nodeId: 'node-6', status: 'success', executionTimeMs: 340, tokens: { prompt: 940, completion: 380, total: 1320 }, completedEdgeIds: ['e5-6'], delayMs: 400 }
    ]
  },
  {
    id: 'performance-optimization',
    title: 'Otimização de Desempenho e Arquitetura',
    tagline: 'Estratégia de aceleração de resposta e cache inteligente',
    category: 'engineering',
    description: 'O agente analisa a arquitetura de uma aplicação, consulta documentações de boas práticas em nuvem, compara estratégias de cache em memória, projeta ganho de velocidade de 8x e gera um guia de modernização claro.',
    prompt: 'Proponha uma arquitetura de cache eficiente para reduzir o tempo de resposta da aplicação de 320ms para menos de 40ms.',
    nodes: [
      {
        id: 'perf-1',
        type: 'goal',
        title: 'Meta de Desempenho',
        subtitle: 'Aceleração de Aplicação',
        status: 'pending',
        level: 0,
        x: 60,
        y: 200,
        inputData: {
          targetLatency: '< 40ms',
          currentLatency: '320ms',
          goal: 'Melhorar a fluidez e a experiência do usuário final'
        },
        reasoning: 'Compreensão do objetivo de engenharia: elevar a velocidade percebida e a satisfação do usuário.'
      },
      {
        id: 'perf-2',
        type: 'planner',
        title: 'Plano de Otimização',
        subtitle: 'Estratégia de Engenharia',
        status: 'pending',
        level: 1,
        x: 380,
        y: 200,
        inputData: {
          steps: [
            '1. Analisar padrões de leitura frequente nas rotas principais',
            '2. Consultar documentações modernas de camadas de cache',
            '3. Avaliar trade-offs entre simplicidade e performance',
            '4. Validar arquitetura recomendada',
            '5. Elaborar plano de implementação gradual'
          ]
        },
        reasoning: 'Estruturação de um caminho técnico seguro e não destrutivo, priorizando facilidade de manutenção.'
      },
      {
        id: 'perf-3',
        type: 'tool_call',
        toolType: 'code_interpreter',
        title: 'Mapeamento de Rotas',
        subtitle: 'Tool: telemetry_access_analyzer',
        status: 'pending',
        level: 2,
        x: 720,
        y: 80,
        inputData: {
          metricTarget: 'read_write_ratio',
          topEndpoints: ['/api/products', '/api/user/feed', '/api/search']
        },
        outputData: {
          readRatio: '92% leituras repetidas',
          cachingOpportunity: 'Elevada (dados com validade de 5 a 15 minutos)'
        },
        executionTimeMs: 320,
        tokens: { prompt: 540, completion: 210, total: 750 },
        reasoning: 'A grande maioria das requisições são leituras de dados estáveis, ideais para aceleração por cache.'
      },
      {
        id: 'perf-4',
        type: 'tool_call',
        toolType: 'web_search',
        title: 'Boas Práticas & Referências',
        subtitle: 'Tool: tech_docs_search',
        status: 'pending',
        level: 2,
        x: 720,
        y: 320,
        inputData: {
          topic: 'Stale-While-Revalidate and Distributed In-Memory Cache best practices',
          focus: 'Low latency & High developer ergonomics'
        },
        outputData: {
          recommendedPattern: 'Cache-Aside com Stale-While-Revalidate',
          expectedLatencyGain: 'De 320ms para ~28ms no p95'
        },
        executionTimeMs: 440,
        tokens: { prompt: 490, completion: 230, total: 720 },
        reasoning: 'Identificado padrão consolidado na indústria que entrega resposta instantânea com atualização suave em segundo plano.'
      },
      {
        id: 'perf-5',
        type: 'reflection',
        title: 'Reflexão & Balanço de Soluções',
        subtitle: 'Escolha da Abordagem Ideal',
        status: 'pending',
        level: 3,
        x: 1060,
        y: 200,
        inputData: {
          optionA: 'Cache simples em memória local',
          optionB: 'Camada distribuída desacoplada'
        },
        outputData: {
          decision: 'CHOSEN_BALANCED_APPROACH',
          rationale: 'A camada distribuída com expiração inteligente garante escalabilidade sem complexidade desnecessária.'
        },
        executionTimeMs: 260,
        tokens: { prompt: 610, completion: 180, total: 790 },
        reasoning: 'O agente comparou os prós e contras, optando pela arquitetura que oferece o melhor retorno com menor esforço da equipe.'
      },
      {
        id: 'perf-6',
        type: 'final_output',
        title: 'Arquitetura Proposta & Guia',
        subtitle: 'Solução de Alta Performance',
        status: 'pending',
        level: 4,
        x: 1400,
        y: 200,
        inputData: {
          deliverable: 'Plano de Implementação com Exemplos'
        },
        outputData: {
          solution: 'Implementação de Cache-Aside com chave composta por ID do recurso.',
          projectedResults: 'Tempo de resposta reduzido em 88% (latência p95 cai para 32ms).',
          rollout: 'Etapa 1 em ambiente de homologação -> Etapa 2 ativação gradual sem indisponibilidade.'
        },
        executionTimeMs: 380,
        tokens: { prompt: 860, completion: 390, total: 1250 },
        reasoning: 'Entrega final com orientações práticas, código limpo e estimativas transparentes de ganho de desempenho.'
      }
    ],
    edges: [
      { id: 'pe1-2', source: 'perf-1', target: 'perf-2', label: 'Alinhamento', status: 'idle' },
      { id: 'pe2-3', source: 'perf-2', target: 'perf-3', label: 'Analisar Uso', status: 'idle' },
      { id: 'pe2-4', source: 'perf-2', target: 'perf-4', label: 'Docs Melhores', status: 'idle' },
      { id: 'pe3-5', source: 'perf-3', target: 'perf-5', label: 'Métricas', status: 'idle' },
      { id: 'pe4-5', source: 'perf-4', target: 'perf-5', label: 'Boas Práticas', status: 'idle' },
      { id: 'pe5-6', source: 'perf-5', target: 'perf-6', label: 'Recomendação', status: 'idle' }
    ],
    executionSequence: [
      { nodeId: 'perf-1', status: 'running', delayMs: 500 },
      { nodeId: 'perf-1', status: 'success', executionTimeMs: 110, tokens: { prompt: 170, completion: 60, total: 230 }, activeEdgeIds: ['pe1-2'], delayMs: 700 },
      { nodeId: 'perf-2', status: 'running', delayMs: 700, activeEdgeIds: ['pe1-2'] },
      { nodeId: 'perf-2', status: 'success', executionTimeMs: 260, tokens: { prompt: 340, completion: 140, total: 480 }, completedEdgeIds: ['pe1-2'], activeEdgeIds: ['pe2-3', 'pe2-4'], delayMs: 700 },
      { nodeId: 'perf-3', status: 'running', delayMs: 800, activeEdgeIds: ['pe2-3'] },
      { nodeId: 'perf-4', status: 'running', delayMs: 1000, activeEdgeIds: ['pe2-4'] },
      { nodeId: 'perf-3', status: 'success', executionTimeMs: 320, tokens: { prompt: 540, completion: 210, total: 750 }, completedEdgeIds: ['pe2-3'], activeEdgeIds: ['pe3-5'], delayMs: 600 },
      { nodeId: 'perf-4', status: 'success', executionTimeMs: 440, tokens: { prompt: 490, completion: 230, total: 720 }, completedEdgeIds: ['pe2-4'], activeEdgeIds: ['pe4-5'], delayMs: 700 },
      { nodeId: 'perf-5', status: 'running', delayMs: 900, activeEdgeIds: ['pe3-5', 'pe4-5'] },
      { nodeId: 'perf-5', status: 'correction', executionTimeMs: 260, tokens: { prompt: 610, completion: 180, total: 790 }, completedEdgeIds: ['pe3-5', 'pe4-5'], activeEdgeIds: ['pe5-6'], delayMs: 800 },
      { nodeId: 'perf-6', status: 'running', delayMs: 1000, activeEdgeIds: ['pe5-6'] },
      { nodeId: 'perf-6', status: 'success', executionTimeMs: 380, tokens: { prompt: 860, completion: 390, total: 1250 }, completedEdgeIds: ['pe5-6'], delayMs: 400 }
    ]
  },
  {
    id: 'customer-care-delight',
    title: 'Atendimento Amigável & Suporte ao Cliente',
    tagline: 'Resolução ágil e aplicação de benefício cortesia',
    category: 'support',
    description: 'Cliente solicita apoio para ajuste de endereço de entrega. O agente consulta o pedido com cordialidade, identifica elegibilidade para upgrade de entrega prioritária e confirma o atendimento com mensagem acolhedora.',
    prompt: 'Atender solicitação da cliente Mariana com cortesia, agilizando o envio e aplicando benefício cortesia de entrega expressa.',
    nodes: [
      {
        id: 'sup-1',
        type: 'goal',
        title: 'Solicitação da Cliente',
        subtitle: 'Atendimento Cordial',
        status: 'pending',
        level: 0,
        x: 60,
        y: 200,
        inputData: {
          customer: 'Mariana Duarte',
          orderId: 'ORD-84920',
          message: 'Olá! Gostaria de saber se é possível antecipar o envio do meu pedido para esta sexta-feira.'
        },
        reasoning: 'Recepção de pedido amigável, orientando a postura para máximo acolhimento e agilidade.'
      },
      {
        id: 'sup-2',
        type: 'planner',
        title: 'Planejamento do Atendimento',
        subtitle: 'Roteiro de Resolução Positiva',
        status: 'pending',
        level: 1,
        x: 380,
        y: 200,
        inputData: {
          steps: [
            '1. Consultar detalhes do pedido ORD-84920 no sistema',
            '2. Verificar programas de fidelidade e cortesias disponíveis',
            '3. Ativar upgrade cortesia para frete prioritário sem custo adicional',
            '4. Gerar mensagem carinhosa e clara com novo prazo'
          ]
        },
        reasoning: 'Foco em transformar um atendimento comum em uma experiência acolhedora e memorável.'
      },
      {
        id: 'sup-3',
        type: 'tool_call',
        toolType: 'database_query',
        title: 'Consulta ao Sistema',
        subtitle: 'Tool: orders_database_query',
        status: 'pending',
        level: 2,
        x: 720,
        y: 100,
        inputData: {
          sql: 'SELECT id, status, customer_tier FROM orders WHERE id = "ORD-84920"',
          schema: 'customer_care'
        },
        outputData: {
          orderId: 'ORD-84920',
          customerTier: 'Cliente Estrela (Fidelidade Ouro)',
          eligibleForPriorityUpgrade: true,
          warehouseStatus: 'Pronto para empacotamento'
        },
        executionTimeMs: 220,
        tokens: { prompt: 390, completion: 140, total: 530 },
        reasoning: 'Identificado que Mariana é cliente especial, perfeitamente elegível ao benefício cortesia.'
      },
      {
        id: 'sup-4',
        type: 'reflection',
        title: 'Reflexão & Escolha de Benefício',
        subtitle: 'Valorização do Cliente',
        status: 'pending',
        level: 3,
        x: 1060,
        y: 100,
        inputData: {
          eligible: true,
          options: ['Desconto futuro', 'Frete Expresso Gratuito Imediato']
        },
        outputData: {
          chosenBenefit: 'Frete Expresso Prioritário Cortesia',
          reason: 'Atende diretamente ao desejo da cliente de receber o produto ainda nesta semana.'
        },
        executionTimeMs: 250,
        tokens: { prompt: 520, completion: 170, total: 690 },
        reasoning: 'O agente optou pela solução que resolve a expectativa da cliente de forma imediata e generosa.'
      },
      {
        id: 'sup-5',
        type: 'tool_call',
        toolType: 'crm_action',
        title: 'Ativação do Benefício',
        subtitle: 'Tool: dispatch_priority_upgrade',
        status: 'pending',
        level: 4,
        x: 1400,
        y: 200,
        inputData: {
          orderId: 'ORD-84920',
          action: 'apply_complimentary_express',
          feeWaived: true
        },
        outputData: {
          upgradeStatus: 'CONFIRMED',
          estimatedArrival: 'Sexta-feira até às 17h',
          trackingCode: 'BR-EXP-99214'
        },
        executionTimeMs: 360,
        tokens: { prompt: 510, completion: 160, total: 670 },
        reasoning: 'Upgrade efetuado com sucesso nos sistemas integrados de expedição.'
      },
      {
        id: 'sup-6',
        type: 'final_output',
        title: 'Mensagem Amigável & Protocolo',
        subtitle: 'Comunicação Encantadora',
        status: 'pending',
        level: 5,
        x: 1740,
        y: 200,
        inputData: {
          channel: 'Chat ao Vivo',
          tone: 'Cordial, Caloroso e Eficiente'
        },
        outputData: {
          message: 'Olá Mariana! Boas notícias: ativamos uma cortesia especial em sua conta e seu pedido foi atualizado para entrega expressa com chegada prevista para esta sexta-feira! Código de rastreamento: BR-EXP-99214. Conte sempre conosco!',
          protocol: 'ATEND-2026-77821'
        },
        executionTimeMs: 310,
        tokens: { prompt: 710, completion: 260, total: 970 },
        reasoning: 'Comunicação final acolhedora, fornecendo informações úteis e fortalecendo o relacionamento.'
      }
    ],
    edges: [
      { id: 'se1-2', source: 'sup-1', target: 'sup-2', label: 'Acolhimento', status: 'idle' },
      { id: 'se2-3', source: 'sup-2', target: 'sup-3', label: 'Consultar Perfil', status: 'idle' },
      { id: 'se3-4', source: 'sup-3', target: 'sup-4', label: 'Elegibilidade', status: 'idle' },
      { id: 'se4-5', source: 'sup-4', target: 'sup-5', label: 'Ativar Cortesia', status: 'idle' },
      { id: 'se5-6', source: 'sup-5', target: 'sup-6', label: 'Confirmar', status: 'idle' }
    ],
    executionSequence: [
      { nodeId: 'sup-1', status: 'running', delayMs: 500 },
      { nodeId: 'sup-1', status: 'success', executionTimeMs: 110, tokens: { prompt: 160, completion: 60, total: 220 }, activeEdgeIds: ['se1-2'], delayMs: 600 },
      { nodeId: 'sup-2', status: 'running', delayMs: 700, activeEdgeIds: ['se1-2'] },
      { nodeId: 'sup-2', status: 'success', executionTimeMs: 250, tokens: { prompt: 320, completion: 130, total: 450 }, completedEdgeIds: ['se1-2'], activeEdgeIds: ['se2-3'], delayMs: 700 },
      { nodeId: 'sup-3', status: 'running', delayMs: 800, activeEdgeIds: ['se2-3'] },
      { nodeId: 'sup-3', status: 'success', executionTimeMs: 220, tokens: { prompt: 390, completion: 140, total: 530 }, completedEdgeIds: ['se2-3'], activeEdgeIds: ['se3-4'], delayMs: 700 },
      { nodeId: 'sup-4', status: 'running', delayMs: 800, activeEdgeIds: ['se3-4'] },
      { nodeId: 'sup-4', status: 'correction', executionTimeMs: 250, tokens: { prompt: 520, completion: 170, total: 690 }, completedEdgeIds: ['se3-4'], activeEdgeIds: ['se4-5'], delayMs: 800 },
      { nodeId: 'sup-5', status: 'running', delayMs: 900, activeEdgeIds: ['se4-5'] },
      { nodeId: 'sup-5', status: 'success', executionTimeMs: 360, tokens: { prompt: 510, completion: 160, total: 670 }, completedEdgeIds: ['se4-5'], activeEdgeIds: ['se5-6'], delayMs: 800 },
      { nodeId: 'sup-6', status: 'running', delayMs: 900, activeEdgeIds: ['se5-6'] },
      { nodeId: 'sup-6', status: 'success', executionTimeMs: 310, tokens: { prompt: 710, completion: 260, total: 970 }, completedEdgeIds: ['se5-6'], delayMs: 400 }
    ]
  }
];

/**
 * Generates an adaptive multi-step DAG for custom user prompts
 */
export function generateDynamicAgentGraph(prompt: string): {
  nodes: AgentNode[];
  edges: AgentEdge[];
  executionSequence: StepUpdate[];
} {
  const cleanPrompt = prompt.trim() || 'Processar requisição personalizada';
  const isCodeQuery = /code|desempenho|performance|otimiza|python|js|ts|sql|arquitetura/i.test(cleanPrompt);
  const isSearchQuery = /busca|pesquisa|notícia|hoje|preço|mercado|quais|como/i.test(cleanPrompt);

  const nodes: AgentNode[] = [
    {
      id: 'custom-1',
      type: 'goal',
      title: 'Prompt do Usuário',
      subtitle: 'Entrada Inicial',
      status: 'pending',
      level: 0,
      x: 60,
      y: 200,
      inputData: { prompt: cleanPrompt, submittedAt: new Date().toISOString() },
      reasoning: 'Recepção da solicitação do usuário e início do processo cognitivo autônomo.'
    },
    {
      id: 'custom-2',
      type: 'planner',
      title: 'Planejamento Cognitivo',
      subtitle: 'Estruturação da Tarefa',
      status: 'pending',
      level: 1,
      x: 380,
      y: 200,
      inputData: {
        intentClassification: isCodeQuery ? 'engineering_optimization' : isSearchQuery ? 'information_retrieval' : 'collaborative_reasoning',
        estimatedSteps: 5
      },
      reasoning: 'Decomposição do objetivo em premissas lógicas, chamadas de ferramentas e síntese consistente.'
    },
    {
      id: 'custom-3',
      type: 'tool_call',
      toolType: isCodeQuery ? 'code_interpreter' : 'web_search',
      title: isCodeQuery ? 'Análise Computacional' : 'Pesquisa de Informações',
      subtitle: isCodeQuery ? 'Tool: code_sandbox' : 'Tool: live_web_search',
      status: 'pending',
      level: 2,
      x: 720,
      y: 100,
      inputData: { query: cleanPrompt.slice(0, 80), depth: 'comprehensive' },
      outputData: {
        matchesFound: 4,
        confidence: 0.96,
        summary: `Dados contextuais levantados com sucesso para "${cleanPrompt.slice(0, 40)}..."`
      },
      executionTimeMs: 380,
      tokens: { prompt: 520, completion: 200, total: 720 },
      reasoning: 'Coleta de referências essenciais para embasar a resposta com precisão e clareza.'
    },
    {
      id: 'custom-4',
      type: 'reflection',
      title: 'Autorreflexão & Validação',
      subtitle: 'Avaliação de Coerência',
      status: 'pending',
      level: 3,
      x: 1060,
      y: 100,
      inputData: { checkClarity: true, threshold: 0.95 },
      outputData: {
        evaluated: true,
        coherenceScore: 0.99,
        validationStatus: 'APROVADO',
        notes: 'Argumentação consistente, amigável e pronta para o usuário.'
      },
      executionTimeMs: 250,
      tokens: { prompt: 420, completion: 140, total: 560 },
      reasoning: 'O agente checou a consistência das conclusões para assegurar uma entrega de alto valor e fácil compreensão.'
    },
    {
      id: 'custom-5',
      type: 'final_output',
      title: 'Resposta Sintetizada',
      subtitle: 'Conclusão Acessível',
      status: 'pending',
      level: 4,
      x: 1400,
      y: 200,
      inputData: { format: 'structured_text', tone: 'helpful' },
      outputData: {
        response: `Processamento concluído com êxito para a solicitação: "${cleanPrompt}". Todos os passos de raciocínio e validação foram finalizados.`,
        status: 'SUCCESS'
      },
      executionTimeMs: 320,
      tokens: { prompt: 790, completion: 290, total: 1080 },
      reasoning: 'Entrega da síntese final clara e estruturada para o usuário.'
    }
  ];

  const edges: AgentEdge[] = [
    { id: 'ce1-2', source: 'custom-1', target: 'custom-2', label: 'Compreensão', status: 'idle' },
    { id: 'ce2-3', source: 'custom-2', target: 'custom-3', label: 'Ferramenta', status: 'idle' },
    { id: 'ce3-4', source: 'custom-3', target: 'custom-4', label: 'Validação', status: 'idle' },
    { id: 'ce4-5', source: 'custom-4', target: 'custom-5', label: 'Síntese', status: 'idle' }
  ];

  const executionSequence: StepUpdate[] = [
    { nodeId: 'custom-1', status: 'running', delayMs: 400 },
    { nodeId: 'custom-1', status: 'success', executionTimeMs: 100, tokens: { prompt: 150, completion: 50, total: 200 }, activeEdgeIds: ['ce1-2'], delayMs: 600 },
    { nodeId: 'custom-2', status: 'running', delayMs: 700, activeEdgeIds: ['ce1-2'] },
    { nodeId: 'custom-2', status: 'success', executionTimeMs: 240, tokens: { prompt: 290, completion: 110, total: 400 }, completedEdgeIds: ['ce1-2'], activeEdgeIds: ['ce2-3'], delayMs: 700 },
    { nodeId: 'custom-3', status: 'running', delayMs: 800, activeEdgeIds: ['ce2-3'] },
    { nodeId: 'custom-3', status: 'success', executionTimeMs: 380, tokens: { prompt: 520, completion: 200, total: 720 }, completedEdgeIds: ['ce2-3'], activeEdgeIds: ['ce3-4'], delayMs: 800 },
    { nodeId: 'custom-4', status: 'running', delayMs: 700, activeEdgeIds: ['ce3-4'] },
    { nodeId: 'custom-4', status: 'success', executionTimeMs: 250, tokens: { prompt: 420, completion: 140, total: 560 }, completedEdgeIds: ['ce3-4'], activeEdgeIds: ['ce4-5'], delayMs: 800 },
    { nodeId: 'custom-5', status: 'running', delayMs: 800, activeEdgeIds: ['ce4-5'] },
    { nodeId: 'custom-5', status: 'success', executionTimeMs: 320, tokens: { prompt: 790, completion: 290, total: 1080 }, completedEdgeIds: ['ce4-5'], delayMs: 400 }
  ];

  return { nodes, edges, executionSequence };
}
