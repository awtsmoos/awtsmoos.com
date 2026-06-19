
// B"H
/**
 * @file Anatomy.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE MEASUREMENTS OF THE STANDING MAN
 * ═══════════════════════════════════════════════════════════════
 * 
 * RECTIFICATION: Standardized the vertical stack.
 * Ground (Feet): 0
 * Hips: -150
 * Shoulders: -290
 * Head Center: -360
 */
export const ANATOMY = {
  head: { 
    cx: 0, 
    cy: -360, // B"H - Positioned atop the torso
    rX: 52,  
    rY: 62    
  },
  
  face: {
    eyes: { offsetX: 25, offsetY: -10, w: 18, h: 26, pupil: 5.5 },
    eyebrows: { offsetX: 45, offsetY: -55, w: 24, h: 5 },
    hair: { bottomY: -65, topY: -95 },
    nose: { offsetY: 22 },
    mouth: { offsetY: 60, baseWidth: 28, maxHeight: 60 },
    cheeks: { offsetX: 50, offsetY: 25, rX: 16, rY: 9 }
  },

  body: { 
    h: 140, // Torso height
    widthTop: 85, 
    widthBottom: 60
  },
  
  legs: { 
    thighLength: 75, 
    calfLength: 75,  
    spread: 22, 
    width: 24,
    pivotY: -150 // B"H - Legs start at the hips
  },

  arms: { 
    pivotX: 45,    
    pivotY: -290, // B"H - Arms start at the shoulders
    upperLength: 55, 
    lowerLength: 55, 
    thickness: 18, 
    handRadius: 13
  },

  feet: { w: 48, h: 20 }
};
