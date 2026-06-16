B"H

CONTINUATION ORDER — USER CORRECTION ACCEPTED

The user correctly identified two remaining obligations:
1. The 6000-frame zero-damage warning with 15 KOs must be traced, not deferred.
2. The animation files rewritten in the previous pass must be split further so each individual animation/micro-pose is a smaller vessel.

Phase A: Simulator truth trace
- Inspect health rule for zero damage.
- Reproduce 6000-frame run with richer report: final stocks, fighter damage, combatEnded, winner, frame samples, attack reasons, states, opportunities.
- Determine whether warning is AI behavior, metric semantics after stock reset, or combat ending/wipe artifact.
- Fix only confirmed cause.

Phase B: AI bot action trace
- Read bot command flow and direct modules.
- Instrument or add temporary trace sim if needed.
- Identify repeated target/opportunity/action problems one by one.
- Patch AI only if evidence shows actual issue.

Phase C: Animation module split
- Split AnimationController shield/landing/combo layers into separate layer modules.
- Split Kick into small ground/aerial/meteor files.
- Split Launch into launch/wall/ground bounce files.
- Split damage Reactions into recoil/dizzy utilities if useful.
- GroundJump is small enough but can split anticipation math if needed.

Whole-file rule remains active: every source touched will be rewritten in full.
