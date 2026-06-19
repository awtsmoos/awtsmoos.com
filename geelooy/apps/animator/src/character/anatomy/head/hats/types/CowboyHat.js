
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { HatBase } from '../HatBase.js';

/**
 * @class CowboyHat
 * @description
 * THE RANGER'S CREST.
 * B"H
 * 
 * Flawless implementation of the iconic curled brim and pinched crown,
 * dynamically flattening its curves across the Z-plane in side-profile.
 */
export class CowboyHat extends HatBase {
  static build(data, profile) {
    const { h, hTop, view, dir, color } = this.getParams(data, profile);
    const nodes = [];

    // The brim curls wildly UP on the edges and DOWN in the front.
    const brimW = h.rX * 1.6;
    const curlH = 45; 
    
    // In profile view, the sweeping curled edges are compressed
    const cW = (view === 'side') ? brimW * 0.6 : brimW;

    // 1. The Back Brim (Sweeps up behind the head)
    nodes.push(G.path('cowboy_brim_back', [
      { type: 'move', x: -cW, y: hTop - curlH },
      { type: 'quad', cx: 0, cy: hTop + 10, x: cW, y: hTop - curlH }
    ], { fill: this.darken(color, 30), stroke: '#000', lineWidth: 4 }));

    // 2. The Pinched 10-Gallon Crown
    const domeW = h.rX * 0.85;
    const domeH = 110;
    
    const domePath = [
      { type: 'move', x: -domeW, y: hTop + 10 },
      // Side walls taper up
      { type: 'quad', cx: -domeW, cy: hTop - domeH*0.5, x: -domeW*0.6, y: hTop - domeH },
      // The deep top crease! (V-shape dipping down)
      { type: 'quad', cx: 0, cy: hTop - domeH + 30, x: domeW*0.6, y: hTop - domeH },
      // Right side wall
      { type: 'quad', cx: domeW, cy: hTop - domeH*0.5, x: domeW, y: hTop + 10 },
      // The base
      { type: 'quad', cx: 0, cy: hTop + 20, x: -domeW, y: hTop + 10 }
    ];
    nodes.push(G.path('cowboy_crown', domePath, { fill: color, stroke: '#000', lineWidth: 4, lineJoin: 'round' }));

    // Center dent vertical lines
    nodes.push(
      G.path('cowboy_dent_L', [{type:'move', x:-15, y:hTop - domeH + 20}, {type:'quad', cx:-25, cy:hTop-domeH/2, x:-15, y:hTop - domeH/2 + 20}], { stroke: 'rgba(0,0,0,0.3)', lineWidth: 3, lineCap: 'round' }),
      G.path('cowboy_dent_R', [{type:'move', x:15, y:hTop - domeH + 20}, {type:'quad', cx:25, cy:hTop-domeH/2, x:15, y:hTop - domeH/2 + 20}], { stroke: 'rgba(0,0,0,0.3)', lineWidth: 3, lineCap: 'round' })
    );

    // 3. Leather Hat Band with Conchos
    nodes.push(G.path('cowboy_band', [
      { type: 'move', x: -domeW * 0.95, y: hTop - 15 },
      { type: 'quad', cx: 0, cy: hTop - 5, x: domeW * 0.95, y: hTop - 15 },
      { type: 'line', x: domeW, y: hTop + 10 },
      { type: 'quad', cx: 0, cy: hTop + 20, x: -domeW, y: hTop + 10 }
    ], { fill: '#3E2723', stroke: '#000', lineWidth: 3 }));
    
    nodes.push(
      G.circle('concho_1', -30, hTop + 2, 4, { fill: '#C0C0C0', stroke: '#000', lineWidth: 1 }),
      G.circle('concho_2', 0, hTop + 5, 4, { fill: '#C0C0C0', stroke: '#000', lineWidth: 1 }),
      G.circle('concho_3', 30, hTop + 2, 4, { fill: '#C0C0C0', stroke: '#000', lineWidth: 1 })
    );

    // 4. The Front Curled Brim
    nodes.push(G.path('cowboy_brim_front', [
      // Starting from the high curled tips...
      { type: 'move', x: -cW, y: hTop - curlH },
      // Swooping down deeply over the forehead
      { type: 'bezier', c1x: -cW*0.6, c1y: hTop + 45, c2x: cW*0.6, c2y: hTop + 45, x: cW, y: hTop - curlH },
      // Carving back inward along the bottom of the crown to seal the shape
      { type: 'bezier', c1x: cW*0.5, c1y: hTop + 15, c2x: -cW*0.5, c2y: hTop + 15, x: -cW, y: hTop - curlH }
    ], { fill: color, stroke: '#000', lineWidth: 5, lineJoin: 'round' }));

    return G.group('cowboy_hat_sys', null, nodes);
  }
}
