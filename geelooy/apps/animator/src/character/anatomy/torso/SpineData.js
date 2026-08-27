
// B"H
/**
 * @file SpineData.js
 * @description
 * 
 * ============================================================================
 * CHAPTER 5: THE PILLARS OF TIFERET (The Segmented Torso)
 * ============================================================================
 * A human body is not a stiff, unyielding rectangle. It is divided into regions 
 * of flexibility and rigidity. To solve the "Iron Spine" problem, we declare 
 * JSON data representing three distinct anatomical blocks.
 * ============================================================================
 */

export const SpineData = {
  proportions: {
    pelvis:   { width: 60, height: 35, yOffset: 0 },
    ribcage:  { width: 75, height: 60, yOffset: -35 },
    shoulders:{ width: 85, height: 45, yOffset: -95 }
  },
  garments: {
    strokeWidth: 4,
    strokeColor: '#000000',
    creaseAlpha: 'rgba(0,0,0,0.3)'
  }
};
