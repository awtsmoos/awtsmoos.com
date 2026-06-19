B"H

# First Brainstorm: Scene Three Must Stop Floating

The screenshots show the actors hovering over buildings, camera cuts too close, UI controls masking subtitles, and scale/grounding broken. The stage is not a park; it is a sky of misplaced people. The first repair is not another tiny camera tweak. We need a clean scene-three system with actual stage grammar: ground plane, actor lanes, fixed safe camera shots, and JSON fragments that can be loaded together.

## Full possibility storm

- Make a brand new scene 3, independent of the old demo sequence.
- Split data into scene metadata, characters, props, cameras, and timeline JSON modules.
- Add a loader that assembles these pieces into one scene contract.
- Make actors stand on a real ground y, not skyline/building tops.
- Use shot names whose framing is mobile-safe: establish, medium group, two shot, speaker, prop insert.
- Reduce actor sizes and prevent oversized faces unless closeup is explicit.
- Disable or soften the current autoplay sequence if it causes sky-floating.
- Repair UI bottom bar overlap by reserving safe area or hiding captions behind controls.
- Keep all touched files under 120 lines where practical.
- Verify import graph and scene loader smoke.

## Inspect before writing

Read DefaultSceneInstaller, scene initializer, sequence structure, camera processors, actor aligner, and any data scene files. Then write second and third plans before writing implementation.
