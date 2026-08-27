
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { SkullPath } from './SkullPath.js';
import { ChinRenderer } from './parts/ChinRenderer.js';
import { CheekRenderer } from './parts/CheekRenderer.js';
import { PerspectiveEngine } from './perspective/PerspectiveEngine.js';
import { AwtsmoosMath } from '../../../engine/core/AwtsmoosMath.js';

/**
 * @class Skull
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 16: THE RIGID CRANIUM (Sha'arei Tzurah)
 * ═══════════════════════════════════════════════════════════════
 * Relativized paths and seeded randomness for absolute stability.
 */
export class Skull {
  static build(skinColor, view = 'front', flipX = 0, jawDrop = 0) {
    const profile = PerspectiveEngine.getProfile(view, flipX);
    const { rx, ry } = profile;
    
    const textureDots = [];
    for (let i = 0; i < 150; i++) {
        const angle = AwtsmoosMath.seededRandom(i) * Math.PI * 2;
        const dist = AwtsmoosMath.seededRandom(i + 150);
        const tx = Math.cos(angle) * rx * dist * 0.95;
        const ty = Math.sin(angle) * ry * dist * 0.95;
        textureDots.push(G.circle(`pore_${i}`, tx, ty, 0.45, { fill: '#00000028' }));
    }

    const wrinkles = [];
    for (let i = 0; i < 29; i++) {
        const wx = (AwtsmoosMath.seededRandom(i + 300) - 0.5) * rx * 1.6;
        const wy = (AwtsmoosMath.seededRandom(i + 400) - 0.5) * ry * 1.6;
        wrinkles.push(G.path(`wrinkle_${i}`, [
            { type: 'move', x: wx, y: wy },
            { type: 'line', x: wx + (AwtsmoosMath.seededRandom(i + 500) - 0.5) * 15, y: wy + (AwtsmoosMath.seededRandom(i + 600) - 0.5) * 8 }
        ], { stroke: '#0000001a', lineWidth: 0.6 }));
    }

    const points = SkullPath.get(view, flipX, rx, ry, jawDrop);

    return G.group('skull_vessel', null, [
      G.path('skull_main', points, { fill: skinColor, stroke: '#000', lineWidth: 2.5, lineJoin: 'round' }),
      G.group('skin_texture', null, textureDots),
      G.group('skin_wrinkles', null, wrinkles),
      ChinRenderer.build(rx, ry, skinColor),
      CheekRenderer.build(-1, rx, ry, skinColor, profile),
      CheekRenderer.build(1, rx, ry, skinColor, profile)
    ]);
  }
}
