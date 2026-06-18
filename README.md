# SkilledAgents Toolkit

An open-source, reusable collection of Codex skills, project workflows, agent profiles, plugin bundles, and Codex SDK examples.

The toolkit keeps reusable AI-agent instructions in one repository so they can be installed globally or copied into any project without rebuilding the same setup.

## Quick start

### Install the complete toolkit on Windows

```powershell
git clone https://github.com/BAKUGOS1/SkilledAgents-Toolkit.git
Set-Location .\SkilledAgents-Toolkit
.\scripts\validate.ps1
.\scripts\install.ps1 -All -Force
```

Restart Codex after installation so new skills, agents, and plugins are discovered.

### Install through the Codex plugin marketplace

```powershell
codex plugin marketplace add BAKUGOS1/SkilledAgents-Toolkit
codex plugin add skilled-agents@skilled-agents-toolkit
```

The marketplace also exposes the smaller `qa-agent` and `phere` plugins.

### Install only the Codex SDK examples

```powershell
.\scripts\install-sdk.ps1 -All
```

This installs:

- TypeScript: `@openai/codex-sdk@0.141.0`
- Python beta: `openai-codex==0.1.0b3`

Node.js 18+ and Python 3.10+ are required. SDK dependencies are installed locally and are not committed.

## What is included

- `skills/codex/` — reusable personal Codex skills.
- `skills/agents-global/` — globally useful Agent Skills.
- `skills/projects/` — QaAgent, Phere/Shaadikhata, Phere Website, NUUDE, and Wrkly workflows.
- `agents/claude/` — original Claude-style project agents.
- `agents/codex/` — generated Codex TOML adapters for reusable custom agents.
- `plugins/skilled-agents/` — umbrella plugin containing the unique installable skill set.
- `plugins/qa-agent/` — focused website QA plugin.
- `plugins/phere/` — focused Phere 9-Agent Manager plugin.
- `project-kits/` — reusable project instructions and sanitized AgentOS assets.
- `sdk/` — minimal TypeScript and Python Codex SDK examples.
- `scripts/` — install, sync, conversion, manifest, and validation tools.

The generated [INVENTORY.md](INVENTORY.md) lists every archived package and agent.

## Install a project profile

Project profiles install skills into `<project>\.agents\skills` and copy profile-specific instructions when available.

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

## Install modes

```powershell
# Canonical user-level Agent Skills location
.\scripts\install.ps1 -Skills -Force

# Also copy skills to the older ~/.codex/skills location
.\scripts\install.ps1 -Skills -LegacyCodexPath -Force

# Install Codex custom-agent TOML files
.\scripts\install.ps1 -CodexAgents -Force

# Add the GitHub marketplace and umbrella plugin
.\scripts\install.ps1 -Plugin
```

## Keep the repository current

The sync script safely copies only skill packages, agent definitions, and root `AGENTS.md` files. It excludes built-in system skills, caches, runtime state, credentials, and the unlicensed upstream Emil skill snapshot.

```powershell
.\scripts\sync-local.ps1 `
  -ProjectRoot "C:\path\to\repo-one","C:\path\to\repo-two" `
  -Force
```

After syncing:

```powershell
.\scripts\build-manifest.ps1
.\scripts\validate.ps1
```

## Licensing

Original toolkit code and locally authored workflows are MIT licensed. Vendored third-party skills remain under their upstream licenses and are documented in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

The Emil Design Engineering skill is intentionally represented as an upstream reference in `external-skills.json` because its source repository did not declare a redistribution license when this toolkit was assembled.

## Safety

- No `.env`, auth, session, browser-profile, database, runtime-log, or generated-run files are included.
- The validator scans for common token and private-key patterns.
- The sync script never deletes local skills.
- Existing destination files are not overwritten unless `-Force` is supplied.
- Project memory is included only as a reviewed, non-sensitive seed.
