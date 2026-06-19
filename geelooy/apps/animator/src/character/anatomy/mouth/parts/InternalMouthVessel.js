// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { ThroatAbyss } from '../cavity/ThroatAbyss.js';
import { DentalArch } from '../teeth/DentalArch.js';
import { TongueSystem } from '../tongue/TongueSystem.js';

/**
 * @file InternalMouthVessel.js
 */
export class InternalMouthVessel {
  static build(lipPoints, intensity, jawDrop, targetViseme) {
    const cavern = ThroatAbyss.build(lipPoints, intensity);
    const teeth = DentalArch.build(intensity, jawDrop, targetViseme, lipPoints);
    const tongue = TongueSystem.build(intensity, jawDrop, targetViseme, lipPoints);

    return G.clip('inner_cavern', null, lipPoints, [
      cavern,
      ...teeth,
      ...tongue
    ]);
  }
}
