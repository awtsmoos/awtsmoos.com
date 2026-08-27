
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { ArmSolver } from './kinematics/ArmSolver.js';
import { AutoSwing } from './kinematics/AutoSwing.js';
import { DepthOrder } from './layering/DepthOrder.js';
import { PoseLibrary } from './animations/PoseLibrary.js';
import { HandVessel } from './hands/HandVessel.js';
import { JointGeometry } from './geometry/Joints.js';
import { SegmentGeometry } from './geometry/Segments.js';

/**
 * @class ArmAssembler
 * @description
 * THE DIVINE FABRICATOR (Yotzer HaZro'ot).
 * B"H
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 9: THE SEVERING OF DEPENDENCY
 * ═══════════════════════════════════════════════════════════════
 * An arm should not be responsible for rendering the universe. 
 * Previously, the ArmAssembler attempted to lazy-load the PropFactory 
 * to draw held items. This caused an async race condition, resulting 
 * in a catastrophic `TypeError` during the synchronous render loop.
 * 
 * We have implemented Tikkun (Rectification). The Arm now only draws 
 * the arm. It assigns a holy ID to the wrist (`${charId}_hand_pivot_right`).
 * The `AttachmentEngine` will later sweep through the VirtualGraph and 
 * magically inject ANY nested object into this bone's children array!
 */
export class ArmAssembler {
  static assemble(side, data, config, profile) {
    const { sleeveColor, skinColor, upperAngle, lowerAngle } = config;
    const time = data._lastDirectorTime || Date.now();

    const pose = PoseLibrary.apply(data, side, { upper: upperAngle, lower: lowerAngle });
    const swing = AutoSwing.get(data, side, time);
    
    // Check if the hand is actively grasping something to override IK logic
    let finalIkTarget = pose.ikTarget;
    if (data.heldItemSide === side) {
      finalIkTarget = { x: 40, y: 15 };
    }

    const refinedConfig = {
       ...config,
       upperAngle: pose.upper + swing,
       lowerAngle: pose.lower,
       ikTarget: finalIkTarget,
       bendDir: pose.bendDir
    };

    const solve = ArmSolver.solve(refinedConfig);
    const { shoulder, elbow, wrist, totalRotation } = solve;

    // B"H - BONE MOUNT POINTS FOR THE ATTACHMENT ENGINE
    const shoulderId = `${data.id}_shoulder_${side}`;
    const elbowId = `${data.id}_elbow_${side}`;
    const wristId = `${data.id}_wrist_${side}`;
    const handPivotId = `${data.id}_hand_pivot_${side}`;

    const segments = {
      shoulder: G.group(shoulderId, { x: shoulder.x, y: shoulder.y }, [
          JointGeometry.build(`${data.id}_socket_${side}`, 0, 0, 18, sleeveColor)
      ]),
      
      upper: SegmentGeometry.build(side, shoulder, elbow, 18, 14, sleeveColor, `${data.id}_bicep_${side}`),
      
      elbow: G.group(elbowId, { x: elbow.x, y: elbow.y }, [
          JointGeometry.build(`${data.id}_elbow_seal_${side}`, 0, 0, 14, sleeveColor)
      ]),
      
      lower: SegmentGeometry.build(side, elbow, wrist, 14, 10, sleeveColor, `${data.id}_forearm_${side}`),
      
      hand: G.group(wristId, { x: wrist.x, y: wrist.y }, [
          G.group(handPivotId, { rotation: totalRotation }, [
              HandVessel.build(side, skinColor, data.isWaving && side === 'right', data.isClapping, time, data.heldItemSide === side)
          ])
      ])
    };

    return DepthOrder.resolve(side, profile, segments);
  }
}
