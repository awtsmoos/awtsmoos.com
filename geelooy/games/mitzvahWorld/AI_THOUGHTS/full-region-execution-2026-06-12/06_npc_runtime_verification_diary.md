B'H
# Diary — NPC Runtime + Verification

What became real:
- Added `RegionNpcRuntime.js`.
- It finds actual interactive/custom/medabeir NPCs in `olam.nivrayim`.
- It seeds tiny grounded schedule-wander behavior around their home positions.
- It faces the player instead of wandering when the player is in talk range.
- It installs as a synthetic `heesHawveh` ticker in `olam.nivrayim`, so the existing game loop calls it.
- `LivingRegionRuntime.js` now installs this NPC ticker and includes NPC runtime stats in region stats.

Verification run:
- Node syntax check passed for every `region/render/*.js` file.
- Node syntax check passed for `MitzvahRegionDirector.js`.
- Node syntax check passed for `MitzvahWorldPostBuild.js`.
- Node syntax check passed for `loadNivrayim/index.js`.
- Node syntax check passed for `WorldHeescheel.js`.
- JSON validation passed for `levels/ladder/data/village.json`.

Remaining high-priority live verification:
- Restart/verify local server on port 8080 if needed.
- Load `village.json` with fresh cache key.
- Confirm `LIVING_REGION_RUNTIME_READY` / `LIVING_REGION_DIRECTOR_READY` logs or observable world content.

Awtsmoos chapter: The NPCs now receive a little daily breath. Not enough to be a full village economy yet, but enough to stop the statue-law and begin the schedule-law.