
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { MouthEngine } from '../face/MouthEngine.js';
import { ANATOMY } from '../../data/Anatomy.js';

/**
 * @class MouthBuilder
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 24: THE VESSEL OF UTTERANCE (Malchut)
 * ═══════════════════════════════════════════════════════════════
 */
export class MouthBuilder {
  static build(data, profile, jawDrop = 0) {
    const config = ANATOMY.face.mouth;
    const targetViseme = data.targetViseme || 'neutral';
    const intensity = Math.min(1.0, (data.vocalIntensity || 0));
    const skinColor = data.colors?.skin || '#f2c1a2';
    
    const mouthAssembly = MouthEngine.process(data.id, targetViseme, intensity, skinColor);

    return G.group('mouth_master_vessel', { x: profile.mouth?.x || 0, y: config.offsetY }, [
      mouthAssembly
    ]);
  }
}
