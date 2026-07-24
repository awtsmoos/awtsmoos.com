B"H

# Planned Versus Actual

## Planned

1. Trace both renderers and the live light preset.
2. Define six bounded dark palettes and shared procedural maps.
3. Record base, texture, vertex, light, roughness, and emissive evidence.
4. Preserve bootstrap readability without brightening unrelated world materials.
5. Prove UV/map binding and zero frame-update allocations.
6. Add focused world and app tests.
7. Keep every executable file at or below 120 lines.

## Actual

- Traced bootstrap and rich shaders to their exact formulas and consumed properties.
- Added six live palettes plus one weathered-stone compatibility palette.
- Added six shared 256×256 procedural textures with hide, rune, scar, vein, ridge, glyph, and stone patterns.
- Added anatomical regions and measurable vertex multipliers for eyes, face, torso, arms, legs, horns, and claws.
- Added immutable bootstrap and rich renderer records, live-light metrics, UV evidence, and allocation diagnostics.
- Bound both `map` and renderer-consumed `mapImage` to the same cached canvas.
- Kept emissive strength at 0.06 and avoided renderer name heuristics that would enable full-body emission.
- Kept generic world-material normalization local to collapsed materials and preserved ordinary bootstrap colors unchanged.
- Added two focused test files and retained two existing material suites.
- Split new responsibilities into small prefix-authorized modules; all executable files are at or below 107 lines.

## Delta resolved

The first test pass exposed five compatibility deltas: exact eye accent, metallic factor 0.035, explicit family precedence, weathered-stone compatibility, and darker tint caps. All five were resolved through complete-file rewrites before the final passing test run.
