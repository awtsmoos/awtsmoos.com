// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file PerspectiveEngine.js
 * @description
 * THE ROTATION OF THE SOUL (Ohr Ein Sof M'sovev Kol Almin).
 * Maps high-level view targets to specific geometric offsets.
 */
export class PerspectiveEngine {
  static getProfile(viewType, rotation = 0) {
    const dir = rotation >= 0 ? 1 : -1;
    const profiles = {
      'front': { type: 'front', dir: 0, rx: 50, ry: 65, featureX: 0, featureY: 0, title: 'TIFERET_FRONT' },
      'side': { type: 'side', dir, rx: 42, ry: 65, featureX: 18 * dir, featureY: 0, title: 'NETZACH_HOD_SIDE' },
      'threequarter': { type: 'threequarter', dir, rx: 46, ry: 65, featureX: 12 * dir, featureY: 0, title: 'CHASSADIM_3/4' },
      'up': { type: 'front', dir: 0, rx: 52, ry: 62, featureX: 0, featureY: -15, title: 'KETER_UPWARD' },
      'down': { type: 'front', dir: 0, rx: 48, ry: 68, featureX: 0, featureY: 15, title: 'MALCHUT_DOWNWARD' },
      'extreme_side': { type: 'extreme_side', dir, rx: 35, ry: 65, featureX: 25 * dir, featureY: 0, title: 'CHITZONIYUT_EXTREME' }
    };
    return profiles[viewType] || profiles.front;
  }
}
