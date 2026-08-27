B"H
Boruch Hashem
Blessed is He

# Tiferes Final Plan — One Future Language, Many Pages

The Awtsmoos is beyond every color and motion, yet Awtsmoos.com may join many pages in one living rhyme;
one visual covenant will carry icon, depth, and reveal, while each route keeps its purpose in time.

## Exact implementation

1. Create `geelooy/style/future-system/index.css` as the import manifest.
2. Create `tokens.css`, `atmosphere.css`, `surfaces.css`, and `motion.css`, each below 120 lines.
3. Create `geelooy/scripts/future-system/index.js` as the coordinator.
4. Create `FutureRevealController.js`, `FuturePointerAura.js`, `FutureIconRenderer.js`, and `futureIconPaths.js` as focused modules.
5. Rewrite Games HTML fully: load shared system, add future page/accent attributes, add semantic SVG icon mounts to hero/search/rail, add reveal/aura attributes.
6. Rewrite Apps HTML fully: load system, add icons to primary hero actions/filter, mark hero/filter/heading/grid for reveal/aura.
7. Rewrite Wallet HTML fully: load system, add icons to hero actions/balance/forms/store, mark sections for reveal/aura without moving form fields.
8. Rewrite About HTML fully: load system, give hero and narrative sections icon/reveal treatment while preserving copy.
9. Rewrite Social Hub HTML fully only if it can remain below 120 lines after expansion. If not, restrict the shared layer to CSS/JS via body classes and existing structural selectors without rewriting business markup.
10. Leave OS and Torah/Sefarim untouched because they already have dedicated icon/motion systems.
11. Add one focused contract test for the shared future system and page opt-in wiring.
12. Do not alter business JS unless a verified integration issue appears.

## Icon vocabulary

Use restrained inline SVG icons: play, grid/apps, wallet/diamond, connect/link, search, spark, shield, profile, message, source/book, pulse/activity, create/plus, review/check, home/orbit. Icons are decorative when text already names the action and must be `aria-hidden`.

## Motion vocabulary

- Reveal: opacity remains visible even before observer state; small translate/blur only.
- Aura: pointer-follow radial light on opted-in hero/cards/panels.
- Atmosphere: slow background grid drift and hero scan glow using pseudo-elements.
- Hover: 1–3px lift with border/light intensification.
- Focus: strong visible outline independent of hover.
- Reduced motion: remove drift/translate and preserve all content immediately.

## Acceptance criteria

- Games, Apps, Wallet, About, and Social visually share the future language.
- Each route still looks like itself.
- Primary actions gain real SVG icons rather than emoji substitutes.
- Dynamic app/game content still renders through existing scripts.
- No hidden content if JS fails.
- No animation traps for reduced-motion users.
- No raster assets added.
- All touched source files use tabs and remain below 120 lines.
- Existing page-specific tests plus new future-system contract pass.
- Browser inspection proves at least Games, Apps, Wallet, and Social render the shared layer without console errors.
