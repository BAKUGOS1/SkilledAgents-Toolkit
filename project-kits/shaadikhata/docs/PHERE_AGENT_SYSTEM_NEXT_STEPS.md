# Phere Agent System Next Steps

Updated: 2026-06-03

This note records the current GitHub research pass and the recommended next steps for improving the Phere 9-Agent Manager, Brain memory skill, NotebookLM research lane, and AI skill router.

## Current Local State

Phere already has these pieces:

- Phere 9-Agent Manager in `tools/phere-9-agent-manager.mjs`.
- Agent operating rules in `AGENTS.md`, `docs/PHERE_9_AGENT_MANAGER_SYSTEM.md`, and `.agents/skills/phere-9-agent-manager/`.
- Single-Codex autonomous mode via `npm run agents:codex -- "<task>"`.
- Brain memory skill under `src/agentos/brain/`.
- Brain memory governance now includes `user`, `project`, and `run` scopes, store-level dedupe, project-decision approval metadata, strict secret rejection, and local `brain:*` inspection commands.
- Deterministic skill router and orchestrator under `src/agentos/router/` and `src/agentos/orchestrator/`.
- NotebookLM research lane connected to the `Phere Shaadikhata Project Docs` notebook.

The current direction is good: keep the system Codex-first, local-first, and evidence-based. Do not replace it with a heavy external framework unless a specific production need appears.

## GitHub Research Summary

| Repo | Best lesson for Phere | Recommendation |
|---|---|---|
| `langchain-ai/langgraph` | Durable graph execution, human-in-the-loop checkpoints, memory, observability. | Borrow the graph/checkpoint concepts, not the Python dependency. |
| `microsoft/agent-framework` | Production multi-agent workflow patterns: sequential, concurrent, handoff, group collaboration, governance. | Use as an architecture reference for approval gates and workflow durability. |
| `open-multi-agent/open-multi-agent` | TypeScript-native goal-to-task DAG, `planOnly`, explicit pipelines, local Ollama support, MCP/tool support. | Closest fit for implementation inspiration because Phere is TypeScript/Node. |
| `mastra-ai/mastra` | TypeScript agents, workflows, memory, evals, observability, MCP integration. | Strong future candidate if we want a larger TypeScript agent runtime. Defer install for now. |
| `dsifry/metaswarm` | Codex/Claude/Gemini CLI orchestration, TDD enforcement, adversarial review, spec-driven work units. | Borrow the process ideas, especially work-unit loops and independent review. |
| `VoltAgent/awesome-claude-code-subagents` | Large catalog of specialized subagent prompt patterns. | Use as role prompt inspiration only; do not copy all agents into Phere. |
| `OpenHands/OpenHands` | Mature autonomous coding-agent product and SDK patterns. | Study for sandboxing and review loops; too heavy to embed into this repo now. |
| `crewaiinc/crewai` | Simple role-based multi-agent automation. | Good conceptual match, but Python-first and less aligned with current TypeScript stack. |
| `microsoft/autogen` | Historical multi-agent design reference. | Do not adopt for new work; current GitHub README says it is in maintenance mode and points users to Microsoft Agent Framework. |

## Decision

Best near-term repo to learn from: `open-multi-agent/open-multi-agent`.

Best production architecture reference: `langchain-ai/langgraph` plus `microsoft/agent-framework`.

Best Codex workflow reference: `dsifry/metaswarm`.

Do not install any external framework yet. The next step should be to harden our existing local TypeScript/Codex system using the best patterns from these repos.

## Recommended Roadmap

### Phase 1: Stabilize Current Brain And Router

Goal: make the existing untracked `src/agentos/` work reliable before adding more orchestration.

Status: implemented for the current local Brain/router layer on 2026-06-03.

Actions:

- Run targeted Brain and orchestrator tests. Done.
- Confirm `tsconfig.json` includes the new TypeScript source safely. Done.
- Verify `.data/brain-memory.json` stays ignored and no memory secrets are tracked. Done.
- Add a simple local demo command or test fixture for `runAssistant()`. Done through orchestrator tests.
- Document what Brain is allowed to remember and what must be rejected. Done.

Done when:

- Brain tests pass.
- Skill orchestrator routing tests pass.
- Final docs state storage, privacy, and approval boundaries.

### Phase 2: Add A Real Agent Run Ledger

Goal: turn `agents:codex` from a printed contract into a structured run plan Codex can update as it works.

Borrow from:

