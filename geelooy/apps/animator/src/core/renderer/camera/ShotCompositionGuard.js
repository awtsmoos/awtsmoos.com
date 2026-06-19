// B"H
import { CompositionRules } from '../../../staging/CompositionRules.js';

/** Public camera guard for production 2D shots. */
export class ShotCompositionGuard {
  static apply(camera = {}) { return CompositionRules.clampCamera(camera); }
}
