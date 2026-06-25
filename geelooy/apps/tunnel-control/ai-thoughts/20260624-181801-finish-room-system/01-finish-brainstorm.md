B"H

# Finish everything: Mission Rooms completion pass

Remaining gaps after room-first fix:
1. Backend gap: selected-room activity should eventually include action history if missionId is present in action ledger entries. Need inspect actionLedger.
2. Frontend gap: room filter controls hidden in lobby now, but there is no obvious manual refresh UI unless controller binds to missing button. Need add lobby refresh/search controls that are room-list-only and not debug controls.
3. PageSpec still may reference removed IDs. Need update it so readiness doesn't expect removed debug IDs.
4. CSS still says roomCommandTable internally but okay only created after room opens. Need ensure workspace hidden until open.
5. Verify in browser after hard reload: no Room activity visible initially.

Finish plan:
- Inspect actionLedger and pageSpecs.
- Add room browser refresh/filter controls but keep initial page as room grid only.
- Add backend-friendly missionTimeline activity only.
- Update pageSpecs IDs.
- Run tests and browser eval.
