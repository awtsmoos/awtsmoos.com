B"H

# Better System Architecture

## Authoring
A new `src/authoring/goalBoard/` family becomes the simple way to author scenes. It exposes:

- GoalBoardScenePreset
- GoalBoardBeatCompiler
- GoalBoardQualityGate
- GoalBoardPreviewManifest
- GoalBoardEasyAPI

## Runtime Fit
The existing default scene imports the Easy API, not scattered low-level modules. This makes the default scene declarative and future edits easy.

## Verification
Add one command-oriented smoke file that uses the Easy API and quality gate. It should fail if the system loses:

- warm study style
- two scholar characters
- 10+ props
- 8+ shots
- insert shots
- mobile coverage
- room detail ids
- character identifiers

## Expected Improvement
Instead of manually wiring every character, prop, beat, and camera in many places, future scenes can be built with a one-call preset plus optional overrides.
