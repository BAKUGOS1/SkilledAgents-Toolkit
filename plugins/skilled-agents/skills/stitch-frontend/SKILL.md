---
name: stitch-frontend
description: Build NUUDE frontend components with Stitch-oriented component structure, mobile-first responsive CSS, brand tokens, accessibility, and reusable implementation patterns. Use for NUUDE Stitch or React frontend implementation.
---

# Stitch Frontend Skill

## Purpose
Build all NUUDE components using Stitch framework conventions.

## Component Pattern
```tsx
// Every component follows this structure:
export default function ComponentName() {
  return (
    <section className="component-name">
      {/* Mobile-first layout */}
    </section>
  )
}
```

## Styling Rules
- Use CSS custom properties for all brand tokens:
```css
:root {
  --nuude-bg: #FAF7F2;
  --nuude-text: #0D0D0D;
  --nuude-wine: #6B1D2A;
  --nuude-gold: #B8960C;
  --nuude-cream: #FAF7F2;
  --nuude-white: #FFFFFF;
  --nuude-font-heading: 'Playfair Display', serif;
  --nuude-font-body: 'Inter', sans-serif;
  --nuude-space-sm: 16px;
  --nuude-space-md: 32px;
  --nuude-space-lg: 60px;
  --nuude-space-xl: 80px;
  --nuude-radius: 0; /* sharp rectangles always */
}
```

## Responsive Breakpoints
```css
/* Mobile first — no media query needed */
/* Tablet */ @media (min-width: 768px) {}
/* Desktop */ @media (min-width: 1024px) {}
/* Wide */ @media (min-width: 1440px) {}
```

## Button Standard
```css
.btn-primary {
  display: block;
  width: 100%;
  padding: 16px 32px;
  background: var(--nuude-text);
  color: var(--nuude-cream);
  font-family: var(--nuude-font-body);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  border: none;
  border-radius: 0;
  cursor: pointer;
}
.btn-secondary {
  background: var(--nuude-wine);
  color: var(--nuude-cream);
}
```

## Typography Scale
- Hero heading: 48px mobile / 72px desktop, Playfair Display
- Section heading: 28px mobile / 36px desktop, Playfair Display
- Product title: 22px mobile / 28px desktop, Playfair Display
- Body: 16px, Inter, line-height 1.6
- Small/meta: 12px, Inter, letter-spacing 1px, uppercase
- Price: 18px, Inter, font-weight 600

## Image Handling
- Use `loading="lazy"` on all images below the fold
- Provide width and height attributes to prevent layout shift
- Use WebP format with JPG fallback via `<picture>` element
- Alt text required on every image
