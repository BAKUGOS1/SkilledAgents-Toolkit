---
name: wrkly-design-system
description: Apply Wrkly's exact design standards to any UI component or page
user-invocable: true
---

# Wrkly Design System

When building or modifying any UI in the Wrkly project, follow these exact standards.

## Color System (HSL Custom Properties)

### Light Mode
| Token                 | HSL Value         | Usage                     |
| --------------------- | ----------------- | ------------------------- |
| `--primary`           | 234 89% 64%      | Buttons, links, active    |
| `--primary-hover`     | 234 89% 57%      | Button hover states       |
| `--accent`            | 262 83% 68%      | Secondary actions, badges |
| `--background`        | 0 0% 100%        | Page background           |
| `--background-secondary` | 220 20% 97%   | Card backgrounds          |
| `--foreground`        | 222 47% 11%      | Primary text              |
| `--foreground-secondary` | 215 16% 47%   | Secondary text            |
| `--border`            | 220 13% 91%      | Borders, dividers         |
| `--destructive`       | 0 84% 60%        | Delete, error states      |
| `--success`           | 160 84% 39%      | Success states            |
| `--warning`           | 38 92% 50%       | Warning states            |

### Dark Mode (`.dark` class)
| Token                 | HSL Value         |
| --------------------- | ----------------- |
| `--primary`           | 234 89% 68%      |
| `--background`        | 222 47% 6%       |
| `--background-secondary` | 220 33% 10%   |
| `--foreground`        | 210 40% 96%      |
| `--border`            | 217 19% 17%      |

**Never use raw hex/rgb values.** Always `hsl(var(--token))`.

## Typography
- Font: **Inter** (loaded via `next/font/google`)
- CSS variable: `--font-inter`
- Sizes: Use Tailwind's scale (`text-sm`, `text-base`, `text-lg`, `text-xl`)
- Headings: `font-semibold` or `font-bold`
- Body: `font-normal`, `text-foreground`
- Secondary: `text-foreground-secondary`

## Spacing & Layout
- Page padding: `p-6` or `px-6 py-4`
- Card padding: `p-4` or `p-5`
- Gap between items: `gap-3` or `gap-4`
- Border radius: `rounded-lg` (0.5rem = `var(--radius)`)
- Max content width: `max-w-7xl mx-auto`

## Component Patterns

### Cards
```tsx
<div className="bg-card rounded-lg border border-border p-4 hover:bg-card-hover transition-colors">
  ...
</div>
```

### Buttons
```tsx
// Primary
<button className="bg-primary text-primary-foreground rounded-lg px-4 py-2 hover:bg-primary-hover transition-colors">

// Ghost
<button className="text-foreground-secondary hover:bg-muted rounded-lg px-3 py-1.5 transition-colors">

// Destructive
<button className="bg-destructive text-destructive-foreground rounded-lg px-4 py-2 hover:opacity-90 transition-opacity">
```

### Inputs
```tsx
<input className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-shadow" />
```

### Sidebar
- Background: `bg-sidebar`
- Active item: `bg-sidebar-active text-sidebar-active-foreground`
- Border: `border-r border-sidebar-border`

## Animations
- Transitions: `transition-colors`, `transition-opacity`, `transition-shadow` (0.2s ease default)
- Hover effects: subtle background change, never jarring
- Loading: pulse or skeleton with `animate-pulse`
- Modals: fade-in + scale (`animate-in fade-in zoom-in-95`)

## Icons
- Library: **Lucide React**
- Default size: `size={16}` for inline, `size={20}` for standalone
- Color: `className="text-foreground-secondary"` by default

## Auth Pages
- Use `auth-bg` class for gradient background with grid overlay
- Center content vertically and horizontally
- Card with glassmorphism: `bg-card/80 backdrop-blur-sm border border-border shadow-xl`

## Brand Mark
- Logo component: `<Logo variant="lockup" />` or `<Logo variant="icon" />`
- Auto-switches between dark/light based on theme
- Assets in `public/brand/` — pixel-grid style (3+2 grid, glass highlights)
