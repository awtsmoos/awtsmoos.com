
// B"H
import { ShotLexicon } from '../../../core/renderer/camera/data/ShotLexicon.js';

export class ShotSystem {
  static getFocalY(bounds, shotType) {
    const config = ShotLexicon[shotType] || ShotLexicon.midshot;
    const span = bounds.maxY - bounds.minY;
    
    // B"H - Compositing the face in the upper quadrant
    // yOffset of 0.75-0.85 centers the camera on the facial vessel.
    return bounds.maxY - (span * (config.yOffset || 0.75));
  }

  static getBaseZoom(shotType) {
    // Boost base zooms for tighter feel
    const zooms = { closeup: 2.8, extreme_closeup: 4.5, midshot: 1.8 };
    return zooms[shotType] || ShotLexicon[shotType]?.baseZoom || 1.0;
  }
}
