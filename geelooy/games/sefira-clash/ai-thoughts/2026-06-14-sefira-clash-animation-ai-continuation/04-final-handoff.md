B"H

FINAL HANDOFF — ANIMATION + AI CONTINUATION

Touched source files, all rewritten whole:
- js/render/v3/character/animation/AnimationController.js
- js/render/v3/character/animation/Kick.js
- js/render/v3/character/animation/jump/GroundJump.js
- js/render/v3/character/animation/Launch.js
- js/render/v3/character/animation/damage/Reactions.js

Evidence-backed changes:
- A silhouette sample showed aerialKick matched normal kick; Kick.js now separates grounded arcs, aerial snap kicks, and meteor spear-down poses.
- shieldIdle, shieldHit, and shieldBreak were identical; AnimationController shield layering now gives hit recoil and shield-break collapse.
- jumpStart/rising were close; GroundJump now has a stronger early crouch/anticipation.
- wallBounce/groundBounce had generic launch treatment; Launch.js now has distinct wall recoil and ground-splat poses.
- dizzy/high-damage low-stun now receives visible sway in damage/Reactions.js.
- Landing and hardLanding were made more distinct through stronger asymmetric compression.

AI decision:
- No AI source was changed in this pass. Current focused sim evidence was clean after animation changes; the old focused warning was not reproduced in the new focused run.
- A 6000-frame single-map run completed locally but returned a zero-damage warning while also reporting 15 KOs and 4229 active attack frames. A 3600-frame follow-up completed cleanly, suggesting the 6000 warning needs future simulator-health investigation rather than speculative AI behavior changes.

Verification run in this pass:
- node .sim/v3-animation-overhaul-probe.mjs PASS, vocabulary 50.
- node .sim/v3-render-probe.mjs PASS.
- node .sim/spectacle-probe.mjs PASS.
- node .sim/v3-extra-animation-probe.mjs PASS.
- .sim/ai-focused-animation-continuation.mjs produced .json for 3 maps: all ok true, no failures, no warnings.
- .sim/ai-warning-inspect-3600.mjs PASS: ok true, warnings [], failures [], 3600 frames, 11 KOs, damagePerMinute 318, longestNoPressureWindow 83.

Unverified / remaining:
- Full 18,000-frame sim was not rerun successfully and remains unverified.
- 6,000-frame single-map run completed but had a warning; not counted as clean.
- Future work: inspect simulator damageEnd/zero-damage warning semantics during stock wipes before changing AI.
