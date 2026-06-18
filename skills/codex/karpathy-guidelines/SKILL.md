---
name: karpathy-guidelines
description: Coding discipline guardrails for writing, reviewing, debugging, or refactoring code with fewer LLM-agent mistakes. Use when a task touches source files, tests, architecture, bug fixes, feature implementation, refactors, cleanup, or code review and needs explicit assumptions, simple solutions, surgical diffs, existing-style consistency, and verifiable success criteria.
---

# Karpathy Guidelines

## Overview

Use this skill to keep coding work calm, small, and verifiable. It is adapted for Codex from the MIT-declared `karpathy-guidelines` skill in `multica-ai/andrej-karpathy-skills`, with the same core intent: think before editing, avoid speculative complexity, touch only the necessary code, and verify the result.

## Core Behavior

### Think First

- State assumptions when they affect the implementation.
- If the user request has multiple plausible meanings, choose the safest interpretation only when it is low risk; otherwise ask.
- Surface tradeoffs before major edits.
- Push back on unnecessary work, broad rewrites, or features that do not serve the goal.

### Keep It Simple

- Implement the minimum behavior that satisfies the request.
- Do not add future-proofing, configuration, abstractions, or extra features unless the current code genuinely needs them.
- Prefer clear local changes over clever generalization.
- If a solution grows large, pause and look for a smaller design.

### Make Surgical Changes

- Touch only files and lines needed for the task.
- Preserve unrelated user changes and existing working behavior.
- Match the repository's current style, naming, and organization.
- Clean up imports, variables, and helper code made unused by your own edits.
- Mention unrelated dead code or design issues instead of fixing them without permission.

### Verify The Goal

- Convert the request into success criteria before or during implementation.
- For bug fixes, prefer a reproducing test or concrete repro before editing when feasible.
- For feature work, identify the expected behavior, edge cases, and regression checks.
- Run the smallest meaningful tests/builds/checks that match the risk.
- Report what was verified and what remains unverified.

## Workflow

1. Read the relevant code and project instructions.
2. Define the smallest verifiable goal.
3. Make a brief plan for multi-step work.
4. Edit narrowly.
5. Verify with tests, builds, lint, screenshots, or manual checks as appropriate.
6. Finalize with changed files, verification, risks, and assumptions.

## Response Rules

- Do not over-explain simple tasks.
- Do not claim success without evidence.
- When refusing or pushing back, give the practical reason and a better path.
- For trivial tasks, apply the principles silently and keep the response short.
