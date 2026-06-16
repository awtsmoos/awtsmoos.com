B"H

PHASE 1 — RAW POSSIBILITY BRAID

User mission: continue Sefira Clash animation + AI overhaul from verified prior state, read recent work, inspect pose distinctness, refine animations, improve AI only from sim evidence, verify with probes/sims.

Immediate evidence to gather:
- Recent thought folder and its declared remaining work.
- Animation pose modules and StateMap.
- CharacterRenderer and ImpactFX integration points.
- js/ai/direct and botBrain plus advanced planners if direct modules delegate there.
- Sim outputs: focused second overhaul, 6000 after fix, any failed pre-fix outputs.

Possibilities to consider before touching code:
1. Add micro-pose overlays without expanding state count if probes expect exactly 50 states.
2. Refine existing states' silhouettes: crouch, jump anticipation, aerial kick, meteor kick, whiff recovery, landing recovery, bounce, shield reactions, stun, victory/respawn.
3. Add helper modules only if medium files need split, but preserve imports and small-file style.
4. Improve AI only if sim output identifies stagnation windows, pressure gaps, missed edgeguards, repeated opportunity lock, or whiff-punish failures.
5. Prefer animation changes first because current AI sims are already clean; no speculative AI patch.

Risks:
- New state names may break 50-state assumptions.
- Pose modules likely small; broad rewrites can cause import breakage.
- Tunnel timeout prevents 18,000-frame proof unless shorter reliable max is found.

Verification graph:
- Required animation/render/spectacle probes.
- Required extra animation probe.
- Focused AI sim.
- Longest reliable AI sim.
