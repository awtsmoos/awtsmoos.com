
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { SpineEngine } from './SpineEngine.js';
import { BodyMorphEngine } from './BodyMorphEngine.js';

/**
 * @class TorsoVessel
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE CENTERED PILLAR (Amud HaMerkazi)
 * ═══════════════════════════════════════════════════════════════
 */
export class TorsoVessel {
  static build(data, profile) {
    const suitColor = data.colors?.clothes || '#444';
    const time = data._lastDirectorTime || Date.now();
    
    const morphs = BodyMorphEngine.getProportions(data);
    const segmentedTorso = SpineEngine.process(data, suitColor, time);

    // B"H - Pivot point is the Pelvis (0,0 local)
    const morphedGroup = G.group('morphed_body', {
      x: 0, y: 0, 
      scaleX: morphs.torsoWidthMult,
      scaleY: morphs.heightMult,
      rotation: morphs.spineCurvature
    }, [segmentedTorso]);

    const armShadowL = G.ellipse('arm_shadow_L', -35, -85, 6, 15, 15, { fill: 'rgba(0,0,0,0.06)' });
    const armShadowR = G.ellipse('arm_shadow_R', 35, -85, 6, 15, -15, { fill: 'rgba(0,0,0,0.06)' });

    return G.group('torso_master_vessel', null, [
      armShadowL,
      armShadowR,
      morphedGroup
    ]);
  }
}