- LangGraph: durable state, checkpoints, resume.
- Open Multi-Agent: task DAG, `planOnly`, explicit pipeline.
- Microsoft Agent Framework: human-in-the-loop approval gates.

Actions:

- Add `.agents/runs/<run-id>/PHERE_AGENT_RUN.json` and `.md`.
- Store selected agents, task DAG, dependencies, owner, status, files touched, commands run, evidence, approvals, and residual risks.
- Add commands:
  - `npm run agents:codex-plan -- "<task>"`
  - `npm run agents:codex-status`
  - `npm run agents:codex-update -- <agent> "<note>"`
  - `npm run agents:codex-done -- "<summary>"`

Done when:

- A Codex autonomous run has machine-readable state.
- Final handoff can be generated from run evidence.
- The run ledger is local/ignored and cannot expose secrets.

### Phase 3: Add Work-Unit Loop

Goal: make large tasks safer by breaking them into reviewed chunks.

Borrow from:

- Metaswarm: spec-driven work units, implement/test/review loop.
- Deep Agents: task planning and context offloading.

Actions:

- Add work units to the run ledger: `research`, `plan`, `implement`, `verify`, `review`, `handoff`.
- Require each work unit to name acceptance criteria and evidence.
- For code changes, enforce the loop:
  1. plan
  2. implement
  3. targeted tests
  4. tester review
  5. security/production gates when relevant
  6. truth handoff

Done when:

- `agents:codex` can print a structured phased run.
- Codex can update each phase without manual handoff prompts.

### Phase 4: Improve Skill Routing

Goal: make the app-side skill router more like a small, deterministic workflow engine.

Borrow from:

- Mastra: workflows, memory, evals, observability.
- Open Multi-Agent: capability matching and explicit pipelines.

Actions:

- Add routing tests for:
  - Brain-only simple messages.
  - Phere agent-manager requests.
  - Supabase/security requests.
  - Website/UI requests.
  - Risky memory/delete requests.
- Add `can_run_parallel` behavior only for read-only skills.
- Add explicit dependency validation so a skill cannot run before its required context skill.
- Add debug output that shows selected skills, rejected skills, confidence, and safety gate reason.

Done when:

- Router behavior is predictable and covered by tests.
- Risky actions never execute without approval.

### Phase 5: Brain Memory Governance

Goal: make Brain useful without becoming a privacy risk.

Status: V1 implemented on 2026-06-03; future work can add richer review UI and approval workflows.

Borrow from:

- LangGraph/Mastra memory patterns: separate working memory, long-term memory, and semantic memory.
- Phere truth rules: no unsupported claims.

Actions:

- Separate memory categories/scopes:
  - user preference
  - project decision
  - workflow rule
  - correction
  - design preference
  - blocked issue
- Add approval mode for long-term project decisions. Done.
- Add `brain:list`, `brain:search`, `brain:approve`, and `brain:forget` local helper commands. Done.
- Keep secret rejection strict. Done.

Done when:

- Brain can be inspected and cleaned.
- Sensitive data is rejected.
- Memory updates are explainable in debug mode.

### Phase 6: Evaluation And Quality Gates

Goal: improve agents by measuring behavior, not just adding more roles.

Borrow from:

- Mastra evals.
- LangSmith-style trace thinking without exposing hidden reasoning.
- Metaswarm review gates.

Actions:

- Add lightweight eval fixtures under `src/agentos/**/__tests__` or `src/agentos/evals/`.
- Track routing accuracy, risk-gate behavior, and final answer format.
- Add a test for the `agents:codex` Saman route to ensure it includes `frontend`, `performance`, and `tester`.

Done when:

- Regressions in routing or safety gates fail tests.
- The final handoff reports commands and evidence.

## What Not To Do Yet

- Do not replace the local system with LangGraph, CrewAI, OpenHands, Mastra, or Microsoft Agent Framework immediately.
- Do not add paid background LLM workers.
- Do not let Brain store secrets, customer data, or raw financial data.
- Do not make all specialist/business agents run on every task.
- Do not claim the agent system is production-ready until run ledgers, tests, approval gates, and verification evidence are in place.

## Immediate Next Action

Implement Phase 1 and Phase 2 first:

1. Stabilize the current Brain/router files with tests.
2. Add the local agent run ledger for `agents:codex`.
3. Add a targeted regression test for autonomous Saman routing.
4. Update docs only after command/test evidence exists.

This gives Phere the practical benefit of the best GitHub agent frameworks while keeping the system local, understandable, and safe for Codex-driven work.
