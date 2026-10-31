import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Health check and environment probe
app.get('/api/status', (_req: Request, res: Response) => {
  const hasServerApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);
  res.json({
    status: 'ok',
    hasServerApiKey,
    defaultModel: 'gemini-3.8-flash',
    timestamp: new Date().toISOString()
  });
});

// Real Gemini Agent Run endpoint
app.post('/api/agent/run', async (req: Request, res: Response) => {
  const { prompt, model: requestedModel, apiKey: clientApiKey } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const effectiveApiKey = clientApiKey || process.env.GEMINI_API_KEY;

  if (!effectiveApiKey) {
    return res.status(400).json({
      error: 'GEMINI_API_KEY não configurada no servidor ou não fornecida.',
      requiresKey: true
    });
  }

  const startTime = Date.now();
  const modelName = requestedModel || 'gemini-3.8-flash';

  try {
    const ai = new GoogleGenAI({
      apiKey: effectiveApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // We configure a structured agent prompt instructing Gemini to break down the task,
    // define tools called, self-reflections, and synthesize the final answer.
    const systemInstruction = `You are an Autonomous AI Agent Graph Engine.
Analyze the user request and generate the complete execution trace as a structured JSON object representing a Directed Acyclic Graph (DAG) of the agent's thought process.

Return the following structure:
{
  "summary": "Brief explanation of agent journey",
  "steps": [
    {
      "stepId": "step-1",
      "type": "goal", // one of: 'goal', 'planner', 'tool_call', 'reflection', 'final_output'
      "title": "Short title",
      "subtitle": "Short descriptive role",
      "toolType": null, // if tool_call: 'web_search' | 'code_interpreter' | 'database_query' | 'api_fetch' | 'crm_action'
      "inputData": { ... },
      "outputData": { ... },
      "reasoning": "Internal chain of thought rationale for this step",
      "executionTimeMs": 150
    }
  ]
}

Ensure there is:
1. One initial 'goal' node
2. One 'planner' node decomposing the plan
3. At least one or two 'tool_call' nodes with real or simulated tool inputs/outputs
4. One 'reflection' node evaluating results and validating accuracy
5. One 'final_output' node with the comprehensive synthesized conclusion.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const elapsedTotalMs = Date.now() - startTime;
    const responseText = response.text || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = {
        summary: 'Agent reasoning cycle complete',
        steps: [
          {
            stepId: 'step-1',
            type: 'goal',
            title: 'Objetivo do Usuário',
            subtitle: 'Entrada Inicial',
            inputData: { prompt },
            reasoning: 'Interpretação da solicitação inicial.',
            executionTimeMs: 120
          },
          {
            stepId: 'step-2',
            type: 'planner',
            title: 'Planejamento Cognitivo',
            subtitle: 'Estratégia de Execução',
            inputData: { rawOutput: responseText.slice(0, 300) },
            reasoning: 'Decomposição em premissas lógicas.',
            executionTimeMs: 240
          },
          {
            stepId: 'step-3',
            type: 'final_output',
            title: 'Resposta do Modelo',
            subtitle: 'Conclusão Gemini',
            outputData: { text: responseText },
            reasoning: 'Síntese das respostas apuradas.',
            executionTimeMs: 380
          }
        ]
      };
    }

    const steps = Array.isArray(parsed.steps) ? parsed.steps : [];
    
    // Convert steps to nodes and edges with layout
    const nodes = steps.map((step: any, index: number) => {
      const type = ['goal', 'planner', 'tool_call', 'reflection', 'final_output'].includes(step.type)
        ? step.type
        : index === 0 ? 'goal' : index === steps.length - 1 ? 'final_output' : 'tool_call';

      // Auto layout coordinate
      const x = 60 + index * 340;
      // Stagger Y slightly for tools or reflections
      const y = type === 'tool_call' ? 120 : type === 'reflection' ? 280 : 200;

      return {
        id: step.stepId || `gemini-node-${index + 1}`,
        type,
        toolType: step.toolType || (type === 'tool_call' ? 'web_search' : undefined),
        title: step.title || `Passo ${index + 1}`,
        subtitle: step.subtitle || (type === 'tool_call' ? 'Tool Call' : 'Raciocínio'),
        status: 'pending',
        level: index,
        x,
        y,
        inputData: step.inputData || { prompt },
        outputData: step.outputData || { status: 'OK' },
        reasoning: step.reasoning || 'Avaliação heurística do agente.',
        executionTimeMs: step.executionTimeMs || Math.floor(150 + Math.random() * 300),
        tokens: {
          prompt: Math.floor(200 + index * 120),
          completion: Math.floor(80 + index * 50),
          total: Math.floor(280 + index * 170)
        }
      };
    });

    // Connect sequential and parallel edges
    const edges = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push({
        id: `ge-${nodes[i].id}-${nodes[i + 1].id}`,
        source: nodes[i].id,
        target: nodes[i + 1].id,
        label: i === 0 ? 'Parse' : i === nodes.length - 2 ? 'Synthesize' : 'Dataflow',
        status: 'idle'
      });
    }

    // Build execution sequence
    const executionSequence = [];
    for (let i = 0; i < nodes.length; i++) {
      const curr = nodes[i];
      const prevEdge = i > 0 ? edges[i - 1].id : undefined;
      const nextEdge = i < edges.length ? edges[i].id : undefined;

      executionSequence.push({
        nodeId: curr.id,
        status: 'running',
        activeEdgeIds: prevEdge ? [prevEdge] : [],
        delayMs: 600
      });

      executionSequence.push({
        nodeId: curr.id,
        status: curr.type === 'reflection' ? 'correction' : 'success',
        executionTimeMs: curr.executionTimeMs,
        tokens: curr.tokens,
        completedEdgeIds: prevEdge ? [prevEdge] : [],
        activeEdgeIds: nextEdge ? [nextEdge] : [],
        delayMs: 700
      });
    }

    res.json({
      success: true,
      modelUsed: modelName,
      totalDurationMs: elapsedTotalMs,
      summary: parsed.summary || 'Fluxo executado via Gemini com sucesso.',
      nodes,
      edges,
      executionSequence
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      error: error.message || 'Erro ao processar chamada com a API Gemini',
      status: 'API_ERROR'
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`AgentGraph Server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
