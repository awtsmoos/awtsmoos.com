
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file SoulShades.js
 * @brief THE SHIELDS OF CONCEALMENT (Masachim).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE REFLECTED LIGHT
 * ═══════════════════════════════════════════════════════════════
 * The shades represent the "Ohr Hozer"—reflected light. 
 * They are not just black circles. They contain "Reflections" that 
 * stay anchored to the sky, even as the head tilts, giving a sense 
 * of divine cool. Fully adapted to 3/4 and side perspectives!
 * 
 * @class SoulShades
 */
export class SoulShades {
  /**
   * @function build
   */
  static build(profile) {
    const lensW = 34;
    const lensH = 26;
    const spacing = 44;

    const is3Q = profile.type === 'threeQuarter';
    const isSide = profile.type === 'side';
    const dir = profile.dir || 1;

    // Dark lenses, slightly translucent, with thick black frames
    const lensFill = 'rgba(15, 15, 20, 0.95)';
    const frameStroke = '#000000';

    const buildLens = (id, x, scaleX = 1) => G.group(id, { x, y: -45, scaleX }, [
      // The Thick Frame
      G.rect('frame', -lensW/2, -lensH/2, lensW, lensH, { fill: lensFill, radius: 6, stroke: frameStroke, lineWidth: 4 }),
      // The Reflection (Ohr Hozer)
      G.path('reflection', [
        { type: 'move', x: -10, y: -8 }, { type: 'line', x: 5, y: 8 },
        { type: 'move', x: -5, y: -12 }, { type: 'line', x: 10, y: 4 }
      ], { stroke: 'rgba(255,255,255,0.3)', lineWidth: 3, lineCap: 'round' })
    ]);

    const nodes = [];

    if (isSide) {
      // Single lens pushed to the profile edge
      nodes.push(buildLens('lens_side', 25 * dir, 0.7));
      // Bridge arm reaching back to the ear
      nodes.push(G.path('arm', [{ type: 'move', x: 15 * dir, y: -45 }, { type: 'line', x: -20 * dir, y: -45 }], { stroke: '#000', lineWidth: 4 }));
    } else if (is3Q) {
      // Near lens (Centered prominently)
      nodes.push(buildLens('lens_near', 12 * dir, 0.95));
      // Far lens (Squished and pushed back)
      nodes.push(buildLens('lens_far', -28 * dir, 0.5));
      // Nose bridge
      nodes.push(G.path('bridge', [
        { type: 'move', x: -10 * dir, y: -45 }, { type: 'quad', cx: -2 * dir, cy: -48, x: 2 * dir, y: -45 }
      ], { stroke: '#000', lineWidth: 4 }));
      // Arm reaching back
      nodes.push(G.path('arm', [{ type: 'move', x: 30 * dir, y: -45 }, { type: 'line', x: -20 * dir, y: -45 }], { stroke: '#000', lineWidth: 4 }));
    } else {
      // Standard Front View
      nodes.push(buildLens('lens_L', -spacing/2));
      nodes.push(buildLens('lens_R', spacing/2));
      nodes.push(G.path('bridge', [
        { type: 'move', x: -12, y: -45 }, { type: 'quad', cx: 0, cy: -48, x: 12, y: -45 }
      ], { stroke: '#000', lineWidth: 4 }));
    }

    return G.group('sunglasses', null, nodes);
  }
}
