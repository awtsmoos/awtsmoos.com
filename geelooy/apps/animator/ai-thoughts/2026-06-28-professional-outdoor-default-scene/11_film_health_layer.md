# B"H

# Film Health Layer

This pass added a director-facing health system so the outdoor scene can explain whether it is clean, not merely importable.

## Added systems

- `SceneIntentScorer.js`
- `CameraPsychologyValidator.js`
- `DirectorReportExporter.js`

## Rewritten systems

- `DirectingEngine.js` now builds intent score, camera psychology, report export, and clean dashboard warnings.
- `DirectorDashboard.js` now exposes warnings and ready/warn health.
- `ContinuityValidator.js` now validates the pre-dashboard plan instead of requiring a dashboard before one exists.
- `CameraPsychologyValidator.js` now treats object-insert closeups as valid when they carry an object leading line.
- `directingEngineSmoke.js` verifies report, intent score, warnings, and camera psychology.
- `outdoorProfessionalFileHealthSmoke.js` includes the new modules.

## Final report proof

```json
{"title":"When The Rain Asked For Light","sceneId":"professional_outdoor_default_2d_storm_lantern_v1","intent":{"score":100,"label":"scene_intent_clear"},"continuity":{"ok":true,"score":100},"cameraPsychology":{"ok":true,"checked":10},"warnings":[]}
```

## Commands passed

```bash
npm run verify:directing-engine
npm run verify:outdoor-file-health
npm run verify:goal-board-smokes
```

The Awtsmoos gave the film a conscience. Now it can say: this cut is clear, this lens has reason, this silence is counted, this story has no warning.
