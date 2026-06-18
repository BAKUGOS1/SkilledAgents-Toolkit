# Skills and Agents Inventory

Archived skills: 41
Codex agents: 6
Claude agents: 6
Plugins: 3

## Skills

| Name | Package | Files | Bytes | openai.yaml |
|---|---|---:|---:|---|
| `find-skills` | `skills/agents-global/find-skills` | 1 | 5588 | no |
| `notebooklm` | `skills/agents-global/notebooklm` | 1 | 36374 | no |
| `stitch::code-to-design` | `skills/codex/code-to-design` | 1 | 3007 | no |
| `design-md` | `skills/codex/design-md` | 3 | 19771 | no |
| `doc-coauthoring` | `skills/codex/doc-coauthoring` | 2 | 2250 | yes |
| `enhance-prompt` | `skills/codex/enhance-prompt` | 3 | 10513 | no |
| `stitch::extract-design-md` | `skills/codex/extract-design-md` | 7 | 38982 | no |
| `stitch::extract-static-html` | `skills/codex/extract-static-html` | 4 | 105006 | no |
| `frontend-design` | `skills/codex/frontend-design` | 2 | 2553 | yes |
| `stitch::generate-design` | `skills/codex/generate-design` | 4 | 17828 | no |
| `hatch-pet` | `skills/codex/hatch-pet` | 14 | 135670 | yes |
| `impeccable` | `skills/codex/impeccable` | 62 | 794452 | no |
| `internal-comms` | `skills/codex/internal-comms` | 2 | 2051 | yes |
| `karpathy-guidelines` | `skills/codex/karpathy-guidelines` | 2 | 3063 | yes |
| `stitch::manage-design-system` | `skills/codex/manage-design-system` | 3 | 12467 | no |
| `mcp-builder` | `skills/codex/mcp-builder` | 2 | 2388 | yes |
| `product-engineering-auditor` | `skills/codex/product-engineering-auditor` | 2 | 9545 | yes |
| `react:components` | `skills/codex/react-components` | 11 | 21166 | no |
| `remotion` | `skills/codex/remotion` | 7 | 27375 | no |
| `shadcn-ui` | `skills/codex/shadcn-ui` | 10 | 85232 | no |
| `stitch-loop` | `skills/codex/stitch-loop` | 6 | 20916 | no |
| `taste-design` | `skills/codex/taste-design` | 2 | 25215 | no |
| `design-taste-frontend` | `skills/codex/taste-skill` | 1 | 21140 | no |
| `ui-ux-pro-max` | `skills/codex/ui-ux-pro-max` | 28 | 505867 | no |
| `stitch::upload-to-stitch` | `skills/codex/upload-to-stitch` | 2 | 9578 | no |
| `webapp-testing` | `skills/codex/webapp-testing` | 2 | 2380 | yes |
| `website-builder-setup` | `skills/codex/website-builder-setup` | 1 | 6012 | no |
| `nuude-ecommerce` | `skills/projects/nuude/nuude-ecommerce` | 1 | 3172 | no |
| `premium-ui` | `skills/projects/nuude/premium-ui` | 1 | 2084 | no |
| `stitch-frontend` | `skills/projects/nuude/stitch-frontend` | 1 | 2371 | no |
| `phere-creative-director` | `skills/projects/phere-website/phere-creative-director` | 3 | 4745 | yes |
| `qa-agent` | `skills/projects/qaagent/qa-agent` | 1 | 8062 | no |
| `website-qa-agent` | `skills/projects/qaagent/website-qa-agent` | 3 | 6616 | no |
| `phere-9-agent-manager` | `skills/projects/shaadikhata/phere-9-agent-manager` | 12 | 41097 | yes |
| `supabase` | `skills/projects/shaadikhata/supabase` | 3 | 10485 | no |
| `supabase-postgres-best-practices` | `skills/projects/shaadikhata/supabase-postgres-best-practices` | 35 | 56973 | no |
| `debugging-strategies` | `skills/projects/wrkly/debugging-strategies` | 1 | 3252 | no |
| `lint-and-validate` | `skills/projects/wrkly/lint-and-validate` | 1 | 1887 | no |
| `supabase-postgres-best-practices` | `skills/projects/wrkly/supabase-postgres-best-practices` | 38 | 62597 | no |
| `test-driven-development` | `skills/projects/wrkly/test-driven-development` | 1 | 3025 | no |
| `wrkly-design-system` | `skills/projects/wrkly/wrkly-design-system` | 1 | 4010 | no |

## Custom agents

| Format | Path | Bytes |
|---|---|---:|
| `codex-toml` | `agents/codex/wrkly/wrkly-code-reviewer.toml` | 2074 |
| `codex-toml` | `agents/codex/wrkly/wrkly-debugger.toml` | 1720 |
| `codex-toml` | `agents/codex/wrkly/wrkly-doc-writer.toml` | 1298 |
| `codex-toml` | `agents/codex/wrkly/wrkly-refactorer.toml` | 1751 |
| `codex-toml` | `agents/codex/wrkly/wrkly-security-auditor.toml` | 2259 |
| `codex-toml` | `agents/codex/wrkly/wrkly-test-writer.toml` | 2040 |
| `claude-markdown` | `agents/claude/wrkly/code-reviewer.md` | 2081 |
| `claude-markdown` | `agents/claude/wrkly/debugger.md` | 1717 |
| `claude-markdown` | `agents/claude/wrkly/doc-writer.md` | 1325 |
| `claude-markdown` | `agents/claude/wrkly/refactorer.md` | 1783 |
| `claude-markdown` | `agents/claude/wrkly/security-auditor.md` | 2267 |
| `claude-markdown` | `agents/claude/wrkly/test-writer.md` | 1917 |

## Plugins

| Name | Version | Manifest |
|---|---|---|
| `phere` | `0.1.0` | `plugins/phere/.codex-plugin/plugin.json` |
| `qa-agent` | `0.1.0` | `plugins/qa-agent/.codex-plugin/plugin.json` |
| `skilled-agents` | `1.0.0` | `plugins/skilled-agents/.codex-plugin/plugin.json` |

## Excluded by design

- Built-in .system skills
- OpenAI bundled and curated plugin caches
- Vercel plugin caches
- Auth files, sessions, browser profiles, env files, databases, runtime logs, and generated run/status folders
- Unlicensed upstream source snapshots; these remain reference-only in external-skills.json
