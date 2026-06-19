// B"H
/**
 * @file IntenseCameraEvents.js
 * @description
 * 
 * ============================================================================
 * CHAPTER 13: THE EYE OF PROVIDENCE (Ein HaHashgacha)
 * ============================================================================
 * We invoke the full power of the CinematicBrain. 
 * The camera will automatically calculate the AABB of multiple characters, 
 * frame them perfectly, and glide between closeups with Hermite interpolation.
 * ============================================================================
 */

export const IntenseCameraEvents = [
  // 0s - 3s: Establishing Wide Shot. The engine automatically finds both characters, 
  // calculates the space between them, and sets the perfect zoom.
  { type: 'camera', start: 0, end: 3000, isCut: true, shotType: 'cowboy', target: ['c1_husband', 'c2_wife'] },

  // 3s - 8.5s: Hard Cut to Husband Close-Up for his existential crisis
  { type: 'camera', start: 3000, end: 8500, isCut: true, shotType: 'closeup', target: 'c1_husband' },

  // 8.5s - 12.5s: Smooth Pan (Not a cut!) to Wife Mid-Shot for her calm response
  // Because t moves from 0 to 1, CameraProcessor will use Smoothstep easing!
  { type: 'camera', start: 8500, end: 12500, isCut: false, shotType: 'midshot', target: 'c2_wife' },

  // 12.5s - 16.5s: Hard Cut to Husband Extreme Close-Up (Intense reaction)
  { type: 'camera', start: 12500, end: 16500, isCut: true, shotType: 'extreme_closeup', target: 'c1_husband' },

  // 16.5s - 20s: Hard Cut back to the Wife as she delivers the punchline
  { type: 'camera', start: 16500, end: 20000, isCut: true, shotType: 'closeup', target: 'c2_wife' },
  
  // 20s - 24s: Cinematic slow pull-out to a Wide Group Shot to end the scene
  { type: 'camera', start: 20000, end: 24000, isCut: false, shotType: 'wide', target: ['c1_husband', 'c2_wife'] }
];