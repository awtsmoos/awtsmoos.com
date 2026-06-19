
// B"H
/**
 * @file ClosedMouths.js
 * @description
 * THE SEALED GATES OF PANIM (Front Closed Visemes).
 * B"H
 */
export class ClosedMouthsFront {
  static get(construct) {
    return {
      // 'M' (M/B/P) - Pure horizontal compression, absolute vacuum seal.
      M: construct(36, 0, 1, -1),
      
      // 'neutral' - Relaxed resting state with a subtle central gap/wave.
      neutral: construct(34, 0, -2, 2),
      
      // 'sad' - Corners plunged deep into the chin space.
      sad: construct(38, 15, 6, -4),
      
      // 'angry' - Rigid, stretched taut tension across the face.
      angry: construct(42, 2, 2, -2),

      // 'smirk' - Unilateral lift. One corner shoots to heaven, one to earth.
      smirk: construct(40, -12, -5, 5) 
    };
  }
}
