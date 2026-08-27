
/**
 * @file IdResolver.js
 * @description
 * THE BOOK OF NAMES (Shemot).
 * This utility ensures that spiritual identifiers (like 'c1') are 
 * translated into valid physical DOM IDs.
 */

export class IdResolver {
  /**
   * Cleanses a string for the physical world.
   */
  static sanitize(str) {
    if (!str) return 'EMPTY';
    return str.toString().toUpperCase().replace(/[^A-Z0-9]/g, '-');
  }

  /**
   * Generates a lane-specific identifier.
   * @param {string} group - The group (e.g. 'c1').
   * @param {string} track - The type (e.g. 'MOTION').
   */
  static getLaneId(group, track) {
    const cleanGroup = this.sanitize(group);
    const cleanTrack = this.sanitize(track);
    return `lane-${cleanGroup}-${cleanTrack}`;
  }
}
