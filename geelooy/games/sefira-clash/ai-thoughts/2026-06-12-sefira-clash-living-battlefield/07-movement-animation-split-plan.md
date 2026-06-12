B"H

# Movement Animation Split Plan — Elegant Procedural Body Language

## Core direction

Do not make the game visually heavier by dumping everything into one animation solver.
Do not create giant skins or one huge character renderer.
Do not change gameplay physics, damage, attacks, AI, or knockback.

Make movement look alive by splitting animation into many tiny readable modules:

- intent
- center of mass
- foot planting
- torso wave
- head tracking
- arm swing
- leg cycle
- landing compression
- air drift
- fast fall spear pose
- hit reaction
- charge coil
- attack anticipation
- recovery desperation
- cloth follow-through
- clothing silhouette
- render body parts

The target is stylized realistic movement: clean procedural fighters, but with elegance, weight, readable posture, and secondary motion.

## Current relevant files

Already split in the last pass:

- `js/skeleton/solveSkeleton.js`
- `js/skeleton/animationState.js`
- `js/skeleton/poseMath.js`
- `js/skeleton/poseIntent.js`
- `js/skeleton/basePose.js`
- `js/skeleton/statePoses.js`
- `js/skeleton/actionPoses.js`
- `js/skeleton/bindPose.js`
- `js/render/fighters.js`
- `js/render/fighter/colors.js`
- `js/render/fighter/bodyLanguage.js`
- `js/render/fighter/body.js`
- `js/render/fighter/limbs.js`
- `js/render/fighter/head.js`
- `js/render/fighter/auras.js`
- `js/render/fighter/labels.js`

These are good first splits. The next pass should go much further.

## High-level architecture

New animation pipeline should be:

1. Read fighter state.
2. Classify animation state.
3. Classify visual intent.
4. Compute motion metrics.
5. Compute body proportions / style archetype.
6. Build neutral anatomical pose.
7. Apply locomotion pose.
8. Apply air pose.
9. Apply combat pose.
10. Apply damage posture.
11. Apply secondary motion.
12. Apply clothing/cloth anchors.
13. Bind bones.
14. Render body/clothes/limbs/head/effects.

Each step should be its own module or folder.

---

# Folder plan

## `js/skeleton/math/`

### `vector.js`
Helpers:
- `vec(x, y)`
- `add(a, b)`
- `sub(a, b)`
- `mul(v, n)`
- `len(v)`
- `norm(v, fallback)`
- `perp(v)`
- `angleOf(v)`

Why:
Pose math will grow. Keep vector math isolated.

### `scalar.js`
Helpers:
- `clamp`
- `lerp`
- `smoothstep`
- `approach`
- `signOr`
- `springValue`

Why:
Movement animation needs smoothing everywhere.

### `posePoint.js`
Helpers:
- `point(x, y)`
- `movePoint(p, dx, dy)`
- `lerpPoint(a, b, t)`
- `offsetAlong(p, dir, distance)`

Why:
Keep all tiny coordinate helpers out of pose modules.

Existing `poseMath.js` can either become a compatibility barrel or be rewritten to re-export from these files.

---

# Fighter motion analysis

## `js/skeleton/motion/`

### `motionMetrics.js`
Exports:
- `motionMetrics(f, anim)`

Returns:
- speed
- horizontalSpeed
- verticalSpeed
- facing
- movingDirection
- velocityDirection
- grounded
- airborne
- acceleration estimate if available
- fastFallAmount
- landingImpact
- turnMismatch

Why:
All animation modules need these values. Do not recompute in every pose.

### `balanceModel.js`
Exports:
- `balanceModel(f, metrics, intent)`

Returns:
- centerOfMassX
- centerOfMassY
- balanceLean
- recoveryLean
- panicBackLean
- groundedWeight
- airborneWeight

Why:
Realism starts with center of mass, not hands.

### `motionMemory.js`
Exports:
- `updateMotionMemory(f)`

