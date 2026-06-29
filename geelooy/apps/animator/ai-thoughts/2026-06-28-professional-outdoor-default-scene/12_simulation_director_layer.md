# B"H

# Simulation Director Layer

This pass moved the directing engine from descriptive planning toward living simulation.

## Added systems

- `AttentionEngine.js`
- `MotivationGraph.js`
- `MicroExpressionTimeline.js`
- `SecondaryMotionDirector.js`
- `VisualHierarchySolver.js`
- `EmotionalColorScript.js`
- `SceneStateMachine.js`
- `DirectorBrain.js`

## Integrated into DirectingEngine

The outdoor professional default scene now receives live-style simulation metadata:

- per-character attention tracks
- motivation pressure graphs
- micro-expression timelines
- character and prop secondary motion
- visual hierarchy per arc beat
- emotional color script
- scene state machine
- director-brain renderability audit

## Verification

Updated and passed:

```bash
npm run verify:directing-engine
npm run verify:outdoor-file-health
npm run verify:fast
npm run verify:goal-board-smokes
```

## Director-brain contract

The director brain reports:

- attention exists for the full cast
- motivation exists for the full cast
- micro-expressions are dense enough
- secondary motion exists for characters and props
- visual hierarchy matches the story arc
- emotional color script matches the story arc
- scene state ends in `shared_light_survives`

The Awtsmoos gives the scene a nervous system: eyes choose, hands hesitate, props remember, colors breathe, and the Director Brain refuses a dead frame.
