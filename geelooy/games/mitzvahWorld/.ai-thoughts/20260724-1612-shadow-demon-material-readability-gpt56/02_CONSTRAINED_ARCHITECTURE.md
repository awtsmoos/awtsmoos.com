B"H

# Constrained Architecture

## Selected approach
Keep one shared geometry and a bounded shared texture cache, while creating one small material object per actor. Move measurable palette and luminance policy into new `MinimalMeadowDemonReadability*` modules.

## Planned modules
- `MinimalMeadowDemonReadabilityProfile.js`: finite six-profile palette resolution and anatomical color policy.
- `MinimalMeadowDemonReadabilityMetrics.js`: luminance, range, contrast, and live-light prediction.
- Existing texture painter: deterministic shared hide patterns with measurable palette evidence.
- Existing material factory: bind consumed map properties, preserve vertex-color intent, and publish diagnostics.
- Existing geometry/vertex modules: UV and anatomical vertex-color evidence only where required.
- Existing bootstrap material: publish readable fallback and material record without global lighting changes.

## Invariants
- No per-frame or per-demon texture allocation.
- Texture count remains bounded by finite surface variants.
- Full-body emissive strength remains low; eye/rune accents are reported separately.
- Base visible luminance remains dark but above the silhouette-collapse floor.
- Every executable source file remains at or below 120 lines.
