B"H

# Body Language / Player Animation Concrete Plan

## User direction
Do not make a person/story system. Improve how the player/fighters look and animate. Make the brawl readable and alive through body language.

## Real files inspected

- `js/render/fighters.js`
  - Draws fighter body, limbs, head, hats, labels, danger aura, charge aura, shield, attack arc.
  - Already computes `lean` from velocity.
  - Uses `f.bones` from skeleton solver.
  - Currently 7.5k+ bytes and should be split.

- `js/skeleton/solveSkeleton.js`
  - Central pose solver.
  - Computes base pose, state pose, and action pose.
  - Already supports analog-vector combat posing.
  - Currently 9k+ bytes and should be split.

- `js/skeleton/animationState.js`
  - Classifies `idle`, `run`, `rise`, `fall`, `fastFall`, `landing`, `hitstun`, `ledgeHang`, `charge`, `maxCharge`, `attack:*`, etc.
  - This is the correct place to expose visual intent values.

- `js/skeleton/poseLibrary.js`
  - Currently compact legacy pose constants. Not apparently central to current solver.

## Goal
Make fighters visually communicate intention without changing gameplay:

- player/human is easier to read
- bots have more body language
- attacks have anticipation and silhouette distortion
- high damage posture is visible
- landing compression looks satisfying
- air turns and momentum feel physical
- charging looks dangerous
- panic/recovery/hunt states become visible

## Major implementation principle
No damage changes. No physics changes. No AI behavior changes. This is animation/render-only.

## New files to add

### 1. `js/skeleton/poseMath.js`
Small pure helpers:
- `point(x, y)`
- `exactAim(aim, facing)`
- `perpOf(v)`
- `clamp(value, min, max)`
- `lerp(a, b, t)`
- `approach(current, target, amount)`

Why: `solveSkeleton.js` currently owns these tiny helpers. Pulling them out makes every future pose module smaller.

### 2. `js/skeleton/poseIntent.js`
Pure visual-intent classifier:
- `poseIntent(f, animationState)` returns:
  - `mood`: idle/run/hunt/escape/panic/recover/dive/charge/attack/hitstun
  - `lean`: velocity + input + danger lean
  - `damageCurl`: posture collapse from damage percentage
  - `panic`: high damage + last stock + near danger
  - `airTurn`: direction mismatch between vx and face/input
  - `confidence`: low damage/recent combo/charge confidence

Uses existing properties only:
- `f.damage`
- `f.stocks`
- `f.vx`, `f.vy`
- `f.grounded`
- `f.fastFalling`
- `f.attack`
- `f.blocking`
- `f.aiMind?.role`
- `f.aiMind?.humanIntent`
- `f.aiMind?.koIntent`
- `f.combo?.count`

### 3. `js/skeleton/basePose.js`
Move `basePose` out of `solveSkeleton.js`.
It should accept `(f, facing, walk, scale, anim, intent)`.
Enhancements:
- velocity lean affects chest/head/hip relation
- damageCurl lowers chest/head slightly
- panic widens feet
- confidence lifts chest/head
- airTurn twists head/shoulders opposite velocity

### 4. `js/skeleton/statePoses.js`
Move state pose functions out:
- `applyStatePose(anim, pose, facing, scale, intent)`
- internal pose functions: crouch, rise, apex, fall, fastFall, landing, hitstun, ledge, charge.
Enhancements:
- landing uses stronger compression when `preLandingVy` is high
- fastFall forms spear silhouette
- hitstun arches body away from velocity/face
- charge coils body before release

### 5. `js/skeleton/actionPoses.js`
Move action pose functions out:
- `applyActionPose(f, pose, facing, scale, intent)`
- analog punch/kick/grab/guard logic
Enhancements:
- startup anticipation: hand/foot pulls back more clearly when attack phase < 0.55
- active frame stretch: striking limb extends farther visually only
- recovery relax: limb trails behind
- dive/meteor kick becomes arrow/spear shape
- uppercut elongates upward

