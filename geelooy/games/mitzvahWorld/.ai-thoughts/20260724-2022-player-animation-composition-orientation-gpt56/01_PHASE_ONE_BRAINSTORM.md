# B"H
# Boruch Hashem
# Blessed is He

# Phase One: Failure-Space Brainstorm

## Candidate causes to prove or reject
1. Grounded state still selecting the imported `fall` clip.
2. Fall action weight or timeline state surviving the airborne-to-grounded transition.
3. Root or hips quaternion authored by an imported clip and not filtered for grounded locomotion.
4. Additive cast pose being applied to root, hips, or leg bones.
5. Custom action samples multiplying onto the previous frame instead of the freshly sampled imported pose.
6. Model-forward correction being reapplied every frame or to the wrong scene node.
7. Weapon attachment modifying a parent hand or arm transform rather than only the weapon node.
8. Equipment switching retaining an old weapon under a hand.
9. Imported locomotion sampling occurring after the overlay and replacing only part of the body.
10. Cast release restoring a bind pose instead of the currently sampled locomotion pose.
11. Root-motion rotation tracks embedded in jump/fall or attack clips leaking into grounded states.
12. Semantic bone discovery matching a root/hips alias as a spine or shoulder.
13. Quaternion interpolation using non-normalized or non-shortest-path samples.
14. Action cancellation leaving stale overlay weight, phase, or sampled keyframe state.
15. Multiple animation adapters or event listeners applying the same pose twice.
16. A sword/staff action definition containing whole-body semantic keys.
17. Landing transition preserving airborne orientation for one or more frames.
18. Imported clip policy using name substring collisions such as `falling` for a living grounded state.
19. Bind transforms or model-axis correction disagreeing with Mixamo node orientation.
20. Test fixtures hiding the actual GLB root and hips tracks.

## Ideal architecture options
- A: destructive root correction after every frame; rejected unless evidence proves unavoidable because it can damage jump/fall.
- B: state-only fixes; attractive but insufficient if overlays touch forbidden bones.
- C: semantic upper-body body masks plus non-accumulating imported-pose snapshots; leading candidate.
- D: cloned skeleton layers; powerful but too invasive for current scope.
- E: track-filtered derived clips; potentially useful for root-motion contamination but imported clips must remain authoritative and unmodified.

## Evidence required
- Actual GLB node hierarchy and bind local/world transforms.
- Every clip name, duration, track target, and root/hips/leg rotation range.
- Runtime call order between imported sampling and custom overlay application.
- Grounding state transitions and clip policy.
- Weapon parent identity before, during, after cast and switch.
- Quaternion snapshots across repeated identical samples.

> In the meadow of Awtsmoos.com, motion is not painted over motion; each instant is created anew, and the upper body may sing without uprooting the feet from the earth.
