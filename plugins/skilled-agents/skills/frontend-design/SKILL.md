---
name: frontend-design
description: Production frontend design and implementation guardrails for web apps, pages, dashboards, landing pages, React components, HTML/CSS layouts, and UI polish. Use when creating, redesigning, beautifying, or reviewing frontend interfaces that need a distinctive visual direction, strong UX, responsive behavior, accessibility basics, and avoidance of generic AI-looking design.
---

# Frontend Design

## Overview

Use this skill to make frontend work feel intentional, domain-specific, and production-quality. It is adapted from useful patterns in Anthropic's Apache-2.0 `frontend-design` skill, but tuned for Codex and local project work.

## Design Direction

Before coding or reviewing:

- Identify the product purpose, primary user, and workflow pressure.
- Choose one clear visual point of view that fits the domain.
- Match density to the product: operational apps should be calm, scannable, and efficient; editorial or creative pages may be more expressive.
- Avoid generic AI defaults: centered sameness, purple gradients, over-rounded cards, random glassmorphism, and decorative blobs.
- Preserve existing design system conventions unless the user asked for a redesign.

## Implementation Rules

- Build the actual usable screen first, not a marketing wrapper.
- Use real controls for real actions: icon buttons, menus, tabs, toggles, sliders, inputs, and clear command buttons.
- Keep text fitted inside its container on mobile and desktop.
- Use stable dimensions for boards, tiles, toolbars, cards, and counters to avoid layout shifts.
- Make empty, loading, error, disabled, and success states feel designed.
- Prefer CSS variables or existing tokens for repeatable color, spacing, and type.
- Verify responsive behavior when the change affects UI.

## Review Checklist

- Does the screen communicate the primary task within a few seconds?
- Are actions positioned where users naturally expect them?
- Is there one clear hierarchy instead of many competing cards?
- Does typography match the container size?
- Are colors balanced, accessible, and not one-note?
- Are hover/focus states and keyboard paths covered where relevant?
- Does the implementation avoid extra dependencies and fragile layout tricks?

## Final Handoff

Report the visual direction, changed files, verification performed, remaining UX risks, and any assumptions.
