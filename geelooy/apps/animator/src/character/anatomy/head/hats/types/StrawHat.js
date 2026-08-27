
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { HatBase } from '../HatBase.js';

/**
 * @class StrawHat
 * @description
 * THE SUN PROTECTOR (Farmer/Luffy).
 * B"H
 * 
 * POEM OF THE WOVEN FRONDS:
 * Wide is the brim that shields from the glare,
 * Crafted from fibers and woven with care!
 * It spans out across the Z-axis array,
 * Keeping the heat of the summer away!
 */
export class StrawHat extends HatBase {
  static build(data, profile, walkBob = 0, sway = 0) {
    const { h, hTop, view, dir } = this.getParams(data, profile);
    const nodes = [];

    // Physics mapping: Brim goes down when bob is down (gravity inertia)
    const brimBob = walkBob * -0.6;

    // The bright organic yellow of dry woven straw
    const baseColor = '#e6c229'; 
    const weaveColor = '#b38b15';

    // Massive horizontal reach
    const brimW = h.rX * 1.8;
    const brimH = (view === 'side') ? 15 : 25; 

    // 1. The Under-Brim (Back half)
    // Sits beneath the dome to provide true 3D perspective 
    nodes.push(G.path('straw_brim_back', [
      { type: 'move', x: -brimW, y: hTop + 5 },
      { type: 'quad', cx: 0, cy: hTop - brimH, x: brimW, y: hTop + 5 }
    ], { fill: this.darken(baseColor, 40), stroke: '#000', lineWidth: 4 }));

    // 2. The Woven Dome
    const domeW = h.rX * 0.9;
    const domeH = 80;
    const domeShift = (view === 'side') ? (-5 * dir) : 0;

    const domePath = [
      { type: 'move', x: -domeW + domeShift, y: hTop + 5 },
      { type: 'bezier', c1x: -domeW + domeShift, c1y: hTop - domeH, c2x: domeW + domeShift, c2y: hTop - domeH, x: domeW + domeShift, y: hTop + 5 },
      { type: 'quad', cx: domeShift, cy: hTop + 15, x: -domeW + domeShift, y: hTop + 5 }
    ];
    nodes.push(G.path('straw_dome', domePath, { fill: baseColor, stroke: '#000', lineWidth: 4 }));

    // Woven crosshatch texture for the Dome!
    for (let wy = hTop; wy > hTop - domeH + 15; wy -= 12) {
       nodes.push(G.path(`weave_h_${wy}`, [
         { type: 'move', x: -domeW * 0.8 + domeShift, y: wy },
         { type: 'quad', cx: domeShift, cy: wy + 8, x: domeW * 0.8 + domeShift, y: wy }
       ], { stroke: weaveColor, lineWidth: 1.5 }));
    }
    for (let wx = -domeW * 0.7; wx < domeW * 0.7; wx += 15) {
       nodes.push(G.path(`weave_v_${wx}`, [
         { type: 'move', x: wx + domeShift, y: hTop + 10 },
         { type: 'quad', cx: wx + domeShift + (wx*0.2), cy: hTop - domeH/2, x: wx*0.6 + domeShift, y: hTop - domeH + 15 }
       ], { stroke: weaveColor, lineWidth: 1.5 }));
    }

    // 3. The Ribbon Band (Usually red)
    nodes.push(G.path('straw_ribbon', [
      { type: 'move', x: -domeW * 0.98 + domeShift, y: hTop - 12 },
      { type: 'quad', cx: domeShift, cy: hTop + 2, x: domeW * 0.98 + domeShift, y: hTop - 12 },
      { type: 'line', x: domeW + domeShift, y: hTop + 5 },
      { type: 'quad', cx: domeShift, cy: hTop + 15, x: -domeW + domeShift, y: hTop + 5 }
    ], { fill: '#d35400', stroke: '#000', lineWidth: 3 }));

    // 4. The Front Brim
    // Slants downward aggressively
    nodes.push(G.path('straw_brim_front', [
      { type: 'move', x: -brimW, y: hTop + 5 },
      { type: 'quad', cx: 0, cy: hTop + brimH * 1.5 + brimBob, x: brimW, y: hTop + 5 },
      // Cut out the center where it connects to the dome
      { type: 'quad', cx: 0, cy: hTop + 15, x: -brimW, y: hTop + 5 }
    ], { fill: baseColor, stroke: '#000', lineWidth: 4, lineJoin: 'round' }));

    return G.group('straw_hat_sys', null, nodes);
  }
}
