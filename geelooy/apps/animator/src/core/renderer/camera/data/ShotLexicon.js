// B"H
/**
 * @file ShotLexicon.js
 * @brief THE LEXICON OF THE LENS (Milon HaAdasha).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 2: THE VOCABULARY OF FOCUS
 * ═══════════════════════════════════════════════════════════════
 * To command the camera with strings like 'cowboy' or 'closeup' 
 * requires a translation matrix. This lexicon defines the vertical 
 * anchoring percentage (Y-Offset) and the magnification (Zoom) 
 * for every standard cinematic shot.
 * 
 * yOffset: 1.0 is the top of the head. 0.0 is the feet.
 * 
 * @class ShotLexicon
 */

export const ShotLexicon = {
  // Deep intimate focus on the eyes and mouth
  extreme_closeup: { yOffset: 0.85, baseZoom: 5.5 },
  
  // The classic dialogue frame (Head and Shoulders)
  closeup:         { yOffset: 0.78, baseZoom: 3.8 },
  
  // Chest up, standard TV framing
  medium_closeup:  { yOffset: 0.70, baseZoom: 2.8 },
  
  // Waist up
  midshot:         { yOffset: 0.60, baseZoom: 2.0 },
  
  // Mid-thigh up (The Western Standoff)
  cowboy:          { yOffset: 0.50, baseZoom: 1.5 },
  
  // Full body in frame
  full:            { yOffset: 0.40, baseZoom: 0.9 },
  
  // Establishing the subject within their environment
  wide:            { yOffset: 0.30, baseZoom: 0.6 },
  
  // The God's Eye view. Massive environmental focus.
  extreme_wide:    { yOffset: 0.15, baseZoom: 0.3 }
};