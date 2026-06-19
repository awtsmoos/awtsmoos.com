B"H

# Step-by-step execution: performance, expression, object life

The big plan becomes an incremental implementation that preserves the existing renderer.

## Step 1: inspect renderer contracts

Read stable adapter, hydrator, character processor, event processor, prop builder/processor, and current scene data.

## Step 2: add pure performance modules

Create face, attention, body, object lifecycle, interaction, camera helper, style, and object art modules. Pure modules first, no runtime damage.

## Step 3: wire safely

Rewrite SpeechProcessor and CharacterProcessor to merge new performance fields without deleting current fields.
Rewrite PropProcessor to use lifecycle/contact/motion presets.
Rewrite DialogueBeatCompiler to accept attention/object directives.

## Step 4: scene data upgrade

Rewrite healthy lunch metadata/characters/props/cameras/beats to include expression, attention, stage anchors, object lifecycle, and shot purpose.

## Step 5: verification

Add smoke tests for every new subsystem and run full verify.

## Step 6: visual iteration

After screenshots, tune fields not architecture.