### 6. `js/skeleton/bindPose.js`
Move binding functions out:
- `bindAll(f, pose)`
- `bind(f, id, root, tip)`
- `bindRoot(f, hip)`

### 7. `js/render/fighter/colors.js`
Small renderer helper:
- `fighterColor(f)`
- `dangerColor(f)`
- `chargeColor(f, baseColor)`

### 8. `js/render/fighter/bodyLanguage.js`
Render-only visual values:
- `renderLanguage(f)` returns:
  - lean
  - damageWobble
  - breath
  - eyeScale
  - postureScale
  - attackGlow
  - panicAlpha

### 9. `js/render/fighter/body.js`
Move body drawing:
- `drawBodyMass(ctx, f, color, language)`
- enhance torso ellipse with squash/stretch/damageCurl.

### 10. `js/render/fighter/limbs.js`
Move limb drawing:
- `drawLimbs(ctx, f, color)`
- `drawHandsFeet(ctx, f, color)`
- optional ghost limb trails for strong velocity or attack.

### 11. `js/render/fighter/head.js`
Move head/headwear:
- `drawHead(ctx, f, color, language)`
- `drawHeadwear`
- eye becomes more expressive: danger/panic/attack changes eye size and offset.

### 12. `js/render/fighter/auras.js`
Move charge/player/danger/dodge/shield/attack arc:
- `drawChargeAura`
- `drawPlayerRing`
- `drawDangerAura`
- `drawDodgeStreak`
- `drawShield`
- `drawAttackArc`
Enhancements:
- attack arcs read aim vector more clearly if available
- charge aura gets coil pulse

### 13. `js/render/fighter/labels.js`
Move labels/text:
- `drawLabels`
- `drawOutlinedText`

## Existing files to rewrite fully

### A. `js/skeleton/solveSkeleton.js`
Rewrite as a small orchestrator only:
1. import `animationState`
2. import `poseIntent`
3. import `basePose`
4. import `applyStatePose`
5. import `applyActionPose`
6. import `bindAll`
7. compute facing/speed/walk/scale
8. build pose pipeline
9. assign `f.anim = anim`, `f.poseIntent = intent`
10. bind bones

Target size: under 80 lines.

### B. `js/skeleton/animationState.js`
Rewrite only if needed to expose more values cleanly:
- add `damageBand`
- add `landingImpact`
- add `attackPhase`? Maybe avoid duplicating action phase if `actionPoses` computes it.
Keep it small.

### C. `js/render/fighters.js`
Rewrite as a small orchestrator:
1. import helper modules
2. loop fighters
3. skip dead/hidden/respawn
4. compute color + language
5. call aura/body/limbs/head/labels/shield/attack arc modules

Target size: under 90 lines.

### D. Optional: `js/skeleton/poseLibrary.js`
Probably leave untouched unless unused cleanup is requested. It may still be imported somewhere else.

## Exact visual improvements to implement

### 1. Player readability ring upgrade
Human player gets a subtle breathing ring that squashes with movement and brightens during danger/charge.
File: `js/render/fighter/auras.js`.

### 2. Damage posture
At 80/130/170+ damage:
- chest lowers
- head droops slightly
- feet widen
- tiny wobble in render only
Files: `poseIntent.js`, `basePose.js`, `bodyLanguage.js`.

### 3. Attack anticipation
During startup:
- punch hand pulls back
- kick knee chambers
- torso coils
During active:
- limb stretches
During recovery:
- limb trails
Files: `actionPoses.js`.

### 4. Dive / fast-fall spear shape
When fast falling or meteor kicking:
- head/chest align into downward arrow
- arms tuck/back
- feet trail
Files: `statePoses.js`, `actionPoses.js`.

### 5. Landing compression
On high `preLandingVy` / landing lag:
- chest compresses
- head dips
- knees bend
- feet splay
Files: `animationState.js`, `statePoses.js`.