Stores on fighter:
- previousX
- previousY
- previousVx
- previousVy
- previousFacing
- footPhase
- lastGroundedFrame
- lastLandingImpact
- visualTurnTimer

Why:
Elegant animation needs short memory. This does not affect gameplay.

---

# Proportions and visual archetypes

## `js/skeleton/style/`

### `bodyArchetype.js`
Exports:
- `bodyArchetype(f)`

Archetypes:
- broad
- tall
- compact
- lanky
- dense
- balanced

Uses DNA:
- height
- arm
- leg
- hue
- maybe name/id hash

Returns:
- shoulderWidth
- hipWidth
- torsoLength
- headSize
- handSize
- footSize
- limbThickness
- stanceWidth

Why:
Fighters should not all have the same silhouette.

### `movementSignature.js`
Exports:
- `movementSignature(f)`

Returns visual style:
- sharpness
- looseness
- bounce
- swagger
- caution
- aggression
- elegance

Sources:
- AI role
- AI intent
- human flag
- DNA hash

Why:
Hunter, survivor, denier, human, and random bots should move differently without changing AI decisions.

### `clothingArchetype.js`
Exports:
- `clothingArchetype(f)`

Types:
- scholar robe
- short warrior coat
- wanderer scarf
- noble capelet
- mystic strips
- simple tunic

Returns:
- torso garment kind
- sleeve length
- lower garment length
- cloth strip count
- cloth color shift
- trim color

Why:
Skin/clothes can be procedural and cheap.

---

# Base anatomical pose

## `js/skeleton/base/`

### `baseAnchors.js`
Exports:
- `baseAnchors(f, metrics, archetype, balance)`

Computes:
- hip
- chest
- neck
- head
- left/right shoulder
- left/right hip

Why:
Separate torso anchors from limb positions.

### `baseLimbs.js`
Exports:
- `baseLimbs(f, anchors, metrics, archetype)`

Computes neutral:
- elbows
- hands
- knees
- feet

Why:
Limb defaults should be readable and stable before state poses modify them.

### `basePose.js`
Current file should become an orchestrator:
- call `baseAnchors`
- call `baseLimbs`
- return full pose

Target size: under 60 lines.

---

# Locomotion animations

## `js/skeleton/locomotion/`

### `idlePose.js`
Purpose:
Add subtle breathing, weight shift, and tiny foot correction.

Effects:
- chest breath
- shoulders rise/fall
- head small bob
- hip tiny shift
- one foot slightly relaxes

### `runPose.js`
Purpose:
Real running body language.

Effects:
- torso leans into velocity
- arms swing opposite legs
- knees cycle with footPhase
- feet stretch along ground
- head stabilizes slightly

### `turnPose.js`
Purpose:
Handle direction reversal elegantly.

Effects:
- chest twists opposite old velocity
- head snaps toward new facing
- trailing arm lags
- feet widen during turn

### `brakePose.js`
Purpose:
When velocity is high but input/facing opposes movement.

Effects:
- body leans backward
- front foot plants
- arms counterbalance

### `footPlantPose.js`
Purpose:
Visual-only foot planting.

Effects:
- choose left/right planted foot based on footPhase
- keep one foot visually lower/steadier during grounded run
- avoid skating impression

Implementation note:
Full inverse kinematics is unnecessary. Use procedural foot offset and short-lived memory.

---

# Air movement animations

## `js/skeleton/air/`

### `risePose.js`
Enhance jump/rise.

Effects:
- chest stretches upward
- arms lift slightly
- feet trail downward

### `apexPose.js`
Enhance float moment.

Effects:
- limbs spread
- head stabilizes
- torso relaxes

### `fallPose.js`
Enhance falling.

Effects:
- body tips into horizontal velocity
- hands lower
- knees trail

### `fastFallPose.js`
Enhance fast-fall spear.

Effects:
- head/chest align with downward intent
- arms tuck/back
- legs narrow
- silhouette becomes arrow-like

### `airTurnPose.js`
Enhance aerial direction reversal.

