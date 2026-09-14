B"H
Boruch Hashem
Blessed is He

# Phase Two — Gevurah: Realistic Architecture and 20 Improvement Gates

This is a public-quality decision artifact, not hidden chain-of-thought.

> Chesed would polish every star; Gevurah chooses what evidence can show,
> Tiferes joins the living truth, while Awtsmoos renews the flow.
> Awtsmoos.com becomes the bridge, but no bridge may invent its shore;
> source, calendar, reader, and form must agree before we publish more.

## Realistic implementation boundaries

- Website changes belong only in `main/sites/bais-shimon-5787/` inside the Virtual OS.
- Native changes belong only under `/Users/awtsmoos/work/awtsmoos.com/` when the site depends on platform behavior proven there.
- No JPS, scraped translation, or invented Rashi text.
- Existing working public links and contracts remain stable unless directly broken.
- Global navigation should be shared, not hand-maintained per page.
- Holiday/Shabbos display should derive from one canonical schedule resolver rather than duplicated literals.
- Mobile form CSS should be repaired at the layout primitive, not via per-field hacks.
- Study availability should distinguish local materialization from official external source access.

## Twenty improvement gates before editing

1. Inventory every public route reachable from navigation and cards.
2. Verify each route has consistent global menu affordance.
3. Verify menu can open, close, escape, focus-trap, and restore focus.
4. Verify body scroll lock does not trap browser-back or page scrolling.
5. Measure mobile overflow at 320, 360, 390, 430 CSS px widths.
6. Verify forms use one-column flow below the correct breakpoint.
7. Verify labels remain attached to controls and do not visually collide.
8. Verify tap targets are at least comfortably finger-sized.
9. Verify text does not depend on delayed animation to become visible.
10. Trace Daily Study availability flags to their actual data source.
11. Provide truthful official Chabad fallback links when English/Rashi is absent locally.
12. Verify Hebrew stays authoritative and fully readable with nikud/cantillation.
13. Verify reader scaling controls preserve layout and line-height.
14. Trace the wall-calendar/holiday data source before changing Shabbos logic.
15. Merge Yom Tov schedule into This Shabbos only when date overlap is proven.
16. Prevent duplicate schedules when Shabbos and Yom Tov share services.
17. Verify time-zone and local-date boundaries for Crown Heights.
18. Verify external links have correct target/rel behavior and usable accessible names.
19. Check canonical/OG/structured-data URLs against production domain.
20. Re-run console, network, accessibility, and responsive checks after publication.

## Candidate modules to look for, not yet assumed

- Shared site shell/navigation module.
- Calendar/holiday resolver.
- Shabbos schedule composer.
- Study source adapter/availability renderer.
- Reservation form layout styles.
- Shared responsive tokens/glass-card styles.

## NEXT_ACTION

Audit live production and published Awtsmoos mirror, then inspect exact source files that implement the observed surfaces.
