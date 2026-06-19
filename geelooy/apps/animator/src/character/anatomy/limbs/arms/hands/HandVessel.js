
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';

/**
 * @file HandVessel.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 12: THE FIVE PILLARS OF ACTION (Etzba'ot)
 * ═══════════════════════════════════════════════════════════════
 * 
 * Hand naturally changes its grip pose based on whether a `heldItem` exists.
 * If holding a cup or toothbrush, the fingers curl into a tight fist around the origin.
 */
export class HandVessel {
  static build(side, skinColor, isWaving, isClapping, time, isHoldingItem) {
    const isLeft = side === 'left';
    const inwardCurlDirection = isLeft ? 1 : -1;
    
    // Base curl: Waving is flat (0.05), Resting is half-curled (0.4), Grabbing is tight (0.9)
    let curlMagnitude = 0.4; 
    
    if (isWaving || isClapping) curlMagnitude = 0.05;
    if (isHoldingItem) curlMagnitude = 0.9; 

    const phaseOffset = isLeft ? 0 : Math.PI;
    const idleFidget = (!isWaving && !isClapping && !isHoldingItem) ? (Math.sin(time * 0.002 + phaseOffset) * 0.15) : 0;
    
    curlMagnitude += idleFidget;
    curlMagnitude = Math.max(-0.1, Math.min(1.0, curlMagnitude)); 

    const thumbSide = isLeft ? 1 : -1; 
    const fingerNodes = [];

    // Thumb
    const tX = isHoldingItem ? 4 * thumbSide : 12 * thumbSide;
    const tY = isHoldingItem ? 8 : 15;
    
    const thumbPath = [
      { type: 'move', x: 8 * thumbSide, y: 2 },
      { type: 'quad', cx: 16 * thumbSide, cy: 8, x: tX, y: tY }
    ];
    
    const thumbGroup = G.group('thumb_grp', { zIndex: isHoldingItem ? 10 : 0 }, [
      G.path('thumb_out', thumbPath, { stroke: '#000', lineWidth: 9, lineCap: 'round', composite: 'destination-over' }),
      G.path('thumb_in', thumbPath, { stroke: skinColor, lineWidth: 6, lineCap: 'round' })
    ]);

    // Fingers
    const fingerData = [
      { x: 5 * inwardCurlDirection, len: 14, angle: 0.1 * inwardCurlDirection }, 
      { x: 1 * inwardCurlDirection, len: 16, angle: 0 },                         
      { x: -3 * inwardCurlDirection, len: 15, angle: -0.1 * inwardCurlDirection }, 
      { x: -7 * inwardCurlDirection, len: 12, angle: -0.2 * inwardCurlDirection }  
    ];

    fingerData.forEach((f, i) => {
      const individualFidget = (!isWaving && !isClapping && !isHoldingItem) ? Math.sin(time * 0.003 + phaseOffset + i * 0.4) * 0.05 : 0;
      const totalAngle = f.angle + ((curlMagnitude + individualFidget) * inwardCurlDirection);
      
      const tipX = f.x + Math.sin(totalAngle) * (isHoldingItem ? f.len * 0.5 : f.len);
      const tipY = 8 + Math.cos(totalAngle) * (isHoldingItem ? f.len * 0.5 : f.len);

      const fPath = [
        { type: 'move', x: f.x, y: 8 },
        { type: 'quad', cx: f.x + (tipX-f.x)*0.8, cy: tipY - (curlMagnitude*5), x: tipX, y: tipY }
      ];

      fingerNodes.push(
        G.path(`f_${i}_out`, fPath, { stroke: '#000', lineWidth: 7, lineCap: 'round', composite: 'destination-over' }),
        G.path(`f_${i}_in`, fPath, { stroke: skinColor, lineWidth: 4, lineCap: 'round' })
      );
    });

    return G.group(`hand_${side}`, null, [
       G.circle('palm_out', 0, 4, 11, { fill: '#000' }),
       ...fingerNodes,
       G.circle('palm_in', 0, 4, 9, { fill: skinColor }),
       thumbGroup
    ]);
  }
}
