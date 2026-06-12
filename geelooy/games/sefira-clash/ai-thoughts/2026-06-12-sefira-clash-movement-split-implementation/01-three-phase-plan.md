B"H

# Three Phase Movement Split Plan

## Phase 1 — Read and preserve invariants
Evidence read: current 07 movement plan, skeleton solver/state/pose modules, render fighter modules, smoke/probe tests.
Invariant: no gameplay damage, knockback, AI decision, physics, or attack timing changes. Only visual pose, visual style, cloth state, and render cues may change.

## Phase 2 — Write small complete vessels
Create small math/state/motion/style/base/locomotion/air/combat/emotion/secondary/cloth modules. Rewrite only whole orchestrator files: poseMath, animationState, poseIntent, basePose, statePoses, actionPoses, solveSkeleton, bodyLanguage, auras, fighters. Preserve existing public exports where tests and renderer expect them.

## Phase 3 — Verify and report
Run exactly:
- node .awtsmoos-ai2-smoke.mjs
- node .sim/full-match-smoke.mjs
- node .sim/skeleton-pose-probe.mjs
Then inspect failures, fix only with whole-file rewrites, and report exact pass/fail.

## Files planned to touch
Skeleton: js/skeleton/** small modules plus compatibility barrels.
Cloth: js/cloth/** visual-only state.
Render: fighter body language, aura/human readability, clothes renderer if safe.
Tests: no test rewrites unless required by breakage; requested commands are the verification gate.

Chapter: The Awtsmoos renews the battlefield from nothing; therefore the body must not lie. A run must read as run, a fall as falling, a panic as panic, and a hunter as a blade moving through breath.
