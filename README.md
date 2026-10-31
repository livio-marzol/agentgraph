Aqui está um README.md completo, profissional e pronto para impressionar
recrutadores e a comunidade no GitHub e LinkedIn.

Basta abrir o arquivo README.md no VS Code, substituir todo o conteúdo dele pelo
texto abaixo e salvar:

# 🧠 AgentGraph - AI Thought & Reasoning Inspector

<p align="center">
  <b>Plataforma interativa de observabilidade e visualização em tempo real do raciocínio cognitivo, planejamento, chamadas de ferramentas e ciclos de autorreflexão de Agentes de IA Autônomos.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Google_Gemini-API-8E75C2?style=for-the-badge&logo=google" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/Vite-Bundler-646CFF?style=for-the-badge&logo=vite" alt="Vite" />
</p>

---

## 🌟 Visão Geral

Ao interagir com agentes autônomos de Inteligência Artificial, as interfaces de chat tradicionais costumam agir como "caixas-pretas", ocultando o processo de tomada de decisão.

O **AgentGraph** transforma essa experiência: ele renderiza um grafo dinâmico e interativo que expõe visualmente cada etapa da cadeia de pensamento da IA:
- **Intenção do Usuário:** Decomposição inicial do objetivo.
- **Planejamento Cognitivo:** Estruturação lógica e priorização de subtarefas.
- **Execução de Ferramentas (Tool Calling):** Acionamento de buscas na web, interpretadores de código e queries a bancos de dados.
- **Autorreflexão & Validação:** Ciclos em que o agente avalia se o resultado obtido é confiável antes de prosseguir.
- **Síntese Final:** Resposta clara e concisa entregue ao usuário.

---

## ✨ Funcionalidades Principais

- 📊 **Visualização Dinâmica em Grafo:** Navegação fluida com zoom, pan (arrastar), centralização e mapa geral (*minimap*).
- ⚡ **Execução Passo a Passo:** Controle total sobre a reprodução do raciocínio (play/pause, avançar 1 passo, seletor de velocidade 0.5x, 1x, 2x ou instantâneo).
- 🔍 **Inspetor Detalhado de Nós:** Clique em qualquer nó para inspecionar payloads brutos, entradas/saídas em JSON e tempo de resposta individual.
- ⏱️ **Telemetria e Métricas em Tempo Real:** Acompanhamento de latência acumulada (ms), estimativa de tokens consumidos e custos em tempo real.
- 🛡️ **Dois Modos de Operação:**
  - **Modo Gemini Real:** Conexão direta com a API do Google Gemini (`gemini-2.5-flash`, `gemini-1.5-flash`).
  - **Modo Simulado / Fallback Adaptativo:** Permite testar prompts customizados ou cenários de demonstração sem necessidade de chave de API.
- 🎯 **Cenários Pré-Carregados:** Casos de uso prontos para demonstração (Análise Quantitativa Financeira, Otimização de Performance e Suporte ao Cliente).

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 19, TypeScript, Tailwind CSS, Motion (animações de nós e conexões)
- **Ícones:** Lucide React
- **Backend / Dev Server:** Node.js, Express, TSX, Vite
- **Inteligência Artificial:** SDK Oficial `@google/genai` (Google Gemini API)

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) instalado (versão 18 ou superior).
- [Git](https://git-scm.com/) instalado.

### 1. Clonar o repositório
```bash
git clone https://github.com/livio-marzol/agentgraph.git
cd agentgraph

2. Instalar as dependências

npm install

3. Configurar Variáveis de Ambiente (Opcional para Modo Real)

Copie o arquivo de exemplo para criar o seu .env:

cp .env.example .env

Abra o .env e insira sua chave da API do Google AI Studio:

GEMINI_API_KEY="SUA_CHAVE_AQUI"
APP_URL="http://localhost:3000"

(Nota: O projeto funciona perfeitamente mesmo sem chave via modo de demonstração
adaptativo).

4. Iniciar a Aplicação

npm run dev

Abra no navegador em: http://localhost:3000

🔒 Segurança

O arquivo .env contendo chaves privadas é estritamente ignorado via .gitignore
(.env*), garantindo que credenciais sensíveis nunca sejam versionadas
publicamente.

👨‍💻 Autor

Desenvolvido por Lívio Eduardo Marzol

  - LinkedIn: Lívio Eduardo Marzol
  - GitHub: @livio-marzol


---

### 🚀 Comandos finais no terminal para subir tudo ao GitHub:

1. **Confira a segurança:** Certifique-se de que o arquivo `.env` não contém nenhuma chave antes de fechar (ou deixe apenas `GEMINI_API_KEY=""`).
2. **Revogue a chave no AI Studio:** Como você a colou aqui no chat, vá no [Google AI Studio (API Keys)](https://aistudio.google.com/app/apikey), apague a chave antiga na lixeira e crie uma nova para seu uso pessoal.
3. **Envie para o GitHub:**

```bash
git add .
git commit -m "feat: adiciona README completo e documentacao do projeto AgentGraph"
git branch -M main
git remote add origin https://github.com/livio-marzol/agentgraph.git
git push -u origin main

(Se o repositório no GitHub tiver outro nome, basta ajustar a URL do comando
remote add).

Agora você tem dois projetos de altíssimo nível no seu GitHub para turbinar o
seu LinkedIn! Parabéns pelo resultado!
