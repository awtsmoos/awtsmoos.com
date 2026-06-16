B"H

PHASE 2 — FILE TOUCH THEORY

Likely read paths:
- ai-thoughts/2026-06-14-sefira-clash-animation-overhaul/
- js/render/v3/character/animation/**
- js/render/v3/effects/ImpactFX.js
- js/render/v3/character/CharacterRenderer.js
- js/ai/direct/**
- js/ai/botBrain.js
- .sim/*.json requested
- .sim/v3-extra-animation-probe.mjs and related probes

Potential touch paths, only after evidence:
- Existing pose modules under js/render/v3/character/animation/...
- StateMap.js if mapping already contains desired semantic states.
- ImpactFX.js only if combo aura/shield/bounce effects lack animation support.
- AI direct/botBrain only if sim output reveals evidence-backed weakness.

Whole-file rule:
Every touched source file must be rewritten in full. No partial patching.

20 improvements over raw plan:
1. Inspect probe assertions before adding state names.
2. Count states from code, not memory.
3. Compare pose silhouette values by sampling pose outputs.
4. Prefer existing states with richer geometry over new states.
5. Preserve all exports exactly unless intentionally changing API.
6. Run syntax probes after each cluster if feasible.
7. Capture sim baseline before AI change.
8. Avoid AI change if current sim already passes and no evidence points to issue.
9. Add character personality via existing character identity fields if renderer exposes them.
10. Keep files short.
11. Use command output as evidence.
12. Update thought folder with planned vs actual.
13. If a probe fails, read the failing assertion.
14. If long sim times out, honestly report the max completed sim.
15. Do not claim visual perfection from numeric probes.
16. Inspect CharacterRenderer usage of pose fields.
17. Inspect ImpactFX inputs before aura changes.
18. Keep animation constants within safe numeric ranges.
19. Avoid touching physics/gameplay.
20. Preserve AI-driven metrics target.
