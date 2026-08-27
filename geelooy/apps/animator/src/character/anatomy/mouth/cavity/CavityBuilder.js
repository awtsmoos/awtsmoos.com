
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { DeepVoid } from './DeepVoid.js';
import { TonsillarPillars } from './TonsillarPillars.js';
import { Uvula } from './Uvula.js';

/**
 * @file CavityBuilder.js
 * @description
 * THE ARCHITECT OF THE ABYSS.
 * B"H
 * 
 * Replaces the flat CavityRenderer. Unifies all the hyper-realistic throat 
 * organs into a single deep-Z-indexed layer that sits behind the teeth and tongue.
 */
export class CavityBuilder {
  /**
   * Generates the entire internal cavern environment.
   */
  static build(lipPoints, intensity, jawDrop) {
    return G.group('oral_cavity_master', null, [
      DeepVoid.build(lipPoints),
      TonsillarPillars.build(intensity, jawDrop),
      Uvula.build(intensity)
    ]);
  }
}
