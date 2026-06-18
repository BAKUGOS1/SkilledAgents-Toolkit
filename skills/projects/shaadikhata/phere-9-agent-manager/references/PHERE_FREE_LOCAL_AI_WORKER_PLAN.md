# Phere Free Local AI Worker Plan

This is a future implementation plan for free AI-code-writing background agents. Do not build this automatically. Use it when the user later asks to wire Ollama/local LLM agents.

## Goal

Add local AI workers that can propose code changes without paid API usage.

Primary free route:

- Ollama running on the user's laptop
- A local coding model such as `qwen2.5-coder:7b` for normal laptops
- Optional larger model such as `qwen2.5-coder:14b` only if hardware can handle it

## Truth Boundaries

- Local LLM quality is not guaranteed.
- Local workers stop when the laptop shuts down.
- Local workers must not deploy, run production SQL, rotate secrets, delete data, or run destructive git commands.
- Code patches must be reviewed before commit.
- Any claim about tests/build must come from fresh command output.

## Future Commands

Use these command names when implementing later:

```bash
npm run agents:local-ai-run -- "task"
npm run agents:local-ai-status
npm run agents:local-ai-logs
npm run agents:local-ai-stop
```

## Setup Steps For Later

1. Install Ollama from `https://ollama.com`.
2. Pull a small coding model:

```bash
ollama pull qwen2.5-coder:7b
```

3. Confirm Ollama is running:

```bash
ollama list
```

4. Add a local worker script that talks to Ollama's local HTTP API.
5. Keep generated patches in a review folder first, not directly applied to source.
6. Run `npm run test` and `npm run build` after any accepted patch.

## Local AI Worker Architecture

```text
user task
  -> agents:route
  -> local-ai coordinator
  -> one prompt per selected agent
  -> proposed patch/report
  -> deterministic verification
  -> human approval
  -> apply patch
  -> test/build
  -> final handoff
```

## Required Safety Gates

- Secret scan before sending context to local model.
- Limit context to relevant files.
- No `.env` or secret-bearing files in prompts.
- Save model output to `.agents/status/` or `.agents/reviews/`.
- Apply patches only after user approval.
- Keep a full log of prompt, files inspected, proposed changes, and verification commands.

## Recommended Prompt Contract

Every local AI worker should receive:

- Role name
- Task
- Allowed files
- Forbidden actions
- Truth rules
- Expected output format
- Verification command expectations

Expected output:

```text
Agent:
Files inspected:
Recommendation:
Patch proposal:
Verification needed:
Risks:
```

## When Not To Use

Do not use local AI workers for:

- Production database changes
- Secret handling
- Legal/compliance final decisions
- Large blind refactors
- Any action where wrong code could destroy user data

For those tasks, use deterministic checks and human review first.
