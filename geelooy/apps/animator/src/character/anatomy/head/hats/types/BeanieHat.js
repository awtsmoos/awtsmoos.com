
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { HatBase } from '../HatBase.js';

/**
 * @class BeanieHat
 * @description
 * THE WINTER CROWN (Beanie/Bernie).
 * B"H
 * 
 * POEM OF THE WARM KNIT:
 * In the freezing void of absolute space,
 * The Beanie descends to protect the face!
 * Ribbed with the lines of quadratic light,
 * And a pom-pom on top to complete the sight!
 */
export class BeanieHat extends HatBase {
  static build(data, profile) {
    const { h, hTop, color, view, dir } = this.getParams(data, profile);
    const nodes = [];

    // Shift dome slightly back in profile views
    const pushX = (view === 'side' || view === 'threeQuarter') ? (-5 * dir) : 0;

    // 1. The Base Dome 
    const beanieDome = [
      { type: 'move', x: -h.rX - 8 + pushX, y: hTop + 20 },
      // Ascends high above the skull
      { type: 'bezier', c1x: -h.rX + pushX, c1y: hTop - 80, c2x: h.rX + pushX, c2y: hTop - 80, x: h.rX + 8 + pushX, y: hTop + 20 },
      // The Folded Cuff (bottom edge) curves up slightly in the center
      { type: 'quad', cx: pushX, cy: hTop + 10, x: -h.rX - 8 + pushX, y: hTop + 20 }
    ];
    nodes.push(G.path('beanie_dome', beanieDome, { fill: color, stroke: '#000', lineWidth: 4 }));
    
    // 2. The Ribbed Knit Texture (Procedural Z-Axis curvature)
    const ribColor = this.darken(color, 40);
    const ribSpread = 20;
    
    for (let i = -h.rX + 15; i < h.rX; i += ribSpread) {
      const xStart = i + pushX;
      // Inward taper simulates wrapping around a 3D sphere!
      const taper = (xStart) * 0.6; 
      
      nodes.push(G.path(`beanie_rib_${i}`, [
        { type: 'move', x: xStart, y: hTop + 18 },
        { type: 'quad', cx: xStart, cy: hTop - 20, x: taper, y: hTop - 45 } 
      ], { stroke: ribColor, lineWidth: 3, lineCap: 'round' }));
    }

    // 3. The Fluffy Pom-Pom!
    nodes.push(G.circle('beanie_pom', pushX * 2, hTop - 55, 18, { fill: color, stroke: '#000', lineWidth: 4 }));
    
    // Texture lines for the pom-pom
    for (let j = 0; j < 6; j++) {
      const a = (j/6) * Math.PI * 2;
      const x1 = pushX * 2 + Math.cos(a) * 5;
      const y1 = hTop - 55 + Math.sin(a) * 5;
      const x2 = pushX * 2 + Math.cos(a) * 15;
      const y2 = hTop - 55 + Math.sin(a) * 15;
      nodes.push(G.path(`pom_fuzz_${j}`, [
        { type: 'move', x: x1, y: y1 }, { type: 'line', x: x2, y: y2 }
      ], { stroke: ribColor, lineWidth: 2, lineCap: 'round' }));
    }

    return G.group('beanie_sys', null, nodes);
  }
}
