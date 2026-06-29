# B"H

# Improvements and Final Plan

Improvements over first brainstorm:

1. Preserve `GoalBoardEasyAPI` behavior so old authoring can still exist.
2. Move the default scene bridge only, not the old authoring system.
3. Add `livingWorld` as an explicit contract, not scattered metadata.
4. Every character must contain a named procedural behavior envelope.
5. Facial performance should be per-character and global system.
6. Environmental intelligence should include both state and active systems.
7. Crowd should be separate from primary characters but still included in verification.
8. Camera operator should produce plans per beat, not static camera array only.
9. Director brain should score 100 by satisfying explicit questions.
10. Story memory should include current and future continuity hooks.
11. Verification should check counts and semantic fields.
12. Scene fields should be stable JSON-like data with no runtime-only closures.
13. Keep all new files below 120 lines.
14. Avoid partial patching; rewrite entire touched files.
15. The final default should feel like a place alive off-camera.

Actual write plan:

- Add nine small modules under `outdoorProfessional`.
- Rewrite `DefaultLivingScene.js` to import `OUTDOOR_PROFESSIONAL_SCENE`.
- Keep `index.js` simple but export the new named scene.
- Add `tools/verify/outdoorProfessionalLivingWorldSmoke.js`.
- Rewrite `defaultDetailedSceneSmoke.js` for new default contract.
- Rewrite `goalBoardEasySystemSmoke.js` so it still verifies GoalBoard API without requiring DEFAULT_SCENE to be goalBoard.
- Rewrite `package.json` to include `verify:outdoor-professional` and include it in `verify:goal-board-smokes` or final `verify`.

Completion proof:

- Read back all touched files.
- Run `node tools/verify/outdoorProfessionalLivingWorldSmoke.js`.
- Run `node tools/verify/defaultDetailedSceneSmoke.js`.
- Run `node tools/verify/goalBoardEasySystemSmoke.js`.
- Run `npm run verify:fast`.
