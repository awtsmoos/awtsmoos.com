
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { SpecularHighlights } from './SpecularHighlights.js';
import { TensionCreases } from './TensionCreases.js';

/**
 * @file LipsBuilder.js
 * @description
 * THE FRAME OF THE WORD (Miskeget HaDibbur).
 * B"H
 * 
 * Wraps the structural border around the cavern of the mouth, 
 * adorning it with lighting and biological tension metadata.
 */
export class LipsBuilder {
  /**
   * Manifests the absolute boundary of the mouth.
   */
  static build(lipPoints, intensity, targetViseme) {
    // 1. The Core Border
    let lipStrokeWidth = 6;
    if (intensity > 0.5) lipStrokeWidth = 4; // Thin out when stretching
    if (targetViseme === 'O' || targetViseme === 'M') lipStrokeWidth = 8; // Thicken on pucker

    const lipOutline = G.path('lip_edge_art', lipPoints, {
      stroke: '#000000',
      lineWidth: lipStrokeWidth,
      lineJoin: 'round',
      lineCap: 'round'
    });

    // 2. Transcendent Details
    const highlights = SpecularHighlights.build(lipPoints, intensity);
    const creases = TensionCreases.build(lipPoints, targetViseme);

    return G.group('lips_master', null, [
      lipOutline,
      highlights,
      creases
    ]);
  }
}
