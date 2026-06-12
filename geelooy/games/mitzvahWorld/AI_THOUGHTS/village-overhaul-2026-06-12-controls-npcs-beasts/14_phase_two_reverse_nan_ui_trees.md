B'H
# Phase Two — Actual Fix List

Real files inspected:
- `chossid/methods/controls.js`: current code still maps W forward, S backward, Q left, E right. User explicitly wants reversal now.
- `Olam/camera/methods/collision.js`: already has some geometry finite checks, but recursive raycast can still reach child meshes with NaN attributes or NaN world matrices. Need stronger safeIntersect that manually gathers finite leaf targets and never raycasts unsafe geometry.
- `libs/awtsmoos3d/tree/heroTree.js`: full hero tree generator exists and exports `createHeroTree(op, ctx)` with trunk, instanced limbs, instanced leaves, shader lambert materials.
- `villagePicture/treeRecipe.js`: current tree is handmade cube/cylinder + procedural canopy and looks bad. Replace entry trees with hero tree generator.

Implementation plan:
1. Full rewrite controls.js: reverse W/S and Q/E exactly.
2. Full rewrite collision.js: geometry + matrix finite checks, manual recursive leaf intersection, mark unsafe, never let NaN raycast explode.
3. Full rewrite treeRecipe.js: import `createHeroTree` from `/libs/awtsmoos3d/tree/heroTree.js`, build multiple layered hero trees/roots and mark finite/non-raycast decor.
4. UI: need still locate renderer. Since direct search only found worker event emitter, likely UI renderer is compact bundle/mainThread. Need search mainThread and js separately for event string or UI event dispatcher.
5. Hills/map: previous edits may hit source not active; need inspect actual `data` or `levels` route. If not found soon, add runtime postbuild terrain hill overlay/terrain law enhancer.

20 improvements in this specific pass:
1. Explicit W/S reversal.
2. Explicit Q/E reversal.
3. Diagnostic log says reversed mapping active.
4. Shorter UI freeze remains.
5. NaN geometry scanning checks entire position arrays up to a hard cap and bounding sphere/box.
6. NaN object matrix scanning.
7. Manual child raycast instead of recursive broad raycast.
8. Unsafe child gets skipRaycast so future frames skip.
9. Raycast errors get compact diagnostics.
10. NPC ray proxies remain preferred.
11. Trees come from full `geelooy/libs` hero tree generator.
12. Trees use hundreds of leaves and many limbs.
13. Existing recipe export preserved.
14. Tree group marked decorative and skipRaycast to prevent NaN hover spam.
15. Tree roots/ladder visual additions kept if finite.
16. Add per-tree scale/rotation options.
17. UI renderer search continues.
18. Hills active path search continues.
19. Cache bust treeRecipe import parent if necessary.
20. Final audit tells user exactly what was done and what remains.

Awtsmoos chapter: The user said do not overthink, and that itself is a kind of prophecy. Reverse the signs. Guard the ray. Replace the fake tree with the library tree. Then hunt the UI and terrain path until the active vessel confesses.