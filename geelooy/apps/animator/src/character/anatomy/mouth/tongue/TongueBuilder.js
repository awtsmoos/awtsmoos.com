
import { TongueMuscle } from './TongueMuscle.js';
import { TongueCleft } from './TongueCleft.js';

/**
 * @class TongueBuilder
 * @description
 * THE CRAFTER OF THE MUSCLE.
 * B"H
 */
export class TongueBuilder {
  static build(intensity, jawDrop, targetViseme) {
    if (intensity < 0.15) return [];

    const isArched = ['L', 'T', 'D', 'N', 'S'].includes(targetViseme);
    
    return [
      TongueMuscle.build(intensity, jawDrop, isArched),
      TongueCleft.build(jawDrop, isArched)
    ];
  }
}
