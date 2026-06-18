# Adding skills and agents

## Skill

Store each skill in its own folder with a `SKILL.md` file:

```markdown
---
name: example-skill
description: Explain what the skill does and when it should trigger.
---

Instructions for the agent.
```

Add optional scripts, references, assets, and `agents/openai.yaml` inside the same folder.

## Codex custom agent

Store personal Codex custom agents as TOML under `agents/codex/<group>/`:

```toml
name = "example-reviewer"
description = "Reviews changes for correctness and missing tests."
developer_instructions = """
Review code like an owner.
Prioritize correctness and actionable evidence.
"""
```

## Third-party source

Only vendor material with an explicit redistribution license. Add its source and license to `THIRD_PARTY_NOTICES.md`.

When a source has no clear license, add a reference to `external-skills.json` instead.

