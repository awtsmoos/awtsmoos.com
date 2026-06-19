// B"H
import { GroundingSolver } from './GroundingSolver.js';
import { StageAnchorResolver } from './StageAnchorResolver.js';
import { CompositionRules } from './CompositionRules.js';

/** One vessel for stage truth: anchors, grounded actors, safe cameras. */
export class SceneStagingSystem {
  static prepare(scene = {}) {
    return {
      ...scene,
      initialCharacters: GroundingSolver.groundAll(scene.initialCharacters || {}, scene.scene || {}),
      initialProps: (scene.initialProps || []).map(p => ({ ...p, ...StageAnchorResolver.resolve(p, scene.scene || {}) })),
      cameras: (scene.cameras || []).map(c => CompositionRules.clampCamera(c))
    };
  }
}
