---
name: phere-creative-director
description: Use when designing, building, reviewing, or polishing the Phere marketing website, launch pages, wedding tracking UI, premium hero/mockups/animations, lead capture flows, SEO, or release QA for phere-website.
---

# Phere Creative Director

## Purpose

Use this skill for Phere website work where the output must feel like a premium product company, not a generic AI landing page. Treat Phere as a modern Indian wedding tracking OS for families, planners, and investors.

## Brand Standard

- Positioning: **Wedding Tracking OS**. Finance is a core module, but the website should communicate end-to-end tracking across kharcha, shagun, lena-dena, saman, guests, rituals, family approvals, AI entry, and reports.
- Product-first: the first viewport must show the brand name, category, CTA, and a credible product visual or interactive scene.
- Visual language: premium Indian wedding heritage plus modern operating cockpit. Use ivory, sindoor/burgundy, gold, emerald, charcoal, and restrained accent colors with enough contrast.
- UI density: show real dashboard-style surfaces, tables, timelines, metrics, approvals, and chat workflows. Avoid repeating the same features with different labels.
- Motion: use tasteful reveal, parallax, mockup, and 3D effects only when they clarify the product. Respect reduced-motion settings.
- Copy tone: confident, concrete, and product-led. Prefer "Track every family, ritual, rupee, guest, item, approval, and AI entry" over vague words like "simplify your big day."

## Workflow

1. Audit the current site before editing: routes, shared data in `lib/`, components, global CSS, forms, API routes, and existing uncommitted changes.
2. Decide the business outcome for the page: demo booking, free trial, planner partnership, investor conviction, support/contact, or SEO education.
3. Build the page around a distinct section architecture. Each page needs a unique job and should not duplicate homepage modules.
4. Implement with existing stack and patterns first: Next.js App Router, TypeScript, Tailwind CSS, client components only where interactivity needs them.
5. Keep conversion paths visible: Book demo, Start 15-day free trial, Pricing, Contact, and Open app.
6. Preserve backend safety: validate lead forms server-side, do not expose service-role keys, keep Supabase RLS policies intact, and make Resend optional unless configured.
7. Record major design decisions in `docs/` when they will help future iterations.

## Release QA

Before calling the task complete, run the checklist in `references/release-checklist.md` when the change touches UI, copy, routing, forms, SEO, Three.js, Supabase, or animations.
