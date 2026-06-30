# B'H — Final Verification: Punch / Kick / Real Adventure

Full-file rewrites and new split modules completed.

Combat changes completed:

- `js/data/attacks.js` now gives punch and kick different startup, reach, damage, knock, and recovery values.
- `js/combat/attackTraits.js` declares punch/kick/meteor/sweep traits.
- `js/combat/attackImpulse.js` splits attacker body motion away from attack startup.
- `js/combat/attackState.js` applies family-aware charge, rapid, range, and active-frame tuning.
- `js/combat/directionalAttack.js` makes punch and kick choose distinct moves.
- `js/combat/rapidAttack.js` makes rapid punch a jab drum and rapid kick a wider boot rhythm.
- `js/combat/attackGeometry.js` gives kicks longer body reach and sweep/meteor-specific collision profiles.
- `js/combat/combatEvents.js` emits visual event traits so kicks can slash, trips can shockwave, and charge can ring.

Adventure changes completed:

- `js/adventure/adventureRun.js` tracks gate number, Sparks, hidden Sparks, Kelipos left, exit-open status, and status text.
- `js/data/adventure/adventureFactory.js` preserves hidden Spark markers from `*` tiles.
- `js/powerups/powerupFactory.js` turns Adventure powerup spawns into Adventure Sparks instead of generic arena orbs.
- `js/powerups/powerupSystem.js` records Spark pickup progress into the Adventure ledger.
- `js/powerups/effects/applyPickupEffect.js` gives Sparks light healing / speed reward without breaking combat balance.
- `js/render/v3/hud/AdventureHud.js` draws live Gate / Spark / Hidden / Kelipah HUD.
- `js/render/ui.js` mounts the Adventure HUD while keeping existing damage HUD.
- `js/core/state.js` creates Adventure run state and names bots as Kelipos in Adventure.
- `js/core/loop.js` steps Adventure progress during normal frames and hitstop.
- `js/main.js` saves hidden Spark records into local Adventure progress when a human clears a gate.

Verified:

- `node --check` passed for every rewritten/new JS file in this pass.
- Import smoke passed for maps, state creation, Adventure run, Spark factory, attack state, and Adventure clear status.
- Smoke evidence: 50 Adventure maps, first map creates 2 Sparks with 1 hidden Spark, jab radius 64, roundhouse radius 132.
- Every new or rewritten file in this pass remains under 120 lines. Largest is `js/main.js` at 106 lines and `js/core/loop.js` at 98 lines.
- Readback completed after final writes for all combat, adventure, powerup, render HUD, state, loop, and main files.

Known limitation:

- Live Chrome visual navigation was not rerun in this pass because prior tunnel Chrome calls were unreliable; command and import verification completed successfully.