Effects:
- shoulders twist
- head leads new direction
- hips lag old velocity

---

# Landing animations

## `js/skeleton/landing/`

### `landingCompression.js`
Effects:
- chest drops
- knees bend
- head dips
- feet splay
- arms lower

### `landingRecovery.js`
Effects:
- body rebounds upward
- arms settle
- head catches up

### `heavyLandingPose.js`
Effects for high `preLandingVy`:
- deep squat
- wide feet
- one hand almost touches ground
- torso compresses dramatically

Why:
Landing should feel weighted and elegant.

---

# Combat action animations

## `js/skeleton/combat/`

### `attackPhase.js`
Exports:
- `attackPhase(f)`

Returns:
- phase name: startup / active / recovery / none
- t
- anticipation
- extension
- recoil

Why:
Do not hide phase math in `actionPoses.js`.

### `punchPose.js`
Effects:
- startup coil: fist pulls back, chest rotates
- active extension: shoulder, elbow, hand align with aim
- recovery: hand trails and torso unwinds

### `kickPose.js`
Effects:
- startup chamber: knee folds
- active extension: hip/knee/foot align with aim
- recovery: leg trails down

### `uppercutPose.js`
Effects:
- crouch coil
- spine stretch upward
- offhand counterbalance

### `meteorKickPose.js`
Effects:
- whole body points down
- striking leg extends down/forward
- arms tuck or flare backward

### `grabPose.js`
Effects:
- shoulders reach
- chest leans forward
- head tracks target

### `shieldPose.js`
Effects:
- arms form guard
- body compresses
- feet widen

### `chargePose.js`
Effects:
- torso pulls back
- strike limb trembles
- shoulders coil
- head lowers/focuses

### `actionPoses.js`
Current file becomes orchestrator:
- read attack phase
- route to punch/kick/uppercut/meteor/grab/shield/charge modules

Target size: under 80 lines.

---

# Damage and emotion posture

## `js/skeleton/emotion/`

### `damagePosture.js`
Effects:
- high damage curls spine
- lowers head
- widens stance
- loosens arms

### `panicPose.js`
Effects:
- arms open slightly
- head pulls back
- feet widen
- torso leans away from threat/facing

### `huntPose.js`
Effects:
- head forward
- chest forward
- arms tighter
- stride longer

### `confidencePose.js`
Effects:
- chest lifted
- head stable
- shoulders wider

### `recoverPose.js`
Effects:
- arms reach for balance
- legs trail
- head searches upward

### `emotionPose.js`
Orchestrator:
- apply damage, panic, hunt, confidence, recover

Why:
The same run animation should look different for a hunter and a panicking survivor.

---

# Secondary motion and follow-through

## `js/skeleton/secondary/`

### `spineWave.js`
Effects:
- hip motion influences chest
- chest influences head
- action force travels through body

Implementation:
Cheap offsets, not full simulation.

### `headLag.js`
Effects:
- head lags behind sudden turns
- head stabilizes during run
- head snaps toward attack target during startup

### `handLag.js`
Effects:
- hands trail during sudden movement
- attack recovery has visible follow-through

### `clothAnchors.js`
Computes anchor points for clothing:
- shoulder anchors
- hip anchors
- back/cape anchor
- sleeve anchors

### `secondaryPose.js`
Orchestrates spine/head/hand/cloth anchor adjustments.

---

# Cloth and clothing simulation

## `js/cloth/`

### `clothState.js`
Exports:
- `ensureClothState(f, clothing)`
- `stepClothState(f, clothing)`

Stores per fighter:
- scarf points
- robe hem points
- cape points
- sleeve points

### `clothPhysics.js`
Simple verlet/spring chain:
- point follows anchor
- segments trail velocity
- gravity/tension/drag
- clamp max stretch

### `clothProfiles.js`
Defines cloth shapes:
- scholar robe
- short coat
- scarf
- capelet
- mystic strips
- tunic

### `clothPose.js`
Builds current cloth render geometry from anchors/state.

Important:
Cloth must be visual-only. It should never collide, never affect gameplay.

