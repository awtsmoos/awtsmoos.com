B"H
# Actual Code Fix Plan

## User-reported failures
1. Level 1 platforms are too close together for player height, causing head collisions / impossible upward movement.
2. A spike appears out of nowhere while climbing and cannot be dodged.
3. This likely exists in all levels via enrichment/triggers/proximity spikes, not just level 1.

## Fix policy
- No generated replacement campaign.
- No partial patching of files.
- Read affected files first.
- Rewrite complete files only.
- Prefer systemic safety helpers for all 51, then hand-fix Level 1 if needed.

## Code targets to inspect
- js/core/physics.js for player dimensions and collision.
- js/data/levels/level01-malchus.js for handmade geometry.
- js/data/enrichment/* for globally injected upper route / spikes / devil hazards.
- js/systems/spikes.js and trigger systems for warning behavior.
- tests to add real regressions: headroom and spike telegraph/dodge.

## Human fairness constants to enforce
- Player height is authoritative from physics.
- Minimum vertical passage between traversed platforms should exceed player height plus jump/headroom margin.
- Emerging / falling / proximity spikes need visible warning time and safe dodge lane.
- If a spike can appear on a mandatory path, warning must happen before the player is committed.
