# B"H
# Boruch Hashem
# Blessed is He

# Player Casting Animation Worker Handoff

## Claimed workstream

Real player casting and combat animation state only: wind-up, channel, release, action locking, smooth return to locomotion, melee phases, hit reaction, death priority, truthful GLB clip selection, and procedural Mixamo-bone fallback.

## Coordination history

- The worker first proposed terrain/road/tree work.
- A fresh hash guard detected that another worker had modified `TextureRepeat.js` and created a terrain claim before any terrain write from this worker.
- This worker relinquished every terrain/road/tree file and did not overwrite that workstream.
- Casting animation was verified unclaimed before source ownership was recorded.
- Dirty combat, equipment, hydration, movement, renderer, camera, demon, terrain, inventory, house, corpse, loot, launcher, HTML, and CSS files were treated as read-only dependencies.

## Root causes found

1. The canonical Chossid GLB has fourteen animation clips but no cast clip.
2. The useful imported clips are locomotion/neutral plus `punch`, `stab`, and `hands-out`; generic attacks must not be treated as spell casting.
3. The old adapter selected a base clip directly from locomotion and had no action-priority lock, so movement or hydration could reclaim the model during a cast.
4. The actual Mixamo skeleton exposes stable spine, neck, head, shoulder, arm, forearm, and hand nodes suitable for one-time cached additive posing.
5. `TinyAnimationPlayer` already provides 0.18-second crossfades, so replacing it would have been an unnecessary regression.

## Files rewritten or created

- `experiments/Awtsmoos/src/app/MinimalMeadowAnimationState.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowAnimationClipPolicy.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowCombatAnimationController.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowCombatAnimationEvents.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowCombatAnimationTimeline.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowPlayerBonePose.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowPlayerPoseLibrary.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowPlayerPoseMath.js`
- `experiments/Awtsmoos/src/test/app/minimalMeadowPlayerCastingAnimation.test.mjs`

## Contracts preserved

- Existing real combat bus events are consumed; combat implementation is unchanged.
- Existing `equipment:draw` is emitted for cast and melee.
- Existing `TinyAnimationPlayer` and its clip crossfades remain authoritative.
- Casts use standing/neutral imported clips as a base, never `punch` or `stab`.
- Melee may use `punch` or `stab` according to equipped weapon kind.
- Procedural posing is additive after imported clip sampling.
- Bone discovery traverses the model once per hydrated model.
- Model replacement reinstalls the adapter and destroys old event listeners.
- No per-frame geometry or material allocation was added.
- No query-string module identities were added to owned imports.

## Implemented states

- standing / walking / running / jumping / falling
- melee-windup / melee-impact / melee-recovery
- cast-windup / cast-channel / cast-release
- hit-reaction
- death

Cast priority remains above hit reaction and locomotion. Death remains terminal and highest priority. Cast launch or cancellation enters a finite release phase before locomotion resumes.

## Static checks completed

All owned JavaScript files passed `node --check`.

All owned source files are at or below 120 lines:

- AnimationState: 63
- ClipPolicy: 63
- Controller: 112
- Events: 43
- Timeline: 59
- BonePose: 70
- PoseLibrary: 70
- PoseMath: 65
- Focused test: 69

Additional checks passed:

- tab indentation
- import resolution
- no query-string identities in owned imports
- complete animation import graph
- scoped `git diff --check`
- no generated browser artifacts inside Git

Focused test result:

`PLAYER_CASTING_ANIMATION_TEST_OK=1`

Import result:

`CAST_FINAL_IMPORT_GRAPH_OK=1`

## Final source hashes

- AnimationState: `4aad41985923c39e710e41d72bcb3ef18feb93499b78bf91cdf76a664b790bed`
- ClipPolicy: `36073fd16e676313a10ae8c6869fdc9a95e5e0414f7c75c3a8b5d46100e76d6a`
- Controller: `9c09883a905d897b7e8e58125397df6f321245cc18920458c824efa838e40237`
- Events: `784e18aff7d58b32c49824d74cc10a831abdd70f463f0b67ae553cf96080aac3`
- Timeline: `fda43c6504a3725b519a0b48cc28c857fd4d94e9d572c57e7a532a225ada3eb9`
- BonePose: `0c78e2e8a8c1e713f6cc432f44789830483a4185eec887296c75e8577ab5313a`
- PoseLibrary: `509a8ebf47732d1cda17ae48c61615d69307f4c3f6c9d1e3f0d7490c6ffe53a2`
- PoseMath: `4650c91dc70bc5b1328303e27c86186c7ba5bf0e9c3ee2e485065c8ba37c52a4`
- Focused test: `b659b0e3e63434d53324811844fbfc634137ea6ba407dd40de47d65963c2dabb`

## Browser testing and current integration blocker

Browser artifacts are kept only under:

`/Users/awtsmoos/.awtsmoos-artifacts/mitzvahWorld/20260724-player-casting-animation-worker`

Two real desktop/mobile CDP gates were attempted using the real runtime and real `hebrew-fire` / `letter-light` actions. The first was intentionally cancelled because it waited for an unrelated terrain-tree worker's degraded rich-world receipt. The focused gate then waited only for real combat, six enemies, canonical Chossid hydration, and animation diagnostics.

During the focused gate, the page reported:

- runtime present
- combat present
- six enemies present
- canonical model stuck at `loading`
- zero imported clips and zero bound bones because model replacement had not occurred

A direct HTTP request to the canonical GLB route also timed out under the same multi-worker server load. The tunnel reported over one hundred queued parallel requests. This is an upstream shared-server/asset-hydration blocker, not evidence of an animation-state failure.

A final browser worker was launched after route recovery and should be inspected at:

- job: `cmdjob_mryqe58o_e4b69203724c`
- receipt directory: `/Users/awtsmoos/.awtsmoos-artifacts/mitzvahWorld/20260724-player-casting-animation-worker/desktop-mobile-final-pass`

The integration worker must use the receipt if present. If it is absent, rerun `cast-workstream-gate.mjs` only after the canonical GLB route responds promptly.

## Acceptance the integration worker must recheck

- real Chossid reports at least ten bound cast bones
- `combat:cast-start` enters wind-up
- progress enters and retains channel
- imported channel base is not punch/stab
- right-arm quaternion changes materially during channel
- launch reaches release
- cast does not emit cancel
- locomotion remains locked until release ends
- return state is unlocked
- desktop `hebrew-fire` and mobile `letter-light` both pass
- no console errors or unhandled rejections
- request count remains below 100

## Files other workers must not overwrite before integration

All nine owned source/test files listed above. The integration worker may merge only after rereading the current file, this handoff, and every overlapping worker handoff.
