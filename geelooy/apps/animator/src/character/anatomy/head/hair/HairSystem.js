
// B"H
import { HairFactory } from './HairFactory.js';

/**
 * @file HairSystem.js
 * @description
 * THE CROWN OF LIGHT.
 *
 * This version expands variety and safely supports more back-layer hair cases
 * so long or wavy silhouettes feel more complete.
 */
export class HairSystem {
  static backLayerMap = {
    long: 'long_back',
    wavy: 'long_back',
    wolf: 'long_back',
    braided: 'long_back',
    dreads: 'long_back'
  };

  /**
   * Builds the front hair layer.
   *
   * @param {Object} data - Character data.
   * @param {Object} profile - Perspective profile.
   * @param {number} hTop - Head-top offset.
   * @returns {Object|null} VirtualGraph result.
   */
  static build(data, profile, hTop = -95) {
    const type = HairFactory.normalize(data && data.hairType ? data.hairType : 'none');
    if (type === 'none') return null;
    return HairFactory.route(type, { ...data, hTop }, profile);
  }

  /**
   * Builds the rear hair layer when needed.
   *
   * @param {Object} data - Character data.
   * @param {Object} profile - Perspective profile.
   * @param {number} hTop - Head-top offset.
   * @returns {Object|null} VirtualGraph result.
   */
  static buildBack(data, profile, hTop = -95) {
    const type = HairFactory.normalize(data && data.hairType ? data.hairType : 'none');
    if (type === 'none') return null;

    const backType = this.backLayerMap[type];
    if (!backType) return null;

    return HairFactory.route(backType, { ...data, hTop }, profile);
  }
}
