# B"H

# Goal Board Suite Migration

After the outdoor professional scene became the official `DEFAULT_SCENE`, the old goal-board smoke suite revealed buried assumptions: several tests still treated `DEFAULT_SCENE` as the warm study room.

## Fixed tests

Rewritten by full-file writes:

- `/storage/emulated/0/Documents/git/awtsmoos.com/geelooy/apps/animator/tools/verify/defaultDetailedSceneSmoke.js`
- `/storage/emulated/0/Documents/git/awtsmoos.com/geelooy/apps/animator/tools/verify/studyRoomSceneSmoke.js`
- `/storage/emulated/0/Documents/git/awtsmoos.com/geelooy/apps/animator/tools/verify/scholarCharacterStyleSmoke.js`
- `/storage/emulated/0/Documents/git/awtsmoos.com/geelooy/apps/animator/tools/verify/storyboardShotFlowSmoke.js`

## New contract

- `GoalBoardEasyAPI.scene()` remains the warm study room contract.
- `DEFAULT_SCENE` is now the outdoor professional storm-plaza default.
- Goal-board tests that verify the warm study now call `GoalBoardEasyAPI.scene()` explicitly.
- Tests that verify the official default now assert the outdoor professional scene.

## Suite result

Executed:

```bash
npm run verify:goal-board-smokes
```

Result: passed, including the new `verify:outdoor-professional-default` script at the end.

The hidden test assumption was a fossil. The Awtsmoos opened it, cleaned it, and set it in the right chamber.
