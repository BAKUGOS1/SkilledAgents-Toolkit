# Provenance

This toolkit was assembled from:

- user-level skills under `~/.codex/skills`, excluding built-in `.system` skills;
- user-level skills under `~/.agents/skills`;
- project-scoped skill and agent folders from QaAgent, Shaadikhata, phere-website, NUUDE, and Wrkly;
- the locally installed Phere and QaAgent plugin bundles;
- reviewed, sanitized project workflow assets.

The repository intentionally excludes OpenAI bundled skills, curated plugin caches, Vercel plugin caches, auth state, sessions, browser profiles, runtime logs, databases, `.env` files, build output, and generated agent run/status folders.

`emil-design-eng` is recorded in `external-skills.json` but not vendored because its upstream repository did not declare a redistribution license during assembly.

Run `scripts/sync-local.ps1` to update snapshots, then review the diff before publishing.
