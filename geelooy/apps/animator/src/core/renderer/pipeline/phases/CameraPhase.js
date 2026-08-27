// B"H
import { SafeFrameResolver } from '../../../../camera/SafeFrameResolver.js';
import { ActorGroundAligner } from '../../../../camera/ActorGroundAligner.js';

/**
 * @file CameraPhase.js
 * @description
 * ============================================================================
 * CHAPTER: THE CAMERA THAT FINALLY PUTS HUMANS FIRST
 * ============================================================================
 *
 * RenderPipeline imports this phase directly, so this is the active final
 * camera transform. It now uses SafeFrameResolver and ActorGroundAligner.
 *
 * The rule is simple:
 * the people must be fully visible before the skyline gets to be beautiful.
 *
 * @class CameraPhase
 */
export class CameraPhase {
  /**
   * Calculates the actor-plane transform.
   *
   * @param {Object} ctx - Render context.
   * @param {Object} cam - Camera state.
   * @returns {Object} VirtualGraph transform.
   */
  static calculate(ctx = {}, cam = {}) {
    const safe = SafeFrameResolver.resolve(ctx);
    return ActorGroundAligner.transform(safe, cam);
  }
}