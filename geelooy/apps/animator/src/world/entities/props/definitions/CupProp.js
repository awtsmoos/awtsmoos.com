
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { LiquidViscosity } from '../../../../engine/reality/physics/LiquidViscosity.js';

export class CupProp {
  static build(propData, transform, time, parentChar) {
    const s = transform.scaleX || 0.5;
    const vel = parentChar?.velocity || { x: (parentChar?.isWalking ? 5 : 0), y: (parentChar?.walk?.bob || 0) };
    
    const meniscus = LiquidViscosity.calculateMeniscus(vel, time, 0.65);

    const cupClipPath = [
      { type: 'move', x: -10 * s, y: -25 * s },
      { type: 'line', x: 10 * s, y: -25 * s },
      { type: 'line', x: 7 * s, y: 0 },
      { type: 'line', x: -7 * s, y: 0 },
      { type: 'close' }
    ];

    const liquidFluidPath = [
      { type: 'move', x: -15 * s, y: (meniscus.levelY + meniscus.leftY) * s },
      { type: 'bezier', 
        c1x: -5 * s, c1y: (meniscus.levelY + meniscus.leftY) * s, 
        c2x: 5 * s, c2y: (meniscus.levelY + meniscus.rightY) * s, 
        x: 15 * s, y: (meniscus.levelY + meniscus.rightY) * s 
      },
      { type: 'line', x: 15 * s, y: 10 * s },
      { type: 'line', x: -15 * s, y: 10 * s },
      { type: 'close' }
    ];

    return G.group(propData.id, transform, [
      G.path('cup_inside', cupClipPath, { fill: '#dddddd' }),
      G.clip('cup_liquid_mask', null, cupClipPath, [
        G.path('liquid_volume', liquidFluidPath, { fill: propData.color || '#3498db' }),
        G.path('liquid_surface', [
          { type: 'move', x: -10 * s, y: (meniscus.levelY + meniscus.leftY) * s },
          { type: 'line', x: 10 * s, y: (meniscus.levelY + meniscus.rightY) * s }
        ], { stroke: 'rgba(255,255,255,0.6)', lineWidth: 1.5 })
      ]),
      G.path('cup_shell', cupClipPath, { stroke: 'rgba(255,255,255,0.8)', lineWidth: 2, lineJoin: 'round' }),
      G.path('cup_sleeve', [
        { type: 'move', x: -9 * s, y: -15 * s },
        { type: 'line', x: 9 * s, y: -15 * s },
        { type: 'line', x: 8 * s, y: -5 * s },
        { type: 'line', x: -8 * s, y: -5 * s },
        { type: 'close' }
      ], { fill: '#8b4513', stroke: '#3e1f08', lineWidth: 1 })
    ]);
  }
}
