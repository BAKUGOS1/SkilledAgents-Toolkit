---
name: webapp-testing
description: Local web application testing workflow for browser automation, Playwright-style checks, screenshots, console logs, UI behavior debugging, responsive verification, and regression QA. Use when verifying a local web app, testing a frontend change, reproducing UI bugs, checking browser console errors, or validating user flows after implementation.
---

# Webapp Testing

## Overview

Use this skill to verify local web apps with evidence instead of assumptions. It is adapted from useful patterns in Anthropic's Apache-2.0 `webapp-testing` skill, tuned for Codex's local browser and Windows workspace.

## Decision Tree

- If the user explicitly asks for the in-app browser or the target is local, prefer the Codex Browser plugin when available.
- If a dev server is needed, start or reuse the app's normal server command and note the URL.
- If a static HTML file is enough, inspect the file and open it directly.
- If the UI is dynamic or flaky, use reconnaissance first: open page, wait for stable render, capture screenshot/DOM/logs, then interact.
- If Browser tooling is unavailable or a repeatable script is better, write a small Playwright test/script scoped to the flow.

## Testing Workflow

1. Identify the exact user flow and expected behavior.
2. Confirm the app URL, route, auth state, seed data, and viewport.
3. Capture baseline evidence: screenshot, visible text, console errors, or network failures.
4. Exercise the flow using stable selectors and user-like actions.
5. Check desktop and mobile when layout may be affected.
6. Record failures with reproduction steps and likely root cause.
7. After fixes, rerun the smallest meaningful checks.

## What To Verify

- Route loads without blank screen or fatal console errors.
- Primary actions work and preserve data.
- Empty, loading, error, disabled, and validation states are present.
- Mobile layout has no clipped text or overlapping controls.
- Accessibility basics exist for forms, modals, focus, and icon-only controls.
- No unexpected network calls, auth redirects, or broken assets.

## Final Handoff

Include URL tested, viewport(s), steps executed, evidence captured, result, and unverified risks.
