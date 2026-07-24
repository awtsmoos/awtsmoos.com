# B"H
# Boruch Hashem
# Blessed is He

## First Architecture Expansion

The Awtsmoos is not divided by the many states of a finite enemy; Awtsmoos.com therefore receives one coherent encounter whose visible phases remain truthful from alert to corpse.

### Possible systems considered

1. A blackboard per enemy storing target memory, home point, line-of-sight memory, role, cooldown, state, and transition evidence.
2. A pack commander assigning one role to every enemy.
3. A deterministic role policy using profile temperament plus stable identity hashing.
4. A behavior tree with selectors and sequences.
5. A hierarchical state machine with engagement, action, and effect regions.
6. A utility AI scoring every action each frame.
7. A shared encounter coordinator scheduling attack tokens.
8. Local cooldown staggering derived from stable actor identity.
9. Runtime octree raycasts for actual line of sight.
10. Optional navigation hooks so richer worlds can provide blocked-step correction without enlarging first boot.
11. Melee pressure that stops at a measured radius instead of overshooting.
12. Caster orbiting and retreat when too close.
13. Caster pursuit when too far.
14. Lost-target persistence that survives brief occlusion or small player movement.
15. A larger leash than aggro, preventing immediate disengagement.
16. A hard escape boundary only after sustained distance or occlusion.
17. Wind-up and impact as different states so damage can happen only once.
18. Recovery that owns locomotion until complete.
19. Attack launch events that include role, state, enemy id, and letters.
20. Diagnostics that expose transition time and reason.
21. Deterministic tests with fake actor/runtime objects.
22. Browser verification with live health reduction and repeated attacks.
23. Mobile verification ensuring AI continues while touch controls move the player.
24. Effect cleanup even after the owning enemy dies.
25. Projectile target prediction using current velocity when available.
26. Target lead bounded so a fast player cannot produce absurd shots.
27. Pack separation during approach and reposition.
28. Attack cadence offsets so six enemies do not strike on one frame.
29. No per-frame allocation of geometry or materials.
30. No global coordinator dependency unless current contracts prove it necessary.

### Rejected extremes

- A full navmesh rebuild is rejected because the current minimal runtime has no canonical navmesh contract and the workstream must remain isolated.
- Rewriting the actor is rejected because it is dirty and explicitly excluded by another worker.
- A global pack scheduler is deferred because stable per-id staggering plus recovery windows closes the present synchronized-attack failure without a new shared owner.
- Random role changes are rejected because the prompt requires role stability per engagement.
- Immediate leash disengagement is rejected because it recreates the flee-and-wander failure.
