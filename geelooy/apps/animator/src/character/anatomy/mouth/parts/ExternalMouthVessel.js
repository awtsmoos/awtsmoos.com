// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { LipFlesh } from '../lips/LipFlesh.js';
import { LipGeometry } from '../lips/LipGeometry.js';

/**
 * @file ExternalMouthVessel.js
 */
export class ExternalMouthVessel {
  static build(lipPoints, targetViseme, intensity, morphParams = {}) {
    // Grimace and tension thin the lips out
    const tension = (intensity * 0.5) + (morphParams.mouthGrimace || 0) + (morphParams.mouthSmile || 0) * 0.5;
    
    const flesh = LipFlesh.build(lipPoints, targetViseme, tension);
    const frames = LipGeometry.build(lipPoints, intensity, targetViseme);
    
    return G.group('external_mouth_vessel', null, [
      flesh,
      frames
    ]);
  }
}
