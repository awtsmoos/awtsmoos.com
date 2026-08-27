
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file EyebrowVessel.js
 * @description
 * THE INDEPENDENT PILLARS OF THOUGHT.
 * B"H
 * 
 * THE SHATTERED MONOLITH:
 * Eyebrows are drawn strictly from -w/2 to w/2 inside their own 
 * localized container. They can mathematically NEVER cross the center 
 * of the face to form a unibrow!
 */
export class EyebrowVessel {
  /**
   * Manifests a perfectly isolated, highly expressive eyebrow.
   */
  static build(id, morph, w, dir, shape = 'standard') {
    // Determine exact local bounds
    // The group container is already properly positioned at the correct X offset.
    const startX = -w/2; 
    const endX = w/2;
    
    // Line width and arch offset based on shape
    let strokeWidth = 4.5;
    let archOffset = -10; // Default arch height
    
    if (shape === 'bushy') {
      strokeWidth = 9;
      archOffset = -6; // Flatter
    } else if (shape === 'thin') {
      strokeWidth = 2;
      archOffset = -18; // Higher arch
    }

    // Normalize emotion shift
    const emotionShiftX = Math.min(10, Math.max(-14, (morph.bx || 0))) * -dir; 
    
    const trueStart = startX + emotionShiftX;
    const trueEnd = endX + emotionShiftX;
    
    // Determine elevations. 'dir' reverses left/right alignment.
    const innerY = morph.bi || 0;
    const outerY = morph.bo || 0;
    
    const leftY = dir === -1 ? outerY : innerY;
    const rightY = dir === -1 ? innerY : outerY;

    // The peak of the arch
    const archY = (morph.ba || archOffset);

    // Finalize the shape with localized center
    const archCenterX = (trueStart + trueEnd) / 2;

    // Arched geometric shapes for elegant, cartoon fidelity.
    const points = [
      { type: 'move', x: trueStart, y: leftY },
      { type: 'quad', cx: archCenterX, cy: archY - (strokeWidth * 1.2), x: trueEnd, y: rightY }, 
      { type: 'quad', cx: trueEnd + (6 * dir * (shape === 'bushy' ? 1.5 : 1)), cy: rightY + (shape === 'bushy' ? 2 : 1), x: trueEnd, y: rightY + 4 }, // Sharper taper
      { type: 'quad', cx: archCenterX, cy: archY + (strokeWidth * 0.1), x: trueStart, y: leftY + 5 }, 
      { type: 'quad', cx: trueStart - (3 * dir), cy: leftY + 2, x: trueStart, y: leftY } // Tapered start
    ];

    // B"H - Hyper-realistic brow hairs over the core shape
    // Instead of flat color, we generate fine textured strokes.
    const hairs = [];
    const numHairs = shape === 'bushy' ? 45 : (shape === 'thin' ? 15 : 29);
    for (let i = 0; i < numHairs; i++) {
        const t = i / (numHairs - 1);
        const hx = trueStart + (trueEnd - trueStart) * t;
        const hy = leftY + (rightY - leftY) * t + (Math.random() - 0.5) * strokeWidth;
        const hLen = strokeWidth * (1 + Math.random() * 0.8);
        const hAng = (Math.PI / 2) + (t * 0.5 * Math.PI * dir) + (Math.random() - 0.5) * 0.4;
        const hxEnd = hx + Math.sin(hAng) * hLen * dir;
        const hyEnd = hy - Math.cos(hAng) * hLen;

        hairs.push(G.path(`brow_hair_${id}_${i}`, [
            { type: 'move', x: hx, y: hy },
            { type: 'quad', cx: hx + Math.sin(hAng)*hLen*0.5*dir, cy: hy - Math.cos(hAng)*hLen*0.8, x: hxEnd, y: hyEnd }
        ], { stroke: '#000000cc', lineWidth: shape === 'bushy' ? 1.5 : 1 }));
    }

    return G.group(`brow_${id}`, null, [
      // The Core
      G.path(`brow_fill_${id}`, points, { 
        fill: '#151515ee', 
        stroke: '#000000',
        lineWidth: 1.5, // Thin outline to prevent merging
        lineJoin: 'round'
      }),
      G.group(`brow_hairs_${id}`, null, hairs)
    ]);
  }
}
