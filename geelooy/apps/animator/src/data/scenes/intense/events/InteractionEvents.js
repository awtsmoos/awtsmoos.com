
// B"H
/**
 * @file InteractionEvents.js
 * @description
 * 
 * ============================================================================
 * CHAPTER 20: THE MASTERY OVER MATTER (Shlita Al HaGeshmiut)
 * ============================================================================
 * Tools only serve their purpose when commanded by the soul.
 * Here we command the characters to grab the scissors and the plant 
 * at the dawn of existence (Time 0).
 * 
 * But at 12,500ms, the Husband is so overwhelmed by the existential weight 
 * of the 60fps framerate that he drops the scissors and LIFTS A PALM TREE.
 * ============================================================================
 */

export const InteractionEvents = [
  // 0s: Husband spawns already holding the trimming scissors
  { type: 'interact', action: 'pickup', target: 'scissors_1', actor: 'c1_husband', start: 0, end: 100 },
  
  // 0s: Wife holds the plant that is being discussed
  { type: 'interact', action: 'pickup', target: 'plant_1', actor: 'c2_wife', start: 0, end: 100 },

  // 12.3s: Husband drops the scissors in frustration
  { type: 'interact', action: 'drop', actor: 'c1_husband', start: 12300, end: 12400 },

  // 12.5s: Husband rips the Palm Tree from the earth!
  { type: 'interact', action: 'pickup', target: 'mighty_palm', actor: 'c1_husband', start: 12500, end: 12600 }
];
