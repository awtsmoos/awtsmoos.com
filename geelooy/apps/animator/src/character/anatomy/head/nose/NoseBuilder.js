
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { ANATOMY } from '../../../data/Anatomy.js';
import { NoseFront } from './NoseFront.js';
import { NoseThreeQuarter } from './NoseThreeQuarter.js';
import { NoseSide } from './NoseSide.js';

/**
 * @file NoseBuilder.js
 * @description
 * THE CENTRAL MOUNT OF BREATH (Mechaber HaChotem).
 * B"H
 * 
 * Now tracking the 'vocalIntensity' parameter to flare the nostrils 
 * dynamically via raw scaling on the X-axis during heavy phonemes!
 */
export class NoseBuilder {
  /**
   * Generates the entire nose assembly bound to an absolute safe Y-offset.
   */
  static draw(r, profile, skinColor, jawDrop, vocalIntensity) {
    const type = profile.type;
    const dir = profile.dir || 1;
    const config = ANATOMY.face.nose;
    
    const safeYOffset = config.offsetY + (jawDrop * 0.05); 
    
    // Nostril Flaring multiplier based on vocal intensity
    const flare = 1.0 + (Math.min(1.0, vocalIntensity) * 0.12);
    const scale = 0.95;

    let noseContent;

    if (type === 'side' || type === 'back') {
      noseContent = NoseSide.build(scale, dir, skinColor);
    } else if (type === 'threeQuarter') {
      noseContent = NoseThreeQuarter.build(scale, dir, skinColor);
    } else {
      noseContent = NoseFront.build(scale, skinColor);
    }

    return G.group('master_nose_anchor', { x: profile.nose?.x || 0, y: safeYOffset, scaleX: flare }, [
      noseContent
    ]);
  }
}
