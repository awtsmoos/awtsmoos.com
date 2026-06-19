
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @class DentalArch
 * @description
 * THE BUILDER OF BONE.
 * B"H
 * RECTIFIED: Improved gingival (gum) logic and tooth segmentation.
 */
export class DentalArch {
  static build(intensity, jawDrop, viseme, lipPoints) {
    const nodes = [];
    const raw = lipPoints.raw;
    if (!raw) return nodes;

    // Expansion parameter (breathing of the jaw structure)
    // B"H - We narrow the teeth arch so that the Buccal Corridors (dark side corners) become visible!
    const w = 24 + (intensity * 2);
    
    // B"H - Teeth must exist independent of the lips. The lips pull back to reveal them.
    // We establish the dental shelf statically at the origin.
    // jawDrop pulls the bottom teeth down.
    const maxillaY = -8; 
    const mandibleY = 8 + jawDrop;

    // --- MAXILLA (Upper) ---
    let uH = 18; // Full height of upper teeth
    
    // Gums (Upper)
    nodes.push(G.path('gums_U', [
      { type: 'move', x: -w-10, y: maxillaY - 40 },
      { type: 'line', x: w+10, y: maxillaY - 40 },
      { type: 'line', x: w+8, y: maxillaY - 14 },
      { type: 'quad', cx: 0, cy: maxillaY - 10, x: -w-8, y: maxillaY - 14 }
    ], { fill: '#9f4150' }));

    // Teeth (Upper)
    nodes.push(G.path('teeth_U', [
      { type: 'move', x: -w-8, y: maxillaY - 14 }, 
      { type: 'quad', cx: 0, cy: maxillaY - 10, x: w+8, y: maxillaY - 14 },
      { type: 'line', x: w+4, y: maxillaY + 4 },
      { type: 'quad', cx: 0, cy: maxillaY + 6, x: -w-4, y: maxillaY + 4 }
    ], { fill: '#ffffff', stroke: '#000000', lineWidth: 2, lineJoin: 'round' }));

    // Bold vertical dividers
    const toothCount = 8;
    const tW = (w * 2 + 8) / toothCount;
    for (let i = 1; i < toothCount; i++) {
      const tx = -(w + 4) + (i * tW);
      nodes.push(G.path(`gap_U_${i}`, [
        { type: 'move', x: tx, y: maxillaY - 12 }, { type: 'line', x: tx, y: maxillaY + 4 }
      ], { stroke: '#00000044', lineWidth: 1.5 }));
    }

    // --- MANDIBLE (Lower) ---
    // Gums (Lower)
    nodes.push(G.path('gums_L', [
      { type: 'move', x: -w-10, y: mandibleY + 40 },
      { type: 'line', x: w+10, y: mandibleY + 40 },
      { type: 'line', x: w+8, y: mandibleY + 14 },
      { type: 'quad', cx: 0, cy: mandibleY + 10, x: -w-8, y: mandibleY + 14 }
    ], { fill: '#9f4150' }));

    // Teeth (Lower)
    nodes.push(G.path('teeth_L', [
      { type: 'move', x: -w-8, y: mandibleY + 14 },
      { type: 'quad', cx: 0, cy: mandibleY + 10, x: w+8, y: mandibleY + 14 },
      { type: 'line', x: w+4, y: mandibleY - 4 },
      { type: 'quad', cx: 0, cy: mandibleY - 6, x: -w-4, y: mandibleY - 4 }
    ], { fill: '#ffffff', stroke: '#000000', lineWidth: 2, lineJoin: 'round' }));

    for (let j = 1; j < toothCount; j++) {
      const lx = -(w + 4) + (j * tW);
      nodes.push(G.path(`gap_L_${j}`, [
        { type: 'move', x: lx, y: mandibleY + 12 }, { type: 'line', x: lx, y: mandibleY - 4 }
      ], { stroke: '#00000044', lineWidth: 1.5 }));
    }

    return nodes;
  }
}
