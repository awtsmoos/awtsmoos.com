
// B"H
import { HairAliases } from './HairAliases.js';
import { HairRegistry } from './HairRegistry.js';

/**
 * @file HairFactory.js
 * @description
 * THE FORGE OF THE FOLLICLE.
 *
 * This rewrite routes hair through an explicit registry and alias resolver.
 * It supports far more variety without bloating the main system file.
 */
export class HairFactory {
  /**
   * Normalizes a requested hair type.
   *
   * @param {string} type - Requested type.
   * @returns {string} Resolved canonical type.
   */
  static normalize(type) {
    const key = String(type || 'standard');
    return HairAliases[key] || key;
  }

  /**
   * Routes to the correct builder.
   *
   * @param {string} type - Requested type.
   * @param {Object} data - Character data.
   * @param {Object} profile - Perspective profile.
   * @returns {Object|null} VirtualGraph result.
   */
  static route(type, data, profile) {
    const resolved = this.normalize(type || data.hairType || 'standard');
    if (resolved === 'none') return null;

    const BuilderClass = HairRegistry[resolved] || HairRegistry.standard;
    return BuilderClass.build(data, profile);
  }
}
