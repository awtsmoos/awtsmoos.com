
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { ArmAssembler } from './ArmAssembler.js';

/**
 * @file ArmVessel.js
 * @description
 * THE REACH (Chessed/Gevurah).
 * B"H
 */
export class ArmVessel {
  static build(side, data, config, profile) {
    return ArmAssembler.assemble(side, data, config, profile);
  }
}
