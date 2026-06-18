# Phere Website Release Checklist

Use this after substantial Phere website changes.

## Visual Review

- First viewport has brand signal, category, CTA, and a product visual.
- Mobile, tablet, desktop, and wide desktop have no horizontal overflow.
- Text does not overlap product mockups, canvas elements, nav, cards, or buttons.
- Product visuals are specific to Phere: dashboard, kharcha, shagun, lena-dena, saman, rituals, AI entry, reports, family sync.
- Palette does not collapse into one-note purple, beige, brown, or dark-blue styling.
- Motion feels premium and does not hide essential content.

## Product And Conversion

- Primary CTA: Book demo.
- Secondary CTA: Start 15-day free trial.
- Pricing shown correctly: 15-day free trial, Rs 159/month, Rs 1500/year.
- `/app` opens or redirects to the existing product app.
- `/investors` is noindex unless explicitly changed.
- Footer has clear product, company, legal, and conversion links.

## Technical QA

- Run `npm run lint`.
- Run `npm run build`.
- Use Playwright or Browser to check `/`, `/features`, `/ai`, `/for-planners`, `/pricing`, `/demo`, `/investors`, `/contact`.
- Verify reduced-motion CSS or component logic when adding animations.
- For Three.js/canvas work, verify visible nonblank pixels on mobile and desktop and confirm the scene stays framed.
- Verify lead form validation, Supabase insert path, and notification behavior. If `RESEND_API_KEY` is missing, the route should still return success after storing the lead.
- Check metadata, canonical URLs, sitemap, robots, and OG-ready page titles/descriptions.

## Owner Notes

Track remaining non-blocking polish separately instead of mixing it into the release: real product screenshots, professional photo/video assets, payment gateway, analytics, CRM automation, deeper AI/RAG, and Lighthouse optimization.
