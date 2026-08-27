
// B"H
/**
 * @file OpenMouthsSide.js
 * @description
 * THE GAPING ABYSS OF ACHORAIM (Side Open Visemes).
 * B"H
 * 
 * Realistic, restrained opening arcs that pull correctly back toward the cheek.
 */
export class OpenMouthsSide {
  static get(construct) {
    return {
      // 'A' - Plunges reasonably down into the chin.
      A: construct(22, -4, -12, 28),
      
      // 'E' - Pulled straight back along the cheekbone.
      E: construct(26, -2, -5, 10),
      
      // 'O' - Pushed forward off the face slightly.
      O: construct(10, 4, -15, 15),
      
      // 'L' - Tongue press.
      L: construct(18, 1, -8, 14),
      
      // PROFILE LAUGH - Corners pulled high.
      smile: construct(24, -8, -6, 18)
    };
  }
}
