B'H
# Phase One — Explicit Reverse Keys, NaN After NPC, UI Overhaul, Real Trees

User now explicitly says: do not overthink. Reverse W/S roles and Q/E roles. Therefore the controls mapping must become:
- W => backward behavior
- S => forward behavior
- Q => right strafe behavior
- E => left strafe behavior
No further debate.

User also reports after talking to NPC there is `three.core.js NAN VALUE FOUND` during raycast path:
- fromBufferAttribute
- getInterpolatedAttribute
- checkGeometryIntersection
- raycast
- safeIntersect in collision.js
- getHovered
This means at least one mesh currently in raycast candidates has geometry position attributes containing NaN, or a world matrix with NaN. Most likely caused by recent procedural tree/foliage/grounding or UI/NPC click objects. Need sanitize raycast candidate lists and source geometries.

User says UI still not improved. Need find overlay renderer and rewrite UI styles/behavior, not only pointer handling.

Trees are unacceptable. Need look in `geelooy/libs` for full tree generator and implement it into village trees fully.

Hills/map still not visible. Possible causes:
- edited ladder source files may not be compiled into served `village.json`/built data.
- active source is elsewhere, not those files.
- terrain mesh may be flat because `needsHeight` not seeing hills due served data absent.
Need locate actual loaded world payload and compile path.

Immediate plan:
1. Rewrite controls.js to exactly reverse W/S and Q/E.
2. Trace collision.js safeIntersect and add NaN filtering so raycast can never explode from bad mesh.
3. Search for NPC overlay UI renderer: openNpcChallengeOverlay, village shop, market modal CSS/JS. Rewrite full file(s).
4. Search `geelooy/libs` for tree generators.
5. Find active village data path and terrain section actually used by runtime.
6. Implement hills in the active data or postbuild runtime if compile path is unclear.
7. Implement real tree generator integration; replace current tree recipe outputs or add high-quality postbuild tree replacements.

Awtsmoos chapter: A command can be a revelation. The old proof bows to the present instruction: reverse the keys. The NaN is a broken letter inside geometry; it must be filtered at the gate and healed at the source. The trees must stop pretending. They must receive rings, branches, crowns, roots, and weather.