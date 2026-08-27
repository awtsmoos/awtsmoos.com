// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @class MoonVessel
 * @description
 * THE LESSER LUMINARY (Ma'or HaKatan).
 * B"H - Solid flat geometric crescent moon. No blur. No gradients.
 * The moon is a perfect circle of ecf0f1 light against the #11131a void,
 * with a dark circle subtracted from it to create the crescent illusion.
 */
export class MoonVessel {
  static build(width, height, timeOfDay) {
    if (timeOfDay < 0.6) return null;
    const moonX = width * 0.8;
    const moonY = height * 0.2 + (timeOfDay * height * 0.5);
    return G.group('moon_grp', null, [
      G.circle('moon_base', moonX, moonY, 45, { fill: '#ecf0f1', stroke: '#000', lineWidth: 4 }),
      G.circle('moon_shadow', moonX + 15, moonY - 10, 40, { fill: '#11131a' })
    ]);
  }
}