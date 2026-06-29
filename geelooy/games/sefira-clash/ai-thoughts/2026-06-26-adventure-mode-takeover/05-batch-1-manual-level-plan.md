# B"H — Batch 1 Manual Level Plan

The user corrected the core law: levels must be manually handcrafted, not generated.

Batch 1 scope: `level01.js` through `level05.js`, plus `adventureFactory.js` so the hand-authored metadata survives into runtime.

Design progression:

1. Level 1: movement and safe Spark pickup. One enemy only after the first bridge.
2. Level 2: vertical moon steps. Jump spacing and one tucked reward.
3. Level 3: mirror-lane approach/retreat. Two separated patrol reads.
4. Level 4: long-run pacing, weapon before pressure, optional upper Spark.
5. Level 5: first tiny mastery garden combining hops, stomp target, weapon, and secret alcove.

Rules:

- No copied rows.
- No shifted clone layouts.
- Every row is manually typed.
- Every enemy, weapon, Spark, and secret has a reason written in metadata.
- Each file remains its own module.

Verification after write:

- Import all 50 levels.
- Confirm 50 unique layouts remain.
- Confirm Batch 1 metadata is present.
- Confirm each of levels 1–5 has platforms, spawns, powerups, and at least one enemy after factory conversion.
