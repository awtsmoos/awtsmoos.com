
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { SubsurfaceScattering } from '../../../../engine/reality/biology/SubsurfaceScattering.js';

/**
 * @file CheekRenderer.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE SMOOTHNESS OF CHESED (Rachut HaChesed)
 * ═══════════════════════════════════════════════════════════════
 * 
 * The cheeks are the dwelling place of the blush, the radiant flush of 
 * the soul's inner light (Ohr Penimi). Previously, they were scarred 
 * by 29 erratic lines of randomized chaos. 
 * 
 * We have banished the random jagged lines. The cheek now exists purely 
 * to host the Subsurface Scattering (SSS) flush, radiating the warmth 
 * of the living biological machine without corrupting the geometry.
 */
export class CheekRenderer {
  static build(dir, rx, ry, color, profile, data = {}) {
    // In side view, hide the far cheek
    if (profile.type === 'side' && dir !== profile.dir) return G.group('hidden_cheek', null, []);
    
    // Squish or shift based on perspective
    const xOff = profile.type === 'side' ? dir * rx * 0.4 : dir * rx * 0.7;
    const yOff = profile.type === 'side' ? 5 : 0;

    // B"H - INJECT BIOLOGICAL SUBSURFACE SCATTERING
    // The flat rgba flush is replaced with the complex, multi-layered SSS blood flow!
    const sssFlush = SubsurfaceScattering.injectFlush(xOff, yOff, data);

    return G.group(`cheek_${dir > 0 ? 'R' : 'L'}`, null, [
        sssFlush
    ]);
  }
}
