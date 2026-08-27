
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { HairBase } from '../HairBase.js';

/**
 * @class StandardHair
 * @description
 * THE COMB-OVER FADE.
 * B"H
 */
export class StandardHair extends HairBase {
  static build(data, profile) {
    const { h, color, view, dir } = this.getParams(data, profile);
    const nodes = [];

    // B"H - Mapping to SkullPath boundaries
    const faceX = h.rX * 0.82 * dir;
    const backX = h.rX * 1.15 * -dir;

    let lx = dir > 0 ? backX : faceX;
    let rx = dir > 0 ? faceX : backX;
    
    if (view === 'front') { lx = -h.rX; rx = h.rX; }

    const volApex = -h.rY * 1.45; 
    const templeY = -h.rY * 0.45;
    
    // Grab the perfect forehead alignment path (B"H)
    const foreheadArc = this.getForeheadArc(h, dir, view);

    const domePath = [
      ...foreheadArc, 
      // Curve back OVER the top of the skull
      { type: 'bezier', c1x: rx + (10 * dir), c1y: volApex, c2x: lx - (10 * dir), c2y: volApex, x: lx, y: templeY }
    ];

    nodes.push(G.path('hair_standard', domePath, { 
      fill: color, stroke: '#000000', lineWidth: 5, lineJoin: 'round', close: true 
    }));

    // B"H - Hyper-detailed comb-over strands (Optimized)
    const strands = [];
    const NUM_LOCKS = 29;
    const STRANDS_PER_LOCK = 15;
    
    // The part is on the left or far side usually
    const partX = lx * 0.5;
    const partY = volApex * 0.9;

    for (let l = 0; l < NUM_LOCKS; l++) {
        const lockT = l / (NUM_LOCKS - 1);
        const lockEndX = lx + (rx - lx) * lockT;
        const lockEndY = templeY + (Math.random() * 20);

        for (let s = 0; s < STRANDS_PER_LOCK; s++) {
            const spreadX = (Math.random() - 0.5) * 20;
            const spreadY = (Math.random() - 0.5) * 10;
            
            strands.push(G.path(`s_strand_${l}_${s}`, [
                { type: 'move', x: partX + spreadX*0.3, y: partY + spreadY*0.5 },
                { type: 'quad', cx: 0, cy: volApex + spreadY - 10, x: lockEndX + spreadX, y: lockEndY + spreadY }
            ], { stroke: '#00000044', lineWidth: 0.8 }));
        }
    }
    
    nodes.push(G.group('hair_standard_strands', null, strands));

    // B"H - Glossy Highlights: The light of the infinite reflecting off the temporal.
    // Replace thick stroke with 29 fine highlight lines
    const highlightLines = [];
    for (let i = 0; i < 29; i++) {
        const hy = volApex + 20 + Math.random() * 15;
        const hxStart = lx * 0.3 + Math.random() * 10;
        const hxEnd = rx * 0.4 + Math.random() * 15;
        highlightLines.push(G.path(`hair_high_${i}`, [
          { type: 'move', x: hxStart, y: hy },
          { type: 'quad', cx: 0, cy: volApex + 5 + Math.random() * 10, x: hxEnd, y: hy + 5 }
        ], { stroke: '#ffffff33', lineWidth: 0.3 }));
    }
    nodes.push(G.group('hair_highlights_micro', null, highlightLines));

    return G.group('hair_standard_sys', null, nodes);
  }
}
