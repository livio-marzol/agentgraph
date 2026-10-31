export type NodeType = 'goal' | 'planner' | 'tool_call' | 'reflection' | 'final_output';

export type ToolType = 
  | 'web_search' 
  | 'code_interpreter' 
  | 'database_query' 
  | 'api_fetch' 
  | 'crm_action' 
  | 'custom';

export type NodeStatus = 'pending' | 'running' | 'success' | 'error' | 'correction';

export interface TokenMetrics {
  prompt: number;
  completion: number;
  total: number;
}

export interface AgentNode {
  id: string;
  type: NodeType;
  title: string;
  subtitle: string;
  status: NodeStatus;
  toolType?: ToolType;
  x: number;
  y: number;
  level: number;
  inputData?: Record<string, unknown> | string;
  outputData?: Record<string, unknown> | string;
  executionTimeMs?: number;
  tokens?: TokenMetrics;
  reasoning?: string;
  codeSnippet?: string;
  error?: string;
  retryAttempt?: number;
}

export interface AgentEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  status: 'idle' | 'active' | 'completed' | 'failed';
  dataFlow?: string;
}

export interface StepUpdate {
  nodeId: string;
  status: NodeStatus;
  executionTimeMs?: number;
  tokens?: TokenMetrics;
  inputData?: Record<string, unknown> | string;
  outputData?: Record<string, unknown> | string;
  reasoning?: string;
  error?: string;
  activeEdgeIds?: string[];
  completedEdgeIds?: string[];
  delayMs?: number;
}

export interface AgentScenario {
  id: string;
  title: string;
  tagline: string;
  category: 'finance' | 'engineering' | 'support' | 'custom';
  description: string;
  prompt: string;
  nodes: AgentNode[];
  edges: AgentEdge[];
  executionSequence: StepUpdate[];
}

export interface ExecutionMetrics {
  totalLatencyMs: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  estimatedCostUsd: number;
  toolCallCount: number;
  correctionCount: number;
  completedNodes: number;
  totalNodes: number;
}
