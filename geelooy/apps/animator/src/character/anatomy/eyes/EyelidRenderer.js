
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @file EyelidRenderer.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 21: THE CURTAINS OF THE SOUL (Masach HaEinayim)
 * THE OUTLINE RECTIFICATION
 * ═══════════════════════════════════════════════════════════════
 * 
 * A shape without a boundary is swallowed by the void. 
 * The eyelids were rendering as pure skin-toned polygons on top of 
 * a pure skin-toned face. When the eye blinked, it simply vanished!
 * 
 * To manifest them physically, we must apply the lines of Gevurah 
 * (Restriction/Boundaries). A subtle dark stroke has been added to the 
 * flesh paths so the overlap is always visible and distinct.
 */
export class EyelidRenderer {
  static build(id, w, h, blink, skinColor, morph) {
    // 1. TOP EYELID (Curved Path)
    const upperY = -h + (blink * h * 2);
    const upperCurve = [
      { type: 'move', x: -w, y: upperY },
      { type: 'bezier', c1x: -w, c1y: -h * 1.5, c2x: w, c2y: -h * 1.5, x: w, y: upperY },
      { type: 'line', x: w, y: -h * 4 },
      { type: 'line', x: -w, y: -h * 4 },
      { type: 'line', x: -w, y: upperY }
    ];
    
    // 2. BOTTOM EYELID (Squint pushes it UP!)
    const squintMod = morph.squint !== undefined ? morph.squint : 1.0;
    const bottomRise = (1.0 - squintMod) * (h * 1.5);
    const lowerY = h - bottomRise;
    
    const lowerCurve = [
      { type: 'move', x: -w, y: lowerY },
      { type: 'bezier', c1x: -w * 0.8, c1y: lowerY + (h * 0.4), c2x: w * 0.8, c2y: lowerY + (h * 0.4), x: w, y: lowerY },
      { type: 'line', x: w, y: h * 4 },
      { type: 'line', x: -w, y: h * 4 },
      { type: 'line', x: -w, y: lowerY }
    ];

    return G.group(`lids_${id}`, null, [
      // B"H - RECTIFICATION: Added stroke to the flesh!
      G.path(`upper_lid_flesh_${id}`, upperCurve, { fill: skinColor, stroke: 'rgba(0,0,0,0.3)', lineWidth: 1.5 }),
      G.path(`upper_lid_line_${id}`, [
        { type: 'move', x: -w, y: upperY },
        { type: 'bezier', c1x: -w, c1y: upperY - 2, c2x: w, c2y: upperY - 2, x: w, y: upperY }
      ], { stroke: '#000000', lineWidth: 4, lineCap: 'round' }),
      
      // B"H - RECTIFICATION: Added stroke to the flesh!
      G.path(`lower_lid_flesh_${id}`, lowerCurve, { fill: skinColor, stroke: 'rgba(0,0,0,0.3)', lineWidth: 1.5 }),
      G.path(`lower_lid_line_${id}`, [
        { type: 'move', x: -w, y: lowerY },
        { type: 'bezier', c1x: -w * 0.8, c1y: lowerY + 2, c2x: w * 0.8, c2y: lowerY + 2, x: w, y: lowerY }
      ], { stroke: '#000000', lineWidth: 2, lineCap: 'round' })
    ]);
  }
}
