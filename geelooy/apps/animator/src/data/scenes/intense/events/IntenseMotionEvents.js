
// B"H
/**
 * @file IntenseMotionEvents.js
 * @description
 * 
 * ============================================================================
 * CHAPTER 11: THE GESTICULATION OF THE SOUL
 * ============================================================================
 * We map high-level acting macros to the characters. 
 * The system automatically blends these poses with their idle breathing 
 * and blinking.
 * 
 * To demonstrate total dynamic dominance, the Rabbi physically removes 
 * his shades mid-argument to reveal his eyes!
 * ============================================================================
 */

export const IntenseMotionEvents = [
  { 
    type: 'character', id: 'c1_husband', start: 0, end: 3000, 
    actions: [{ at: 0, key: 'acting', value: 'thinker' }] 
  },

  { 
    type: 'character', id: 'c1_husband', start: 3000, end: 8400, 
    actions: [
      { at: 0.1, key: 'acting', value: 'shrug' },
      { at: 0.8, key: 'acting', value: 'neutral' }
    ]
  },

  // B"H - He removes his shades at 8500ms to look his wife in the eye!
  { 
    type: 'character', id: 'c1_husband', start: 8500, end: 24000, 
    actions: [
      { at: 0, key: 'glasses', value: 'none' }
    ] 
  },

  { 
    type: 'character', id: 'c2_wife', start: 8500, end: 12000, 
    actions: [{ at: 0, key: 'emotion', value: 'happy' }] 
  },

  { 
    type: 'character', id: 'c1_husband', start: 12500, end: 16000, 
    actions: [{ at: 0, key: 'acting', value: 'facepalm' }] 
  },

  { 
    type: 'character', id: 'c2_wife', start: 16500, end: 20000, 
    actions: [{ at: 0, key: 'acting', value: 'sigh' }] 
  },

  // B"H - The Anime Revelation
  { type: 'character', id: 'c1_husband', start: 20000, end: 24000, 
    actions: [
      { at: 0, key: 'exaggeration', value: 1.0 }, 
      { at: 0, key: 'sadness', value: 1.5 },      
      { at: 0, key: 'acting', value: 'breakdown' } 
    ] 
  }
];
