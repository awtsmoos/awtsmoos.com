// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';

/**
 * @file BicepVessel.js
 */
export class BicepVessel {
  static build(side, pivotX, pivotY, elbowX, elbowY, sleeveColor) {
    // B"H - Hyper-real anatomical arm shape (Deltoid, Bicep, Tricep)
    const midY = (pivotY + elbowY) / 2;
    const isLeft = side === 'left';
    const outDir = isLeft ? -1 : 1;
    const inDir = isLeft ? 1 : -1;

    const points = [
      { type: 'move', x: pivotX + (12 * inDir), y: pivotY }, // inner armpit
      // Inner bicep curve
      { type: 'bezier', c1x: pivotX + (18 * inDir), c1y: midY * 0.8, c2x: elbowX + (14 * inDir), c2y: elbowY - 10, x: elbowX + (11 * inDir), y: elbowY },
      // Across elbow
      { type: 'line', x: elbowX + (14 * outDir), y: elbowY },
      // Outer tricep/brachialis taper
      { type: 'bezier', c1x: elbowX + (18 * outDir), c1y: elbowY - 15, c2x: pivotX + (20 * outDir), c2y: midY * 1.2, x: pivotX + (22 * outDir), y: midY * 0.8 },
      // Deltoid bulge (Outer shoulder)
      { type: 'bezier', c1x: pivotX + (28 * outDir), c1y: pivotY + 10, c2x: pivotX + (22 * outDir), c2y: pivotY - 5, x: pivotX + (8 * outDir), y: pivotY - 5 },
      { type: 'close' }
    ];
    
    const shape = G.path(`bicep_${side}`, points, { 
      fill: sleeveColor, 
      stroke: '#000', 
      lineWidth: 4, 
      lineJoin: 'round'
    });

    const crease1 = G.path(`bicep_crease1_${side}`, [
      { type: 'move', x: pivotX, y: pivotY + 15 },
      { type: 'line', x: elbowX, y: elbowY - 10 }
    ], { stroke: '#000', lineWidth: 1.5 });

    const crease2 = G.path(`bicep_crease2_${side}`, [
      { type: 'move', x: pivotX - 5, y: pivotY + 25 },
      { type: 'line', x: pivotX - 8, y: pivotY + 35 }
    ], { stroke: '#000', lineWidth: 1.5 });

    const elbowJoint = G.circle(`bicep_elbow_joint_${side}`, elbowX, elbowY, 13, { 
      fill: '#00000033', // Shadowed joint fold
      stroke: '#000', 
      lineWidth: 2 
    });

    return G.group(`bicep_vessel_${side}`, null, [shape, elbowJoint, crease1, crease2]);
  }
}
