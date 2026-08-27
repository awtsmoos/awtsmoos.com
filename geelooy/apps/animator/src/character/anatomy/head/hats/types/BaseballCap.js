
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { HatBase } from '../HatBase.js';

/**
 * @class BaseballCap
 * @description
 * THE FORWARD VISOR.
 * B"H
 * Maps exactly to the `dir` property, thrusting a solid geometric bill 
 * out into Z-space and curving down to shade the eyes!
 */
export class BaseballCap extends HatBase {
  static build(data, profile, walkBob = 0, sway = 0) {
    const { h, hTop, color, view, dir } = this.getParams(data, profile);
    const nodes = [];

    const brimBob = walkBob * -0.4;

    // The Visor thrusts forward far beyond the face in profile!
    let visorPush = 85 * dir;
    if (view === 'front') visorPush = 60 * dir;

    // 1. The Head Dome (Snug fit)
    nodes.push(G.path('cap_dome', [
      { type: 'move', x: -h.rX, y: hTop + 20 },
      // Puffs up and over
      { type: 'bezier', c1x: -h.rX, c1y: hTop - 65, c2x: h.rX, c2y: hTop - 65, x: h.rX, y: hTop + 20 },
      { type: 'quad', cx: 0, cy: hTop + 10, x: -h.rX, y: hTop + 20 }
    ], { fill: color, stroke: '#000', lineWidth: 4 }));

    // Six-panel stitching lines reaching to the center button
    nodes.push(
      G.path('cap_stitch_1', [{ type: 'move', x: 0, y: hTop - 45 }, { type: 'quad', cx: 15*dir, cy: hTop - 15, x: 25*dir, y: hTop + 15 }], { stroke: 'rgba(0,0,0,0.3)', lineWidth: 2 }),
      G.path('cap_stitch_2', [{ type: 'move', x: 0, y: hTop - 45 }, { type: 'quad', cx: -20*dir, cy: hTop - 15, x: -40*dir, y: hTop + 10 }], { stroke: 'rgba(0,0,0,0.3)', lineWidth: 2 })
    );

    // Center Metal Squatchee (Button)
    nodes.push(G.circle('cap_btn', 0, hTop - 45, 5, { fill: '#111', stroke: '#000', lineWidth: 2 }));

    // 2. The Sweeping Visor (The Bill)
    const visorBaseX = (view === 'side') ? (-h.rX * 0.2 * dir) : (-50 * dir);
    
    nodes.push(G.path('cap_brim', [
      { type: 'move', x: visorBaseX, y: hTop + 10 },
      // Curves out and DOWN
      { type: 'quad', cx: visorPush * 0.8, cy: hTop + 5 + brimBob, x: visorPush * 1.1, y: hTop + 28 + brimBob },
      // Returns back to the forehead
      { type: 'quad', cx: visorPush * 0.5, cy: hTop + 18, x: 10 * dir, y: hTop + 15 }
    ], { fill: '#1a1a1a', stroke: '#000', lineWidth: 5, lineCap: 'round', lineJoin: 'round' }));

    // Under-visor shade polygon
    nodes.push(G.path('cap_brim_under', [
      { type: 'move', x: visorBaseX + (10*dir), y: hTop + 12 },
      { type: 'quad', cx: visorPush * 0.7, cy: hTop + 8 + brimBob, x: visorPush * 1.0, y: hTop + 26 + brimBob }
    ], { stroke: '#0a0a0a', lineWidth: 4, lineCap: 'round' }));

    return G.group('baseball_cap_sys', null, nodes);
  }
}