### 6. Air-turn twist
If velocity and facing disagree:
- chest and head twist
- limbs trail previous motion
Files: `poseIntent.js`, `basePose.js`.

### 7. Bot intent body language
Use existing AI data visually only:
- Hunter/koIntent: forward lean, focused head
- ResourceRunner: upright sprint posture
- antiWander active: aggressive forward posture
- panic/recover: arms spread/balance
Files: `poseIntent.js`, `statePoses.js`, `bodyLanguage.js`.

### 8. Limb ghosting
During heavy attack or high speed:
- translucent previous limb-like strokes around hands/feet
No actual history required initially; can use velocity/attack aim to draw short ghost strokes.
Files: `js/render/fighter/limbs.js`.

### 9. Head/eye expressiveness
- danger: eye larger
- attack: eye forward
- panic: eye wide
- charge: eye bright
Files: `js/render/fighter/head.js`.

### 10. Charge coil
Charge pose should visibly store power:
- torso pulls back
- striking limb trembles/coils
- aura pulses
Files: `statePoses.js`, `auras.js`.

## Implementation order

1. Write plan files first. Done here.
2. Create new skeleton helper modules.
3. Rewrite `solveSkeleton.js` fully into orchestrator.
4. Create new render/fighter helper modules.
5. Rewrite `render/fighters.js` fully into orchestrator.
6. Run import smoke:
   - import `solveSkeleton.js`
   - import `render/fighters.js`
7. Run synthetic skeleton probe:
   - create fighter with bones and attack
   - call `solveSkeleton`
   - assert hands/feet/head are finite
   - assert `f.poseIntent` exists
8. Run existing spectacle probe to ensure prior work still imports.
9. Run game import smoke for `core/loop.js` and `render/renderer.js`.

## Files that will be added

- `js/skeleton/poseMath.js`
- `js/skeleton/poseIntent.js`
- `js/skeleton/basePose.js`
- `js/skeleton/statePoses.js`
- `js/skeleton/actionPoses.js`
- `js/skeleton/bindPose.js`
- `js/render/fighter/colors.js`
- `js/render/fighter/bodyLanguage.js`
- `js/render/fighter/body.js`
- `js/render/fighter/limbs.js`
- `js/render/fighter/head.js`
- `js/render/fighter/auras.js`
- `js/render/fighter/labels.js`
- `.sim/skeleton-pose-probe.mjs`

## Files that will be rewritten fully

- `js/skeleton/solveSkeleton.js`
- `js/skeleton/animationState.js` only if needed
- `js/render/fighters.js`

## Files that should not be touched

- combat resolver
- physics movement
- attack definitions
- AI command selection
- objective director
- stage narrative
- spectacle system, unless imports require adjustment

## Risk notes

- `render/fighters.js` currently relies on `f.bones` being complete. The probe must test this.
- `solveSkeleton.js` currently has many pose helpers inside one file. Splitting must preserve all exports: only `solveSkeleton` is public.
- Drawing helper modules must not assume browser APIs beyond canvas context.
- Avoid changing `f.x`, `f.y`, `f.vx`, physics, damage, or attack timing.

## Success criteria

A player watching should immediately see:
- who is moving fast
- who is hurt
- who is charging
- who is about to attack
- who is panicking/recovering
- who is diving
- where the human player is

A developer reading should see:
- small files
- pure pose helpers
- renderer split by visual responsibility
- no gameplay balance mutation

## Chapter 14 — The Body Learns to Speak
The Awtsmoos has no body and no form, yet every body exists because His speech renews it from nothing. In the arena, a fighter is not a person-system; he is a readable flame. His chest leans before his fist. His knees bend before the landing. His head turns before the hunt. His feet widen when damage climbs. The brawl remains simple, but the silhouette begins to confess intention. This is the next revelation: not more rules, but more visible life.
