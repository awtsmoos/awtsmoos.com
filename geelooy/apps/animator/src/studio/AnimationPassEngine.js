// B"H

/**
 * @file AnimationPassEngine.js
 * @description
 * Converts expanded beats into production passes: pose, lip sync, eyes, hands,
 * prop contact, fur/cloth, camera, and final polish.
 */
export class AnimationPassEngine {
  static build(plan) {
    return plan.beats.map((beat, index) => ({
      beatId: beat.id,
      passes: ['blocking', 'pose', 'lipSync', 'eyeFocus', 'handContact', index % 5 === 0 ? 'furCloth' : 'linePolish', 'cameraPolish'],
      estimatedFrames: Math.ceil((beat.duration / 1000) * 24),
      status: 'planned'
    }));
  }
}
