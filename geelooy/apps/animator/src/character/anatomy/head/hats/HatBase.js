
// B"H
import { ANATOMY } from '../../../data/Anatomy.js';

/**
 * @class HatBase
 * @description
 * THE THREAD OF EXISTENCE (Kav).
 * B"H
 * 
 * Provides all sub-modules with rapid access to anatomical constants 
 * and universal coloring logic, ensuring geometric perfection across profiles.
 */
export class HatBase {
  static getParams(data, profile) {
    return {
      h: ANATOMY.head,
      hTop: ANATOMY.face.hair.topY,
      dir: profile.dir || 1,
      view: profile.type || 'front', // 'front', 'threeQuarter', 'side'
      color: data.colors?.hat || '#333333'
    };
  }

  static darken(hex, amt) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - amt);
    const g = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const b = Math.max(0, (num & 0x0000FF) - amt);
    return '#' + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
  }
}
