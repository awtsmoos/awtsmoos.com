B"H

# Final Implementation Plan

1. Read the tiny-runtime material class, rich renderer binding, bootstrap binding, lighting defaults, and demon spawn profiles.
2. Measure baseline tint, texture palette, vertex multiplication, emissive, roughness, UV range, and predicted live-light luminance.
3. Implement six deterministic readability profiles through bounded variant keys.
4. Rewrite painter and texture cache to expose real procedural map and luminance evidence.
5. Rewrite material creation to bind the actual consumed map field, preserve readable vertex colors, and record light-response metrics.
6. Rewrite geometry/vertex records to prove UV population and anatomical contrast.
7. Rewrite bootstrap material to expose a stable fallback record before rich texture readiness.
8. Add focused app tests for metrics/binding and world tests for six-profile contrast/cache behavior.
9. Run all implementation writes before any tests, then execute syntax checks and focused test suites.
10. Re-read complete touched files, compare planned versus actual, resolve deltas, and write the final handoff.
