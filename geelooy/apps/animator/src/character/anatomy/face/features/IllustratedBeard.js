
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { AwtsmoosMath } from '../../../../engine/core/AwtsmoosMath.js';

/**
 * @file IllustratedBeard.js
 * @brief THE WATERFALL OF WISDOM (Zakan HaElyon).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 22: THE OVERFLOW OF THE SOUL
 * ═══════════════════════════════════════════════════════════════
 * RECTIFIED (The Jittering Chaos): `Math.random()` is forbidden in the 
 * continuous render loop. It has been replaced with `AwtsmoosMath.seededRandom`, 
 * ensuring the majestic hairs of the beard remain permanently fixed in 
 * their divine coordinates across all dimensions of time.
 */
export class IllustratedBeard {
  static build(jawDrop, color = '#cccccc') {
    const beardY = 40 + jawDrop * 0.8; 
    const w = 110;
    const h = 200;

    // Anchor securely to the cheekbones at Y: -80
    const beardPoints = [
      { type: 'move', x: -w/2.2, y: -80 }, 
      { type: 'bezier', c1x: -w, c1y: h * 0.4, c2x: -w/4, c2y: h * 1.1, x: 0, y: h }, 
      { type: 'bezier', c1x: w/4, c1y: h * 1.1, c2x: w, c2y: h * 0.4, x: w/2.2, y: -80 }, 
      { type: 'bezier', c1x: w/3, c1y: 0, c2x: -w/3, c2y: 0, x: -w/2.2, y: -80 } 
    ];

    // B"H - Pure Deterministic Geometry
    const hairLines = [];
    for (let i = 0; i < 9; i++) {
      const x = -w/3 + (i * (w/13));
      
      // Generate stable, eternal random values based on the strand index
      const rand1 = AwtsmoosMath.seededRandom(i * 123.45);
      const rand2 = AwtsmoosMath.seededRandom(i * 987.65);
      
      const sway = (rand1 - 0.5) * 15;
      const lengthSway = Math.abs(x) * 0.5;
      
      hairLines.push(G.path(`hair_line_${i}`, [
        { type: 'move', x: x, y: -10 + lengthSway },
        { type: 'quad', cx: x + sway, cy: h * 0.5, x: x * 0.5, y: h * 0.8 - lengthSway * (0.5 + rand2) }
      ], { stroke: 'rgba(255,255,255,0.4)', lineWidth: 2, lineCap: 'round' }));
    }

    return G.group('beard_vessel', { y: beardY }, [
      G.path('beard_base', beardPoints, { fill: color, stroke: '#000000', lineWidth: 4, lineJoin: 'round' }),
      ...hairLines
    ]);
  }
}
