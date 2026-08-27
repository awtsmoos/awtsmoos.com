
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @class ScissorsProp
 * @description
 * THE BLADES OF DIVISION (HaMisparayim).
 * B"H
 * 
 * An isolated module drawing the sharp geometry of trimming shears.
 */
export class ScissorsProp {
  static build(propData, transform, time, parentChar) {
    const s = transform.scaleX || 1.0;
    
    return G.group(propData.id, transform, [
      // Top Blade
      G.path('blade1', [{type:'move', x:0, y:0}, {type:'line', x:25*s, y:-10*s}], {stroke:'#ccc', lineWidth:3*s, lineCap:'round'}),
      // Bottom Blade
      G.path('blade2', [{type:'move', x:0, y:0}, {type:'line', x:25*s, y:5*s}], {stroke:'#ccc', lineWidth:3*s, lineCap:'round'}),
      
      // Handles
      G.circle('handle1', -5*s, -5*s, 6*s, {stroke: propData.color || '#2ecc71', fill:'transparent', lineWidth:3*s}),
      G.circle('handle2', -5*s, 5*s, 6*s, {stroke: propData.color || '#2ecc71', fill:'transparent', lineWidth:3*s}),
      
      // Pivot Screw
      G.circle('screw', 0, 0, 2*s, {fill:'#555'})
    ]);
  }
}
