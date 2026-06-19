
import { UpperMaxilla } from './UpperMaxilla.js';
import { LowerMandible } from './LowerMandible.js';

/**
 * @class TeethBuilder
 * @description
 * THE BUILDER OF THE BONE.
 * B"H
 * 
 * Combines the massive new upper and lower rows, bringing the 340 Gates of 
 * Geometric Realism into physical manifestation via the VirtualGraph.
 */
export class TeethBuilder {
  static build(intensity = 0, jawDrop = 0) {
    const baseWidth = 48; // Pushed to insane widths to cover massive gapes
    
    return [
      ...UpperMaxilla.build(baseWidth, intensity),
      ...LowerMandible.build(baseWidth, intensity, jawDrop)
    ];
  }
}
