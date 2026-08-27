
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { HatBase } from '../HatBase.js';
import { seededRandom } from '../../../../../utils/random.js';

/**
 * @class ChefHat
 * @description
 * THE TOQUE BLANCHE.
 * B"H
 * 
 * POEM OF THE BAKER'S CROWN:
 * A hundred pleats to catch the heat,
 * Floating like clouds above the meat!
 * Pure mathematical circles expanding wide,
 * Merging together with nowhere to hide.
 */
export class ChefHat extends HatBase {
  static build(data, profile) {
    const { h, hTop, view, dir } = this.getParams(data, profile);
    const nodes = [];

    const puffColor = '#ffffff';
    const bandW = h.rX + 5;
    
    // 1. The Puffy Cloud (The Toque)
    // We generate overlapping circles along an overarching ellipse path to simulate billowing fabric pleats.
    const puffRadiusY = 120;
    const puffRadiusX = 140;
    const centerY = hTop - 80;
    
    const clouds = [];
    const numPleats = 16;
    
    for (let i = 0; i <= numPleats; i++) {
      const angle = (i / numPleats) * Math.PI + Math.PI; // Top half of a circle
      const ox = Math.cos(angle) * puffRadiusX;
      const oy = centerY + Math.sin(angle) * puffRadiusY;
      
      const r = 25 + seededRandom(i)*15; // Variable fluff size
      
      clouds.push(G.circle(`pleat_bg_${i}`, ox, oy, r, { fill: puffColor, stroke: '#000', lineWidth: 4 }));
    }
    
    // Inner mass to fill the gaps between the circles solidly
    clouds.push(G.ellipse('toque_mass', 0, centerY, puffRadiusX, puffRadiusY*0.9, 0, { fill: puffColor, stroke: 'transparent', lineWidth: 0 }));

    nodes.push(G.group('toque_cloud', null, clouds));

    // Internal vertical pleat lines descending from the fluff into the band
    for (let p = -bandW + 15; p < bandW; p += 25) {
      nodes.push(G.path(`pleat_line_${p}`, [
        { type: 'move', x: p, y: hTop - 15 },
        { type: 'quad', cx: p + (p*0.1), cy: hTop - 45, x: p*1.2, y: hTop - 70 }
      ], { stroke: 'rgba(0,0,0,0.15)', lineWidth: 3, lineCap: 'round' }));
    }

    // 2. The Solid Stiff Base Band
    nodes.push(G.path('chef_band', [
      { type: 'move', x: -bandW, y: hTop + 20 },
      { type: 'line', x: -bandW + 5, y: hTop - 15 },
      { type: 'quad', cx: 0, cy: hTop - 25, x: bandW - 5, y: hTop - 15 },
      { type: 'line', x: bandW, y: hTop + 20 },
      { type: 'quad', cx: 0, cy: hTop + 35, x: -bandW, y: hTop + 20 }
    ], { fill: puffColor, stroke: '#000', lineWidth: 4, lineJoin: 'round' }));

    return G.group('chef_hat_sys', null, nodes);
  }
}
