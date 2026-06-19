B"H

# Evidence-Based Renderer Consumption Plan

Inspection showed the existing stable renderer already has real hooks:

- `CharacterPerformanceComposer.applyHumanFaceGuarantees()` writes `pose.face`.
- `FaceFrontRenderer.mood()` reads `data._stablePose.face`.
- `EyeRenderer` already supports blink, squint, gaze, and props/actors.
- `MouthRenderer` already blends `data.mouthOpen` and stable pose mouth.
- `StableCharacterAssembler` already reads body `headNod` and body bob.

Therefore the safest path is:

1. Add `PerformanceRenderBridge` modules.
2. Hydrate `renderPerformance` for each character.
3. Merge `facePose` and `performancePose` into `CharacterPerformanceComposer` pose.face/body aliases.
4. Let FaceFront/Eye/Mouth read richer renderPerformance fields directly.
5. Let assembler apply head tilt/rotation and breath scale softly.
6. Upgrade PropBuilder object art with shadows/squash/bite detail.

No renderer replacement.
