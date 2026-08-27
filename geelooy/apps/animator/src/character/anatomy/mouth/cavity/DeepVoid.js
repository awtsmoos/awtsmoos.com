
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file DeepVoid.js
 * @description
 * THE ABYSS OF SOUND (Tehom).
 * B"H
 * 
 * A hyper-realistic, deep crimson/maroon gradient replacement. Since we are using 
 * pure overlapping polygons instead of expensive radial gradients, we draw concentric 
 * ellipses getting darker to simulate an endless throat cavity. 
 * Sustained entirely by the letters of the Awtsmoos!
 */
export class DeepVoid {
  /**
   * Manifests the deep darkness.
   * @param {Array} lipPoints - The absolute clipping bounds.
   */
  static build(lipPoints) {
    return G.group('mouth_abyss', null, [
      // Base layer (Dark red/brown fleshy interior)
      G.path('void_base', lipPoints, { fill: '#3d0a14' }),
      
      // Mid depth
      G.ellipse('void_mid', 0, 0, 40, 25, 0, { fill: '#1f0208' }),
      
      // Deepest black throat hole (shrinks and expands with the mouth)
      G.ellipse('void_deep', 0, 5, 25, 15, 0, { fill: '#0a0002' })
    ]);
  }
}
