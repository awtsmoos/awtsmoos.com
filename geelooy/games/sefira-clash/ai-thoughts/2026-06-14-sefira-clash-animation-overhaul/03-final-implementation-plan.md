B"H
# Final Implementation Plan

Files rewritten completely:
- js/render/v3/character/animation/Pose.js
- js/render/v3/character/animation/AnimationController.js
- js/render/v3/character/animation/Idle.js
- js/render/v3/character/animation/Run.js
- js/render/v3/character/animation/Jump.js
- js/render/v3/character/animation/Fall.js
- js/render/v3/character/animation/Punch.js
- js/render/v3/character/animation/Kick.js
- js/render/v3/character/animation/Charge.js
- js/render/v3/character/animation/Hitstun.js
- js/render/v3/character/animation/Launch.js
- js/render/v3/character/animation/Knockout.js
- js/render/v3/character/CharacterRig.js
- js/render/v3/character/CharacterRenderer.js

Files added:
- js/render/v3/character/animation/Math.js
- js/render/v3/character/animation/StateMap.js
- js/render/v3/effects/ImpactFX.js
- .sim/v3-animation-overhaul-probe.mjs

Verification:
- Run Node import/probe across idle, run, sprint, brake, turn, jump, peak, fastfall, landing, charge, punch, rapid, kick, hit, launch, shield, death, respawn.
- Ensure all resolved rig points are finite.
- Ensure state vocabulary exposes missing states for future systems even when game fields are approximated.