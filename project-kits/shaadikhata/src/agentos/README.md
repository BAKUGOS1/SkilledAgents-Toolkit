# AgentOS Source Layout

This folder contains the local Karynth AgentOS runtime pieces used by Phere.

```text
src/agentos/
  brain/          Memory providers, extraction, approval governance, tests.
  router/         Intent analysis, skill routing, execution-plan creation.
  orchestrator/   runAssistant pipeline, result merging, memory update hook.
  skills/         Skill metadata, registry, adapters, and shared types.
  config.ts       AgentOS/router environment config.
```

Keep product UI, pages, hooks, stores, and reusable app components outside this folder. Keep developer CLI tools under `tools/`.
