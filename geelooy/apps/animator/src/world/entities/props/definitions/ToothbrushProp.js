
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { AwtsmoosMath } from '../../../../engine/core/AwtsmoosMath.js';

/**
 * @class ToothbrushProp
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 35: THE PURIFIER (Kli HaTohora)
 * ═══════════════════════════════════════════════════════════════
 * 
 * An isolated module drawing a toothbrush with dynamic foam particles.
 */
export class ToothbrushProp {
  static build(propData, transform, time, parentChar) {
    const s = transform.scaleX || 1.0;
    
    const foam = [];
    for(let i=0; i<8; i++) {
        const randSize = 2 + AwtsmoosMath.seededRandom(i * 77) * 3;
        const oy = Math.sin(time*0.005 + i) * 10;
        const ox = Math.cos(time*0.008 + i) * 6;
        
        foam.push(G.circle(`foam_${i}`, -15*s + ox, -25*s + oy, randSize * s, { 
            fill: 'rgba(200, 255, 255, 0.8)' 
        }));
    }

    return G.group(propData.id, transform, [
      G.path('tb_handle', [
          {type:'move', x:0, y:20*s},
          {type:'quad', cx:5*s, cy:0, x:0, y:-20*s},
          {type:'line', x:-5*s, y:-20*s},
          {type:'quad', cx:-2*s, cy:0, x:-5*s, y:20*s},
          {type:'close'}
      ], { fill: propData.color || '#3498db', stroke: '#2980b9', lineWidth: 1.5*s }),
      
      G.rect('tb_head', -6*s, -40*s, 8*s, 20*s, { fill: '#fff', stroke: '#ccc', lineWidth: 1*s, radius: 4*s }),
      G.rect('bristles', -12*s, -38*s, 6*s, 16*s, { fill: '#ecf0f1', stroke: '#bdc3c7', lineWidth: 1*s }),
      G.group('tb_foam', null, foam)
    ]);
  }
}
