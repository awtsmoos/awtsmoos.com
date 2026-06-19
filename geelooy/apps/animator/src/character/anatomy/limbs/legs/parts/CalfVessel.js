// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';

/**
 * @file CalfVessel.js
 */
export class CalfVessel {
  static build(side, p1X, p1Y, p2X, p2Y, pantsColor) {
    const dx = p2X - p1X;
    const dy = p2Y - p1Y;
    const angle = Math.atan2(dy, dx);
    const perp = angle + Math.PI/2;
    
    const wTop = 15;
    const wBot = 10;

    const points = [
      { type: 'move', x: p1X + Math.cos(perp) * wTop, y: p1Y + Math.sin(perp) * wTop },
      { type: 'line', x: p2X + Math.cos(perp) * wBot, y: p2Y + Math.sin(perp) * wBot },
      { type: 'line', x: p2X - Math.cos(perp) * wBot, y: p2Y - Math.sin(perp) * wBot },
      { type: 'line', x: p1X - Math.cos(perp) * wTop, y: p1Y - Math.sin(perp) * wTop },
      { type: 'close' }
    ];
    
    const shape = G.path(`calf_${side}`, points, { 
      fill: pantsColor, 
      stroke: '#000', 
      lineWidth: 4,
      lineJoin: 'round'
    });

    const crease = G.path(`calf_crease_${side}`, [
      { type: 'move', x: p1X, y: p1Y + 5 },
      { type: 'line', x: p2X, y: p2Y - 5 }
    ], { stroke: '#000000', lineWidth: 1.5 });

    const stripe = G.path(`calf_stripe_${side}`, [
      { type: 'move', x: p1X + Math.cos(perp) * (wTop*0.5), y: p1Y + Math.sin(perp) * (wTop*0.5) },
      { type: 'line', x: p2X + Math.cos(perp) * (wBot*0.5), y: p2Y + Math.sin(perp) * (wBot*0.5) }
    ], { stroke: '#000000', lineWidth: 0.5 });

    return G.group(`calf_vessel_${side}`, null, [shape, crease, stripe]);
  }
}
