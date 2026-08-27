
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @class PlantProp
 * @description
 * THE VESSEL OF GROWTH (Tzemach).
 * B"H
 * 
 * An isolated module drawing a terracotta pot and flourishing green leaves.
 */
export class PlantProp {
  static build(propData, transform, time, parentChar) {
    const s = transform.scaleX || 1.0;
    
    return G.group(propData.id, transform, [
      // The Pot
      G.path('pot', [
        {type:'move', x:-15*s, y:0}, 
        {type:'line', x:15*s, y:0}, 
        {type:'line', x:10*s, y:25*s}, 
        {type:'line', x:-10*s, y:25*s}, 
        {type:'close'}
      ], {fill: propData.color || '#2980b9', stroke:'#000', lineWidth:2*s}),
      
      // The Leaves
      G.path('leaf1', [{type:'move', x:0, y:0}, {type:'quad', cx:-15*s, cy:-10*s, x:-25*s, y:-20*s}], {stroke:'#27ae60', lineWidth:4*s, lineCap:'round'}),
      G.path('leaf2', [{type:'move', x:0, y:0}, {type:'quad', cx:0, cy:-15*s, x:5*s, y:-30*s}], {stroke:'#2ecc71', lineWidth:4*s, lineCap:'round'}),
      G.path('leaf3', [{type:'move', x:0, y:0}, {type:'quad', cx:15*s, cy:-10*s, x:25*s, y:-15*s}], {stroke:'#27ae60', lineWidth:4*s, lineCap:'round'})
    ]);
  }
}
