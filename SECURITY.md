# Security policy

Do not report secrets by opening a public issue. Use GitHub's private vulnerability reporting feature for this repository.

Before publishing a change, run `.\scripts\validate.ps1`. The validator checks common credential patterns, private-key blocks, forbidden runtime paths, malformed skills, plugin manifests, and custom-agent files.

Never commit `.env` files, authentication state, Codex sessions, browser profiles, customer data, production exports, database files, or local memory dumps.