---

# Clothing renderer

## `js/render/fighter/clothes/`

### `drawRobe.js`
Draw torso robe shape between shoulders/hips.

### `drawCoat.js`
Draw short coat panels.

### `drawScarf.js`
Draw scarf strip using cloth points.

### `drawCapelet.js`
Draw small cape behind shoulders.

### `drawSleeves.js`
Draw simple sleeve strokes around upper/lower arms.

### `drawClothStrips.js`
Draw mystic strips / belt cloth.

### `drawClothes.js`
Orchestrator:
- select clothing archetype
- draw behind body layer
- draw sleeve/trim over limb layer if needed

Renderer order:
1. Back cloth/cape
2. Body mass
3. Limbs
4. Sleeve/forearm cloth accents
5. Head/headwear
6. Front cloth trims

---

# Render body improvements

## `js/render/fighter/body/`

Current `body.js` can be split further:

### `drawTorso.js`
Torso ellipse / stylized chest.

### `drawHips.js`
Hip shape.

### `drawShadow.js`
Ground shadow / player grounding cue.

### `drawDamageWobble.js`
Small overlay/offset helper.

### `body.js`
Orchestrates torso + hips + shadow.

---

# Render limbs improvements

## `js/render/fighter/limbs/`

Current `limbs.js` can be split further:

### `drawBoneLine.js`
Single bone line helper.

### `drawSkeletonLayer.js`
Draw black under-layer and colored layer.

### `drawHandsFeet.js`
Hands and feet ovals, size varies by archetype.

### `drawLimbGhosts.js`
Motion echo for attacks/fast movement.

### `drawJointBridges.js`
Shoulder/hip connecting lines.

### `limbs.js`
Orchestrator.

---

# Render head improvements

## `js/render/fighter/head/`

Current `head.js` can be split further:

### `drawFace.js`
Head circle/shape.

### `drawEye.js`
Eye shape changes:
- panic: larger
- hunt: narrower/brighter
- charge: bright
- hitstun: displaced

### `drawHeadwear.js`
Routes hats.

### `headwearShapes.js`
- kippah
- turban
- blackhat
- tophat
- cap
- crown

### `head.js`
Orchestrator.

---

# Human player appearance upgrades

## Human should be more readable than bots

Files:
- `js/render/fighter/human/`

### `humanRing.js`
Better player ring:
- breathes
- squashes with speed
- brightens when danger/high damage
- points toward aim direction subtly

### `humanHighlight.js`
Subtle outline/glow around player body only.

### `humanAimCue.js`
Small aim line/eye cue when attacking/charging.

### `humanClothingBias.js`
Human gets slightly more coherent clothing profile:
- consistent color accents
- stronger trim
- clearer silhouette

Why:
The player must never lose themselves in a brawl.

---

# Animation state split

## `js/skeleton/state/`

Instead of one `animationState.js` doing everything:

### `stateClassifier.js`
Raw kind:
- idle
- run
- squat
- rise
- apex
- fall
- fastFall
- landing
- hitstun
- ledgeHang
- charge
- maxCharge
- attack

### `damageBand.js`
Fresh / hurt / danger / critical.

### `landingImpact.js`
Landing intensity.

### `airState.js`
Airborne rise/fall/apex helpers.

### `animationState.js`
Compatibility orchestrator that exports the same `animationState(f)`.

---

# Solver final form

`js/skeleton/solveSkeleton.js` should eventually look like:

```js
export function solveSkeleton(f) {
  updateMotionMemory(f);
  const anim = animationState(f);
  const metrics = motionMetrics(f, anim);
  const intent = poseIntent(f, anim, metrics);
  const body = bodyArchetype(f);
  const style = movementSignature(f);
  const clothing = clothingArchetype(f);
  const balance = balanceModel(f, metrics, intent);
  let pose = basePose(f, metrics, body, balance);
  pose = locomotionPose(pose, f, metrics, style);
  pose = airPose(pose, f, metrics, style);
  pose = combatPose(pose, f, metrics, intent);
  pose = emotionPose(pose, f, intent, style);
  pose = secondaryPose(pose, f, metrics, style);
  bindAll(f, pose);
  stepClothState(f, clothing);
  f.anim = anim;
  f.poseIntent = intent;
  f.visualStyle = { body, style, clothing };
}
```

