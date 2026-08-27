// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';

/**
 * @class ArmDepthManager
 * @description
 * THE ORDER OF THE REACH.
 * B"H
 */
export class ArmDepthManager {
  static layer(side, profile, elements) {
    // B"H - Depending on view and side, we reorder segments
    const isBackArm = elements.isBackArm;
    return G.group(`arm_depth_${side}`, null, elements.list);
  }
}
