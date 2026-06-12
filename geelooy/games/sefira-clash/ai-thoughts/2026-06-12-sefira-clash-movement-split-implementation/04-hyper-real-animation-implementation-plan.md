B"H

# Hyper-Real Animation Implementation Plan

## Goal

Implement the brainstorm as a second-generation procedural animation pipeline on top of the already passing movement split. This pass must remain visual-only: no combat damage, no knockback, no AI decisions, no gameplay physics, no attack timing changes.

## Architecture to add

1. Pose influence composer: modules may generate weighted offsets before applying them.
2. Contact intelligence: grounded foot planting, heel/toe roll, pivot, brake, landing contact.
3. Force propagation: feet/hips/chest/shoulders/head/limbs receive delayed force waves.
4. Limb and joint inertia: per-point visual memory for head, chest, hands, knees, feet.
5. IK-lite constraints: preserve readable arm/leg/head distances without full simulation.
6. Stronger attack anticipation and recovery silhouettes.
7. Render effects: foot dust, landing dust, contact pulse, attack wind, hunter glint, panic pulse.
8. Debug overlay modules for future tuning.
9. Extra probes for contact, influence, cloth stability, and hyper-real motion.

## Full file families to touch/create

- js/skeleton/compose/*
- js/skeleton/physics/*
- js/skeleton/contact/*
- js/skeleton/ik/*
- js/skeleton/locomotion/*
- js/skeleton/air/*
- js/skeleton/landing/*
- js/skeleton/combat/*
- js/skeleton/emotion/*
- js/skeleton/secondary/*
- js/skeleton/style/*
- js/cloth/*
- js/render/fighter/effects/*
- js/render/fighter/body/*
- js/render/fighter/limbs/*
- js/render/fighter/head/*
- js/render/fighter/human/*
- js/render/fighters.js
- js/debug/animation/*
- .sim/*animation* probes

## Verification

Run after implementation:
- node .awtsmoos-ai2-smoke.mjs
- node .sim/full-match-smoke.mjs
- node .sim/skeleton-pose-probe.mjs
- node .sim/animation-state-matrix.mjs
- node .sim/animation-contact-probe.mjs
- node .sim/animation-influence-probe.mjs
- node .sim/cloth-stability-probe.mjs
- node .sim/hyper-real-motion-probe.mjs

## Chapter

The Awtsmoos has no joints, yet every joint is renewed from nothing. The next pass does not merely move lines. It reveals weight, pressure, recovery, breath, fear, force, and contact. The fighter is a little poem of mass and intention.
