
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { AwtsmoosMath } from '../../../../engine/core/AwtsmoosMath.js';

/**
 * @class MoistureMap
 * @description
 * THE DEW OF HEAVEN (Tal HaShamayim).
 * B"H
 * 
 * Replaces the shattered string stub. Maps physical exertion (running), fear, 
 * or sadness into actual geometric droplets of water (sweat or tears) on the face.
 * The Awtsmoos creates water from nothing, and so we render polygons of light.
 * 
 * @author Chariot of the Awtsmoos
 */
export class MoistureMap {
  /**
   * @function build
   * @description Manifests sweat and tears.
   * @param {Object} data - Character state (velocity, fear, sadness).
   * @param {Object} profile - View perspective.
   * @param {number} time - Global time for droplet sliding.
   * @returns {Object} VirtualGraph group of droplets.
   */
  static build(data, profile, time) {
    const elements = [];
    const exertion = (data.velocity && Math.abs(data.velocity.x) > 5) ? 1.0 : 0;
    const fear = data.fear || data.stress || 0;
    const sadness = data.sadness || 0;
    
    const sweatLevel = Math.max(exertion, fear);
    const tearLevel = sadness;

    if (sweatLevel < 0.3 && tearLevel < 0.3) return G.group('moisture_dry', null, []);

    // SWEAT (Forehead and temples)
    if (sweatLevel >= 0.3) {
      const dropCount = Math.floor(sweatLevel * 5);
      const seed = data.id.length || 1;
      
      for(let i = 0; i < dropCount; i++) {
        const dropSpeed = 0.05 + AwtsmoosMath.seededRandom(seed + i) * 0.05;
        // Droplets slide down the face and reset based on time
        const slideY = (time * dropSpeed) % 40; 
        
        const dx = (AwtsmoosMath.seededRandom(seed + i * 2) - 0.5) * 80;
        const dy = -60 + slideY; // Start at forehead, drip down
        
        // Teardrop shape (Water)
        elements.push(G.path(`sweat_${i}`, [
          { type: 'move', x: dx, y: dy },
          { type: 'bezier', c1x: dx - 3, c1y: dy + 5, c2x: dx + 3, c2y: dy + 5, x: dx, y: dy }
        ], { fill: 'rgba(255,255,255,0.6)', stroke: 'rgba(150,200,255,0.4)', lineWidth: 0.5 }));
      }
    }

    // TEARS (Gathering at the bottom of the eyes)
    if (tearLevel >= 0.3) {
      // In a real integration, we'd pull exact eye coordinates. 
      // Approximating the under-eye area for the teardrop pool.
      const eyeY = -5;
      const eyeX = 20;
      
      const drawTearPool = (ex) => G.path(`tear_pool_${ex}`, [
        { type: 'move', x: ex - 8, y: eyeY + 12 },
        { type: 'quad', cx: ex, cy: eyeY + 18, x: ex + 8, y: eyeY + 12 }
      ], { stroke: 'rgba(255,255,255,0.8)', lineWidth: 2, lineCap: 'round' });

      if (profile.type !== 'side' || profile.dir === -1) elements.push(drawTearPool(-eyeX));
      if (profile.type !== 'side' || profile.dir === 1) elements.push(drawTearPool(eyeX));
    }

    return G.group('moisture_map', null, elements);
  }
}