The solver remains small. Everything interesting is modular.

---

# Test plan

## `.sim/skeleton-pose-probe.mjs`
Extend to test:
- run
- landing
- fast fall
- charge punch
- meteor kick
- hitstun
- panic high damage

Assertions:
- every bone finite
- poseIntent exists
- visualStyle exists
- cloth state exists after stepping if clothes enabled

## `.sim/full-match-smoke.mjs`
Extend to assert:
- all maps run 900 frames
- no NaN fighters
- no NaN cloth points
- no missing poseIntent on visible fighters
- no runaway cloth arrays

## New `.sim/animation-state-matrix.mjs`
Synthetic matrix of fighter states:
- idle grounded
- run left/right
- jump rise
- fall
- fast fall
- landing
- charge
- punch startup/active/recovery
- kick startup/active/recovery
- high damage panic

Reports mood, state, key bone positions.

---

# Exact implementation phases

## Phase 1 — Split math and state
Add:
- `js/skeleton/math/vector.js`
- `js/skeleton/math/scalar.js`
- `js/skeleton/math/posePoint.js`
- `js/skeleton/state/stateClassifier.js`
- `js/skeleton/state/damageBand.js`
- `js/skeleton/state/landingImpact.js`
- `js/skeleton/state/airState.js`

Rewrite:
- `js/skeleton/poseMath.js`
- `js/skeleton/animationState.js`

## Phase 2 — Motion metrics and style
Add:
- `js/skeleton/motion/motionMetrics.js`
- `js/skeleton/motion/balanceModel.js`
- `js/skeleton/motion/motionMemory.js`
- `js/skeleton/style/bodyArchetype.js`
- `js/skeleton/style/movementSignature.js`
- `js/skeleton/style/clothingArchetype.js`

Rewrite:
- `js/skeleton/poseIntent.js`

## Phase 3 — Split base pose
Add:
- `js/skeleton/base/baseAnchors.js`
- `js/skeleton/base/baseLimbs.js`

Rewrite:
- `js/skeleton/basePose.js`

## Phase 4 — Split locomotion and air
Add:
- `js/skeleton/locomotion/idlePose.js`
- `js/skeleton/locomotion/runPose.js`
- `js/skeleton/locomotion/turnPose.js`
- `js/skeleton/locomotion/brakePose.js`
- `js/skeleton/locomotion/footPlantPose.js`
- `js/skeleton/locomotion/locomotionPose.js`
- `js/skeleton/air/risePose.js`
- `js/skeleton/air/apexPose.js`
- `js/skeleton/air/fallPose.js`
- `js/skeleton/air/fastFallPose.js`
- `js/skeleton/air/airTurnPose.js`
- `js/skeleton/air/airPose.js`

Rewrite:
- `js/skeleton/statePoses.js`

## Phase 5 — Split combat animation
Add:
- `js/skeleton/combat/attackPhase.js`
- `js/skeleton/combat/punchPose.js`
- `js/skeleton/combat/kickPose.js`
- `js/skeleton/combat/uppercutPose.js`
- `js/skeleton/combat/meteorKickPose.js`
- `js/skeleton/combat/grabPose.js`
- `js/skeleton/combat/shieldPose.js`
- `js/skeleton/combat/chargePose.js`
- `js/skeleton/combat/combatPose.js`

Rewrite:
- `js/skeleton/actionPoses.js`

