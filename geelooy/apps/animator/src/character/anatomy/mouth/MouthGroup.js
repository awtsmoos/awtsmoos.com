
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { MouthArchitect } from './MouthArchitect.js';

/**
 * @file MouthGroup.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 23: THE PORTAL OF SPEECH (Peh)
 * ═══════════════════════════════════════════════════════════════
 */
export class MouthGroup {
  static build(data, profile, jawDrop) {
    const mouthAsset = MouthArchitect.build(data, profile, jawDrop);
    
    const mouthConfig = profile.mouth || {};
    
    // B"H - Must account for mirrored directions in perspective offsets!
    const mX = (mouthConfig.x || 0) * (profile.dir || 1);
    const mY = mouthConfig.y || 0;
    const scaleX = mouthConfig.scaleX || 1;
    const scaleY = mouthConfig.scaleY || 1;
    
    return G.group('mouth_masked', { x: mX, y: mY, scaleX: scaleX, scaleY: scaleY }, [
        mouthAsset
    ]);
  }
}
