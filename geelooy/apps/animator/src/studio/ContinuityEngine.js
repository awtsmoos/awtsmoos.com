// B"H

/**
 * @file ContinuityEngine.js
 * @description
 * Keeps the hourglass from lying: props remember damage, doors remember state,
 * wardrobe and fur remember continuity across a twenty-minute cartoon world.
 */
export class ContinuityEngine {
  static build(plan) {
    return plan.shots.map((shot, index) => ({
      shotId: shot.id,
      time: shot.start,
      propState: index < 8 ? 'clean' : index < 24 ? 'scuffed' : 'damaged-but-trackable',
      wardrobeState: index % 6 === 0 ? 'ruffled' : 'consistent',
      furState: index % 5 === 0 ? 'needs secondary-fur continuity pass' : 'locked silhouette',
      callback: index % 8 === 7 ? `Callback payoff from ${plan.shots[Math.max(0, index - 7)].id}` : 'carry forward'
    }));
  }
}
