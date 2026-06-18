# SkilledAgents Toolkit

[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e.svg)](LICENSE)
[![Codex Skills](https://img.shields.io/badge/Codex_Skills-41-2563eb.svg)](INVENTORY.md)
[![Agent Profiles](https://img.shields.io/badge/Agent_Profiles-12-7c3aed.svg)](agents)
[![Plugins](https://img.shields.io/badge/Plugins-3-f97316.svg)](plugins)
[![PowerShell](https://img.shields.io/badge/Installer-PowerShell-5391FE.svg)](scripts/install.ps1)

Portable, open-source workflows for Codex: reusable skills, custom agents, plugin bundles, project installers, validation tools, and TypeScript/Python SDK examples.

Use one repository as the source of truth for agent workflows you want available across different codebases and machines.

## At a glance

| Included | Count | Purpose |
|---|---:|---|
| Archived skill packages | 41 | Reusable global and project-specific workflows |
| Unique umbrella-plugin skills | 40 | Deduplicated skills installable through one plugin |
| Agent profiles | 12 | 6 Codex TOML agents and 6 Claude Markdown agents |
| Codex plugins | 3 | Full toolkit, QA Agent, and Phere |
| Project profiles | 5 | QaAgent, Shaadikhata, Phere Website, NUUDE, and Wrkly |
| Codex SDK examples | 2 | TypeScript and Python |

The generated [inventory](INVENTORY.md) and [machine-readable manifest](MANIFEST.json) contain the complete package list.

## Why this repository exists

Agent skills often end up scattered across user folders and individual projects. That makes them difficult to reuse, review, update, or move to a new machine.

SkilledAgents Toolkit provides:

- one reviewed archive for reusable skills and agents;
- selective and full-install PowerShell workflows;
- Codex plugin marketplace support;
- project-profile installation into `.agents/skills`;
- conversion of Claude-style agents into Codex custom-agent TOML;
- secret, path, manifest, and frontmatter validation;
- safe local synchronization without deleting existing skills;
- working Codex SDK starter examples.

## Quick start

### Option 1: Install the Codex plugin

Best when you want the deduplicated skill collection through the Codex plugin system.

```powershell
codex plugin marketplace add BAKUGOS1/SkilledAgents-Toolkit
codex plugin add skilled-agents@skilled-agents-toolkit
```

Start a new Codex thread after installation. The marketplace also exposes the smaller `qa-agent` and `phere` plugins.

### Option 2: Install global skills and custom agents

Best when you want direct user-level files without installing SDK dependencies.

```powershell
git clone https://github.com/BAKUGOS1/SkilledAgents-Toolkit.git
Set-Location .\SkilledAgents-Toolkit

.\scripts\validate.ps1
.\scripts\install.ps1 -Skills -CodexAgents -Force
```

This installs skills into `%USERPROFILE%\.agents\skills` and Codex agents into `%USERPROFILE%\.codex\agents`.

### Option 3: Install everything

```powershell
.\scripts\install.ps1 -All -Force
```

`-All` installs skills, Codex agents, the marketplace plugin, and both SDK example dependencies. The Python SDK includes a pinned Codex CLI runtime download, so this option is intentionally heavier.

Restart Codex after installation so it reloads installed skills, agents, and plugins.

## Requirements

| Requirement | Needed for |
|---|---|
| Windows PowerShell 5.1+ or PowerShell 7+ | Installer, sync, manifest, and validation scripts |
| Git | Cloning and repository workflows |
| Codex CLI | Plugin marketplace installation |
| Node.js 18+ and npm | TypeScript Codex SDK example |
| Python 3.10+ | Python Codex SDK example |

Skills and Markdown/TOML agent definitions are portable files. The included automation scripts are Windows-first.

## What is included

### Reusable skills

The toolkit covers:

- frontend design, UI/UX critique, shadcn/ui, Stitch, React, and Remotion workflows;
- product engineering audits, debugging, testing, documentation, and internal communication;
- MCP server design, Supabase, Postgres, and QA automation;
- project-specific workflows for Phere/Shaadikhata, QaAgent, NUUDE, and Wrkly;
- NotebookLM, skill discovery, animated Codex pets, and website-builder setup.

See [INVENTORY.md](INVENTORY.md) for every skill and its package location.

### Custom agents

`agents/codex/wrkly/` contains installable Codex custom agents for:

- code review;
- debugging;
- documentation;
- refactoring;
- security auditing;
- test writing.

The original Claude-compatible definitions remain under `agents/claude/wrkly/`.

### Plugin bundles

| Plugin | Purpose |
|---|---|
| `skilled-agents` | Deduplicated umbrella collection of reusable skills |
| `qa-agent` | Focused website QA and evidence-reporting workflow |
| `phere` | Phere/Shaadikhata 9-Agent Manager workflow |

Marketplace metadata lives at [`.agents/plugins/marketplace.json`](.agents/plugins/marketplace.json).

### Project kits

Project profiles install relevant skills into a target repository:

```powershell
.\scripts\install.ps1 `
  -ProjectProfile qaagent `
  -ProjectPath "C:\path\to\QaAgent" `
  -Force
```

Supported profiles:

- `qaagent`
- `shaadikhata`
- `phere-website`
- `nuude`
- `wrkly`

Where available, the installer also copies the profile's `AGENTS.md` guidance. The Wrkly profile includes its Claude agent definitions.

## Selective installation

```powershell
# Canonical user-level Agent Skills location
.\scripts\install.ps1 -Skills -Force

# Also copy skills into the legacy ~/.codex/skills location
.\scripts\install.ps1 -Skills -LegacyCodexPath -Force

# Install only Codex custom-agent TOML files
.\scripts\install.ps1 -CodexAgents -Force

# Configure the public marketplace and install the umbrella plugin
.\scripts\install.ps1 -Plugin

# Install and verify both Codex SDK examples
.\scripts\install-sdk.ps1 -All
```

Without `-Force`, existing destination packages are preserved.

## Codex SDK examples

### TypeScript

Pinned package: `@openai/codex-sdk@0.141.0`

```powershell
Set-Location .\sdk\typescript
npm install
npm run typecheck
npm start -- "Inspect this repository and suggest improvements"
```

### Python

Pinned beta package: `openai-codex==0.1.0b3`

```powershell
.\scripts\install-sdk.ps1 -Python
.\sdk\python\.venv\Scripts\python.exe .\sdk\python\example.py `
  "Inspect this repository and suggest improvements"
```

SDK environments and `node_modules` are ignored by Git.

## Example prompts

After installation, try:

```text
Use $product-engineering-auditor to audit this app and implement the highest-value safe fixes.
```

```text
Use $webapp-testing to verify the local app and report console, responsive, and interaction problems.
```

```text
Use $phere-9-agent-manager to plan, implement, test, and review this Shaadikhata task.
```

```text
Spawn the wrkly-code-reviewer and wrkly-security-auditor agents to review this branch.
```

## Repository layout

```text
.
|-- .agents/plugins/       # Codex marketplace catalog
|-- agents/
|   |-- codex/             # Custom-agent TOML files
|   `-- claude/            # Claude-compatible agent files
|-- plugins/               # Three Codex plugin bundles
|-- project-kits/          # Reusable AGENTS.md and AgentOS assets
|-- scripts/               # Install, sync, conversion, and validation
|-- sdk/
|   |-- typescript/
|   `-- python/
|-- skills/
|   |-- codex/             # User-level reusable skills
|   |-- agents-global/     # General Agent Skills
|   `-- projects/          # Project-specific workflows
`-- third-party/licenses/  # Preserved license texts
```

## Keep the toolkit current

Safely copy supported local skills and agents into this repository:

```powershell
.\scripts\sync-local.ps1 `
  -ProjectRoot "C:\path\to\repo-one","C:\path\to\repo-two" `
  -Force
```

The sync workflow excludes built-in system skills, plugin caches, authentication state, sessions, environment files, databases, runtime logs, and generated run/status directories.

After reviewing the diff:

```powershell
.\scripts\build-manifest.ps1
.\scripts\validate.ps1
```

## Validation and safety

`scripts/validate.ps1` checks:

- required repository and marketplace files;
- forbidden generated or sensitive paths;
- common token, API-key, JWT, Slack-token, and private-key patterns;
- `SKILL.md` frontmatter;
- Codex plugin manifests and marketplace paths;
- custom-agent required fields;
- reference-only third-party skill rules;
- pinned SDK package versions.

The installer and sync scripts do not delete local skills. Existing files are overwritten only when `-Force` is explicitly supplied.

## Licensing

Original toolkit code and locally authored workflows are released under the [MIT License](LICENSE).

Vendored third-party components retain their upstream licenses and attribution. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

The Emil Design Engineering skill is reference-only in [`external-skills.json`](external-skills.json) because its upstream repository did not declare a redistribution license when this toolkit was assembled.

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before adding skills, agents, plugins, or third-party material.

## Support and community

- Report reproducible bugs through [GitHub Issues](https://github.com/BAKUGOS1/SkilledAgents-Toolkit/issues).
- Share questions, workflow ideas, and reusable skill proposals in [GitHub Discussions](https://github.com/BAKUGOS1/SkilledAgents-Toolkit/discussions).
- For sensitive security issues, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.
