
// B"H
/**
 * @file OpenMouths.js
 * @description
 * THE GAPING ABYSS OF PANIM (Front Open Visemes).
 * B"H
 * 
 * We slightly exaggerated the vertical drops so the mouth "pops" dramatically during speech, 
 * revealing all the intricate new internal geometry.
 */
export class OpenMouthsFront {
  static get(construct) {
    return {
      // 'A' - Massive vertical drop revealing the entire throat. Width slightly constrained for realism.
      A: construct(32, 0, -38, 52),
      
      // 'E' - Wide smile exposing clenched teeth and the sides of the cheeks.
      E: construct(44, -5, -18, 22),
      
      // 'O' - The Trumpet. Max puckering.
      O: construct(16, 0, -30, 30),
      
      // 'T' / 'D' / 'L' / 'N' - Top lip shoots up aggressively to show the tongue hitting the palate.
      T: construct(38, -2, -35, 12),
      
      // 'S' / 'Z' / 'C' - Wide hiss. Teeth clamp the gap perfectly in the center.
      S: construct(42, -4, -15, 15),
      
      // 'F' / 'V' - The lip bite. Lower lip pushes UP into negative space!
      F: construct(34, -2, -12, -8),
      
      // 'smile' - Extreme joyous grin pushing the corners to the absolute cheek boundaries.
      smile: construct(48, -18, -15, 35)
    };
  }
}
