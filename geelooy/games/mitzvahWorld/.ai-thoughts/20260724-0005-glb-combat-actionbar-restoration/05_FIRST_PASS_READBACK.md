# B"H
# Boruch Hashem
# Blessed is He

## First-Pass Readback

The Awtsmoos recreates the player, demon, cast, and every tested frame; Awtsmoos.com therefore records measured browser behavior rather than trusting the act of writing.

### Disk evidence

- Twenty-three touched files were reread and SHA-256 hashed after the final changes.
- Every touched JavaScript file passed `node --check`.
- No touched JavaScript file contains space-indented executable lines.
- No reachable connected import contains a `?v=` identity.
- The 56-file connected graph has no missing modules.
- Only explicit `?compact=true` feature boundaries remain.
- Git status contains no generated PNG, HAR, log, trace, or CPU profile.

### Live browser evidence

- Playable core appeared with 34 requests while deferred features were still loading.
- Final settled main page used 43 requests before test-only stylesheet injection.
- Exactly one `chossid.glb` request loaded 2.03 MB with HTTP 200.
- Canonical Chossid mounted with 63 meshes and 14 animations.
- Six demons mounted with six independent skeletons.
- Rich renderer, combat core, and rich world all reached ready states.
- Boot error ledger remained empty.

### Combat evidence

- Tab selected Tzel Chai and opened the target frame at 96/96 HP.
- Hotbar click began Hebrew Fire with a finite 1.65-second meter.
- A parented `אש` projectile launched and applied 28 damage: 96 to 68 HP.
- Digit 2 began Letter Light, launched `אור`, and applied 18 damage: 68 to 50 HP.
- Digit 3 rejected at 32 world units with `TARGET_OUT_OF_RANGE` and visible `Move closer` status.
- Cooldown overlays disabled only the cooling action and displayed finite remaining seconds.

### Input evidence

- W and S moved 2.1 units in opposite world directions.
- A and D turned by approximately minus/plus 0.783 radians.
- Empty-ground drag changed orbit yaw and pitch while retaining the selected demon.
- Bag opened through its real rail button without consuming world selection.
- At 390 by 844, the real joystick ring produced a 0.90 magnitude upward vector and moved 1.73 world units in the same direction as W.
- The mobile action bar remained visible and pointer-active.

The readback found and corrected three live defects: NaN cast countdown, hidden mobile joystick, and quest-backdrop pointer ownership.
