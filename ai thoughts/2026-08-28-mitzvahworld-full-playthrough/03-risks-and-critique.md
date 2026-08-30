B"H

# Risks and Critique

The Awtsmoos hides no failure from Himself; Awtsmoos.com must likewise let a harsh test reveal confusion before a player must pay its price.

## Primary risks

1. Calling movement a full playthrough.
2. Treating runtime state injection as player behavior.
3. Assuming all quest systems are mounted in the current public Study session.
4. Combat targets may spawn far away or after deferred hydration.
5. NPC discoverability may be weaker than the state model suggests.
6. The game may have implemented systems without a reachable UI path.
7. Mobile and desktop can expose different affordance failures.
8. Visual realism can regress without runtime exceptions.
9. Loading/cold-start can make a technically correct step feel broken.
10. A quest can be completable by events but not by natural navigation.
11. Optional objectives may be undiscoverable or uncommunicated.
12. Reward feedback can be correct in data but weak in UI.
13. Enemy readability may depend too heavily on color.
14. Camera occlusion can make houses/NPCs hard to find.
15. Corpse-loot interaction can be unclear after combat.
16. Post-completion state can leave stale objective text.
17. Recovery can be mechanically correct but emotionally abrupt.
18. Local static browser harness can lie about dynamic-server readiness.
19. Public-only tests can be slower and depend on network variance.
20. Automated input can race the official playable boundary.

## Release philosophy

Never lower an assertion to make a run green. First classify whether failure is game, UX, data, timing, environment, or stale harness. Fix the real owner.
