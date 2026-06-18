# Karynth AgentOS Research Catalogue

Updated: 2026-06-03

Karynth AgentOS uses these repositories as research inputs. V1 installs only the VoltAgent adapter packages and uses the already installed NotebookLM CLI after re-authentication. The other repos are references only; do not vendor code or copy implementation from them.

## V1 Install/Use Decisions

| Repository | Category | V1 decision | How it affects Karynth AgentOS |
|---|---|---|---|
| `teng-lin/notebooklm-py` | Research connector | Use installed local CLI | Research-only summaries for approved project docs. Local files and command output stay source of truth. |
| `VoltAgent/voltagent` | TypeScript agent framework | Optional adapter | Used behind `AGENTOS_RUNTIME=voltagent`; default runtime remains `local`. |
| `open-multi-agent/open-multi-agent` | Orchestration | Reference only | Borrow goal-to-task DAG planning and explicit pipeline ideas. |
| `dsifry/metaswarm` | Codex/CLI loop | Reference only | Borrow work-unit loops, TDD/review cadence, and CLI-oriented coordination. |
| `langchain-ai/langgraph` | Durable graph | Reference only | Borrow durable state, checkpoints, human-in-the-loop, and memory boundaries. |
| `mastra-ai/mastra` | TypeScript agent framework | Future phase | Strong workflow/memory/eval reference, but not installed in V1 because the current package requires Node `>=22.13.0`. |
| `openai/openai-agents-js` | Agent SDK | Reference only | Borrow guardrails, sessions, handoffs, and tracing concepts. Paid model calls remain disabled by default. |
| `OpenHands/OpenHands` | Autonomous coding | Reference only | Study sandboxing and review loops. Too heavy to embed in V1. |

## Memory And Brain References

| Repository | Category | V1 decision | How it affects Karynth AgentOS |
|---|---|---|---|
| `mem0ai/mem0` | Memory | Reference only | Long-term memory extraction/search pattern. Existing Brain `mem0` provider remains opt-in through env. |
| `letta-ai/letta` | Stateful memory | Reference only | Memory governance and stateful agent patterns. |
| `getzep/graphiti` | Temporal memory graph | Reference only | Temporal knowledge graph and episodic memory ideas. |
| `getzep/zep` | Memory service | Reference only | Session memory and production memory blocks. |
| `letta-ai/letta-chatbot-example` | Memory example | Reference only | Small TypeScript stateful assistant example. |
| `pinkpixel-dev/mem0-mcp` | Memory MCP | Reference only | MCP shape for memory access without hard-wiring memory into every agent. |
| `AIAnytime/Agent-Memory-Playground` | Memory playground | Reference only | Memory technique comparison. |
| `raymondmdzz123/agent-memory` | Lightweight memory | Reference only | Persistent memory idea; low-star repo, inspiration only. |
| `ntbpy/AI_Agent_Memory_Techniques` | Memory techniques | Reference only | Memory technique notes and examples. |
| `homgorn/graphiti-free-agent-memory-zep` | Free memory stack | Reference only | Free Graphiti/Zep-style composition idea. |
| `openaeon/OpenAEON` | Personal brain | Reference only | Personal memory implementation patterns. |
| `swarmclawai/swarmvault` | Local-first memory | Reference only | Local-first/private memory vault ideas. |
| `sachitrafa/YourMemory` | Personal memory | Reference only | Agentic personal memory idea; avoid copying code unless licensing is cleared. |

## Safety Rules

- Do not install external frameworks beyond the approved V1 VoltAgent adapter packages.
- Do not call paid model providers unless `AGENTOS_ALLOW_PAID_MODELS=true` and the user explicitly approves the cost.
- Do not treat NotebookLM output as implementation truth.
- Do not claim Karynth AgentOS is enterprise-ready, secure, deployed, or shipped without direct evidence.
- Deduplicate research repos by exact `owner/name` before generating docs or adapters.

## Known Package Risk

Initial VoltAgent installation reported advisories in transitive provider packages and `uuid` through `@voltagent/core`. On 2026-06-03, Karynth added npm `overrides` for the affected transitive packages and verified `npm audit --audit-level=moderate` with `0 vulnerabilities`.

Keep VoltAgent optional and local-only. The overrides should be revisited when upstream `@voltagent/core` moves to the fixed dependency ranges directly.
