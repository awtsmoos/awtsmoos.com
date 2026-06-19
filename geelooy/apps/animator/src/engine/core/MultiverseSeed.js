// B"H
/**
 * @file MultiverseSeed.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 39: THE ROOT OF THE TREE (Shorash HaIlan)
 * ═══════════════════════════════════════════════════════════════
 * 
 * Every deterministic random value in the Awtsmoos Engine relies on a seed.
 * By injecting a Master Shift Offset into the `AwtsmoosMath.seededRandom`
 * function, changing a single global string alters the mathematical layout 
 * of the entire universe instantly.
 * 
 * New tree branching, new cloud formations, new star positions, new 
 * facial asymmetry—a parallel dimension spawned from a single word.
 * 
 * @class MultiverseSeed
 */

export class MultiverseSeed {
  static currentOffset = 0;

  /**
   * @function setSeedWord
   * @description Converts a word into a numerical offset to shift all reality.
   * @param {string} word - The divine word.
   */
  static setSeedWord(word) {
    if (!word) {
      this.currentOffset = 0;
      return;
    }
    
    // Hash the string into a massive integer offset
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      const char = word.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // This offset will now be added to all `seededRandom` calls globally!
    this.currentOffset = Math.abs(hash);
    console.log(`B"H - Multiverse shifted. Dimension Index: ${this.currentOffset}`);
  }

  static getOffset() {
    return this.currentOffset;
  }
}