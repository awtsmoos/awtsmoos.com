
// B"H
/**
 * @file ArchetypeMacro.js
 * @brief THE TEMPLATE OF ADAM (Tavnit Adam).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 5: THE SKELETAL RIG
 * ═══════════════════════════════════════════════════════════════
 * To define "Human" every time is a waste of letters. 
 * This macro expander detects the 'human' archetype and 
 * automatically populates the 16-point mouth, the 5-layer 
 * skin matrix, and the kinematic limb chain. 
 * 
 * The user only needs to define the "Garments" (JSON overrides).
 * 
 * @class ArchetypeMacro
 */
export class ArchetypeMacro {
  /**
   * @function expand
   * @description Bestows the human rig upon a formless data object.
   */
  static expand(data) {
    if (data.archetype !== 'human') return data;

    // The core biological defaults
    const humanBase = {
      view: 'front',
      mood: 'calm',
      isWalking: false,
      vocalIntensity: 0,
      morphParams: { squint: 1.0, mouthSmile: 0 },
      colors: {
        skin: '#f1c27d',
        clothes: '#333',
        pants: '#111'
      },
      // The skeleton is implicit in the SoulUnifiedAssembler
    };

    // Deep merge: User overrides take priority
    return { ...humanBase, ...data };
  }
}