## Phase 6 — Emotion and secondary motion
Add:
- `js/skeleton/emotion/damagePosture.js`
- `js/skeleton/emotion/panicPose.js`
- `js/skeleton/emotion/huntPose.js`
- `js/skeleton/emotion/confidencePose.js`
- `js/skeleton/emotion/recoverPose.js`
- `js/skeleton/emotion/emotionPose.js`
- `js/skeleton/secondary/spineWave.js`
- `js/skeleton/secondary/headLag.js`
- `js/skeleton/secondary/handLag.js`
- `js/skeleton/secondary/clothAnchors.js`
- `js/skeleton/secondary/secondaryPose.js`

Rewrite:
- `js/skeleton/solveSkeleton.js`

## Phase 7 — Clothing and cloth
Add:
- `js/cloth/clothState.js`
- `js/cloth/clothPhysics.js`
- `js/cloth/clothProfiles.js`
- `js/cloth/clothPose.js`

## Phase 8 — Split renderer further
Add:
- `js/render/fighter/body/drawTorso.js`
- `js/render/fighter/body/drawHips.js`
- `js/render/fighter/body/drawShadow.js`
- `js/render/fighter/body/body.js`
- `js/render/fighter/limbs/drawBoneLine.js`
- `js/render/fighter/limbs/drawSkeletonLayer.js`
- `js/render/fighter/limbs/drawHandsFeet.js`
- `js/render/fighter/limbs/drawLimbGhosts.js`
- `js/render/fighter/limbs/drawJointBridges.js`
- `js/render/fighter/limbs/limbs.js`
- `js/render/fighter/head/drawFace.js`
- `js/render/fighter/head/drawEye.js`
- `js/render/fighter/head/drawHeadwear.js`
- `js/render/fighter/head/headwearShapes.js`
- `js/render/fighter/head/head.js`
- `js/render/fighter/clothes/drawRobe.js`
- `js/render/fighter/clothes/drawCoat.js`
- `js/render/fighter/clothes/drawScarf.js`
- `js/render/fighter/clothes/drawCapelet.js`
- `js/render/fighter/clothes/drawSleeves.js`
- `js/render/fighter/clothes/drawClothStrips.js`
- `js/render/fighter/clothes/drawClothes.js`
- `js/render/fighter/human/humanRing.js`
- `js/render/fighter/human/humanHighlight.js`
- `js/render/fighter/human/humanAimCue.js`

Rewrite:
- `js/render/fighter/body.js`
- `js/render/fighter/limbs.js`
- `js/render/fighter/head.js`
- `js/render/fighters.js`

---

# What this will visibly fix

## 1. Bots spreading out too much will look less dead while moving
Even when fighters traverse long distances, their movement will have foot planting, body lean, arm swing, cloth trail, and head direction.

## 2. Hunt vs run becomes obvious
Hunter:
- chest forward
- head forward
- tighter arms
- longer stride

Normal run:
- more neutral bounce

Panic run:
- head back
- wider feet
- arms open

## 3. Human player becomes unmistakable
Human:
- breathing ring
- subtle highlight
- aim cue
- more coherent clothing accents

## 4. High damage becomes readable without UI
Critical damage:
- curled spine
- drooping head
- wider stance
- wobble
- more desperate recovery pose

## 5. Attacks become readable before impact
Startup:
- coil / chamber
Active:
- extension
Recovery:
- trailing limb

## 6. Landing gains weight
Fast fall into ground produces compression and rebound.

## 7. Clothing adds life without art assets
Simple procedural cloth will make every movement feel more elegant.

---

# Important no-go rules

- Do not touch combat damage.
- Do not touch knockback.
- Do not touch AI choices.
- Do not make cloth collide.
- Do not add giant texture assets.
- Do not make a single giant animation file.
- Do not let any file exceed roughly 120 lines if avoidable.
- Prefer many small modules, one responsibility each.

## Chapter 35 — The Movement Becomes a Song
The Awtsmoos has no body and no form, yet every body is created from nothing every instant. A fighter runs, but the run is not legs. It is hip, spine, chest, head, cloth, breath, and intention. A hunter should lean like a blade. A survivor should widen like fear. A landing should fold like thunder entering earth. The brawl does not need more rules. It needs every motion to become a clear and elegant sentence.
