B"H

# Architecture Plan

## UI

- Keep mobile geometry in dedicated portrait CSS modules.
- Give cast feedback a viewport-clamped owner with safe-area-aware horizontal bounds.
- Give target status a width contract that never exceeds the remaining portrait row.
- Make inventory a true scroll container with a fixed header, touch scrolling, and non-blocking item controls.
- Keep quest completion and active tracking driven by one quest receipt rather than duplicated counters.

## World presentation

- Treat terrain as a layered material composition: grass base, dirt transition, path shoulder, and explicit cobblestone center.
- Ensure road geometry is mounted, visible, elevated above terrain by a bounded epsilon, and included in diagnostics.
- Replace tree foliage aliases that resolve to non-tree imagery with species leaf and bark identities.
- Build water from uploaded shallow/seamless water sources, paired animated normal samples, opacity/depth policy, and shoreline evidence.

## Combat and selection

- Emit one damage-feedback receipt for every successful player attack.
- Render readable damage numerals and action-themed impact effects near the struck actor.
- Expand corpse hit testing with a screen-space radius and ground-projected fallback while preserving nearest-target ordering.

## Quest completion

- Reuse useful earlier quest completion behavior from Git history without restoring obsolete UI.
- Turn-in must grant rewards once, update tracked state, unpin the completed quest, show a completion sequence, and offer the next action.
