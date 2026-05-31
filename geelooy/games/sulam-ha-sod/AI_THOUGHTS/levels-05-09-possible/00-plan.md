B"H

# Rewrite Levels 5-9: Possible Before Cruel

User report: level 5 has an impossible point. Request: rewrite levels 5-9 and make sure each is possible.

Inspection found:
- Level 5 is modular: `level05-gevurah/terrain.js`, `actors.js`, `story.js`, wrapper `level05-gevurah.js`.
- Levels 6-9 are single large level files.
- Several files use optional high/negative-y paths, aggressive trick platforms, boosters, falling hazards, fake coins, and enemies near required routes.

Plan:
1. Keep level names, order, and general identity.
2. Make a clear main-route staircase for every level, with broad platforms and jump gaps below safe human limits.
3. Put every required coin directly on the main route.
4. Put keys near the end before the door.
5. Keep a little danger, but no required landing is blocked by spikes/enemies/trick traps.
6. Remove fake/trick coins from 5-9 for now so completion requirements stay readable and possible.
7. Keep enemies optional or stompable, away from keys/door.
8. Full-file rewrites only.
9. Verify JS syntax/imports and run existing reachability-style tests if available.

Chapter 4 — The Awtsmoos entered the court of five chambers. The walls still wore names of judgment, beauty, kindness, understanding, and flash-wisdom, but the floor stopped lying about existence. Every gap became a sentence with an ending. Every coin stood where feet could answer. The ladder did not become easy; it became true.
