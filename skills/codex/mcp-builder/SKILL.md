---
name: mcp-builder
description: MCP server design, implementation, and review workflow for Model Context Protocol integrations. Use when building or auditing MCP servers, tools, resources, prompts, connectors, external API integrations, tool schemas, authentication boundaries, error handling, pagination, or agent-facing workflow tools in Python, TypeScript, or another runtime.
---

# MCP Builder

## Overview

Use this skill to build MCP servers that are useful to agents in real workflows, not just thin API wrappers. It is adapted from useful patterns in Anthropic's Apache-2.0 `mcp-builder` skill.

## First Principles

- Verify current MCP docs before relying on protocol details, SDK APIs, or transport behavior.
- Design tools around tasks agents need to complete.
- Prefer clear, discoverable tool names with consistent prefixes.
- Return focused data with pagination/filtering instead of huge responses.
- Make errors actionable: tell the agent what failed, why, and what to try next.
- Keep auth, secrets, destructive actions, and production writes behind explicit safeguards.

## Design Workflow

1. Identify the external service, target users, and top workflows.
2. List required read tools, write tools, resources, and prompts.
3. Define tool schemas with strict inputs, clear descriptions, and safe defaults.
4. Decide which operations need confirmation or dry-run behavior.
5. Implement the smallest useful server using the project's existing runtime.
6. Add tests or smoke checks for connection, happy path, invalid input, auth failure, pagination, and rate-limit behavior.
7. Document setup, environment variables, and example prompts.

## Tool Quality Checklist

- Names are action-oriented and easy to search.
- Descriptions explain when to use the tool and what it returns.
- Inputs are typed, minimal, and validated.
- Outputs are structured and not overlong.
- Errors include next steps.
- Secrets never appear in logs or responses.
- Destructive tools require explicit confirmation.
- The server can be run locally and verified with a simple client.

## Final Handoff

Report tools/resources added, auth/env requirements, verification performed, remaining risks, and any MCP docs consulted.
