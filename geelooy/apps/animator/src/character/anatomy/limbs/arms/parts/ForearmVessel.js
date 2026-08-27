// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';

/**
 * @file ForearmVessel.js
 */
export class ForearmVessel {
  static build(side, elbowX, elbowY, wristX, wristY, sleeveColor) {
    // B"H - Hyper-real anatomical forearm shape (Brachioradialis taper)
    const midY = (elbowY + wristY) / 2;
    const isLeft = side === 'left';
    const outDir = isLeft ? -1 : 1;
    const inDir = isLeft ? 1 : -1;

    const points = [
      { type: 'move', x: elbowX + (12 * inDir), y: elbowY },
      // Inner forearm flexor taper
      { type: 'bezier', c1x: elbowX + (16 * inDir), c1y: elbowY + 20, c2x: wristX + (9 * inDir), c2y: midY * 1.2, x: wristX + (7 * inDir), y: wristY },
      // Across wrist
      { type: 'line', x: wristX + (8 * outDir), y: wristY },
      // Outer brachioradialis bulge and taper
      { type: 'bezier', c1x: wristX + (9 * outDir), c1y: midY * 1.2, c2x: elbowX + (22 * outDir), c2y: elbowY + 25, x: elbowX + (15 * outDir), y: elbowY },
      { type: 'close' }
    ];
    
    const shape = G.path(`forearm_${side}`, points, { 
        fill: sleeveColor, 
        stroke: '#000', 
        lineWidth: 4, 
        lineJoin: 'round' 
    });

    // B"H - Elbow Joint Indicator
    const elbowJoint = G.circle(`elbow_joint_${side}`, elbowX, elbowY, 13, { 
        fill: '#00000033', // Shadowed joint fold
        stroke: '#000', 
        lineWidth: 2
    });

    const crease = G.path(`forearm_crease_${side}`, [
        { type: 'move', x: elbowX, y: elbowY + 5 },
        { type: 'line', x: wristX, y: wristY - 5 }
    ], { stroke: '#000', lineWidth: 1.5 });

    // Inner sleeve opening
    const cuff = G.path(`forearm_cuff_${side}`, [
        { type: 'move', x: wristX - 8, y: wristY - 4 },
        { type: 'quad', cx: wristX, cy: wristY - 8, x: wristX + 8, y: wristY - 4 }
    ], { stroke: '#000', lineWidth: 1.5 });

    return G.group(`forearm_vessel_${side}`, null, [shape, elbowJoint, crease, cuff]);
  }
}
