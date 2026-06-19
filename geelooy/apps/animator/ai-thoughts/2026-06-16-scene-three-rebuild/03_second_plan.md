B"H

# Second Plan

Inspection found the current default scene data places actors at y=0, which visually pins them to the skyline/horizon instead of the park floor. The old demo uses aggressive closeups and a bottom NLE overlay that blocks captions and makes mobile look broken.

## Implementation plan

Create scene 3 as assembled modules under `src/data/scenes/scene3/`:
- metadata.js
- characters.js
- props.js
- cameras.js
- beats.js
- SceneThree.js

Rewrite `DefaultSceneInstaller.js` to install SCENE_THREE by default with a new version stamp. Add smoke verification. Update package scripts. Rewrite the mobile NLE seal to collapse the editor controls on phones so the animation can be watched without giant dead buttons covering the stage.

## Improvements

1. y positions will be floor-lane positive values, not zero.
2. actor scales will stay moderate.
3. closeups become medium close, not face filling the whole screen.
4. camera ids will be scene3-specific.
5. props stay at chest/floor coordinates, not floating in skyline.
6. the scene loops at 12s, not 27s.
7. mobile timeline becomes collapsed.
8. tests validate y positions are grounded.
9. no partial file edits.
10. all new files stay small.
