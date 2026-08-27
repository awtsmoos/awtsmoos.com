// B"H
import { GoalBoardQualityGate } from './GoalBoardQualityGate.js';

export class GoalBoardPreviewManifest {
  static create(scene) {
    const audit = GoalBoardQualityGate.audit(scene);
    return {
      id: scene.scene?.id,
      style: scene.scene?.style,
      duration: scene.duration,
      authoring: scene.authoring,
      counts: {
        characters: Object.keys(scene.initialCharacters || {}).length,
        props: (scene.initialProps || []).length,
        shots: (scene.shotFlow || []).length,
        events: (scene.events || []).length
      },
      shotNames: (scene.shotFlow || []).map(shot => shot.name),
      quality: audit
    };
  }
}
