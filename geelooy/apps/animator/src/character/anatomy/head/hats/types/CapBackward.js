
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { HatBase } from '../HatBase.js';

/**
 * @class CapBackward
 * @description
 * THE REBEL'S CROWN.
 * B"H
 * 
 * Flips the visor entirely away from the face, revealing the plastic 
 * snapback adjustment strap resting right above the eyebrows.
 */
export class CapBackward extends HatBase {
  static build(data, profile) {
    const { h, hTop, color, view, dir } = this.getParams(data, profile);
    const nodes = [];

    // Reverse the direction!
    const backDir = -dir; 
    let visorPush = 70 * backDir;
    if (view === 'front') visorPush = 40 * backDir;

    // 1. The Visor (Points backwards)
    // Drawn BEHIND the dome in 3/4 or front view by being added to the array first.
    if (view !== 'front') {
      nodes.push(G.path('back_brim', [
        { type: 'move', x: 20 * backDir, y: hTop + 10 },
        { type: 'quad', cx: visorPush * 0.8, cy: hTop + 5, x: visorPush * 1.1, y: hTop + 25 },
        { type: 'quad', cx: visorPush * 0.5, cy: hTop + 20, x: h.rX * backDir, y: hTop + 10 }
      ], { fill: '#1a1a1a', stroke: '#000', lineWidth: 4, lineJoin: 'round' }));
    }

    // 2. The Head Dome
    nodes.push(G.path('cap_dome', [
      { type: 'move', x: -h.rX - 2, y: hTop + 20 },
      { type: 'bezier', c1x: -h.rX, c1y: hTop - 65, c2x: h.rX, c2y: hTop - 65, x: h.rX + 2, y: hTop + 20 },
      { type: 'quad', cx: 0, cy: hTop + 5, x: -h.rX - 2, y: hTop + 20 }
    ], { fill: color, stroke: '#000', lineWidth: 4 }));

    // 3. The Snapback Void (Semi-circle cutout above forehead)
    // In profile, it sits on the front. In front view, it's centered!
    const snapX = (view === 'side') ? (h.rX * 0.7 * dir) : 0;
    
    nodes.push(G.path('snapback_hole', [
      { type: 'move', x: snapX - 25, y: hTop + 15 },
      { type: 'quad', cx: snapX, cy: hTop - 20, x: snapX + 25, y: hTop + 15 },
      { type: 'quad', cx: snapX, cy: hTop + 5, x: snapX - 25, y: hTop + 15 }
    ], { fill: '#111', stroke: '#000', lineWidth: 2 }));

    // 4. The Plastic Adjustment Straps overlapping the void
    nodes.push(
      G.rect('strap_left', snapX - 25, hTop, 20, 6, { fill: color, stroke: '#000', lineWidth: 1.5 }),
      G.rect('strap_right', snapX + 5, hTop, 20, 6, { fill: color, stroke: '#000', lineWidth: 1.5 }),
      // The overlapping pop-in buttons
      G.rect('strap_overlap', snapX - 10, hTop, 15, 6, { fill: '#ddd', stroke: '#000', lineWidth: 1.5 })
    );

    // 5. Visor (Front view renders it as a curved line peeking from the back of the skull)
    if (view === 'front') {
      nodes.unshift(G.path('back_brim_front_view', [
        { type: 'move', x: -h.rX - 15, y: hTop - 15 },
        { type: 'quad', cx: 0, cy: hTop - 40, x: h.rX + 15, y: hTop - 15 },
        { type: 'quad', cx: 0, cy: hTop - 25, x: -h.rX - 15, y: hTop - 15 }
      ], { fill: '#1a1a1a', stroke: '#000', lineWidth: 4 }));
    }

    return G.group('baseball_backward_sys', null, nodes);
  }
}
