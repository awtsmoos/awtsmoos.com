
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file LipGeometry.js
 * @description
 * THE FRAME OF THE WORD (Miskeget HaDibbur).
 * B"H
 * 
 * NO SHADOWS. NO GLOWS. PURE FAT VECTORS.
 * Vermilion boundaries and dimples established entirely through solid #000 shapes!
 */
export class LipGeometry {
  static build(lipPoints, intensity, targetViseme) {
    const nodes = [];
    const pts = lipPoints; 
    // B"H - Safe access to raw points
    const raw = lipPoints.raw;
    if (!raw || raw.length < 8) return null;

    let lipStrokeWidth = 4.5;
    if (targetViseme === 'O' || targetViseme === 'M') lipStrokeWidth = 7;
    if (targetViseme === 'E' || targetViseme === 'S') lipStrokeWidth = 3.5;

    // 1. Solid Outer Outline
    nodes.push(G.path('lip_edge_main', pts, {
      stroke: '#000000', lineWidth: lipStrokeWidth, lineJoin: 'round', lineCap: 'round'
    }));

    // 2. Solid Black Buccal/Corner Dots (The Cheilions)
    nodes.push(G.circle('comm_l', raw[0].x, raw[0].y, lipStrokeWidth * 0.7, { fill: '#000000' }));
    nodes.push(G.circle('comm_r', raw[4].x, raw[4].y, lipStrokeWidth * 0.7, { fill: '#000000' }));

    // 3. Chin Pad Crease (Relative to center bottom point 6)
    const botX = raw[6].x;
    const botY = raw[6].y;
    
    // B"H - Only show crease when mouth is relatively closed or emotional
    const showCrease = intensity < 0.8;
    if (showCrease) {
      nodes.push(G.path('chin_crease', [
        { type: 'move', x: botX - 16, y: botY + 18 },
        { type: 'quad', cx: botX, cy: botY + 26, x: botX + 16, y: botY + 18 }
      ], { stroke: '#000000', lineWidth: 3.5, lineCap: 'round' }));
    }

    return G.group('lips_outer_assembly', null, nodes);
  }
}
