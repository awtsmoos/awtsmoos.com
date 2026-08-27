
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @class WagonProp
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 32: THE MOVING FOUNDATION (Merkava)
 * ═══════════════════════════════════════════════════════════════
 * 
 * A large cart with spinning wheels. Characters and other props 
 * can be mounted to it. As it moves, its wheels rotate based on X velocity.
 */
export class WagonProp {
  static build(propData, transform, time, parentChar) {
    const s = transform.scaleX || 1.0;
    
    // Wheels rotate based on global X position to simulate rolling on the ground
    const wheelRot = (transform.x * 2) % 360; 

    const buildWheel = (id, wx) => G.group(id, { x: wx, y: 30*s, rotation: wheelRot }, [
        G.circle('w_tire', 0, 0, 20*s, { fill: '#111', stroke: '#000', lineWidth: 4*s }),
        G.circle('w_rim', 0, 0, 12*s, { fill: '#7f8c8d', stroke: '#2c3e50', lineWidth: 2*s }),
        G.path('spoke1', [{type:'move', x:-12*s, y:0}, {type:'line', x:12*s, y:0}], { stroke: '#2c3e50', lineWidth: 3*s }),
        G.path('spoke2', [{type:'move', x:0, y:-12*s}, {type:'line', x:0, y:12*s}], { stroke: '#2c3e50', lineWidth: 3*s })
    ]);

    return G.group(propData.id, transform, [
      G.path('handle', [{type:'move', x:-80*s, y:10*s}, {type:'line', x:-140*s, y:-40*s}], { stroke: '#8b4513', lineWidth: 8*s, lineCap: 'round' }),
      G.rect('bed_base', -100*s, -10*s, 200*s, 20*s, { fill: '#5c4033', stroke: '#3e2723', lineWidth: 4*s }),
      G.rect('side_panel', -90*s, -30*s, 180*s, 20*s, { fill: '#8b5a2b', stroke: '#5c4033', lineWidth: 3*s }),
      
      buildWheel('wheel_L', -60*s),
      buildWheel('wheel_R', 60*s)
    ]);
  }
}
