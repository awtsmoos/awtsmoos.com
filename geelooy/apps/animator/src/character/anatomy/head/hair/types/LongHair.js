
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { HairBase } from '../HairBase.js';

/**
 * @class LongHair
 * @description
 * THE FLOWING RADIANCE.
 * B"H
 */
export class LongHair extends HairBase {
  static build(data, profile) {
    const { h, color, view, dir } = this.getParams(data, profile);
    const nodes = [];

    const foreheadArc = this.getForeheadArc(h, dir, view);
    let lx = -h.rX;
    let rx = h.rX;
    if (view === 'side') { lx = -h.rX * 0.4; rx = h.rX * 1.1 * dir; }

    const volApex = -h.rY * 1.5;

    // B"H - Extract Physics for swaying locks
    let physOffX = 0;
    if (data.physics?.hair && data.physics.hair.length > 2) {
      const tail = data.physics.hair[2];
      physOffX = (tail.x - (data.position?.x || 0)) * 0.4; 
    }

    // Top Bangs / Fringe
    const fringePath = [
       ...foreheadArc,
       { type: 'bezier', c1x: rx + physOffX * 0.3, c1y: volApex, c2x: lx + physOffX * 0.3, c2y: volApex, x: lx, y: -h.rY * 0.4 }
    ];

    nodes.push(G.path('hair_long_front', fringePath, { 
      fill: color, stroke: '#000', lineWidth: 4, lineJoin: 'round' 
    }));

    // B"H - Side locks
    const lockY = h.rY * 0.8;
    nodes.push(G.path('hair_lock_l', [
        { type: 'move', x: lx, y: -h.rY * 0.4 },
        { type: 'bezier', c1x: lx - 15 + physOffX, c1y: lockY * 0.5, c2x: lx - 5 + physOffX, c2y: lockY, x: lx + physOffX * 0.8, y: lockY + 20 }
    ], { fill: color, stroke: '#000', lineWidth: 2 }));
    
    nodes.push(G.path('hair_lock_r', [
        { type: 'move', x: rx, y: -h.rY * 0.4 },
        { type: 'bezier', c1x: rx + 15 + physOffX, c1y: lockY * 0.5, c2x: rx + 5 + physOffX, c2y: lockY, x: rx + physOffX * 0.8, y: lockY + 20 }
    ], { fill: color, stroke: '#000', lineWidth: 2 }));

    return G.group('hair_long_front_sys', null, nodes);
  }
}
