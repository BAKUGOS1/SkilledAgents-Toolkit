---
name: premium-ui
description: Apply premium e-commerce UX patterns for product galleries, shade selectors, mobile sticky actions, loading states, accessibility, and conversion-focused interface polish. Use when building or reviewing NUUDE product UI.
---

# Premium UI Skill

## Purpose
Ensure every component meets premium e-commerce UX standards.

## Shade Selector Pattern
```
[dot] [dot] [dot] [dot] [dot] [dot] [dot] [dot]
         ↑ selected (ring highlight)
    Shade Name: Nuit Parisienne
    Best for: medium to deep skin tones
```
- Dots: 32px diameter, 8px gap
- Selected: 2px ring in wine colour, 4px offset
- On tap: main image gallery updates to show this shade
- Group dots by family: Nudes | Reds | Berries | Browns | Plums
- Below selector: "Not sure? Find your shade in 60 seconds →"

## Sticky Add-to-Cart (Mobile)
- Fixed to bottom of viewport
- Full-width, 56px height
- Black background, cream text
- Contains: price + "ADD TO CART" text
- Appears after scrolling past the main Add to Cart button
- z-index: 1000

## Product Image Gallery
- Swipeable on mobile (touch events)
- Dot indicators below
- Pinch-to-zoom support
- First image: shade swatch on skin (not product tube)
- Desktop: thumbnail strip on left, main image on right

## Trust Badges Row
- 4 icons in a horizontal row
- Icon size: 24px
- Below each: label in 11px uppercase Inter
- Items: "10-Hr Stay" | "Hydrating Matte" | "Cruelty-Free" | "Derm Tested"

## Cart Upsell
- Below cart items: "Add a matching shade for ₹200 off"
- Show 2 recommended products based on what's in cart
- Progress bar: "Free shipping if you add ₹X more"

## Conversion Checklist
Every product page must include:
- [ ] Shade swatch on real skin tones (first image)
- [ ] Price with strikethrough showing discount
- [ ] Shade selector with name + skin-tone hint
- [ ] Sticky Add-to-Cart on mobile
- [ ] Trust badges visible without scrolling
- [ ] "Ships in 2–3 days" reassurance below CTA
- [ ] Free returns mention
- [ ] Cross-sell/bundle suggestion
