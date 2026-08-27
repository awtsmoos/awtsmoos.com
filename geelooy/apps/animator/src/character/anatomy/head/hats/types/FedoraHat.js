
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { HatBase } from '../HatBase.js';

/**
 * @class FedoraHat
 * @description
 * THE CLASSIC SHIELD.
 * B"H
 */
export class FedoraHat extends HatBase {
  static build(data, profile, walkBob = 0, sway = 0) {
    const { h, hTop, color, view, dir } = this.getParams(data, profile);
    const nodes = [];

    // Physics mapping: Brim goes down when bob is down (gravity inertia)
    const brimBob = walkBob * -0.5;

    // Sweeping circular brim
    const brimW = h.rX + 35;
    const brimH = 15;
    
    // The Crown
    const crownW = h.rX * 0.8;
    const crownH = 95;

    // 1. The Back Brim (Shadowed)
    nodes.push(G.path('fedora_brim_back', [
      { type: 'move', x: -brimW, y: hTop + 10 },
      { type: 'quad', cx: 0, cy: hTop - 15, x: brimW, y: hTop + 10 }
    ], { fill: '#111', stroke: '#000', lineWidth: 4 }));

    // 2. The Dented Crown
    const crownPath = [
      { type: 'move', x: -crownW, y: hTop + 5 },
      // Side walls slightly tapered inward
      { type: 'line', x: -crownW*0.8, y: hTop - crownH },
      // The Center Dent! V-Shape!
      { type: 'quad', cx: 0, cy: hTop - crownH + 25, x: crownW*0.8, y: hTop - crownH },
      { type: 'line', x: crownW, y: hTop + 5 }
    ];
    nodes.push(G.path('fedora_crown', crownPath, { fill: color, stroke: '#000', lineWidth: 4, lineJoin: 'round' }));

    // Indentation Pinch on the sides
    nodes.push(G.path('fedora_pinch', [
      { type: 'move', x: -crownW*0.4, y: hTop - crownH + 30 },
      { type: 'quad', cx: 0, cy: hTop - crownH + 45, x: crownW*0.4, y: hTop - crownH + 30 }
    ], { stroke: 'rgba(0,0,0,0.3)', lineWidth: 5, lineCap: 'round' }));

    // 3. The Hat Band
    nodes.push(G.path('fedora_band', [
      { type: 'move', x: -crownW*0.95, y: hTop - 15 },
      { type: 'quad', cx: 0, cy: hTop - 5, x: crownW*0.95, y: hTop - 15 },
      { type: 'line', x: crownW, y: hTop + 5 },
      { type: 'quad', cx: 0, cy: hTop + 15, x: -crownW, y: hTop + 5 }
    ], { fill: '#0a0a0a', stroke: '#000', lineWidth: 3, lineJoin: 'round' }));

    // 4. The Front Brim
    // Dips aggressively in the front, kicks up on the sides
    nodes.push(G.path('fedora_brim_front', [
      { type: 'move', x: -brimW, y: hTop + 10 },
      { type: 'bezier', c1x: -brimW*0.5, c1y: hTop + 35 + brimBob, c2x: brimW*0.5, c2y: hTop + 35 + brimBob, x: brimW, y: hTop + 10 },
      // Carve out center overlap
      { type: 'quad', cx: 0, cy: hTop + 15, x: -brimW, y: hTop + 10 }
    ], { fill: color, stroke: '#000', lineWidth: 4, lineJoin: 'round' }));

    return G.group('fedora_sys', null, nodes);
  }
}
