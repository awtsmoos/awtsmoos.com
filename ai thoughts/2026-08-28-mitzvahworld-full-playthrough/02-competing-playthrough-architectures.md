B"H

# Competing Playthrough Architectures

The Awtsmoos is one while finite tests divide their vessels; Awtsmoos.com chooses the architecture that lets each vessel tell truth without pretending its boundary is all.

## Architecture A: browser-only black box

Strongest realism and UI evidence, but slow and fragile for combat branches, defeat recovery, exact-once rewards, and deterministic optional objectives.

## Architecture B: simulation-only domain run

Fast and deterministic for progression, combat consequence, recovery, and rewards, but cannot judge discoverability, loading, camera, touch controls, hierarchy, visual affordance, or perceived realism.

## Architecture C: browser with direct runtime mutation

Fast but risks turning a playthrough into hidden teleports and state injection. Useful only for observation or bounded setup, never as the primary user-path proof.

## Architecture D: public production browser plus deterministic simulation companion

Best current fit. Real browser performs genuine UI/input actions and records UX/realism. Deterministic simulation covers lawful alternate branches and validates exact state consequences. Both emit one shared evidence schema.

## Architecture E: dynamic local production server plus browser and simulation

Best long-term developer loop if local server faithfully supports CompactJS/CSS. This release should move toward it, but public production remains the final authority.

## Chosen

Architecture D now, with Architecture E built as supporting infrastructure where existing dynamic-server primitives make it safe and small.
