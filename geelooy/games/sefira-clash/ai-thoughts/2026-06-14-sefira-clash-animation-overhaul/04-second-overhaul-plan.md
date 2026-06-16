B"H
# Second Overhaul Plan

Goal: add more animation breadth without breaking v3 probes, split medium files into smaller pose modules, split the direct AI brain into smaller modules, and verify behavior with focused and long simulations.

Animation files to add/split:
- animation/idle/Breath.js
- animation/idle/GuardTwitch.js
- animation/idle/WeightShift.js
- animation/jump/GroundJump.js
- animation/jump/DoubleJump.js
- animation/jump/ApexHang.js
- animation/jump/FallPanic.js
- animation/jump/DivePose.js
- animation/punch/JabPose.js
- animation/punch/RapidPose.js
- animation/punch/ChargedPose.js
- animation/punch/MissRecovery.js
- animation/ledge/HangPose.js
- animation/ledge/ClimbPose.js
- animation/ledge/DropPose.js
- animation/ledge/AttackPose.js
- animation/damage/Reactions.js

AI files to add/split:
- js/ai/direct/blankInput.js
- js/ai/direct/targeting.js
- js/ai/direct/memory.js
- js/ai/direct/movement.js
- js/ai/direct/attacks.js
- js/ai/direct/mark.js
- js/ai/direct/command.js
- js/ai/botBrain.js as tiny shell.

Verification:
- visual probes
- spectacle probe
- focused simulations before/after
- at least one full 18,000-frame sim after changes.
