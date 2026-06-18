---
name: website-builder-setup
description: "Install and verify the AI website builder stack: UI/UX Pro Max, Motion/Framer Motion, 21st.dev Magic, Taste, Emil Design Engineering, Impeccable, and Stitch skills."
---

# Website Builder Setup

Use this skill when the user wants to set up, repair, or expand their AI website-building stack for premium marketing sites, SaaS pages, app mockups, motion-heavy UI, Stitch workflows, and design review loops.

## What Gets Installed

| Tool or skill | What it adds |
|---|---|
| UI/UX Pro Max | Design-system prompts, style directions, palettes, type pairings, and UI heuristics. |
| Motion / Framer Motion | Production animation patterns: reveals, transitions, hover/tap feedback, and reduced-motion aware effects. |
| 21st.dev Magic | Component inspiration and generated React UI building blocks. |
| Taste Skill | Stronger visual taste rules for frontend architecture, typography, layout, color, and anti-generic UI. |
| Emil Design Engineering | Micro-interaction polish, animation judgment, component feel, and design-engineering review. |
| Impeccable | Deep UI critique, redesign, polish, UX writing, responsiveness, accessibility, and live iteration workflows. |
| Stitch Skills | Stitch design, code-to-design, design-system extraction, prompt enhancement, and React component workflows. |

## Operating Style

- Walk the user through setup in clear steps, but do the work directly when possible.
- Do not ask for secrets in chat. If an API key is required, ask the user to set it locally or paste only when they explicitly accept that risk.
- If a command fails, explain the failure briefly, provide the manual command, and continue with the rest of the stack.
- Prefer `$CODEX_HOME\skills` when `CODEX_HOME` is set; otherwise use `$HOME\.codex\skills`.
- After installing new Codex skills, tell the user to restart Codex so the new skills appear in the active skill list.

## Step 1: Check Prerequisites

Run:

```powershell
node --version
npm --version
python --version
git --version
```

If Node.js is missing, stop and ask the user to install the LTS version from `https://nodejs.org`.

If Python or Git is missing, continue where possible but tell the user which GitHub skill installs may fail.

## Step 2: Install UI/UX Pro Max

Run:

```powershell
npm install -g uipro-cli
uipro init --ai codex
```

Fallback if `--ai codex` is not supported:

```powershell
uipro init --ai claude
```

## Step 3: Install Motion

For Next.js or React projects, prefer the modern Motion package when starting fresh:

```powershell
npm install motion
```

If the existing project already uses `framer-motion`, keep it:

```powershell
npm install framer-motion
```

Always check `package.json` before importing either package.

## Step 4: Connect 21st.dev Magic

The user needs a 21st.dev API key from `https://21st.dev/magic/console`.

For Codex plugin setup, use the available plugin workflow if present. If the user already has the key locally, the command pattern is:

```powershell
$env:API_KEY="YOUR_21ST_DEV_KEY"
npx -y @21st-dev/magic@latest
```

Do not store or print API keys in project files.

## Step 5: Install Advanced Design Skills

Resolve the built-in skill installer helper:

```powershell
$codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME '.codex' }
$skillInstaller = Join-Path $codexHome 'skills\.system\skill-installer\scripts\install-skill-from-github.py'
```

Install the main Taste skill:

```powershell
python $skillInstaller --repo Leonxlnx/taste-skill --path skills/taste-skill
```

Install Emil Design Engineering:

```powershell
python $skillInstaller --repo emilkowalski/skills --path skills/emil-design-eng
```

Install Impeccable:

```powershell
python $skillInstaller --repo pbakaus/impeccable --path skill --name impeccable
```

Install Stitch skills:

```powershell
python $skillInstaller --repo google-labs-code/stitch-skills --path plugins/stitch-design/skills/code-to-design plugins/stitch-design/skills/extract-design-md plugins/stitch-design/skills/extract-static-html plugins/stitch-design/skills/generate-design plugins/stitch-design/skills/manage-design-system plugins/stitch-design/skills/upload-to-stitch plugins/stitch-build/skills/react-components plugins/stitch-build/skills/remotion plugins/stitch-build/skills/shadcn-ui plugins/stitch-utilities/skills/design-md plugins/stitch-utilities/skills/enhance-prompt plugins/stitch-utilities/skills/stitch-loop plugins/stitch-utilities/skills/taste-design
```

If a destination already exists, do not overwrite it automatically. Report that it is already installed.

## Step 6: Optional Stitch Plugin Marketplace

For full Stitch plugin integration, add the Stitch marketplace when Codex plugin CLI is available:

```powershell
codex plugin marketplace add google-labs-code/stitch-skills --ref main --sparse .agents/plugins --sparse plugins/stitch-design --sparse plugins/stitch-build --sparse plugins/stitch-utilities
```

Stitch workflows require the Stitch MCP server and credentials. Do not claim Stitch is fully ready until the MCP server is visible in the active tools.

## Step 7: Verify

Run:

```powershell
$codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME '.codex' }
Get-ChildItem (Join-Path $codexHome 'skills') -Directory | Sort-Object Name | Select-Object -ExpandProperty Name
```

Expected important entries:

- `taste-skill`
- `emil-design-eng`
- `impeccable`
- `code-to-design`
- `generate-design`
- `manage-design-system`
- `react-components`
- `shadcn-ui`
- `design-md`
- `enhance-prompt`
- `stitch-loop`
- `taste-design`

## Done Message

When finished, summarize what installed, what failed if anything, and say:

> Restart Codex to pick up the new skills.

Then the user can ask for premium website work using:

- `website-builder-setup`
- `ui-ux-pro-max`
- `taste-skill`
- `emil-design-eng`
- `impeccable`
- Stitch skills such as `generate-design`, `stitch-loop`, `code-to-design`, or `react-components`
